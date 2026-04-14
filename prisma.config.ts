import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts",
  },
  datasource: {
    // Works for both "file:./dev.db" (local SQLite) and
    // "libsql://..." (Turso in production)
    url: process.env.DATABASE_URL ?? "file:./dev.db",
  },
});
