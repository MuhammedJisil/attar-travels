import { NextResponse } from "next/server";
import prisma, { getDatabaseUrl } from "@/lib/prisma";

export async function GET() {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    return NextResponse.json({
      connected: false,
      configured: false,
      message: "DATABASE_URL is not set in Vercel environment variables.",
    });
  }

  try {
    // Run quick query
    const [customerCount, bookingCount] = await Promise.all([
      prisma.customer.count(),
      prisma.booking.count(),
    ]);

    return NextResponse.json({
      connected: true,
      configured: true,
      provider: "Neon PostgreSQL",
      counts: {
        customers: customerCount,
        bookings: bookingCount,
      },
      message: "Database is connected and active.",
    });
  } catch (error: unknown) {
    console.error("Database connection check failed:", error);
    return NextResponse.json({
      connected: false,
      configured: true,
      error: error instanceof Error ? error.message : "Database connection failed",
      message: "Could not connect to database. If using Neon, compute might be waking up or credentials need verification.",
    }, { status: 500 });
  }
}
