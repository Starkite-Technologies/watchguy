import { timingSafeEqual } from "node:crypto";
import { flushEmailQueue } from "@/lib/email";

/**
 * Flushes the email outbox. Called every minute by the Cloudflare Cron Trigger
 * (see worker.ts), or by any scheduler that sends
 * `Authorization: Bearer <CRON_SECRET>`. Disabled unless CRON_SECRET is set.
 */
export const dynamic = "force-dynamic";

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from("Bearer " + secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(req: Request) {
  if (!authorized(req))
    return Response.json({ error: "Not found." }, { status: 404 });
  try {
    return Response.json(await flushEmailQueue(25));
  } catch (error) {
    console.error("mail flush failed", error);
    return Response.json({ error: "Mail flush failed." }, { status: 500 });
  }
}
