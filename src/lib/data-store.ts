import prisma, { getDatabaseUrl } from "./prisma";
import { Booking, Customer, ServiceType, AgencySettings, initialAgencySettings } from "./types";
import { hashPassword } from "./auth";

// Default admin user credentials (username: admin, password: admin123)
const defaultAdminPass = hashPassword("admin123");
let memoryUsers = [
  {
    id: "usr-admin",
    username: "admin",
    password: defaultAdminPass.hash,
    salt: defaultAdminPass.salt,
    name: "Travel Desk Admin",
    role: "admin",
  },
];

// Seed / Initial dynamic service types
export const initialServiceTypes: ServiceType[] = [
  { id: "srv-flight", name: "Flight Ticket", code: "FLIGHT", description: "Domestic & International airline tickets", isActive: true },
  { id: "srv-passport", name: "Passport Service", code: "PASSPORT", description: "New passport, renewal & tatkal assistance", isActive: true },
  { id: "srv-visa", name: "Visa Processing", code: "VISA", description: "Tourist, visit & employment visas", isActive: true },
  { id: "srv-hotel", name: "Hotel Booking", code: "HOTEL", description: "Domestic & international hotel reservations", isActive: true },
  { id: "srv-tour", name: "Tour Package", code: "TOUR", description: "Custom holiday packages & group tours", isActive: true },
  { id: "srv-bus-train", name: "Bus / Train Ticket", code: "TRANSPORT", description: "Intercity bus & railway reservations", isActive: true },
];

export { initialAgencySettings };

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
    travelDate: addDays(0, 4),
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
    travelDate: addDays(1),
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
    dueDate: addDays(-5),
    paymentStatus: "Paid",
    notes: "Informed customer regarding delay via WhatsApp.",
  },
];

// Fallback in-memory state
let memoryServiceTypes = [...initialServiceTypes];
let memoryCustomers = [...initialCustomers];
let memoryBookings = [...initialBookings];
let memorySettings = { ...initialAgencySettings };

// Check if a database connection URL is configured in environment
export function hasDatabase(): boolean {
  return !!getDatabaseUrl();
}

// ---------------- SERVICE TYPES ----------------
export async function getServiceTypes(): Promise<ServiceType[]> {
  if (hasDatabase()) {
    try {
      const records = await prisma.serviceType.findMany({
        orderBy: { name: "asc" },
      });
      if (records.length > 0) return records;

      // Seed defaults if empty
      for (const st of initialServiceTypes) {
        await prisma.serviceType.upsert({
          where: { name: st.name },
          update: {},
          create: { name: st.name, code: st.code, description: st.description, isActive: st.isActive },
        });
      }
      return await prisma.serviceType.findMany({ orderBy: { name: "asc" } });
    } catch (e) {
      console.error("Prisma error in getServiceTypes:", e);
    }
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

  if (hasDatabase()) {
    try {
      return await prisma.serviceType.create({
        data: {
          name: newType.name,
          code: newType.code,
          description: newType.description,
          isActive: newType.isActive,
        },
      });
    } catch (e) {
      console.error("Prisma error in createServiceType:", e);
      throw e;
    }
  }

  memoryServiceTypes.push(newType);
  return newType;
}

export async function updateServiceType(id: string, data: Partial<ServiceType>): Promise<ServiceType | null> {
  if (hasDatabase()) {
    try {
      return await prisma.serviceType.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          isActive: data.isActive,
        },
      });
    } catch (e) {
      console.error("Prisma error in updateServiceType:", e);
      throw e;
    }
  }

  const idx = memoryServiceTypes.findIndex((s) => s.id === id);
  if (idx !== -1) {
    memoryServiceTypes[idx] = { ...memoryServiceTypes[idx], ...data };
    return memoryServiceTypes[idx];
  }
  return null;
}

export async function deleteServiceType(id: string): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await prisma.serviceType.delete({ where: { id } });
      return true;
    } catch (e) {
      console.error("Prisma error in deleteServiceType:", e);
      throw e;
    }
  }

  const before = memoryServiceTypes.length;
  memoryServiceTypes = memoryServiceTypes.filter((s) => s.id !== id);
  return memoryServiceTypes.length < before;
}

// ---------------- CUSTOMERS ----------------
export async function getCustomers(): Promise<Customer[]> {
  if (hasDatabase()) {
    try {
      const records = await prisma.customer.findMany({
        include: {
          bookings: {
            include: { serviceType: true },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { name: "asc" },
      });
      // Always return actual DB records (even if empty [])
      return records as unknown as Customer[];
    } catch (e) {
      console.error("Prisma error in getCustomers:", e);
    }
  }

  // Populate memory relations if no DB
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
  if (hasDatabase()) {
    try {
      const created = await prisma.customer.create({
        data: {
          name: data.name!.trim(),
          phone: data.phone!.trim(),
          email: data.email?.trim() || null,
          city: data.city?.trim() || null,
          address: data.address?.trim() || null,
          notes: data.notes?.trim() || null,
        },
        include: {
          bookings: {
            include: { serviceType: true },
          },
        },
      });
      return created as unknown as Customer;
    } catch (e) {
      console.error("Prisma error in createCustomer:", e);
      throw e;
    }
  }

  const newCust: Customer = {
    id: `cust-${Date.now()}`,
    name: data.name || "Customer",
    phone: data.phone || "",
    email: data.email || "",
    city: data.city || "",
    address: data.address || "",
    notes: data.notes || "",
    createdAt: new Date(),
    bookings: [],
  };

  memoryCustomers.push(newCust);
  return newCust;
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
  const { bookings, _count, ...customerData } = data;
  if (hasDatabase()) {
    try {
      return (await prisma.customer.update({
        where: { id },
        data: customerData,
        include: {
          bookings: {
            include: { serviceType: true },
          },
        },
      })) as unknown as Customer;
    } catch (e) {
      console.error("Prisma error in updateCustomer:", e);
      throw e;
    }
  }

  const idx = memoryCustomers.findIndex((c) => c.id === id);
  if (idx !== -1) {
    memoryCustomers[idx] = { ...memoryCustomers[idx], ...customerData };
    return memoryCustomers[idx];
  }
  return null;
}

export async function deleteCustomer(id: string): Promise<boolean> {
  if (hasDatabase()) {
    try {
      await prisma.customer.delete({ where: { id } });
      return true;
    } catch (e) {
      console.error("Prisma error in deleteCustomer:", e);
      throw e;
    }
  }

  memoryCustomers = memoryCustomers.filter((c) => c.id !== id);
  memoryBookings = memoryBookings.filter((b) => b.customerId !== id);
  return true;
}

// ---------------- BOOKINGS / TICKETS ----------------
export async function getBookings(): Promise<Booking[]> {
  if (hasDatabase()) {
    try {
      const records = await prisma.booking.findMany({
        include: {
          customer: true,
          serviceType: true,
        },
        orderBy: { travelDate: "asc" },
      });
      return records as unknown as Booking[];
    } catch (e) {
      console.error("Prisma error in getBookings:", e);
    }
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

  if (hasDatabase()) {
    try {
      return (await prisma.booking.create({
        data: {
          bookingNo,
          customerId: data.customerId!,
          serviceTypeId: data.serviceTypeId!,
          issueDate: data.issueDate ? new Date(data.issueDate) : null,
          travelDate: data.travelDate ? new Date(data.travelDate) : null,
          returnDate: data.returnDate ? new Date(data.returnDate) : null,
          sector: data.sector?.trim() || null,
          flightNo: data.flightNo?.trim() || null,
          pnr: data.pnr ? data.pnr.toUpperCase().trim() : null,
          flightTime: data.flightTime?.trim() || null,
          portal: data.portal?.trim() || null,
          passengerCount: Number(data.passengerCount) || 1,
          passengerNames: data.passengerNames?.trim() || null,
          passportNo: data.passportNo?.trim() || null,
          submissionDate: data.submissionDate ? new Date(data.submissionDate) : null,
          expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
          status: data.status || "Confirmed",
          alertNotes: data.alertNotes?.trim() || null,
          totalAmount,
          paidAmount,
          balanceAmount,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          paymentStatus,
          notes: data.notes?.trim() || null,
        },
        include: {
          customer: true,
          serviceType: true,
        },
      })) as unknown as Booking;
    } catch (e) {
      console.error("Prisma error in createBooking:", e);
      throw e;
    }
  }

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

  if (hasDatabase()) {
    try {
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
    } catch (e) {
      console.error("Prisma error in updateBooking:", e);
      throw e;
    }
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
  if (hasDatabase()) {
    try {
      await prisma.booking.delete({ where: { id } });
      return true;
    } catch (e) {
      console.error("Prisma error in deleteBooking:", e);
      throw e;
    }
  }

  const before = memoryBookings.length;
  memoryBookings = memoryBookings.filter((b) => b.id !== id);
  return memoryBookings.length < before;
}

// ---------------- AGENCY SETTINGS ----------------
export async function getAgencySettings(): Promise<AgencySettings> {
  if (hasDatabase()) {
    try {
      const settings = await prisma.agencySettings.findFirst();
      if (settings) return settings;
      return await prisma.agencySettings.create({
        data: initialAgencySettings,
      });
    } catch (e) {
      console.error("Prisma error in getAgencySettings:", e);
    }
  }
  return memorySettings;
}

export async function updateAgencySettings(data: Partial<AgencySettings>): Promise<AgencySettings> {
  if (hasDatabase()) {
    try {
      return await prisma.agencySettings.upsert({
        where: { id: "default" },
        update: data,
        create: { ...initialAgencySettings, ...data },
      });
    } catch (e) {
      console.error("Prisma error in updateAgencySettings:", e);
      throw e;
    }
  }
  memorySettings = { ...memorySettings, ...data };
  return memorySettings;
}

// ---------------- USER AUTHENTICATION & CREDENTIALS ----------------
export async function getAdminUser() {
  if (hasDatabase()) {
    try {
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            username: "admin",
            password: defaultAdminPass.hash,
            salt: defaultAdminPass.salt,
            name: "Travel Desk Admin",
            role: "admin",
          },
        });
      }
      return user;
    } catch (e) {
      console.error("Prisma error in getAdminUser:", e);
    }
  }
  return memoryUsers[0];
}

export async function findUserByUsername(username: string) {
  if (hasDatabase()) {
    try {
      return await prisma.user.findUnique({
        where: { username },
      });
    } catch (e) {
      console.error("Prisma error in findUserByUsername:", e);
    }
  }
  return memoryUsers.find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export async function updateUserCredentials(
  userId: string,
  newUsername: string,
  newPassword?: string
) {
  let updateData: { username: string; password?: string; salt?: string } = {
    username: newUsername,
  };

  if (newPassword && newPassword.trim()) {
    const hashed = hashPassword(newPassword.trim());
    updateData.password = hashed.hash;
    updateData.salt = hashed.salt;
  }

  if (hasDatabase()) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    } catch (e) {
      console.error("Prisma error in updateUserCredentials:", e);
      throw e;
    }
  }

  const idx = memoryUsers.findIndex((u) => u.id === userId);
  if (idx !== -1) {
    memoryUsers[idx] = {
      ...memoryUsers[idx],
      ...updateData,
    };
    return memoryUsers[idx];
  }
  return null;
}
