import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { getWatches, watchDto, demoEnabled } from "./catalogue";
import { filterWatches, type Filters } from "./demo";
export async function publicPage(filters: Filters = {}, page = 1, size = 9) {
  if (demoEnabled()) {
    const rows = await getWatches(),
      filtered = filterWatches(rows, filters);
    return {
      watches: filtered.slice((page - 1) * size, page * size),
      total: filtered.length,
      brands: [...new Set(rows.map((w) => w.brand))].sort(),
      page,
    };
  }
  const where: Prisma.WatchWhereInput = {
    published: true,
    ...(process.env.NODE_ENV === "production" &&
    process.env.DEMO_MODE !== "true"
      ? { isDemo: false }
      : {}),
    availability: { in: ["AVAILABLE", "RESERVED"] },
  };
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
        : [{ createdAt: "desc" }, { id: "asc" }];
  const [rows, total, brands] = await Promise.all([
    db.watch.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy,
      skip: (page - 1) * size,
      take: size,
    }),
    db.watch.count({ where }),
    db.watch.findMany({
      where: {
        published: true,
        ...(process.env.NODE_ENV === "production" &&
        process.env.DEMO_MODE !== "true"
          ? { isDemo: false }
          : {}),
        availability: { in: ["AVAILABLE", "RESERVED"] },
      },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);
  return {
    watches: rows.map(watchDto),
    total,
    brands: brands.map((b) => b.brand),
    page,
  };
}
