import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding travels office data...");

  // 1. Agency Settings
  await prisma.agencySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      agencyName: "Al-Madina Travels & Tours",
      tagline: "Your Trusted Travel & Ticketing Partner",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      email: "booking@almadinatravels.com",
      address: "Shop No. 12, Ground Floor, Skyline Commercial Complex, Calicut, Kerala - 673001",
      taxNumber: "GSTIN: 32AAAAA0000A1Z5",
      bankDetails: "A/C: 50200012345678 | HDFC Bank, Calicut Branch | IFSC: HDFC0001234 | UPI: almadinatravels@hdfcbank",
      termsConditions: "1. Please report at airport 3 hours prior to international departure and 2 hours for domestic.\n2. Date change & cancellation charges are applicable as per airline fare rules.\n3. Verify passport validity (minimum 6 months from travel date required).",
    },
  });

  // 2. Service Types
  const services = [
    { name: "Flight Ticket", code: "FLIGHT", description: "Domestic & International airline tickets" },
    { name: "Passport Service", code: "PASSPORT", description: "New passport, renewal & tatkal assistance" },
    { name: "Visa Processing", code: "VISA", description: "Tourist, visit & employment visas" },
    { name: "Hotel Booking", code: "HOTEL", description: "Domestic & international hotel reservations" },
    { name: "Tour Package", code: "TOUR", description: "Custom holiday packages & group tours" },
    { name: "Bus / Train Ticket", code: "TRANSPORT", description: "Intercity bus & railway reservations" },
  ];

  const serviceMap: Record<string, string> = {};
  for (const s of services) {
    const created = await prisma.serviceType.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
    serviceMap[s.code] = created.id;
  }

  // 3. Customers
  const cust1 = await prisma.customer.create({
    data: {
      name: "Mohammed Rashid",
      phone: "+91 98471 23456",
      email: "rashid.m@gmail.com",
      city: "Calicut",
      notes: "Frequent flyer to Dubai / Gulf sector",
    },
  });

  const cust2 = await prisma.customer.create({
    data: {
      name: "Ananya Sharma",
      phone: "+91 97450 98765",
      email: "ananya.s@outlook.com",
      city: "Kochi",
      notes: "Corporate traveler - IT consultancy",
    },
  });

  const now = new Date();
  const addDays = (d: number, h: number = 0) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    date.setHours(date.getHours() + h);
    return date;
  };

  // 4. Bookings
  await prisma.booking.create({
    data: {
      bookingNo: "TRV-2026-101",
      customerId: cust1.id,
      serviceTypeId: serviceMap["FLIGHT"],
      issueDate: addDays(-5),
      travelDate: addDays(0, 4), // Today
      returnDate: addDays(15),
      sector: "CCJ (Calicut) - DXB (Dubai)",
      flightNo: "IX 343",
      pnr: "Z7K9PL",
      flightTime: "22:15",
      portal: "Air India Express Portal",
      passengerCount: 1,
      passengerNames: "Mohammed Rashid",
      status: "Confirmed",
      alertNotes: "Web check-in completed. Gate opens at 20:45.",
      totalAmount: 18500,
      paidAmount: 18500,
      balanceAmount: 0,
      paymentStatus: "Paid",
    },
  });

  await prisma.booking.create({
    data: {
      bookingNo: "TRV-2026-102",
      customerId: cust2.id,
      serviceTypeId: serviceMap["FLIGHT"],
      issueDate: addDays(-8),
      travelDate: addDays(1), // Tomorrow
      sector: "COK (Cochin) - BLR (Bangalore)",
      flightNo: "6E 6231",
      pnr: "W4MN8Q",
      flightTime: "07:30 AM",
      portal: "IndiGo Direct",
      passengerCount: 1,
      passengerNames: "Ananya Sharma",
      status: "Flight Delayed",
      alertNotes: "Flight delayed by 1 hour 45 mins. Revised departure: 09:15 AM.",
      totalAmount: 5200,
      paidAmount: 5200,
      balanceAmount: 0,
      paymentStatus: "Paid",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
