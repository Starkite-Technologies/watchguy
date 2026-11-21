import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { getWatches, watchDto, demoEnabled } from "./catalogue";
import { filterWatches, type Filters } from "./demo";

export type BrandCount = { brand: string; count: number };
export const PAGE_SIZE = 12;

/** Published, buyable listings (demo rows only when demo mode is on). */
const visibleWhere = (): Prisma.WatchWhereInput => ({
  published: true,
  ...(process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true"
    ? { isDemo: false }
    : {}),
  availability: { in: ["AVAILABLE", "RESERVED"] },
});

function countBrands(brands: string[]): BrandCount[] {
  const counts = new Map<string, number>();
  for (const b of brands) counts.set(b, (counts.get(b) || 0) + 1);
  return [...counts]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
}

export async function publicPage(
  filters: Filters = {},
  page = 1,
  size = PAGE_SIZE,
) {
  if (demoEnabled()) {
    const rows = await getWatches(),
      filtered = filterWatches(rows, filters);
    const brandCounts = countBrands(filterWatches(rows).map((w) => w.brand));
    return {
      watches: filtered.slice((page - 1) * size, page * size),
      total: filtered.length,
      brands: brandCounts.map((b) => b.brand),
      brandCounts,
      page,
    };
  }
  const where: Prisma.WatchWhereInput = visibleWhere();
  if (filters.search)
    where.OR = ["brand", "model", "reference"].map((key) => ({
      [key]: { contains: filters.search, mode: "insensitive" },
    }));
  if (filters.brand && filters.brand !== "All brands")
    where.brand = filters.brand;
  if (filters.condition && filters.condition !== "All conditions")
    where.condition = filters.condition;
  if (
    filters.availability === "AVAILABLE" ||
    filters.availability === "RESERVED"
  )
    where.availability = filters.availability;
  if (filters.boxPapers) {
    where.box = true;
    where.papers = true;
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined)
    where.price = {
      gte: filters.minPrice?.toString(),
      lte: filters.maxPrice?.toString(),
    };
  const orderBy: Prisma.WatchOrderByWithRelationInput[] =
    filters.sort === "price-low"
      ? [{ price: "asc" }, { id: "asc" }]
      : filters.sort === "price-high"
        ? [{ price: "desc" }, { id: "asc" }]
        : filters.sort === "brand-az"
          ? [{ brand: "asc" }, { model: "asc" }, { id: "asc" }]
          : [{ createdAt: "desc" }, { id: "asc" }];
  const [rows, total, grouped] = await Promise.all([
    db.watch.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { images: true } },
      },
      orderBy,
      skip: (page - 1) * size,
      take: size,
    }),
    db.watch.count({ where }),
    db.watch.groupBy({
      by: ["brand"],
      where: visibleWhere(),
      _count: { _all: true },
      orderBy: { brand: "asc" },
    }),
  ]);
  const brandCounts = grouped.map((g) => ({
    brand: g.brand,
    count: g._count._all,
  }));
  return {
    watches: rows.map(watchDto),
    total,
    brands: brandCounts.map((b) => b.brand),
    brandCounts,
    page,
  };
}

/** Other listings from the same brand, for "More from {brand}". */
export async function relatedWatches(brand: string, excludeId: string) {
  if (demoEnabled())
    return (await getWatches())
      .filter((w) => w.brand === brand && w.id !== excludeId)
      .slice(0, 4);
  const rows = await db.watch.findMany({
    where: { ...visibleWhere(), brand, NOT: { id: excludeId } },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      _count: { select: { images: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
  });
  return rows.map(watchDto);
}
