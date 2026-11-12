import { db } from "@/lib/db";
import { apiError, checkOrigin, HttpError, requireAdmin } from "@/lib/auth";
import { watchManagementSchema } from "@/lib/validation";
import { logAdminActivity } from "@/lib/services";
import { BRAND, formatNAD } from "@/config/brand";

export const runtime = "nodejs";

function generateSlug(brand: string, model: string, reference?: string | null): string {
  const base = `${brand}-${model}-${reference || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const admin = await requireAdmin(["OWNER", "EDITOR"]);
    const body = await req.json();

    const parsed = watchManagementSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0].message);
    }

    const { images, price, ...data } = parsed.data;
    const priceInCents = Math.round(price * BRAND.minorUnitFactor);
    const slug = generateSlug(data.brand, data.model, data.referenceNumber);

    const watch = await db.watch.create({
      data: {
        ...data,
        slug,
        price: priceInCents,
        ownershipType: data.ownershipType || "COMPANY",
        images: {
          create: images.map((url, idx) => ({
            imageUrl: url,
            sortOrder: idx,
          })),
        },
      },
      include: { images: true },
    });

    await logAdminActivity(
      "WATCH_CREATED",
      watch.id,
      `Created listing for ${watch.brand} ${watch.model} priced at ${formatNAD(priceInCents)}.`,
      admin,
    );

    return Response.json({ success: true, watch }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(req: Request) {
  try {
    checkOrigin(req);
    const admin = await requireAdmin(["OWNER", "EDITOR"]);
    const body = await req.json();

    const { id, images, price, ...rest } = body;
    if (!id || typeof id !== "string") {
      throw new HttpError(400, "Missing watch identifier.");
    }

    const existing = await db.watch.findUnique({ where: { id } });
    if (!existing) {
      throw new HttpError(404, "Watch not found.");
    }

    const updateData: Record<string, unknown> = { ...rest };
    if (price !== undefined) {
      updateData.price = Math.round(Number(price) * BRAND.minorUnitFactor);
    }

    const updated = await db.watch.update({
      where: { id },
      data: updateData,
      include: { images: true },
    });

    // If new images provided
    if (Array.isArray(images)) {
      await db.watchImage.deleteMany({ where: { watchId: id } });
      for (let i = 0; i < images.length; i++) {
        await db.watchImage.create({
          data: {
            watchId: id,
            imageUrl: images[i],
            sortOrder: i,
          },
        });
      }
    }

    await logAdminActivity(
      "WATCH_UPDATED",
      id,
      `Updated ${updated.brand} ${updated.model} (Status: ${updated.status}, Price: ${formatNAD(updated.price)}).`,
      admin,
    );

    return Response.json({ success: true, watch: updated });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    checkOrigin(req);
    const admin = await requireAdmin(["OWNER"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new HttpError(400, "Watch ID is required.");
    }

    const watch = await db.watch.findUnique({ where: { id } });
    if (!watch) {
      throw new HttpError(404, "Watch not found.");
    }

    await db.watch.delete({ where: { id } });

    await logAdminActivity(
      "WATCH_DELETED",
      id,
      `Deleted watch listing: ${watch.brand} ${watch.model}.`,
      admin,
    );

    return Response.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
