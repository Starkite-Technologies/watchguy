import { db } from "@/lib/db";
import { apiError, checkOrigin, HttpError, requireAdmin } from "@/lib/auth";
import { logAdminActivity } from "@/lib/services";

export const runtime = "nodejs";

export async function PUT(req: Request) {
  try {
    checkOrigin(req);
    const admin = await requireAdmin();
    const body = await req.json();

    const { id, status } = body;
    if (!id || !status || !["NEW", "CONTACTED", "CLOSED"].includes(status)) {
      throw new HttpError(400, "Valid enquiry id and status ('NEW', 'CONTACTED', 'CLOSED') required.");
    }

    const updated = await db.enquiry.update({
      where: { id },
      data: { status },
      include: {
        watch: { select: { brand: true, model: true } },
      },
    });

    await logAdminActivity(
      "ENQUIRY_STATUS_UPDATED",
      id,
      `Updated enquiry from ${updated.customerName} to status ${status}.`,
      admin,
    );

    return Response.json({ success: true, enquiry: updated });
  } catch (error) {
    return apiError(error);
  }
}
