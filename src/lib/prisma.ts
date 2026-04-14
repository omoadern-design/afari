import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import fs from "fs";
import path from "path";

function getDbUrl(): string {
  const envUrl = process.env.DATABASE_URL;

  // If pointing to a remote libsql/Turso DB, use it
  if (envUrl && (envUrl.startsWith("libsql://") || envUrl.startsWith("https://"))) {
    return envUrl;
  }

  // In Vercel serverless, copy seed DB to /tmp for read-write access
  if (process.env.VERCEL || (process.env.NODE_ENV === "production" && !envUrl?.startsWith("file:"))) {
    const tmpDb = "/tmp/afari.db";
    if (!fs.existsSync(tmpDb)) {
      const seedDb = path.join(process.cwd(), "prisma", "seed.db");
      if (fs.existsSync(seedDb)) {
        fs.copyFileSync(seedDb, tmpDb);
      }
    }
    return `file:${tmpDb}`;
  }

  // Local development
  return envUrl ?? "file:./prisma/dev.db";
}

function createPrismaClient() {
  const url = getDbUrl();
  const isRemote = url.startsWith("libsql://") || url.startsWith("https://");

  if (isRemote) {
    const authToken = process.env.DATABASE_AUTH_TOKEN;
    const adapter = new PrismaLibSql({ url, authToken });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  // Local file mode - use libsql adapter with file URL
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
