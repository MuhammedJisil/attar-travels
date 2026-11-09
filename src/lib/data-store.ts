import prisma from "./prisma";
import { Booking, Customer, ServiceType, AgencySettings } from "./types";

// Seed / Initial dynamic service types
export const initialServiceTypes: ServiceType[] = [
  { id: "srv-flight", name: "Flight Ticket", code: "FLIGHT", description: "Domestic & International airline tickets", isActive: true },
  { id: "srv-passport", name: "Passport Service", code: "PASSPORT", description: "New passport, renewal & tatkal assistance", isActive: true },
  { id: "srv-visa", name: "Visa Processing", code: "VISA", description: "Tourist, visit & employment visas", isActive: true },
  { id: "srv-hotel", name: "Hotel Booking", code: "HOTEL", description: "Domestic & international hotel reservations", isActive: true },
  { id: "srv-tour", name: "Tour Package", code: "TOUR", description: "Custom holiday packages & group tours", isActive: true },
  { id: "srv-bus-train", name: "Bus / Train Ticket", code: "TRANSPORT", description: "Intercity bus & railway reservations", isActive: true },
];

export const initialAgencySettings: AgencySettings = {
  id: "default",
  agencyName: "Al-Madina Travels & Tours",
  tagline: "Your Trusted Travel & Ticketing Partner",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "booking@almadinatravels.com",
  address: "Shop No. 12, Ground Floor, Skyline Commercial Complex, Calicut, Kerala - 673001",
  logoUrl: "",
  taxNumber: "GSTIN: 32AAAAA0000A1Z5",
  bankDetails: "A/C: 50200012345678 | HDFC Bank, Calicut Branch | IFSC: HDFC0001234 | UPI: almadinatravels@hdfcbank",
  termsConditions: "1. Please report at airport 3 hours prior to international departure and 2 hours for domestic.\n2. Date change & cancellation charges are applicable as per airline fare rules.\n3. Verify passport validity (minimum 6 months from travel date required).",
};

// Initial seed customers
export const initialCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Mohammed Rashid",
    phone: "+91 98471 23456",
    email: "rashid.m@gmail.com",
    city: "Calicut",
    notes: "Frequent flyer to Dubai / Gulf sector",
  },
  {
    id: "cust-2",
    name: "Ananya Sharma",
    phone: "+91 97450 98765",
    email: "ananya.s@outlook.com",
    city: "Kochi",
    notes: "Corporate traveler - IT consultancy",
  },
  {
    id: "cust-3",
    name: "Faisal Rahman & Family",
    phone: "+91 94472 11223",
    email: "faisal.rahman@yahoo.com",
    city: "Malappuram",
    notes: "Family booking, requires wheelchair for mother",
  },
  {
    id: "cust-4",
    name: "Dr. Suresh Kumar",
    phone: "+91 99460 33445",
    email: "sureshkumar.dr@gmail.com",
    city: "Kannur",
    notes: "Medical conference travel to London",
  },
];

// Helper to calculate date offsets
const now = new Date();
const addDays = (days: number, hours: number = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
};

export const initialBookings: Booking[] = [
  {
    id: "bk-1001",
    bookingNo: "TRV-2026-101",
    customerId: "cust-1",
    serviceTypeId: "srv-flight",
    issueDate: addDays(-5),
    travelDate: addDays(0, 4), // Today (in 4 hours)
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
    dueDate: addDays(-2),
    paymentStatus: "Paid",
    notes: "Seat 14A selected. 30kg check-in baggage.",
  },
  {
    id: "bk-1002",
    bookingNo: "TRV-2026-102",
    customerId: "cust-2",
    serviceTypeId: "srv-flight",
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
    alertNotes: "Flight delayed by 1 hour 45 mins due to weather. Revised departure: 09:15 AM.",
    totalAmount: 5200,
    paidAmount: 5200,
    balanceAmount: 0,
    dueDate: addDays(-5),
    paymentStatus: "Paid",
    notes: "Informed customer regarding delay via WhatsApp.",
  },
  {
    id: "bk-1003",
    bookingNo: "TRV-2026-103",
    customerId: "cust-3",
    serviceTypeId: "srv-flight",
    issueDate: addDays(-4),
    travelDate: addDays(3), // In 3 days
    returnDate: addDays(18),
    sector: "CCJ (Calicut) - JED (Jeddah)",
    flightNo: "SV 757",
    pnr: "K38XZT",
    flightTime: "14:40",
    portal: "Saudia Direct / Akbar Travels",
    passengerCount: 3,
    passengerNames: "Faisal Rahman, Aysha Faisal, Mariyam Faisal",
    status: "Confirmed",
    alertNotes: "Umrah visa verified. 2 pieces 23kg each.",
    totalAmount: 124000,
    paidAmount: 90000,
    balanceAmount: 34000,
    dueDate: addDays(2),
    paymentStatus: "Partial",
    notes: "Balance Rs. 34,000 pending before departure date.",
  },
  {
    id: "bk-1004",
    bookingNo: "TRV-2026-104",
    customerId: "cust-4",
    serviceTypeId: "srv-flight",
    issueDate: addDays(-10),
    travelDate: addDays(6), // In 6 days
    returnDate: addDays(16),
    sector: "COK (Cochin) - DOH (Doha) - LHR (London Heathrow)",
    flightNo: "QR 517 / QR 007",
    pnr: "PQ92LL",
    flightTime: "03:55 AM",
    portal: "Qatar Airways Portal",
    passengerCount: 1,
    passengerNames: "Dr. Suresh Kumar",
    status: "Confirmed",
    alertNotes: "Transit at Doha: 2h 40m.",
    totalAmount: 76500,
    paidAmount: 76500,
    balanceAmount: 0,
    dueDate: addDays(-8),
    paymentStatus: "Paid",
    notes: "Vegetarian meal requested on both sectors.",
  },
  {
    id: "bk-1005",
    bookingNo: "TRV-2026-105",
    customerId: "cust-1",
    serviceTypeId: "srv-passport",
    issueDate: addDays(-15),
    travelDate: addDays(12),
    passportNo: "Z5892341",
    submissionDate: addDays(-12),
    expiryDate: addDays(3650),
    passengerCount: 1,
    status: "In Process",
    alertNotes: "Police verification completed. Dispatched via Speed Post.",
    totalAmount: 3500,
    paidAmount: 2000,
    balanceAmount: 1500,
    dueDate: addDays(5),
    paymentStatus: "Partial",
    notes: "Tatkal passport renewal for Mohammed Rashid.",
  },
  {
    id: "bk-1006",
    bookingNo: "TRV-2026-106",
    customerId: "cust-2",
    serviceTypeId: "srv-flight",
    issueDate: addDays(-20),
    travelDate: addDays(4),
    sector: "BLR (Bangalore) - DEL (Delhi)",
    flightNo: "UK 812",
    pnr: "VISTA88",
    flightTime: "18:20",
    portal: "Vistara / Air India",
    passengerCount: 1,
    passengerNames: "Ananya Sharma",
    status: "Rescheduled / Postponed",
    alertNotes: "Flight time moved by airline from 16:00 to 18:20.",
    totalAmount: 7800,
    paidAmount: 7800,
    balanceAmount: 0,
    dueDate: addDays(-18),
    paymentStatus: "Paid",
    notes: "Client accepted revised time.",
  },
];

// Fallback in-memory state
let memoryServiceTypes = [...initialServiceTypes];
let memoryCustomers = [...initialCustomers];
let memoryBookings = [...initialBookings];
let memorySettings = { ...initialAgencySettings };

// Helper to test if Prisma DB is reachable
async function isDbAvailable(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    // Quick probe
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// ---------------- SERVICE TYPES ----------------
export async function getServiceTypes(): Promise<ServiceType[]> {
  try {
    if (await isDbAvailable()) {
      const records = await prisma.serviceType.findMany({
        orderBy: { name: "asc" },
      });
      if (records.length > 0) return records;
      // Seed default if empty
      for (const st of initialServiceTypes) {
        await prisma.serviceType.upsert({
          where: { name: st.name },
          update: {},
          create: { name: st.name, code: st.code, description: st.description, isActive: st.isActive },
        });
      }
      return await prisma.serviceType.findMany({ orderBy: { name: "asc" } });
    }
  } catch (e) {
    console.warn("DB not accessible, using memory store for service types:", e);
  }
  return memoryServiceTypes;
}

export async function createServiceType(data: Partial<ServiceType>): Promise<ServiceType> {
  const newType: ServiceType = {
    id: `srv-${Date.now()}`,
    name: data.name || "New Service",
    code: data.code || data.name?.substring(0, 4).toUpperCase(),
    description: data.description || "",
    isActive: data.isActive ?? true,
    createdAt: new Date(),
  };

  try {
    if (await isDbAvailable()) {
      return await prisma.serviceType.create({
        data: {
          name: newType.name,
          code: newType.code,
          description: newType.description,
          isActive: newType.isActive,
        },
      });
    }
  } catch (e) {
    console.warn("DB write failed, falling back to memory:", e);
  }

  memoryServiceTypes.push(newType);
  return newType;
}

export async function updateServiceType(id: string, data: Partial<ServiceType>): Promise<ServiceType | null> {
  try {
    if (await isDbAvailable()) {
      return await prisma.serviceType.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          isActive: data.isActive,
        },
      });
    }
  } catch (e) {
    console.warn("DB update failed, falling back to memory:", e);
  }

  const idx = memoryServiceTypes.findIndex((s) => s.id === id);
  if (idx !== -1) {
    memoryServiceTypes[idx] = { ...memoryServiceTypes[idx], ...data };
    return memoryServiceTypes[idx];
  }
  return null;
}

export async function deleteServiceType(id: string): Promise<boolean> {
  try {
    if (await isDbAvailable()) {
      await prisma.serviceType.delete({ where: { id } });
      return true;
    }
  } catch (e) {
    console.warn("DB delete failed, falling back to memory:", e);
  }

  const before = memoryServiceTypes.length;
  memoryServiceTypes = memoryServiceTypes.filter((s) => s.id !== id);
  return memoryServiceTypes.length < before;
}

// ---------------- CUSTOMERS ----------------
export async function getCustomers(): Promise<Customer[]> {
  try {
    if (await isDbAvailable()) {
      const records = await prisma.customer.findMany({
        include: {
          bookings: {
            include: { serviceType: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { name: "asc" },
      });
      if (records.length > 0) return records as unknown as Customer[];
    }
  } catch (e) {
    console.warn("DB error fetching customers, using memory store:", e);
  }

  // Populate memory relations
  return memoryCustomers.map((cust) => ({
    ...cust,
    bookings: memoryBookings.filter((b) => b.customerId === cust.id).map((b) => ({
      ...b,
      serviceType: memoryServiceTypes.find((s) => s.id === b.serviceTypeId),
    })),
    _count: {
      bookings: memoryBookings.filter((b) => b.customerId === cust.id).length,
    },
  }));
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  const newCust: Customer = {
    id: `cust-${Date.now()}`,
    name: data.name || "Customer",
    phone: data.phone || "",
    email: data.email || "",
    city: data.city || "",
    address: data.address || "",
    notes: data.notes || "",
    createdAt: new Date(),
  };

  try {
    if (await isDbAvailable()) {
      return (await prisma.customer.create({
        data: {
          name: newCust.name,
          phone: newCust.phone,
          email: newCust.email,
          city: newCust.city,
          address: newCust.address,
          notes: newCust.notes,
        },
      })) as unknown as Customer;
    }
  } catch (e) {
    console.warn("DB write failed for customer, using memory:", e);
  }

  memoryCustomers.push(newCust);
  return newCust;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  const { bookings, _count, ...customerData } = data;
  try {
    if (await isDbAvailable()) {
      return (await prisma.customer.update({
        where: { id },
        data: customerData,
      })) as unknown as Customer;
    }
  } catch (e) {
    console.warn("DB update failed for customer, using memory:", e);
  }

  const idx = memoryCustomers.findIndex((c) => c.id === id);
  if (idx !== -1) {
    memoryCustomers[idx] = { ...memoryCustomers[idx], ...customerData };
    return memoryCustomers[idx];
  }
  return null;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    if (await isDbAvailable()) {
      await prisma.customer.delete({ where: { id } });
      return true;
    }
  } catch (e) {
    console.warn("DB delete failed for customer, using memory:", e);
  }

  memoryCustomers = memoryCustomers.filter((c) => c.id !== id);
  memoryBookings = memoryBookings.filter((b) => b.customerId !== id);
  return true;
}

// ---------------- BOOKINGS / TICKETS ----------------
export async function getBookings(): Promise<Booking[]> {
  try {
    if (await isDbAvailable()) {
      const records = await prisma.booking.findMany({
        include: {
          customer: true,
          serviceType: true,
        },
        orderBy: { travelDate: "asc" },
      });
      if (records.length > 0) return records as unknown as Booking[];
    }
  } catch (e) {
    console.warn("DB error fetching bookings, using memory store:", e);
  }

  return memoryBookings.map((b) => ({
    ...b,
    customer: memoryCustomers.find((c) => c.id === b.customerId),
    serviceType: memoryServiceTypes.find((s) => s.id === b.serviceTypeId),
  }));
}

export async function createBooking(data: Partial<Booking>): Promise<Booking> {
  const totalAmount = Number(data.totalAmount) || 0;
  const paidAmount = Number(data.paidAmount) || 0;
  const balanceAmount = Math.max(0, totalAmount - paidAmount);
  const paymentStatus = balanceAmount === 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";

  const bookingNo = data.bookingNo || `TRV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    bookingNo,
    customerId: data.customerId || "",
    serviceTypeId: data.serviceTypeId || "",
    issueDate: data.issueDate || new Date().toISOString(),
    travelDate: data.travelDate || null,
    returnDate: data.returnDate || null,
    sector: data.sector || "",
    flightNo: data.flightNo || "",
    pnr: data.pnr ? data.pnr.toUpperCase().trim() : "",
    flightTime: data.flightTime || "",
    portal: data.portal || "",
    passengerCount: Number(data.passengerCount) || 1,
    passengerNames: data.passengerNames || "",
    passportNo: data.passportNo || "",
    submissionDate: data.submissionDate || null,
    expiryDate: data.expiryDate || null,
    status: data.status || "Confirmed",
    alertNotes: data.alertNotes || "",
    totalAmount,
    paidAmount,
    balanceAmount,
    dueDate: data.dueDate || null,
    paymentStatus,
    notes: data.notes || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    if (await isDbAvailable()) {
      return (await prisma.booking.create({
        data: {
          bookingNo: newBooking.bookingNo,
          customerId: newBooking.customerId,
          serviceTypeId: newBooking.serviceTypeId,
          issueDate: newBooking.issueDate ? new Date(newBooking.issueDate) : null,
          travelDate: newBooking.travelDate ? new Date(newBooking.travelDate) : null,
          returnDate: newBooking.returnDate ? new Date(newBooking.returnDate) : null,
          sector: newBooking.sector,
          flightNo: newBooking.flightNo,
          pnr: newBooking.pnr,
          flightTime: newBooking.flightTime,
          portal: newBooking.portal,
          passengerCount: newBooking.passengerCount,
          passengerNames: newBooking.passengerNames,
          passportNo: newBooking.passportNo,
          submissionDate: newBooking.submissionDate ? new Date(newBooking.submissionDate) : null,
          expiryDate: newBooking.expiryDate ? new Date(newBooking.expiryDate) : null,
          status: newBooking.status,
          alertNotes: newBooking.alertNotes,
          totalAmount: newBooking.totalAmount,
          paidAmount: newBooking.paidAmount,
          balanceAmount: newBooking.balanceAmount,
          dueDate: newBooking.dueDate ? new Date(newBooking.dueDate) : null,
          paymentStatus: newBooking.paymentStatus,
          notes: newBooking.notes,
        },
        include: {
          customer: true,
          serviceType: true,
        },
      })) as unknown as Booking;
    }
  } catch (e) {
    console.warn("DB write failed for booking, using memory store:", e);
  }

  memoryBookings.unshift(newBooking);
  return {
    ...newBooking,
    customer: memoryCustomers.find((c) => c.id === newBooking.customerId),
    serviceType: memoryServiceTypes.find((s) => s.id === newBooking.serviceTypeId),
  };
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<Booking | null> {
  const totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : undefined;
  const paidAmount = data.paidAmount !== undefined ? Number(data.paidAmount) : undefined;

  let balanceAmount = data.balanceAmount;
  let paymentStatus = data.paymentStatus;

  if (totalAmount !== undefined && paidAmount !== undefined) {
    balanceAmount = Math.max(0, totalAmount - paidAmount);
    paymentStatus = balanceAmount === 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending";
  }

  const { customer, serviceType, id: _bid, createdAt: _cAt, updatedAt: _uAt, ...cleanData } = data;

  try {
    if (await isDbAvailable()) {
      return (await prisma.booking.update({
        where: { id },
        data: {
          ...cleanData,
          totalAmount,
          paidAmount,
          balanceAmount,
          paymentStatus,
          issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
          travelDate: data.travelDate ? new Date(data.travelDate) : undefined,
          returnDate: data.returnDate ? new Date(data.returnDate) : undefined,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          submissionDate: data.submissionDate ? new Date(data.submissionDate) : undefined,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        },
        include: {
          customer: true,
          serviceType: true,
        },
      })) as unknown as Booking;
    }
  } catch (e) {
    console.warn("DB update failed for booking, using memory store:", e);
  }

  const idx = memoryBookings.findIndex((b) => b.id === id);
  if (idx !== -1) {
    memoryBookings[idx] = {
      ...memoryBookings[idx],
      ...data,
      totalAmount: totalAmount ?? memoryBookings[idx].totalAmount,
      paidAmount: paidAmount ?? memoryBookings[idx].paidAmount,
      balanceAmount: balanceAmount ?? memoryBookings[idx].balanceAmount,
      paymentStatus: paymentStatus ?? memoryBookings[idx].paymentStatus,
      updatedAt: new Date().toISOString(),
    };
    return {
      ...memoryBookings[idx],
      customer: memoryCustomers.find((c) => c.id === memoryBookings[idx].customerId),
      serviceType: memoryServiceTypes.find((s) => s.id === memoryBookings[idx].serviceTypeId),
    };
  }
  return null;
}

export async function deleteBooking(id: string): Promise<boolean> {
  try {
    if (await isDbAvailable()) {
      await prisma.booking.delete({ where: { id } });
      return true;
    }
  } catch (e) {
    console.warn("DB delete failed for booking, using memory store:", e);
  }

  const before = memoryBookings.length;
  memoryBookings = memoryBookings.filter((b) => b.id !== id);
  return memoryBookings.length < before;
}

// ---------------- AGENCY SETTINGS ----------------
export async function getAgencySettings(): Promise<AgencySettings> {
  try {
    if (await isDbAvailable()) {
      const settings = await prisma.agencySettings.findFirst();
      if (settings) return settings;
      return await prisma.agencySettings.create({
        data: initialAgencySettings,
      });
    }
  } catch (e) {
    console.warn("DB error fetching agency settings, using memory:", e);
  }
  return memorySettings;
}

export async function updateAgencySettings(data: Partial<AgencySettings>): Promise<AgencySettings> {
  try {
    if (await isDbAvailable()) {
      return await prisma.agencySettings.upsert({
        where: { id: "default" },
        update: data,
        create: { ...initialAgencySettings, ...data },
      });
    }
  } catch (e) {
    console.warn("DB update settings failed, using memory:", e);
  }
  memorySettings = { ...memorySettings, ...data };
  return memorySettings;
}
