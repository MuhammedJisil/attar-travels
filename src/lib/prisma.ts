import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check environment variables in priority order
export const getDatabaseUrl = (): string | undefined => {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DIRECT_URL,
    process.env.STORAGE_URL,
  ].filter(Boolean) as string[];

  // Prefer a Neon or PostgreSQL standard URL over an unconfigured db.prisma.io url
  const nonPrismaIo = candidates.find((url) => !url.includes("prisma.io"));
  if (nonPrismaIo) return nonPrismaIo;

  return candidates[0];
};

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
