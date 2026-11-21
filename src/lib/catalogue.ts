import "server-only";
import { db, databaseConfigured } from "./db";
import { defaultContent } from "./demo";
import type { Watch, SiteContent } from "./types";
import type { Watch as DbWatch, WatchImage } from "@prisma/client";
export const demoEnabled = () =>
  !databaseConfigured() &&
  (process.env.NODE_ENV === "development" || process.env.DEMO_MODE === "true");
export function watchDto(row: DbWatch & { images: WatchImage[] }): Watch {
  return {
    id: row.id,
    demo: row.isDemo,
    slug: row.slug,
    brand: row.brand,
    model: row.model,
    reference: row.reference,
    price: Number(row.price),
    currency: row.currency,
    condition: row.condition,
    year: row.year,
    diameter: row.diameter,
    movement: row.movement,
    description: row.description,
    defects: row.defects,
    images: [...row.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => i.imageUrl),
    availability: row.availability,
    sellerType: row.sellerType,
    featured: row.featured,
    published: row.published,
    box: row.box,
    papers: row.papers,
    createdAt: row.createdAt.toISOString(),
  };
}
export async function getWatches(): Promise<Watch[]> {
  if (demoEnabled()) {
    const data = await import("../../prisma/demo-watches.json");
    return data.default as Watch[];
  }
  if (!databaseConfigured())
    throw new Error("DATABASE_URL is required outside explicit demo mode.");
  return (
    await db.watch.findMany({
      where: {
        published: true,
        ...(process.env.NODE_ENV === "production" &&
        process.env.DEMO_MODE !== "true"
          ? { isDemo: false }
          : {}),
        availability: { in: ["AVAILABLE", "RESERVED"] },
      },
      include: { images: true },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 12,
    })
  ).map(watchDto);
}
export async function getWatch(slug: string) {
  if (demoEnabled())
    return (await getWatches()).find((w) => w.slug === slug) || null;
  const row = await db.watch.findFirst({
    where: {
      slug,
      published: true,
      ...(process.env.NODE_ENV === "production" &&
      process.env.DEMO_MODE !== "true"
        ? { isDemo: false }
        : {}),
      availability: { in: ["AVAILABLE", "RESERVED"] },
    },
    include: { images: true },
  });
  return row ? watchDto(row) : null;
}
export async function getContent(): Promise<SiteContent> {
  if (!databaseConfigured()) return defaultContent;
  const row = await db.siteContent.findUnique({ where: { id: "home" } });
  return {
    ...defaultContent,
    ...((row?.content as Partial<SiteContent>) || {}),
  };
}
