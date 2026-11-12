import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

  if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
    throw new Error(
      "To connect directly to PostgreSQL, run with postgres adapter or set up database pooler.",
    );
  }

  const cleanPath = dbUrl.replace(/^file:/, "");
  const resolvedPath = path.isAbsolute(cleanPath)
    ? cleanPath
    : path.resolve(process.cwd(), cleanPath);

  const adapter = new PrismaBetterSqlite3({ url: resolvedPath });

  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
