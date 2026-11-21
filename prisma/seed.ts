import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFile } from "node:fs/promises";
loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL)
  throw new Error("Set DATABASE_URL before seeding.");
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const { defaultContent } = await import("../src/lib/demo");
  await db.siteContent.upsert({
    where: { id: "home" },
    create: { id: "home", content: defaultContent },
    update: {},
  });
  if (process.argv.includes("--demo")) {
    if (process.env.NODE_ENV === "production")
      throw new Error("Demo seeding is disabled in production.");
    const rows = JSON.parse(await readFile("prisma/demo-watches.json", "utf8"));
    for (const row of rows) {
      const { id, demo, images, createdAt, ...data } = row;
      if (await db.watch.findUnique({ where: { slug: row.slug } })) continue;
      // Third-party listings must come from an approved seller submission
      // (database constraint), so demo ones get a fictional demo seller.
      let provenance = {};
      if (data.sellerType === "THIRD_PARTY") {
        const seller = await db.seller.create({
          data: {
            fullName: "Demo Seller",
            email: "demo-seller@example.invalid",
            phone: "+264000000000",
            preferredContactMethod: "Email",
          },
        });
        const submission = await db.watchSubmission.create({
          data: {
            sellerId: seller.id,
            brand: data.brand,
            model: data.model,
            condition: data.condition,
            requestedPrice: data.price,
            description: data.description,
            status: "APPROVED",
            reviewNotes: "Demo record.",
          },
        });
        provenance = { sellerId: seller.id, submissionId: submission.id };
      }
      await db.watch.upsert({
        where: { slug: row.slug },
        create: {
          ...data,
          ...provenance,
          isDemo: true,
          images: {
            create: images.map((imageUrl: string, sortOrder: number) => ({
              imageUrl,
              sortOrder,
            })),
          },
        },
        update: {},
      });
    }
    console.log("Clearly marked development inventory seeded.");
  } else
    console.log(
      "Homepage defaults seeded. No inventory or admin identities were created.",
    );
} finally {
  await db.$disconnect();
}
