import { cookies } from "next/headers";
import { db } from "./db";
import { signPayload, verifySessionToken } from "./crypto";

export * from "./crypto";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const SESSION_COOKIE_NAME = "atelier_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Create and set HTTP-only admin session cookie
 */
export async function createAdminSession(user: { id: string; email: string; role: string }) {
  const payload = JSON.stringify({
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });

  const token = await signPayload(payload);
  const cookieJar = await cookies();
  cookieJar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Destroy admin session cookie
 */
export async function destroyAdminSession() {
  const cookieJar = await cookies();
  cookieJar.delete(SESSION_COOKIE_NAME);
}

/**
 * Get current authenticated admin user from session
 */
export async function getAdmin() {
  try {
    const cookieJar = await cookies();
    const token = cookieJar.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session) return null;

    const user = await db.adminUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

/**
 * Require admin authentication with role check
 */
export async function requireAdmin(allowedRoles: string[] = ["OWNER", "EDITOR", "REVIEWER"]) {
  const admin = await getAdmin();
  if (!admin) {
    throw new HttpError(401, "Authentication required. Please sign in to the Atelier Studio.");
  }
  if (!allowedRoles.includes(admin.role)) {
    throw new HttpError(403, "Access denied. Insufficient administrative privileges.");
  }
  return admin;
}

/**
 * CSRF / Origin Validation
 */
export function checkOrigin(req: Request) {
  if (process.env.NODE_ENV === "development") return;
  const origin = req.headers.get("origin");
  const requestUrl = new URL(req.url);
  const host = req.headers.get("host") || requestUrl.host;
  const allowed = process.env.APP_ORIGIN;
  if (allowed && origin && origin !== allowed) {
    throw new HttpError(403, "Untrusted request origin.");
  }
}

/**
 * Standard API error formatter
 */
export function apiError(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Internal Server Error:", error);
  return Response.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
}
