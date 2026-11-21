import type { MetadataRoute } from "next";
import { db, databaseConfigured } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.DEMO_MODE === "true" || !databaseConfigured()) return [];
  const base = process.env.APP_ORIGIN!;
  const rows = await db.watch.findMany({
    where: {
      published: true,
      isDemo: false,
      availability: { in: ["AVAILABLE", "RESERVED"] },
    },
    select: { slug: true, updatedAt: true },
    take: 49000,
  });
  return [
    ...[
      "",
      "/collection",
      "/about",
      "/sell",
      "/contact",
      "/privacy",
      "/terms",
    ].map((path) => ({ url: base + path })),
    ...rows.map((row) => ({
      url: base + "/watches/" + row.slug,
      lastModified: row.updatedAt,
    })),
  ];
}
