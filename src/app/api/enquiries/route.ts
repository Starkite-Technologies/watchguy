import { after } from "next/server";
import { db, backendConfigured } from "@/lib/db";
import { checkOrigin, apiError, HttpError } from "@/lib/auth";
import { enquirySchema } from "@/lib/validation";
import { rateLimit, verifyBot } from "@/lib/services";
import { limitedJson } from "@/lib/http";
import { adminRecipients, tryFlushEmail } from "@/lib/email";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    if (!backendConfigured)
      throw new HttpError(
        503,
        "Enquiries are not connected in this design preview. Your message has not been sent.",
      );
    await rateLimit(req, "enquiry", 8);
    const parsed = enquirySchema.safeParse(await limitedJson(req, 16000));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0].message);
    const { consent, website, botToken, ...values } = parsed.data;
    await verifyBot(botToken, "enquiry");
    if (
      values.watchId &&
      !(await db.watch.findFirst({
        where: {
          id: values.watchId,
          published: true,
          ...(process.env.NODE_ENV === "production" &&
          process.env.DEMO_MODE !== "true"
            ? { isDemo: false }
            : {}),
          availability: { in: ["AVAILABLE", "RESERVED"] },
        },
      }))
    )
      throw new HttpError(
        404,
        "This timepiece is no longer publicly available.",
      );
    const enquiry = await db.$transaction(async (tx) => {
      const record = await tx.enquiry.create({ data: values });
      const recipients = adminRecipients();
      if (recipients.length)
        await tx.emailOutbox.createMany({
          data: recipients.map((to) => ({
            to,
            subject: "New customer enquiry",
            text:
              "A customer has enquired about " +
              (values.watchId ? "watch " + values.watchId : "the boutique") +
              ". View the enquiry securely at " +
              process.env.APP_ORIGIN +
              "/admin. Enquiry " +
              record.id,
          })),
        });
      return record;
    });
    after(async () => {
      await tryFlushEmail();
    });
    return Response.json({ success: true, id: enquiry.id }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
