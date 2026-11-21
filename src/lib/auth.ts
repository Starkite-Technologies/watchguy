import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { db, databaseConfigured, authConfigured } from "./db";
import type { Role } from "@prisma/client";
import { HttpError } from "./errors";
export { HttpError, apiError } from "./errors";
export async function authClient() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
              }),
            );
          } catch {}
        },
      },
    },
  );
}
export async function getAdmin() {
  if (!databaseConfigured() || !authConfigured()) return null;
  const client = await authClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) return null;
  return db.adminUser.findUnique({ where: { id: user.id } });
}
export async function requireAdmin(
  roles: Role[] = ["OWNER", "EDITOR", "REVIEWER"],
) {
  if (!databaseConfigured() || !authConfigured())
    throw new HttpError(503, "Admin authentication is not configured.");
  const admin = await getAdmin();
  if (!admin)
    throw new HttpError(
      401,
      "Sign in with an authorized administrator account.",
    );
  if (!roles.includes(admin.role))
    throw new HttpError(403, "Your role does not allow this action.");
  return admin;
}
export function checkOrigin(req: Request) {
  const origin = req.headers.get("origin"),
    url = new URL(req.url),
    host = req.headers.get("host") || url.host;
  const allowed = process.env.APP_ORIGIN
    ? [process.env.APP_ORIGIN]
    : process.env.NODE_ENV === "production" &&
        databaseConfigured() &&
        authConfigured()
      ? []
      : [url.origin, url.protocol + "//" + host];
  if (!origin || !allowed.includes(origin))
    throw new HttpError(403, "Request origin is not allowed.");
}
