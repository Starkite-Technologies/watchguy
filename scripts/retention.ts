import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const { db } = await import("../src/lib/db");
const { removeObjects, privateBucket } = await import("../src/lib/storage");
const days = Number(process.env.REJECTED_RETENTION_DAYS || 90);
if (!Number.isInteger(days) || days < 1)
  throw new Error("Set a positive retention period.");
const cutoff = new Date(Date.now() - days * 86400000);
try {
  const rows = await db.watchSubmission.findMany({
    where: { status: "REJECTED", reviewedAt: { lt: cutoff } },
    include: { images: true },
  });
  console.log({
    expiredRejectedSubmissions: rows.length,
    mode: process.argv.includes("--apply") ? "apply" : "dry-run",
  });
  if (process.argv.includes("--apply")) {
    for (const row of rows) {
      await removeObjects(
        privateBucket(),
        row.images.map((i) => i.storageKey),
      );
      await db.$transaction(async (tx) => {
        await tx.emailOutbox.deleteMany({ where: { submissionId: row.id } });
        await tx.watchSubmission.delete({ where: { id: row.id } });
        await tx.adminActivityLog.updateMany({
          where: { entityId: row.id },
          data: {
            detail:
              "Private details removed under the configured retention policy.",
          },
        });
        if (
          !(await tx.watchSubmission.count({
            where: { sellerId: row.sellerId },
          })) &&
          !(await tx.watch.count({ where: { sellerId: row.sellerId } }))
        )
          await tx.seller.delete({ where: { id: row.sellerId } });
      });
    }
    await db.rateLimit.deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - 86400000) } },
    });
  }
} finally {
  await db.$disconnect();
}
