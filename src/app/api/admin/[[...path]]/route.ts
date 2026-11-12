import { db, storageConfigured } from "@/lib/db";
import { requireAdmin, checkOrigin, apiError, HttpError } from "@/lib/auth";
import { watchSchema, approvalSchema, contentSchema } from "@/lib/validation";
import { limitedJson, limitedForm } from "@/lib/http";
import {
  signedPhoto,
  publishPhoto,
  publicBucket,
  uploadFiles,
  publicImage,
  validPublicImage,
  removeObjects,
} from "@/lib/storage";
import { tryFlushEmail, emailConfigured } from "@/lib/email";
import { watchDto } from "@/lib/catalogue";
import { defaultContent } from "@/lib/demo";
import { z } from "zod";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type Context = { params: Promise<{ path?: string[] }> };
export async function GET() {
  try {
    const admin = await requireAdmin();
    const [rows, submissions, enquiries, content, activity, queuedEmails] =
      await Promise.all([
        db.watch.findMany({
          include: { images: true },
          orderBy: { createdAt: "desc" },
        }),
        db.watchSubmission.findMany({
          include: { seller: true, images: { orderBy: { sortOrder: "asc" } } },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        db.enquiry.findMany({
          include: { watch: { select: { brand: true, model: true } } },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        db.siteContent.findUnique({ where: { id: "home" } }),
        db.adminActivityLog.findMany({
          include: { actor: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        }),
        db.emailOutbox.count({ where: { status: { not: "SENT" } } }),
      ]);
    const privateRows = await Promise.all(
      submissions.map(async (s) => ({
        id: s.id,
        name: s.seller.fullName,
        email: s.seller.email,
        phone: s.seller.phone,
        preferredContactMethod: s.seller.preferredContactMethod,
        brand: s.brand,
        model: s.model,
        reference: s.reference,
        year: s.year,
        condition: s.condition,
        price: Number(s.requestedPrice),
        currency: s.currency,
        description: s.description,
        defects: s.defects,
        box: s.box,
        papers: s.papers,
        images: storageConfigured
          ? await Promise.all(s.images.map((i) => signedPhoto(i.storageKey)))
          : [],
        status: s.status,
        createdAt: s.createdAt,
        reviewedAt: s.reviewedAt,
        reviewNote: s.reviewNotes,
      })),
    );
    return Response.json(
      {
        admin: { name: admin.name, role: admin.role },
        watches: rows.map(watchDto),
        submissions: privateRows,
        enquiries,
        content: { ...defaultContent, ...((content?.content as object) || {}) },
        activity,
        email: { configured: emailConfigured(), queued: queuedEmails },
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
export async function POST(req: Request, context: Context) {
  const { path = [] } = await context.params;
  const copied: string[] = [];
  let committed = false;
  try {
    checkOrigin(req);
    const admin = await requireAdmin(
      path[0] === "submissions"
        ? ["OWNER", "EDITOR", "REVIEWER"]
        : ["OWNER", "EDITOR"],
    );
    if (path[0] === "uploads") {
      if (!storageConfigured)
        throw new HttpError(503, "Photo storage is not configured.");
      const form = await limitedForm(req, 34 * 1024 * 1024);
      const files = form
        .getAll("photos")
        .filter((f): f is File => f instanceof File);
      const keys = await uploadFiles(files, publicBucket(), "inventory");
      return Response.json({ images: keys.map(publicImage) });
    }
    if (path[0] === "notifications") {
      return Response.json({ success: true, ...(await tryFlushEmail()) });
    }
    if (path[0] === "watches") {
      const parsed = watchSchema.safeParse(await limitedJson(req));
      if (!parsed.success)
        throw new HttpError(400, parsed.error.issues[0].message);
      const { images, ...values } = parsed.data;
      if (["SOLD", "ARCHIVED"].includes(values.availability))
        values.published = false;
      if (images.some((url) => !validPublicImage(url)))
        throw new HttpError(
          400,
          "Upload photographs to the store before saving.",
        );
      if (values.sellerType !== "STORE")
        throw new HttpError(
          400,
          "Third-party watches must be approved through submissions.",
        );
      const slug =
        (values.brand + "-" + values.model)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-") +
        "-" +
        crypto.randomUUID().slice(0, 8);
      const record = await db.$transaction(async (tx) => {
        const w = await tx.watch.create({
          data: {
            ...values,
            slug,
            images: {
              create: images.map((imageUrl, sortOrder) => ({
                imageUrl,
                sortOrder,
              })),
            },
          },
        });
        await tx.adminActivityLog.create({
          data: {
            actorId: admin.id,
            entityId: w.id,
            action: "WATCH_CREATED",
            detail: values.published ? "Published" : "Draft",
          },
        });
        return w;
      });
      return Response.json({ success: true, id: record.id });
    }
    if (path[0] === "submissions" && path[1]) {
      const parsed = approvalSchema.safeParse(await limitedJson(req));
      if (!parsed.success)
        throw new HttpError(400, parsed.error.issues[0].message);
      const { action, note, selectedImages, listing } = parsed.data;
      const s = await db.watchSubmission.findUnique({
        where: { id: path[1] },
        include: { seller: true, images: { orderBy: { sortOrder: "asc" } } },
      });
      if (!s || !["PENDING_REVIEW", "INFO_REQUESTED"].includes(s.status))
        throw new HttpError(409, "This submission has already been reviewed.");
      const urls: string[] = [];
      if (action === "APPROVE") {
        if (!storageConfigured)
          throw new HttpError(503, "Photo storage is not configured.");
        for (const i of [...new Set(selectedImages)]) {
          if (!s.images[i])
            throw new HttpError(400, "A selected photo is unavailable.");
          const key = await publishPhoto(s.images[i].storageKey);
          copied.push(key);
          urls.push(publicImage(key));
        }
      }
      await db.$transaction(async (tx) => {
        const status =
          action === "APPROVE"
            ? "APPROVED"
            : action === "REJECT"
              ? "REJECTED"
              : "INFO_REQUESTED";
        const changed = await tx.watchSubmission.updateMany({
          where: {
            id: s.id,
            status: { in: ["PENDING_REVIEW", "INFO_REQUESTED"] },
          },
          data: {
            status,
            reviewNotes: note,
            reviewedById: admin.id,
            reviewedAt: new Date(),
          },
        });
        if (changed.count !== 1)
          throw new HttpError(
            409,
            "Another administrator has already reviewed this submission.",
          );
        if (action === "APPROVE" && listing) {
          await tx.watch.create({
            data: {
              ...listing,
              slug:
                (listing.brand + "-" + listing.model)
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-") +
                "-" +
                crypto.randomUUID().slice(0, 8),
              currency: "NAD",
              sellerType: "THIRD_PARTY",
              sellerId: s.sellerId,
              submissionId: s.id,
              published: true,
              images: {
                create: urls.map((imageUrl, sortOrder) => ({
                  imageUrl,
                  sortOrder,
                })),
              },
            },
          });
        }
        await tx.adminActivityLog.create({
          data: {
            actorId: admin.id,
            entityId: s.id,
            action: "SUBMISSION_" + status,
            detail: note,
          },
        });
        await tx.emailOutbox.create({
          data: {
            submissionId: s.id,
            to: s.seller.email,
            subject:
              "Your watch submission ? " +
              status.replaceAll("_", " ").toLowerCase(),
            text:
              (action === "APPROVE"
                ? "Your watch has been approved and published. The public selling price is N$ " +
                  listing!.price +
                  "."
                : action === "REJECT"
                  ? "We are unable to accept this submission at this time."
                  : "We need some additional information before continuing. Your watch remains unpublished.") +
              "\n\n" +
              note +
              "\n\nPlease reply to the boutique with any questions.",
          },
        });
      });
      committed = true;
      const delivery = await tryFlushEmail();
      return Response.json({
        success: true,
        emailConfigured: delivery.configured,
        notification: "queued",
      });
    }
    throw new HttpError(404, "Action not found.");
  } catch (error) {
    if (copied.length && !committed)
      await removeObjects(publicBucket(), copied).catch(() => {});
    return apiError(error);
  }
}
export async function PATCH(req: Request, context: Context) {
  try {
    checkOrigin(req);
    const { path = [] } = await context.params;
    const admin = await requireAdmin(
      path[0] === "enquiries"
        ? ["OWNER", "EDITOR", "REVIEWER"]
        : ["OWNER", "EDITOR"],
    );
    const body = await limitedJson(req);
    if (path[0] === "watches" && path[1]) {
      const parsed = watchSchema.safeParse(body);
      if (!parsed.success)
        throw new HttpError(400, parsed.error.issues[0].message);
      const { images, ...values } = parsed.data;
      if (["SOLD", "ARCHIVED"].includes(values.availability))
        values.published = false;
      if (images.some((url) => !validPublicImage(url)))
        throw new HttpError(400, "Use the store?s uploaded photographs.");
      await db.$transaction(async (tx) => {
        const existing = await tx.watch.findUnique({ where: { id: path[1] } });
        if (!existing || existing.sellerType !== values.sellerType)
          throw new HttpError(
            400,
            "The ownership classification cannot be changed.",
          );
        await tx.watch.update({
          where: { id: path[1] },
          data: {
            ...values,
            published:
              values.availability === "ARCHIVED" ? false : values.published,
            images: {
              deleteMany: {},
              create: images.map((imageUrl, sortOrder) => ({
                imageUrl,
                sortOrder,
              })),
            },
          },
        });
        await tx.adminActivityLog.create({
          data: {
            actorId: admin.id,
            entityId: path[1],
            action: "WATCH_UPDATED",
            detail:
              values.availability +
              "; " +
              (values.published ? "published" : "draft"),
          },
        });
      });
      return Response.json({ success: true });
    }
    if (path[0] === "enquiries" && path[1]) {
      const parsed = z
        .object({ status: z.enum(["NEW", "CONTACTED", "CLOSED"]) })
        .safeParse(body);
      if (!parsed.success) throw new HttpError(400, "Invalid enquiry status.");
      await db.$transaction(async (tx) => {
        await tx.enquiry.update({ where: { id: path[1] }, data: parsed.data });
        await tx.adminActivityLog.create({
          data: {
            actorId: admin.id,
            entityId: path[1],
            action: "ENQUIRY_UPDATED",
            detail: parsed.data.status,
          },
        });
      });
      return Response.json({ success: true });
    }
    if (path[0] === "content") {
      const parsed = contentSchema.safeParse(body);
      if (!parsed.success)
        throw new HttpError(400, parsed.error.issues[0].message);
      await db.$transaction(async (tx) => {
        await tx.siteContent.upsert({
          where: { id: "home" },
          create: { id: "home", content: parsed.data },
          update: { content: parsed.data },
        });
        await tx.adminActivityLog.create({
          data: {
            actorId: admin.id,
            entityId: "home",
            action: "CONTENT_UPDATED",
          },
        });
      });
      return Response.json({ success: true });
    }
    throw new HttpError(404, "Action not found.");
  } catch (error) {
    return apiError(error);
  }
}
export async function DELETE(req: Request, context: Context) {
  try {
    checkOrigin(req);
    const admin = await requireAdmin(["OWNER", "EDITOR"]);
    const { path = [] } = await context.params;
    if (path[0] !== "watches" || !path[1])
      throw new HttpError(404, "Listing not found.");
    await db.$transaction(async (tx) => {
      await tx.watch.update({
        where: { id: path[1] },
        data: { availability: "ARCHIVED", published: false, featured: false },
      });
      await tx.adminActivityLog.create({
        data: {
          actorId: admin.id,
          entityId: path[1],
          action: "WATCH_ARCHIVED",
        },
      });
    });
    return Response.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
