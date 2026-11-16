import { NextResponse } from "next/server";
import prisma, { getDatabaseUrl } from "@/lib/prisma";
import { ensureDatabaseTables } from "@/lib/data-store";

export async function GET() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    return NextResponse.json({
      connected: false,
      configured: false,
      message: "DATABASE_URL is not set in Vercel environment variables.",
    });
  }

  // Extract host and database safely without revealing password
  let host = "Unknown";
  let database = "Unknown";
  try {
    const urlObj = new URL(dbUrl);
    host = urlObj.hostname;
    database = urlObj.pathname ? urlObj.pathname.replace(/^\//, "") : "Unknown";
  } catch {
    // fallback
  }

  const envSource = process.env.DATABASE_URL
    ? "DATABASE_URL"
    : process.env.POSTGRES_PRISMA_URL
    ? "POSTGRES_PRISMA_URL"
    : process.env.POSTGRES_URL
    ? "POSTGRES_URL"
    : process.env.DIRECT_URL
    ? "DIRECT_URL"
    : process.env.STORAGE_URL
    ? "STORAGE_URL"
    : "default";

  try {
    // Auto-verify and create tables if needed
    await ensureDatabaseTables();

    // Run count queries
    const [customerCount, bookingCount] = await Promise.all([
      prisma.customer.count(),
      prisma.booking.count(),
    ]);

    return NextResponse.json({
      connected: true,
      configured: true,
      host,
      database,
      envSource,
      provider: host.includes("neon.tech")
        ? "Neon PostgreSQL"
        : host.includes("prisma.io")
        ? "Prisma Postgres"
        : "PostgreSQL",
      counts: {
        customers: customerCount,
        bookings: bookingCount,
      },
      message: `Database connected to ${host} (db: ${database}). Found ${customerCount} customers and ${bookingCount} bookings.`,
    });
  } catch (error: unknown) {
    console.error("Database connection check failed:", error);
    return NextResponse.json({
      connected: false,
      configured: true,
      host,
      error: error instanceof Error ? error.message : "Database connection failed",
      message: host.includes("prisma.io")
        ? "Connected to Prisma Postgres which is unreachable. Please set DATABASE_URL to your Neon database in Vercel Settings."
        : "Could not connect to database. If using Neon, compute might be waking up or credentials need verification in Vercel Settings.",
    }, { status: 500 });
  }
}

