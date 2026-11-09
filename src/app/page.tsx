"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import DueAlertsWidget from "@/components/DueAlertsWidget";
import BookingList from "@/components/BookingList";
import CustomerList from "@/components/CustomerList";
import CustomerDrawer from "@/components/CustomerDrawer";
import BookingModal from "@/components/BookingModal";
import InvoiceModal from "@/components/InvoiceModal";
import WhatsAppModal from "@/components/WhatsAppModal";
import ServiceManagementModal from "@/components/ServiceManagementModal";
import AgencySettingsView from "@/components/AgencySettingsView";
import { Booking, Customer, ServiceType, AgencySettings } from "@/lib/types";
import { initialAgencySettings } from "@/lib/data-store";
import { getDaysDifference } from "@/lib/date-utils";
import {
  CalendarDays,
  PlaneTakeoff,
  Users,
  Layers,
  Settings,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "customers" | "services" | "settings">("dashboard");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [settings, setSettings] = useState<AgencySettings>(initialAgencySettings);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | undefined>(undefined);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);

  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

  // Customer Drawer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);

  // Fetch all core data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [resBookings, resCustomers, resServices, resSettings] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/customers"),
        fetch("/api/services"),
        fetch("/api/settings"),
      ]);

      if (resBookings.ok) {
        const data = await resBookings.json();
        setBookings(data);
      }
      if (resCustomers.ok) {
        const data = await resCustomers.json();
        setCustomers(data);
      }
      if (resServices.ok) {
        const data = await resServices.json();
        setServiceTypes(data);
      }
      if (resSettings.ok) {
        const data = await resSettings.json();
        setSettings(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load travels data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Urgent alerts count for header badge (Today departures + delays)
  const urgentCount = bookings.filter((b) => {
    const diff = getDaysDifference(b.travelDate);
    const isDelay = b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";
    return diff.isToday || isDelay;
  }).length;

  // Filter bookings based on activeFilter
  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === "all") return true;
    const diff = getDaysDifference(b.travelDate);

    if (activeFilter === "today") return diff.isToday;
    if (activeFilter === "tomorrow") return diff.isTomorrow;
    if (activeFilter === "3days") return diff.days >= 0 && diff.days <= 3;
    if (activeFilter === "7days") return diff.days >= 0 && diff.days <= 7;
    if (activeFilter === "delayed") {
      return b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";
    }
    if (activeFilter === "pending_balance") {
      return b.balanceAmount > 0;
    }
    return true;
  });

  // Handlers
  const handleOpenNewBooking = (custId?: string) => {
    setEditingBooking(null);
    setPreselectedCustomerId(custId);
    setIsBookingModalOpen(true);
  };

  const handleEditBooking = (b: Booking) => {
    setEditingBooking(b);
    setPreselectedCustomerId(undefined);
    setIsBookingModalOpen(true);
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ticket/booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
        // Update selected customer if drawer is open
        if (selectedCustomer) {
          const updatedCust = customers.find((c) => c.id === selectedCustomer.id);
          if (updatedCust) setSelectedCustomer(updatedCust);
        }
      }
    } catch (e) {
      console.error("Delete booking error:", e);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer and all their associated bookings?")) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchData();
        if (selectedCustomer?.id === id) {
          setIsCustomerDrawerOpen(false);
          setSelectedCustomer(null);
        }
      }
    } catch (e) {
      console.error("Delete customer error:", e);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setSelectedCustomer(found);
      setIsCustomerDrawerOpen(true);
    }
  };

  const handleOpenInvoice = (b: Booking) => {
    setInvoiceBooking(b);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenWhatsApp = (b: Booking) => {
    setWhatsAppBooking(b);
    setIsWhatsAppModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewBooking={() => handleOpenNewBooking()}
        urgentAlertCount={urgentCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchData}
              className="font-bold underline text-rose-800 hover:text-rose-950"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: Dashboard & Due Alerts */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Header Title & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CalendarDays className="text-sky-600" size={24} />
                  <span>Due Date Alerts & Travel Radar</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Monitor upcoming passenger flights, schedule changes, and due dates before departure
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2 text-slate-600 hover:text-sky-600 bg-white border border-slate-200 rounded-xl transition hover:shadow-sm"
                  title="Refresh Data"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>

                <button
                  onClick={() => handleOpenNewBooking()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
                >
                  <PlusCircle size={16} />
                  <span>Add Ticket / Customer</span>
                </button>
              </div>
            </div>

            {/* Due Alerts Widget & Filter Pills */}
            <DueAlertsWidget
              bookings={bookings}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />

            {/* Filtered Bookings Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {activeFilter === "today"
                    ? "🚨 Flights Departing Today"
                    : activeFilter === "tomorrow"
                    ? "⏰ Flights Departing Tomorrow"
                    : activeFilter === "3days"
                    ? "✈️ Flights in the Next 3 Days"
                    : activeFilter === "7days"
                    ? "📅 Flights This Week"
                    : activeFilter === "delayed"
                    ? "⚠️ Delayed & Rescheduled Flights"
                    : activeFilter === "pending_balance"
                    ? "💳 Bookings with Pending Dues"
                    : "All Travel Tickets & Bookings"}
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredBookings.length} records
                </span>
              </div>

              <BookingList
                bookings={filteredBookings}
                serviceTypes={serviceTypes}
                onOpenInvoice={handleOpenInvoice}
                onOpenWhatsApp={handleOpenWhatsApp}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onSelectCustomer={handleSelectCustomer}
              />
            </div>
          </div>
        )}

        {/* TAB 2: All Tickets & Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <PlaneTakeoff className="text-sky-600" size={24} />
                  <span>All Tickets & Bookings</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Complete ledger of flight tickets, passenger manifests, and travel documents
                </p>
              </div>

              <button
                onClick={() => handleOpenNewBooking()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
              >
                <PlusCircle size={16} />
                <span>New Ticket / Booking</span>
              </button>
            </div>

            <BookingList
              bookings={bookings}
              serviceTypes={serviceTypes}
              onOpenInvoice={handleOpenInvoice}
              onOpenWhatsApp={handleOpenWhatsApp}
              onEditBooking={handleEditBooking}
              onDeleteBooking={handleDeleteBooking}
              onSelectCustomer={handleSelectCustomer}
            />
          </div>
        )}

        {/* TAB 3: Customers & Parties Directory */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Users className="text-sky-600" size={24} />
                  <span>Customers & Parties</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Click any customer to inspect all their booked services, flights, and payments
                </p>
              </div>
            </div>

            <CustomerList
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onAddBookingForCustomer={(custId) => handleOpenNewBooking(custId)}
              onDeleteCustomer={handleDeleteCustomer}
              onOpenNewCustomer={() => handleOpenNewBooking()}
            />
          </div>
        )}

        {/* TAB 4: Services Management */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="text-sky-600" size={24} />
                  <span>Services Configuration</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Manage the service dropdown options (Flight Ticket, Passport, Visa, Tour Packages, etc.)
                </p>
              </div>

              <button
                onClick={() => setIsServicesModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95"
              >
                <PlusCircle size={16} />
                <span>Manage Dropdown</span>
              </button>
            </div>

            {/* Services Grid Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {serviceTypes.map((service) => {
                const count = bookings.filter((b) => b.serviceTypeId === service.id).length;
                return (
                  <div
                    key={service.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-sky-300 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-slate-900">{service.name}</span>
                        <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                          {service.code || "SRV"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {service.description || "Active service category"}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Total bookings: <strong className="text-slate-800">{count}</strong>
                      </span>
                      <button
                        onClick={() => setIsServicesModalOpen(true)}
                        className="font-bold text-sky-600 hover:underline"
                      >
                        Edit →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: Agency Settings & Logo Branding */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <AgencySettingsView
              settings={settings}
              onSaved={(updated) => setSettings(updated)}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="no-print mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>{settings.agencyName}</strong> — Built for Travels Office Customer Management & Due Alerts
          </div>
          <div className="text-slate-400">
            Powered by Next.js &bull; Tailwind CSS &bull; PostgreSQL &bull; Prisma
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Add / Edit Booking & Customer Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingBooking(null);
          setPreselectedCustomerId(undefined);
        }}
        onSaved={fetchData}
        booking={editingBooking}
        customers={customers}
        serviceTypes={serviceTypes}
        onOpenManageServices={() => setIsServicesModalOpen(true)}
        preselectedCustomerId={preselectedCustomerId}
      />

      {/* 2. Customer Drawer (All services for single customer) */}
      <CustomerDrawer
        customer={selectedCustomer}
        settings={settings}
        isOpen={isCustomerDrawerOpen}
        onClose={() => {
          setIsCustomerDrawerOpen(false);
          setSelectedCustomer(null);
        }}
        onAddService={(custId) => {
          setIsCustomerDrawerOpen(false);
          handleOpenNewBooking(custId);
        }}
        onEditBooking={(b) => {
          setIsCustomerDrawerOpen(false);
          handleEditBooking(b);
        }}
        onDeleteBooking={handleDeleteBooking}
        onOpenInvoice={(b) => handleOpenInvoice(b)}
        onOpenWhatsApp={(b) => handleOpenWhatsApp(b)}
      />

      {/* 3. Printable Invoice & Voucher Modal */}
      <InvoiceModal
        booking={invoiceBooking}
        settings={settings}
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceBooking(null);
        }}
      />

      {/* 4. WhatsApp Alert & Notification Modal */}
      <WhatsAppModal
        booking={whatsAppBooking}
        settings={settings}
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setWhatsAppBooking(null);
        }}
      />

      {/* 5. Services Dropdown Management Modal */}
      <ServiceManagementModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
        serviceTypes={serviceTypes}
        onRefresh={fetchData}
      />
    </div>
  );
}
