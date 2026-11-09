import { NextResponse } from "next/server";
import { getBookings, createBooking } from "@/lib/data-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const serviceTypeId = searchParams.get("serviceTypeId");
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const daysLeft = searchParams.get("daysLeft"); // e.g. "today", "1", "3", "7", "overdue", "all"

    let bookings = await getBookings();

    // Customer filter
    if (customerId) {
      bookings = bookings.filter((b) => b.customerId === customerId);
    }

    // Service filter
    if (serviceTypeId && serviceTypeId !== "all") {
      bookings = bookings.filter((b) => b.serviceTypeId === serviceTypeId);
    }

    // Status filter
    if (status && status !== "all") {
      bookings = bookings.filter((b) => b.status === status);
    }

    // Search filter across party name, phone, PNR, flightNo, sector, portal
    if (search) {
      bookings = bookings.filter((b) => {
        const party = b.customer?.name?.toLowerCase() || "";
        const phone = b.customer?.phone?.toLowerCase() || "";
        const pnr = b.pnr?.toLowerCase() || "";
        const flt = b.flightNo?.toLowerCase() || "";
        const sector = b.sector?.toLowerCase() || "";
        const portal = b.portal?.toLowerCase() || "";
        const bookingNo = b.bookingNo.toLowerCase();
        return (
          party.includes(search) ||
          phone.includes(search) ||
          pnr.includes(search) ||
          flt.includes(search) ||
          sector.includes(search) ||
          portal.includes(search) ||
          bookingNo.includes(search)
        );
      });
    }

    // Days left calculation & filter
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (daysLeft && daysLeft !== "all") {
      bookings = bookings.filter((b) => {
        if (!b.travelDate) return false;
        const travel = new Date(b.travelDate);
        travel.setHours(0, 0, 0, 0);
        const diffDays = Math.round((travel.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysLeft === "today") return diffDays === 0;
        if (daysLeft === "tomorrow") return diffDays === 1;
        if (daysLeft === "3days") return diffDays >= 0 && diffDays <= 3;
        if (daysLeft === "7days") return diffDays >= 0 && diffDays <= 7;
        if (daysLeft === "overdue") return diffDays < 0;
        if (daysLeft === "delayed") return b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";
        return true;
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customerId) {
      return NextResponse.json({ error: "Customer is required" }, { status: 400 });
    }
    if (!body.serviceTypeId) {
      return NextResponse.json({ error: "Service type is required" }, { status: 400 });
    }
    const created = await createBooking(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
