import { NextResponse } from "next/server";
import { getServiceTypes, createServiceType } from "@/lib/data-store";

export async function GET() {
  try {
    const services = await getServiceTypes();
    return NextResponse.json(services);
  } catch (error) {
    console.error("Failed to fetch services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "Service name is required" }, { status: 400 });
    }
    const created = await createServiceType(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create service:", error);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
