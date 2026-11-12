import { db } from "@/lib/db";
import { apiError, requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const noCacheHeaders = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate",
};

export async function GET() {
  try {
    const admin = await requireAdmin();

    const [watches, submissions, enquiries, activities] = await Promise.all([
      db.watch.findMany({
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
          seller: {
            select: { fullName: true, email: true, phone: true },
          },
          _count: {
            select: { enquiries: true },
          },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
      db.watchSubmission.findMany({
        include: {
          seller: true,
          images: {
            orderBy: { sortOrder: "asc" },
          },
          approvedWatch: {
            select: { id: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.enquiry.findMany({
        include: {
          watch: {
            select: { id: true, brand: true, model: true, referenceNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.adminActivityLog.findMany({
        take: 30,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // Calculate metrics
    const totalPublished = watches.filter((w) => w.published && w.status !== "SOLD").length;
    const pendingSubmissions = submissions.filter((s) => s.status === "PENDING_REVIEW").length;
    const soldWatches = watches.filter((w) => w.status === "SOLD").length;
    const totalEnquiries = enquiries.length;
    const totalInventoryValue = watches
      .filter((w) => w.published && w.status === "AVAILABLE")
      .reduce((acc, curr) => acc + curr.price, 0);

    return Response.json(
      {
        admin,
        metrics: {
          totalPublished,
          pendingSubmissions,
          soldWatches,
          totalEnquiries,
          totalInventoryValue,
        },
        watches,
        submissions,
        enquiries,
        activities,
      },
      { headers: noCacheHeaders },
    );
  } catch (error) {
    return apiError(error);
  }
}
