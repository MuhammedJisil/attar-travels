import { NextResponse } from "next/server";
import { getCustomers, createCustomer } from "@/lib/data-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json(customers, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
    }
    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json({ error: "Mobile number is required" }, { status: 400 });
    }
    const created = await createCustomer(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("Failed to create customer:", error);
    const msg = error instanceof Error ? error.message : "Failed to create customer";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

