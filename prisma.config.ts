import { defineConfig } from "prisma/config";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://postgres:preview@127.0.0.1:5432/preview",
  },
});
