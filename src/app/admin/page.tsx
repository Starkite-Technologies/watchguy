import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { AdminStudio } from "@/components/admin-studio";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Private Administration",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return <AdminStudio />;
}
