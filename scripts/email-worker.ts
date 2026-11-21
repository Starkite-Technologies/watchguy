import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const { flushEmailQueue } = await import("../src/lib/email");
const { db } = await import("../src/lib/db");

// One-shot by default (for cron). `--loop` keeps running and flushes every
// MAIL_FLUSH_INTERVAL_SECONDS (default 60), for a dedicated worker container.
const loop = process.argv.includes("--loop");
const intervalMs =
  Math.max(10, Number(process.env.MAIL_FLUSH_INTERVAL_SECONDS) || 60) * 1000;

let stopping = false;
let wake: (() => void) | undefined;
for (const signal of ["SIGTERM", "SIGINT"] as const)
  process.on(signal, () => {
    stopping = true;
    wake?.();
  });

try {
  do {
    try {
      const result = await flushEmailQueue(25);
      console.log(new Date().toISOString(), JSON.stringify(result));
    } catch (error) {
      if (!loop) throw error;
      console.error(new Date().toISOString(), "mail flush failed", error);
    }
    if (loop && !stopping)
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, intervalMs);
        wake = () => {
          clearTimeout(timer);
          resolve();
        };
      });
  } while (loop && !stopping);
} finally {
  await db.$disconnect();
}
