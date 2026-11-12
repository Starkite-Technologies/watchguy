import { db } from "@/lib/db";
import {
  apiError,
  checkOrigin,
  createAdminSession,
  destroyAdminSession,
  getAdmin,
  HttpError,
  verifyPassword,
} from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validation";
import { logAdminActivity } from "@/lib/services";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0].message);
    }

    const { email, password } = parsed.data;
    const admin = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      throw new HttpError(401, "Invalid administrator credentials.");
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      throw new HttpError(401, "Invalid administrator credentials.");
    }

    await createAdminSession({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    });

    await logAdminActivity("ADMIN_LOGIN", admin.id, `Admin ${admin.name} signed in successfully.`, {
      id: admin.id,
      name: admin.name,
    });

    return Response.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE() {
  try {
    const admin = await getAdmin();
    if (admin) {
      await logAdminActivity("ADMIN_LOGOUT", admin.id, `Admin ${admin.name} signed out.`, admin);
    }
    await destroyAdminSession();
    return Response.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
