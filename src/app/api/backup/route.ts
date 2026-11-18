import { NextResponse } from "next/server";
import { getSession } from "@/lib/server-auth";
import {
  getCustomers,
  getBookings,
  getServiceTypes,
  getAgencySettings,
  getAdminUser,
  createCustomer,
  createBooking,
  createServiceType,
  updateAgencySettings,
  ensureDatabaseTables,
} from "@/lib/data-store";
import prisma, { getDatabaseUrl } from "@/lib/prisma";

// GET /api/backup - Export complete database backup as JSON
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureDatabaseTables();

    const [customers, bookings, serviceTypes, settings, adminUser] = await Promise.all([
      getCustomers(),
      getBookings(),
      getServiceTypes(),
      getAgencySettings(),
      getAdminUser(),
    ]);

    const backupData = {
      version: "2.1",
      app: "Attar Travels Management Desk",
      exportedAt: new Date().toISOString(),
      metadata: {
        totalCustomers: customers.length,
        totalBookings: bookings.length,
        totalServiceTypes: serviceTypes.length,
        hasAdminCredentials: Boolean(adminUser),
      },
      data: {
        agencySettings: settings,
        serviceTypes,
        customers,
        bookings,
        adminUser: adminUser
          ? {
              username: adminUser.username,
              password: adminUser.password,
              salt: adminUser.salt,
              name: adminUser.name || "Administrator",
            }
          : undefined,
      },
    };

    return NextResponse.json(backupData);
  } catch (error: unknown) {
    console.error("Backup export failed:", error);
    const msg = error instanceof Error ? error.message : "Failed to generate backup";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/backup - Restore database from uploaded JSON backup
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();

    if (!payload || !payload.data) {
      return NextResponse.json(
        { error: "Invalid backup file format. Expected a valid Travels backup JSON." },
        { status: 400 }
      );
    }

    await ensureDatabaseTables();

    const { agencySettings, serviceTypes, customers, bookings, adminUser } = payload.data;
    const hasDb = !!getDatabaseUrl();

    let restoredServicesCount = 0;
    let restoredCustomersCount = 0;
    let restoredBookingsCount = 0;

    // 0. Restore Admin User Credentials if present in backup
    if (adminUser && adminUser.username && adminUser.password && adminUser.salt) {
      if (hasDb) {
        const existingAdmin = await prisma.user.findFirst();
        if (existingAdmin) {
          await prisma.user.update({
            where: { id: existingAdmin.id },
            data: {
              username: adminUser.username,
              password: adminUser.password,
              salt: adminUser.salt,
              name: adminUser.name || existingAdmin.name,
            },
          });
        } else {
          await prisma.user.create({
            data: {
              username: adminUser.username,
              password: adminUser.password,
              salt: adminUser.salt,
              name: adminUser.name || "Administrator",
              role: "admin",
            },
          });
        }
      }
    }

    // 1. Restore Agency Settings if present
    if (agencySettings) {
      await updateAgencySettings(agencySettings);
    }

    // 2. Restore Service Types
    const serviceIdMap = new Map<string, string>();
    if (Array.isArray(serviceTypes)) {
      for (const st of serviceTypes) {
        if (!st.name) continue;
        if (hasDb) {
          const upserted = await prisma.serviceType.upsert({
            where: { name: st.name },
            update: {
              code: st.code || null,
              description: st.description || null,
              isActive: st.isActive ?? true,
            },
            create: {
              ...(st.id ? { id: st.id } : {}),
              name: st.name,
              code: st.code || null,
              description: st.description || null,
              isActive: st.isActive ?? true,
            },
          });
          if (st.id) serviceIdMap.set(st.id, upserted.id);
        } else {
          const created = await createServiceType(st);
          if (st.id) serviceIdMap.set(st.id, created.id);
        }
        restoredServicesCount++;
      }
    }

    // 3. Restore Customers & Map old IDs to new or preserved IDs
    const customerIdMap = new Map<string, string>();

    if (Array.isArray(customers)) {
      for (const cust of customers) {
        if (!cust.name || !cust.phone) continue;

        if (hasDb) {
          // Check if customer with same ID or phone exists
          const existing = await prisma.customer.findFirst({
            where: {
              OR: [
                ...(cust.id ? [{ id: cust.id }] : []),
                { phone: cust.phone.trim() },
              ],
            },
          });

          if (existing) {
            customerIdMap.set(cust.id, existing.id);
            await prisma.customer.update({
              where: { id: existing.id },
              data: {
                name: cust.name.trim(),
                phone: cust.phone.trim(),
                email: cust.email?.trim() || null,
                city: cust.city?.trim() || null,
                address: cust.address?.trim() || null,
                notes: cust.notes?.trim() || null,
              },
            });
          } else {
            const created = await prisma.customer.create({
              data: {
                ...(cust.id ? { id: cust.id } : {}),
                name: cust.name.trim(),
                phone: cust.phone.trim(),
                email: cust.email?.trim() || null,
                city: cust.city?.trim() || null,
                address: cust.address?.trim() || null,
                notes: cust.notes?.trim() || null,
              },
            });
            customerIdMap.set(cust.id, created.id);
          }
        } else {
          const created = await createCustomer(cust);
          customerIdMap.set(cust.id, created.id);
        }
        restoredCustomersCount++;
      }
    }

    // 4. Restore Bookings
    if (Array.isArray(bookings)) {
      // Refresh service map
      const allServices = await getServiceTypes();
      const serviceNameMap = new Map(allServices.map((s) => [s.name.toLowerCase(), s.id]));
      const serviceIdSet = new Set(allServices.map((s) => s.id));

      for (const bk of bookings) {
        const targetCustomerId = customerIdMap.get(bk.customerId) || bk.customerId;
        let targetServiceId = serviceIdMap.get(bk.serviceTypeId) || bk.serviceTypeId;

        // If serviceTypeId doesn't exist directly, try matching by name
        if (!serviceIdSet.has(targetServiceId) && bk.serviceType?.name) {
          targetServiceId = serviceNameMap.get(bk.serviceType.name.toLowerCase()) || targetServiceId;
        }

        if (!targetCustomerId || !targetServiceId) continue;

        const bookingNo = bk.bookingNo || `CCJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

        if (hasDb) {
          const existingBooking = await prisma.booking.findFirst({
            where: {
              OR: [
                { bookingNo },
                ...(bk.id ? [{ id: bk.id }] : []),
              ],
            },
          });

          const bookingData = {
            customerId: targetCustomerId,
            serviceTypeId: targetServiceId,
            issueDate: bk.issueDate ? new Date(bk.issueDate) : null,
            travelDate: bk.travelDate ? new Date(bk.travelDate) : null,
            returnDate: bk.returnDate ? new Date(bk.returnDate) : null,
            sector: bk.sector || null,
            flightNo: bk.flightNo || null,
            pnr: bk.pnr || null,
            flightTime: bk.flightTime || null,
            portal: bk.portal || null,
            passengerCount: Number(bk.passengerCount) || 1,
            passengerNames: bk.passengerNames || null,
            passportNo: bk.passportNo || null,
            submissionDate: bk.submissionDate ? new Date(bk.submissionDate) : null,
            expiryDate: bk.expiryDate ? new Date(bk.expiryDate) : null,
            status: bk.status || "Confirmed",
            alertNotes: bk.alertNotes || null,
            totalAmount: Number(bk.totalAmount) || 0,
            paidAmount: Number(bk.paidAmount) || 0,
            balanceAmount: Math.max(0, (Number(bk.totalAmount) || 0) - (Number(bk.paidAmount) || 0)),
            dueDate: bk.dueDate ? new Date(bk.dueDate) : null,
            paymentStatus: bk.paymentStatus || "Pending",
            notes: bk.notes || null,
          };

          if (existingBooking) {
            await prisma.booking.update({
              where: { id: existingBooking.id },
              data: {
                bookingNo,
                ...bookingData,
              },
            });
          } else {
            await prisma.booking.create({
              data: {
                ...(bk.id ? { id: bk.id } : {}),
                bookingNo,
                ...bookingData,
              },
            });
          }
        } else {
          await createBooking({
            ...bk,
            customerId: targetCustomerId,
            serviceTypeId: targetServiceId,
            bookingNo,
          });
        }
        restoredBookingsCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database restore completed successfully!",
      restored: {
        services: restoredServicesCount,
        customers: restoredCustomersCount,
        bookings: restoredBookingsCount,
      },
    });
  } catch (error: unknown) {
    console.error("Backup restore failed:", error);
    const msg = error instanceof Error ? error.message : "Failed to restore backup";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
