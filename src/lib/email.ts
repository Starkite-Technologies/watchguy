import { db } from "./db";
export const emailConfigured = () =>
  !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
export const adminRecipients = () =>
  process.env.ADMIN_EMAIL?.split(",")
    .map((s) => s.trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) || [];
export async function flushEmailQueue(limit = 15) {
  if (!emailConfigured()) return { sent: 0, failed: 0, configured: false };
  const now = new Date(),
    stale = new Date(Date.now() - 10 * 60 * 1000);
  const due = await db.emailOutbox.findMany({
    where: {
      attempts: { lt: 5 },
      OR: [
        { status: { in: ["PENDING", "FAILED"] }, nextAttempt: { lte: now } },
        { status: "SENDING", claimedAt: { lt: stale } },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  let sent = 0,
    failed = 0;
  for (const job of due) {
    const claimed = await db.emailOutbox.updateMany({
      where: {
        id: job.id,
        attempts: job.attempts,
        OR: [
          { status: { in: ["PENDING", "FAILED"] } },
          { status: "SENDING", claimedAt: { lt: stale } },
        ],
      },
      data: {
        status: "SENDING",
        claimedAt: new Date(),
        attempts: { increment: 1 },
      },
    });
    if (!claimed.count) continue;
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.RESEND_API_KEY,
          "Content-Type": "application/json",
          "Idempotency-Key": "atelier-email/" + job.id,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM,
          to: [job.to],
          subject: job.subject,
          text: job.text,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error("Provider returned " + response.status);
      await db.emailOutbox.update({
        where: { id: job.id },
        data: { status: "SENT", sentAt: new Date(), lastError: null },
      });
      sent++;
    } catch (error) {
      failed++;
      await db.emailOutbox
        .update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            lastError:
              error instanceof Error ? error.message : "Delivery failed",
            nextAttempt: new Date(
              Date.now() + Math.pow(2, job.attempts + 1) * 60000,
            ),
          },
        })
        .catch(() => {});
    }
  }
  return { sent, failed, configured: true };
}
export async function tryFlushEmail() {
  try {
    return await flushEmailQueue();
  } catch {
    return { sent: 0, failed: 0, configured: emailConfigured() };
  }
}
