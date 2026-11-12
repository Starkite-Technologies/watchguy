import { authConfigured, databaseConfigured } from "@/lib/db";
import { AdminLogin } from "@/components/admin-login";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administrator Sign In",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AdminLogin configured={authConfigured && databaseConfigured} />;
}
