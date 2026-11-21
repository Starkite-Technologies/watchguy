import { timingSafeEqual } from "node:crypto";
import { flushEmailQueue } from "@/lib/email";

/**
 * Flushes the email outbox. On Cloudflare the Cron Trigger in worker.ts calls
 * this in-process with a random token generated inside the Worker (never
 * configured, never sent over the network). Any other scheduler can call it
 * with `Authorization: Bearer <CRON_SECRET>` (32+ characters).
 */
export const dynamic = "force-dynamic";

const matches = (given: string, secret: string | undefined) => {
  if (!secret || secret.length < 32) return false;
  const a = Buffer.from(given);
  const b = Buffer.from("Bearer " + secret);
  return a.length === b.length && timingSafeEqual(a, b);
};

function authorized(req: Request) {
  const given = req.headers.get("authorization") ?? "";
  const internal = (globalThis as { __watchguyCronToken?: string })
    .__watchguyCronToken;
  return matches(given, internal) || matches(given, process.env.CRON_SECRET);
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
