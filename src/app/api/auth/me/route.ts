import { getAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getAdmin();
  if (!admin) {
    return Response.json({ authenticated: false, admin: null });
  }
  return Response.json({
    authenticated: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}
