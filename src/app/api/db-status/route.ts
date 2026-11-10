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

  // Extract host safely without revealing password
  let host = "Unknown";
  try {
    const urlObj = new URL(dbUrl);
    host = urlObj.hostname;
  } catch {
    // fallback
  }

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
      provider: host.includes("neon.tech") ? "Neon PostgreSQL" : host.includes("prisma.io") ? "Prisma Postgres" : "PostgreSQL",
      counts: {
        customers: customerCount,
        bookings: bookingCount,
      },
      message: "Database is connected, tables are active, and queries succeed.",
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

