import { db } from "@/lib/db";
import { apiError, checkOrigin, HttpError, requireAdmin } from "@/lib/auth";
import { submissionReviewSchema } from "@/lib/validation";
import { logAdminActivity, sendEmailNotification } from "@/lib/services";
import { BRAND, formatNAD } from "@/config/brand";

export const runtime = "nodejs";

function generateSlug(brand: string, model: string, reference?: string | null): string {
  const base = `${brand}-${model}-${reference || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const admin = await requireAdmin(["OWNER", "EDITOR", "REVIEWER"]);
    const body = await req.json();

    const parsed = submissionReviewSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0].message);
    }

    const {
      submissionId,
      action,
      reviewNotes,
      approvedPrice,
      approvedPhotos,
      publicBrand,
      publicModel,
    } = parsed.data;

    const submission = await db.watchSubmission.findUnique({
      where: { id: submissionId },
      include: {
        seller: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!submission) {
      throw new HttpError(404, "Watch submission not found.");
    }

    const now = new Date();

    if (action === "APPROVE") {
      // Approval requires OWNER or EDITOR
      if (admin.role === "REVIEWER") {
        throw new HttpError(403, "Reviewers cannot publish watches. An Editor or Owner must approve.");
      }

      if (submission.status === "APPROVED") {
        throw new HttpError(400, "This submission has already been approved and published.");
      }

      const finalPriceInCents = approvedPrice
        ? Math.round(approvedPrice * BRAND.minorUnitFactor)
        : submission.requestedPrice;

      const brand = publicBrand || submission.brand;
      const model = publicModel || submission.model;
      const slug = generateSlug(brand, model, submission.referenceNumber);

      // Selected photos or all submission photos
      const photoUrls =
        approvedPhotos && approvedPhotos.length > 0
          ? approvedPhotos
          : submission.images.map((img) => img.storageKey);

      // Create live watch listing
      const publishedWatch = await db.watch.create({
        data: {
          slug,
          brand,
          model,
          referenceNumber: submission.referenceNumber,
          year: submission.year,
          condition: submission.condition,
          price: finalPriceInCents,
          currency: submission.currency,
          description: submission.description,
          ownershipType: "THIRD_PARTY",
          sellerId: submission.sellerId,
          submissionId: submission.id,
          status: "AVAILABLE",
          published: true,
          box: submission.box,
          papers: submission.papers,
          images: {
            create: photoUrls.map((url, idx) => ({
              imageUrl: url,
              sortOrder: idx,
            })),
          },
        },
      });

      // Update submission status
      await db.watchSubmission.update({
        where: { id: submissionId },
        data: {
          status: "APPROVED",
          reviewNotes: reviewNotes || "Listing approved and published to Atelier catalogue.",
          reviewedBy: admin.id,
          reviewedAt: now,
        },
      });

      // Notify seller
      const formattedPrice = formatNAD(finalPriceInCents);
      const emailText = `Dear ${submission.seller.fullName},\n\n` +
        `We are delighted to inform you that your timepiece, ${brand} ${model}, has been reviewed and approved by Atelier Timepieces!\n\n` +
        `Your listing is now live in our curated collection:\n` +
        `Listing Price: ${formattedPrice}\n` +
        `URL: ${process.env.APP_ORIGIN || "http://localhost:3000"}/watches/${slug}\n\n` +
        `Our private client advisors are presenting your watch to interested collectors. We will notify you immediately when enquiries or acquisition offers are placed.\n\n` +
        `Warm regards,\nAtelier Timepieces Boutique\n${BRAND.location}`;

      await sendEmailNotification({
        to: submission.seller.email,
        subject: `Approved & Published: Your ${brand} ${model} is now live at ${BRAND.name}`,
        text: emailText,
      });

      await logAdminActivity(
        "SUBMISSION_APPROVED",
        submissionId,
        `Approved submission from ${submission.seller.fullName} for ${brand} ${model} (Live slug: ${slug}, Price: ${formattedPrice}).`,
        admin,
      );

      return Response.json({
        success: true,
        message: "Submission approved and published successfully.",
        watch: publishedWatch,
      });
    }

    if (action === "REJECT") {
      await db.watchSubmission.update({
        where: { id: submissionId },
        data: {
          status: "REJECTED",
          reviewNotes: reviewNotes || "Submission does not align with current boutique curation criteria.",
          reviewedBy: admin.id,
          reviewedAt: now,
        },
      });

      const emailText = `Dear ${submission.seller.fullName},\n\n` +
        `Thank you for your patience while our team assessed your ${submission.brand} ${submission.model}.\n\n` +
        `After careful evaluation by our curation board, we are unable to accept this timepiece for consignment at this time.\n` +
        (reviewNotes ? `Curator note: ${reviewNotes}\n\n` : "\n") +
        `We sincerely appreciate your interest in Atelier Timepieces and welcome future submissions.\n\n` +
        `Kind regards,\nThe Atelier Curation Board\n${BRAND.location}`;

      await sendEmailNotification({
        to: submission.seller.email,
        subject: `Update regarding your submission: ${submission.brand} ${submission.model}`,
        text: emailText,
      });

      await logAdminActivity(
        "SUBMISSION_REJECTED",
        submissionId,
        `Rejected submission from ${submission.seller.fullName} for ${submission.brand} ${submission.model}. Reason: ${reviewNotes || "Not specified"}`,
        admin,
      );

      return Response.json({
        success: true,
        message: "Submission rejected and seller notified.",
      });
    }

    if (action === "INFO_REQUESTED") {
      await db.watchSubmission.update({
        where: { id: submissionId },
        data: {
          status: "INFO_REQUESTED",
          reviewNotes: reviewNotes || "Additional details requested from seller.",
          reviewedBy: admin.id,
          reviewedAt: now,
        },
      });

      const emailText = `Dear ${submission.seller.fullName},\n\n` +
        `Our curators have commenced the assessment of your ${submission.brand} ${submission.model}.\n\n` +
        `To complete our verification, our team requires some additional information:\n` +
        `"${reviewNotes}"\n\n` +
        `Please reply directly to this email or contact us via WhatsApp (${BRAND.whatsappDisplay}) quoting reference ${submission.id.substring(0, 8).toUpperCase()}.\n\n` +
        `Kind regards,\nAtelier Timepieces Concierge`;

      await sendEmailNotification({
        to: submission.seller.email,
        subject: `Additional information requested: ${submission.brand} ${submission.model}`,
        text: emailText,
      });

      await logAdminActivity(
        "SUBMISSION_INFO_REQUESTED",
        submissionId,
        `Requested more info from ${submission.seller.fullName}. Note: ${reviewNotes}`,
        admin,
      );

      return Response.json({
        success: true,
        message: "Request for additional information sent to seller.",
      });
    }

    throw new HttpError(400, "Invalid review action.");
  } catch (error) {
    return apiError(error);
  }
}
