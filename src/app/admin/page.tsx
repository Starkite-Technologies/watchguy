import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Atelier Studio — Private Administration",
};

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  // Fetch full operational data
  const [watches, submissions, enquiries, activities] = await Promise.all([
    db.watch.findMany({
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        seller: { select: { fullName: true, email: true, phone: true } },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    }),
    db.watchSubmission.findMany({
      include: {
        seller: true,
        images: { orderBy: { sortOrder: "asc" } },
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
      take: 25,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPublished = watches.filter((w) => w.published && w.status !== "SOLD").length;
  const pendingSubmissions = submissions.filter((s) => s.status === "PENDING_REVIEW").length;
  const soldWatches = watches.filter((w) => w.status === "SOLD").length;
  const totalEnquiries = enquiries.length;
  const totalInventoryValue = watches
    .filter((w) => w.published && w.status === "AVAILABLE")
    .reduce((acc, curr) => acc + curr.price, 0);

  const initialData = {
    admin,
    metrics: {
      totalPublished,
      pendingSubmissions,
      soldWatches,
      totalEnquiries,
      totalInventoryValue,
    },
    watches: watches.map((w) => ({
      ...w,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    })),
    submissions: submissions.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    enquiries: enquiries.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
    activities: activities.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  };

  return <AdminDashboard initialData={initialData} />;
}
