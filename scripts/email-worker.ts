import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const { flushEmailQueue } = await import("../src/lib/email");
const { db } = await import("../src/lib/db");
try {
  console.log(await flushEmailQueue(25));
} finally {
  await db.$disconnect();
}
