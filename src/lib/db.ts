import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
export const db =
  globalDb.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString:
        process.env.DATABASE_URL ||
        "postgresql://postgres:preview@127.0.0.1:5432/preview",
      max: 5,
    }),
  });
if (process.env.NODE_ENV !== "production") globalDb.prisma = db;
export const databaseConfigured = !!process.env.DATABASE_URL;
export const authConfigured = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);
export const storageConfigured = !!(
  process.env.S3_PRIVATE_BUCKET &&
  process.env.S3_PUBLIC_BUCKET &&
  process.env.PUBLIC_ASSET_BASE_URL &&
  (process.env.S3_ACCESS_KEY_ID ||
    process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI ||
    process.env.AWS_WEB_IDENTITY_TOKEN_FILE)
);
export const backendConfigured =
  databaseConfigured && authConfigured && storageConfigured;
