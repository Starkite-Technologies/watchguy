import { db } from "@/lib/db";
import { apiError, checkOrigin, HttpError } from "@/lib/auth";
import { submissionSchema } from "@/lib/validation";
import { rateLimit, saveUploadedFile, sendEmailNotification } from "@/lib/services";
import { BRAND, formatNAD } from "@/config/brand";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const savedFilePaths: string[] = [];

  try {
    checkOrigin(req);
    await rateLimit(req, "watch_submission", 8);

    const formData = await req.formData();
    const rawData = Object.fromEntries(formData);

    const parsed = submissionSchema.safeParse({
      ...rawData,
      box: formData.get("box") === "true",
      papers: formData.get("papers") === "true",
      proof: formData.get("proof") === "true",
      consent: formData.get("consent") === "true",
    });

    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0].message);
    }

    const {
      fullName,
      email,
      phone,
      preferredContactMethod,
      brand,
      model,
      referenceNumber,
      year,
      condition,
      requestedPrice,
      currency,
      description,
      defects,
      box,
      papers,
      proof,
    } = parsed.data;

    // Extract photo files
    const photoFiles = formData
      .getAll("photos")
      .filter((item): item is File => item instanceof File && item.size > 0);

    if (photoFiles.length === 0) {
      throw new HttpError(400, "Please upload at least one photograph of your watch.");
    }
    if (photoFiles.length > 8) {
      throw new HttpError(400, "Maximum of 8 photographs allowed per submission.");
    }

    // Save uploaded photos
    for (const file of photoFiles) {
      const storedPath = await saveUploadedFile(file, "submissions");
      savedFilePaths.push(storedPath);
    }

    // 1. Find or create Seller
    let seller = await db.seller.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (!seller) {
      seller = await db.seller.create({
        data: {
          fullName,
          email: email.toLowerCase(),
          phone,
          preferredContactMethod,
        },
      });
    } else {
      seller = await db.seller.update({
        where: { id: seller.id },
        data: { fullName, phone, preferredContactMethod },
      });
    }

    // 2. Convert requestedPrice to integer minor units (cents)
    const priceInCents = Math.round(requestedPrice * BRAND.minorUnitFactor);

    // 3. Create WatchSubmission in PENDING_REVIEW state (NEVER auto-published)
    const submission = await db.watchSubmission.create({
      data: {
        sellerId: seller.id,
        brand,
        model,
        referenceNumber: referenceNumber || null,
        year: year || null,
        condition,
        requestedPrice: priceInCents,
        currency,
        description,
        defects: defects || null,
        box,
        papers,
        proof,
        status: "PENDING_REVIEW",
        images: {
          create: savedFilePaths.map((filePath, index) => ({
            storageKey: filePath,
            sortOrder: index,
          })),
        },
      },
    });

    // 4. Send email notifications
    const formattedPrice = formatNAD(priceInCents);
    const adminAlertText = `A new watch has been submitted for consignment / sale review.\n\n` +
      `Timepiece: ${brand} ${model} ${referenceNumber ? `(Ref. ${referenceNumber})` : ""}\n` +
      `Asking Price: ${formattedPrice}\n` +
      `Seller: ${fullName} (${email}, ${phone})\n` +
      `Preferred Contact: ${preferredContactMethod}\n` +
      `Condition: ${condition}\n` +
      `Box & Papers: Box: ${box ? "Yes" : "No"}, Papers: ${papers ? "Yes" : "No"}\n\n` +
      `Please review this submission in the Atelier Admin Studio: ${process.env.APP_ORIGIN || "http://localhost:3000"}/admin`;

    await sendEmailNotification({
      to: process.env.ADMIN_EMAIL || BRAND.adminEmail,
      subject: `[New Submission] ${brand} ${model} — ${formattedPrice}`,
      text: adminAlertText,
    });

    const sellerAckText = `Dear ${fullName},\n\n` +
      `Thank you for submitting your ${brand} ${model} to ${BRAND.name}.\n\n` +
      `Our horological curation team is reviewing your timepiece details and photographs. We will contact you via ${preferredContactMethod.toLowerCase()} within 1–2 business days.\n\n` +
      `Submission Reference: ${submission.id.substring(0, 8).toUpperCase()}\n\n` +
      `Kind regards,\nThe Atelier Concierge Team\n${BRAND.location}`;

    await sendEmailNotification({
      to: email,
      subject: `Watch Submission Received: ${brand} ${model} [Ref: ${submission.id.substring(0, 8).toUpperCase()}]`,
      text: sellerAckText,
    });

    return Response.json(
      {
        success: true,
        submissionId: submission.id,
        referenceCode: submission.id.substring(0, 8).toUpperCase(),
        message: "Your watch has been submitted successfully for curation review.",
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
