import { after } from "next/server";
import { db, backendConfigured } from "@/lib/db";
import { checkOrigin, apiError, HttpError } from "@/lib/auth";
import { submissionSchema } from "@/lib/validation";
import { rateLimit, verifyBot } from "@/lib/services";
import { limitedForm } from "@/lib/http";
import { uploadFiles, privateBucket, removeObjects } from "@/lib/storage";
import { adminRecipients, tryFlushEmail } from "@/lib/email";
import { brand } from "@/config/brand";
export const runtime = "nodejs";
export async function POST(req: Request) {
  let keys: string[] = [];
  let saved = false;
  try {
    checkOrigin(req);
    if (!backendConfigured())
      throw new HttpError(
        503,
        "Submissions are not connected in this design preview. No personal details or photos have been saved.",
      );
    await rateLimit(req, "submission");
    const form = await limitedForm(req);
    const parsed = submissionSchema.safeParse({
      ...Object.fromEntries(form),
      box: form.get("box") === "true",
      papers: form.get("papers") === "true",
      consent: form.get("consent") === "true",
    });
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    await verifyBot(parsed.data.botToken, "submission");
    const photos = form
      .getAll("photos")
      .filter((f): f is File => f instanceof File);
    if (photos.length < 3 || photos.length > 6)
      throw new HttpError(400, "Please supply 3?6 photographs.");
    keys = await uploadFiles(photos, privateBucket(), "submissions");
    const {
      name,
      email,
      phone,
      preferredContactMethod,
      price,
      consent,
      website,
      botToken,
      ...watch
    } = parsed.data;
    const record = await db.$transaction(async (tx) => {
      const seller = await tx.seller.create({
        data: { fullName: name, email, phone, preferredContactMethod },
      });
      const submission = await tx.watchSubmission.create({
        data: {
          ...watch,
          requestedPrice: price,
          sellerId: seller.id,
          images: {
            create: keys.map((storageKey, sortOrder) => ({
              storageKey,
              sortOrder,
            })),
          },
        },
      });
      await tx.emailOutbox.createMany({
        data: [
          {
            submissionId: submission.id,
            to: email,
            subject: brand.name + " ? submission received",
            text:
              "Thank you for submitting your " +
              watch.brand +
              " " +
              watch.model +
              ". Your reference is " +
              submission.id +
              ". It is private and pending review. Submission is not authentication, valuation or an offer to buy.",
          },
          ...adminRecipients().map((to) => ({
            submissionId: submission.id,
            to,
            subject: "New watch submission awaits review",
            text:
              "A new " +
              watch.brand +
              " " +
              watch.model +
              " is awaiting review. Open " +
              process.env.APP_ORIGIN +
              "/admin. Reference: " +
              submission.id,
          })),
        ],
      });
      return submission;
    });
    saved = true;
    after(async () => {
      await tryFlushEmail();
    });
    return Response.json(
      { success: true, id: record.id, status: "PENDING_REVIEW" },
      { status: 201 },
    );
  } catch (error) {
    if (keys.length && !saved)
      await removeObjects(privateBucket(), keys).catch(() => {});
    return apiError(error);
  }
}
