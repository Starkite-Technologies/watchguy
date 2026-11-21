import { limitedJson } from "@/lib/http";
import { authClient, checkOrigin, apiError, HttpError } from "@/lib/auth";
import {
  backendConfigured,
  db,
  authConfigured,
  databaseConfigured,
} from "@/lib/db";
import { rateLimit } from "@/lib/services";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    if (!authConfigured() || !databaseConfigured())
      throw new HttpError(503, "Authentication is not connected yet.");
    const body = await limitedJson(req, 3000);
    const auth = await authClient();
    if (body.action === "logout") {
      await auth.auth.signOut();
      return Response.json({ success: true });
    }
    await rateLimit(req, "login", 12);
    if (
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      body.email.length > 200 ||
      body.password.length > 200
    )
      throw new HttpError(400, "Enter a valid email and password.");
    const { data, error } = await auth.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });
    if (error || !data.user)
      throw new HttpError(401, "The email or password is incorrect.");
    const admin = await db.adminUser.findUnique({
      where: { id: data.user.id },
    });
    if (!admin) {
      await auth.auth.signOut();
      throw new HttpError(
        403,
        "This account is not authorized for the studio.",
      );
    }
    return Response.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
