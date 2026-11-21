import "server-only";
import { createHash } from "node:crypto";
import { db } from "./db";
import { HttpError } from "./errors";
import { clientIp } from "./client-ip";
export async function rateLimit(req: Request, scope: string, max = 5) {
  if (!process.env.RATE_LIMIT_SECRET)
    throw new HttpError(503, "This service is not configured yet.");
  const ip = clientIp(req);
  const key = createHash("sha256")
    .update(scope + ":" + ip + ":" + process.env.RATE_LIMIT_SECRET)
    .digest("hex");
  const rows = await db.$queryRaw<
    { attempts: number }[]
  >`INSERT INTO "RateLimit" ("key","attempts","windowStart") VALUES (${key},1,NOW()) ON CONFLICT ("key") DO UPDATE SET "attempts"=CASE WHEN "RateLimit"."windowStart"<NOW()-INTERVAL '1 hour' THEN 1 ELSE "RateLimit"."attempts"+1 END,"windowStart"=CASE WHEN "RateLimit"."windowStart"<NOW()-INTERVAL '1 hour' THEN NOW() ELSE "RateLimit"."windowStart" END RETURNING "attempts"`;
  if (rows[0].attempts > max)
    throw new HttpError(429, "Too many requests. Please try again in an hour.");
}
export async function verifyBot(token: unknown, action: string) {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    if (process.env.NODE_ENV === "production")
      throw new HttpError(503, "Bot verification is not configured.");
    return;
  }
  if (typeof token !== "string" || !token)
    throw new HttpError(400, "Please complete the security check.");
  const result = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
      signal: AbortSignal.timeout(10000),
    },
  );
  const verdict = await result.json();
  const hostname = process.env.APP_ORIGIN
    ? new URL(process.env.APP_ORIGIN).hostname
    : null;
  if (
    !verdict.success ||
    verdict.action !== action ||
    (hostname && verdict.hostname !== hostname)
  )
    throw new HttpError(400, "The security check expired. Please try again.");
}
