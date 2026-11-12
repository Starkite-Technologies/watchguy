import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { z } from "zod";
loadEnvConfig(process.cwd());
const config = z
  .object({
    DATABASE_URL: z.string().min(1),
    ADMIN_USER_ID: z.uuid(),
    ADMIN_USER_EMAIL: z.email(),
    ADMIN_USER_NAME: z.string().min(1),
  })
  .parse(process.env);
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.DATABASE_URL }),
});
try {
  await db.adminUser.upsert({
    where: { id: config.ADMIN_USER_ID },
    create: {
      id: config.ADMIN_USER_ID,
      email: config.ADMIN_USER_EMAIL,
      name: config.ADMIN_USER_NAME,
      role: "OWNER",
    },
    update: {
      email: config.ADMIN_USER_EMAIL,
      name: config.ADMIN_USER_NAME,
      role: "OWNER",
    },
  });
  console.log(
    "The configured, existing Auth identity is now an OWNER. No password was created.",
  );
} finally {
  await db.$disconnect();
}
