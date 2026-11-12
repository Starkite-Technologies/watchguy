import "server-only";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "./db";
import { HttpError } from "./auth";
import { validImage } from "./validation";
import { BRAND } from "@/config/brand";

/**
 * Durable Rate Limiting with sliding 1-hour window
 */
export async function rateLimit(req: Request, scope: string, maxAttempts = 6) {
  const secret = process.env.RATE_LIMIT_SECRET || "dev-rate-limit-secret";
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const key = createHash("sha256")
    .update(`${scope}:${ip}:${secret}`)
    .digest("hex");

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const existing = await db.rateLimit.findUnique({ where: { key } });

  if (!existing || existing.windowStart < oneHourAgo) {
    await db.rateLimit.upsert({
      where: { key },
      create: { key, attempts: 1, windowStart: now },
      update: { attempts: 1, windowStart: now },
    });
    return;
  }

  if (existing.attempts >= maxAttempts) {
    throw new HttpError(
      429,
      "Too many requests. Please wait a while before trying again.",
    );
  }

  await db.rateLimit.update({
    where: { key },
    data: { attempts: existing.attempts + 1 },
  });
}

/**
 * Handle local file upload with validation
 */
export async function saveUploadedFile(
  file: File,
  folder: "submissions" | "watches",
): Promise<string> {
  const maxBytes = 8 * 1024 * 1024; // 8MB
  if (file.size > maxBytes || file.size === 0) {
    throw new HttpError(400, "Each photograph must be between 1 KB and 8 MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!validImage(bytes, file.type)) {
    throw new HttpError(
      400,
      "Photographs must be valid JPG, PNG, or WebP images.",
    );
  }

  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = extMap[file.type] || "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;

  // Local storage root
  const baseUploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(baseUploadDir, { recursive: true });

  const filePath = path.join(baseUploadDir, fileName);
  await fs.writeFile(filePath, Buffer.from(bytes));

  // Return relative storage path
  return `/uploads/${folder}/${fileName}`;
}

/**
 * Transactional Email Dispatcher (Resend API with reliable fallback)
 */
export async function sendEmailNotification({
  to,
  subject,
  html,
  text,
}: {
  to?: string;
  subject: string;
  html?: string;
  text: string;
}): Promise<boolean> {
  const recipient = to || process.env.ADMIN_EMAIL || BRAND.adminEmail;
  const from = process.env.EMAIL_FROM || BRAND.contactEmail;
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Development / offline simulation: log clearly so no email is silently lost
    console.log(`[EMAIL NOTIFICATION] To: ${recipient} | Subject: ${subject}`);
    console.log(`[EMAIL CONTENT]\n${text}\n-------------------`);
    return true;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Atelier Timepieces <${from}>`,
        to: [recipient],
        subject,
        text,
        html: html || `<p>${text.replace(/\n/g, "<br/>")}</p>`,
      }),
      signal: AbortSignal.timeout(8000),
    });

    return res.ok;
  } catch (error) {
    console.error("Failed to deliver transactional email:", error);
    // Return false, but do NOT throw so DB records are preserved
    return false;
  }
}

/**
 * Log Admin Action for Auditing
 */
export async function logAdminActivity(
  action: string,
  entityId: string,
  detail: string,
  actor?: { id: string; name: string } | null,
) {
  try {
    await db.adminActivityLog.create({
      data: {
        actorId: actor?.id || null,
        actorName: actor?.name || "System",
        action,
        entityId,
        detail,
      },
    });
  } catch (err) {
    console.error("Failed to record admin activity log:", err);
  }
}
