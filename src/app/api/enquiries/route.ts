import { db } from "@/lib/db";
import { apiError, checkOrigin, HttpError } from "@/lib/auth";
import { enquirySchema } from "@/lib/validation";
import { rateLimit, sendEmailNotification } from "@/lib/services";
import { BRAND } from "@/config/brand";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    await rateLimit(req, "customer_enquiry", 10);

    const body = await req.json();
    const parsed = enquirySchema.safeParse(body);

    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0].message);
    }

    const { customerName, customerEmail, customerPhone, message, watchId } = parsed.data;

    let watchTitle = "General Boutique Enquiry";
    if (watchId) {
      const watch = await db.watch.findUnique({
        where: { id: watchId },
        select: { brand: true, model: true, referenceNumber: true },
      });
      if (watch) {
        watchTitle = `${watch.brand} ${watch.model} ${watch.referenceNumber ? `(Ref. ${watch.referenceNumber})` : ""}`;
      }
    }

    const enquiry = await db.enquiry.create({
      data: {
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        message,
        watchId: watchId || null,
        status: "NEW",
      },
    });

    // Notify admin
    const emailText = `New customer enquiry received regarding: ${watchTitle}\n\n` +
      `Customer: ${customerName}\n` +
      `Email: ${customerEmail}\n` +
      `Phone: ${customerPhone || "Not provided"}\n\n` +
      `Message:\n${message}\n\n` +
      `View in Atelier Studio: ${process.env.APP_ORIGIN || "http://localhost:3000"}/admin`;

    const emailSent = await sendEmailNotification({
      to: process.env.ADMIN_EMAIL || BRAND.adminEmail,
      subject: `[Customer Enquiry] ${watchTitle} — ${customerName}`,
      text: emailText,
    });

    if (emailSent) {
      await db.enquiry.update({
        where: { id: enquiry.id },
        data: { emailSent: true },
      });
    }

    return Response.json(
      {
        success: true,
        message: "Thank you for contacting Atelier Timepieces. A private client advisor will respond promptly.",
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
