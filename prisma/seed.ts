import { loadEnvConfig } from "@next/env";
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
      await db.watch.upsert({
        where: { slug: row.slug },
        create: {
          ...data,
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
