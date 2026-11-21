import { publicPage } from "@/lib/public-catalogue";
import { apiError, HttpError } from "@/lib/auth";
import { z } from "zod";
export const dynamic = "force-dynamic";
const schema = z.object({
  search: z.string().max(120).optional(),
  brand: z.string().max(80).optional(),
  condition: z.string().max(40).optional(),
  availability: z
    .enum(["AVAILABLE", "RESERVED", "All availability"])
    .optional(),
  minPrice: z.coerce.number().nonnegative().max(100000000).optional(),
  maxPrice: z.coerce.number().nonnegative().max(100000000).optional(),
  boxPapers: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  sort: z.enum(["newest", "price-low", "price-high", "brand-az"]).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});
export async function GET(req: Request) {
  try {
    const parsed = schema.safeParse(
      Object.fromEntries(new URL(req.url).searchParams),
    );
    if (!parsed.success)
      throw new HttpError(400, "Check the collection filters.");
    const { page, ...filters } = parsed.data;
    return Response.json(await publicPage(filters, page), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiError(error);
  }
}
