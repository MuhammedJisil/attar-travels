"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import DueAlertsWidget from "@/components/DueAlertsWidget";
import BookingList from "@/components/BookingList";
import CustomerList from "@/components/CustomerList";
import CustomerDrawer from "@/components/CustomerDrawer";
import BookingModal from "@/components/BookingModal";
import InvoiceModal from "@/components/InvoiceModal";
import TicketReportPdfModal from "@/components/TicketReportPdfModal";
import WhatsAppModal from "@/components/WhatsAppModal";
import ServiceManagementModal from "@/components/ServiceManagementModal";
import AgencySettingsView from "@/components/AgencySettingsView";
import CustomerModal from "@/components/CustomerModal";
import LoginScreen from "@/components/LoginScreen";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Booking, Customer, ServiceType, AgencySettings, initialAgencySettings } from "@/lib/types";
import { getDaysDifference } from "@/lib/date-utils";
import { getServiceDisplayDescription, isFlightOrTravelService } from "@/lib/service-config";
import {
  CalendarDays,
  PlaneTakeoff,
  Users,
  Layers,
  Settings,
  PlusCircle,
  RefreshCw,
  AlertCircle,
  Plane,
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "bookings" | "customers" | "services" | "settings">("dashboard");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Authentication state
  const [user, setUser] = useState<{ id: string; username: string; name?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [settings, setSettings] = useState<AgencySettings>(initialAgencySettings);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [preselectedCustomerId, setPreselectedCustomerId] = useState<string | undefined>(undefined);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);

  // PDF Ledger Report Modal state (mounted at root level for seamless print/export)
  const [isReportPdfOpen, setIsReportPdfOpen] = useState(false);
  const [reportPdfBookings, setReportPdfBookings] = useState<Booking[]>([]);
  const [reportPdfLabel, setReportPdfLabel] = useState<string>("All Active Tickets");

  const handleOpenReportPdf = (items: Booking[], label?: string) => {
    setReportPdfBookings(items);
    if (label) setReportPdfLabel(label);
    setIsReportPdfOpen(true);
  };

  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message?: string } | null>(null);

  // Theme state (Light / Dark mode toggle)
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("travels_theme");
    if (saved === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("travels_theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("travels_theme", "light");
      }
      return next;
    });
  };

  // Customer Drawer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);

  // Check current session
  const checkSession = useCallback(async () => {
    try {
      setAuthLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          return true;
        }
      }
      setUser(null);
      return false;
    } catch {
      setUser(null);
      return false;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Fetch all core travels data
  const fetchData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      setError(null);

      const reqHeaders = { "Cache-Control": "no-cache, no-store, must-revalidate", Pragma: "no-cache" };

      const [resBookings, resCustomers, resServices, resSettings, resDb] = await Promise.all([
        fetch("/api/bookings", { cache: "no-store", headers: reqHeaders }),
        fetch("/api/customers", { cache: "no-store", headers: reqHeaders }),
        fetch("/api/services", { cache: "no-store", headers: reqHeaders }),
        fetch("/api/settings", { cache: "no-store", headers: reqHeaders }),
        fetch("/api/db-status", { cache: "no-store", headers: reqHeaders }).catch(() => null),
      ]);

      if (resDb && resDb.ok) {
        const dbInfo = await resDb.json();
        setDbStatus(dbInfo);
      }

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

  // Load agency settings (for branding/logo on login screen & dashboard)
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch {
      // Keep default settings
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    checkSession().then((isAuthed) => {
      if (isAuthed) {
        fetchData(true);
      }
    });
  }, [fetchSettings, checkSession, fetchData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setBookings([]);
      setLoading(false);
    }
  };

  // Urgent alerts count for header badge (Today departures/returns + delays)
  const urgentCount = bookings.filter((b) => {
    const isTravel = isFlightOrTravelService(b.serviceType);
    if (!isTravel) return false;
    const diff = getDaysDifference(b.travelDate);
    const retDiff = b.returnDate ? getDaysDifference(b.returnDate) : null;
    const activeDiff = (diff.isPast && retDiff && retDiff.days !== 999) ? retDiff : diff;
    const isDelay = b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";
    return activeDiff.isToday || isDelay;
  }).length;

  // Filter bookings based on activeFilter
  const filteredBookings = bookings.filter((b) => {
    if (activeFilter === "all") return true;
    const isTravel = isFlightOrTravelService(b.serviceType);
    const diff = getDaysDifference(b.travelDate);
    const retDiff = b.returnDate ? getDaysDifference(b.returnDate) : null;
    const activeDiff = (diff.isPast && retDiff && retDiff.days !== 999) ? retDiff : diff;

    if (activeFilter === "today") return isTravel && (b.travelDate || b.returnDate) && activeDiff.isToday;
    if (activeFilter === "tomorrow") return isTravel && (b.travelDate || b.returnDate) && activeDiff.isTomorrow;
    if (activeFilter === "3days") return isTravel && (b.travelDate || b.returnDate) && activeDiff.days >= 0 && activeDiff.days <= 3;
    if (activeFilter === "7days") return isTravel && (b.travelDate || b.returnDate) && activeDiff.days >= 0 && activeDiff.days <= 7;
    if (activeFilter === "delayed") {
      return isTravel && (b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed");
    }
    if (activeFilter === "pending_balance") {
      return b.balanceAmount > 0;
    }
    if (activeFilter === "passports") {
      const isPassport =
        b.serviceType?.code === "PASSPORT" ||
        (b.serviceType?.name || "").toLowerCase().includes("passport");

      if (!isPassport) return false;
      const expDiff = b.expiryDate ? getDaysDifference(b.expiryDate) : null;
      const isExpiringSoon = expDiff ? expDiff.days <= 180 : false;
      const isSubmissionPending = Boolean(b.submissionDate && b.status !== "Completed");
      return isExpiringSoon || isSubmissionPending || Boolean(b.expiryDate) || Boolean(b.submissionDate);
    }
    if (activeFilter === "visas") {
      const isVisa =
        b.serviceType?.code === "VISA" ||
        (b.serviceType?.name || "").toLowerCase().includes("visa");

      if (!isVisa) return false;
      const expDiff = b.expiryDate ? getDaysDifference(b.expiryDate) : null;
      const isExpiringSoon = expDiff ? expDiff.days <= 60 : false;
      const isProcessing = b.status !== "Completed" && b.status !== "Cancelled";
      return isProcessing || isExpiringSoon || Boolean(b.submissionDate);
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

  // 1. Initial Session Verification (Subtle spinner while checking session cookie)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Unauthenticated Screen (Login)
  if (!user) {
    return (
      <LoginScreen
        settings={settings}
        onLoginSuccess={(authedUser) => {
          setUser(authedUser);
          fetchData();
        }}
      />
    );
  }

  // 3. Authenticated Loading (Modern skeleton while fetching bookings & records for logged-in user)
  if (loading && bookings.length === 0) {
    return <DashboardSkeleton />;
  }

  // 3. Authenticated Dashboard
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-200">
      {/* App main content hidden during invoice / report printing */}
      <div id="main-app-content" className="no-print flex-1 flex flex-col">
        {/* Top Navbar */}
        <Navbar
          settings={settings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenNewBooking={() => handleOpenNewBooking()}
          urgentAlertCount={urgentCount}
          currentUser={user}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Container with generous header breathing room */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 space-y-6">
          {/* Error notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchData()}
              className="font-bold underline text-rose-800 hover:text-rose-950"
            >
              Retry
            </button>
          </div>
        )}

        {/* TAB 1: Dashboard & Due Alerts */}
        {activeTab === "dashboard" && (
          <div className="space-y-5 sm:space-y-6">
            {/* Header Title & Refresh */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <CalendarDays className="text-sky-600 dark:text-sky-400 shrink-0" size={24} />
                  <span>Due Date Alerts & Travel Radar</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Monitor upcoming passenger flights, schedule changes, and due dates before departure
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchData()}
                  disabled={loading}
                  className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition hover:shadow-xs"
                  title="Refresh Data"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>

                <button
                  onClick={() => handleOpenNewBooking()}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition active:scale-95"
                >
                  <PlusCircle size={16} />
                  <span>Add Ticket</span>
                </button>
              </div>
            </div>

            {/* Due Alerts Widget & Filter Pills */}
            <DueAlertsWidget
              bookings={bookings}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />

            {/* Filtered Bookings Table & Mobile Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
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
                    : activeFilter === "passports"
                    ? "🛂 Passport Alerts (Expiry < 6 Mos & Submissions)"
                    : activeFilter === "visas"
                    ? "🌐 Visa Processing & Expiry Alerts"
                    : "All Travel Tickets & Bookings"}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Showing {filteredBookings.length} records
                </span>
              </div>

              <BookingList
                bookings={filteredBookings}
                serviceTypes={serviceTypes}
                settings={settings}
                onOpenInvoice={handleOpenInvoice}
                onOpenWhatsApp={handleOpenWhatsApp}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onSelectCustomer={handleSelectCustomer}
                onOpenReportPdf={handleOpenReportPdf}
              />
            </div>
          </div>
        )}

        {/* TAB 2: All Tickets & Bookings */}
        {activeTab === "bookings" && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <PlaneTakeoff className="text-sky-600 dark:text-sky-400 shrink-0" size={24} />
                  <span>All Tickets & Bookings</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete ledger of flight tickets, passenger manifests, and travel documents
                </p>
              </div>

              <button
                onClick={() => handleOpenNewBooking()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition active:scale-95"
              >
                <PlusCircle size={16} />
                <span>New Ticket / Booking</span>
              </button>
            </div>

            <BookingList
              bookings={bookings}
              serviceTypes={serviceTypes}
              settings={settings}
              onOpenInvoice={handleOpenInvoice}
              onOpenWhatsApp={handleOpenWhatsApp}
              onEditBooking={handleEditBooking}
              onDeleteBooking={handleDeleteBooking}
              onSelectCustomer={handleSelectCustomer}
              onOpenReportPdf={handleOpenReportPdf}
            />
          </div>
        )}

        {/* TAB 3: Customers & Parties Directory */}
        {activeTab === "customers" && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Users className="text-sky-600 dark:text-sky-400 shrink-0" size={24} />
                  <span>Customers & Parties</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any customer to inspect all their booked services, flights, and payments
                </p>
              </div>
            </div>

            <CustomerList
              customers={customers}
              onSelectCustomer={handleSelectCustomer}
              onAddBookingForCustomer={(custId) => handleOpenNewBooking(custId)}
              onDeleteCustomer={handleDeleteCustomer}
              onOpenNewCustomer={() => {
                setEditingCustomer(null);
                setIsCustomerModalOpen(true);
              }}
              onEditCustomer={(cust) => {
                setEditingCustomer(cust);
                setIsCustomerModalOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 4: Services Management */}
        {activeTab === "services" && (
          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Layers className="text-sky-600 dark:text-sky-400 shrink-0" size={24} />
                  <span>Services Configuration</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage the service dropdown options (Flight Ticket, Passport, Visa, Tour Packages, etc.)
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingServiceId(null);
                  setIsServicesModalOpen(true);
                }}
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
                    className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-sky-300 dark:hover:border-sky-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-base text-slate-900 dark:text-white">{service.name}</span>
                        <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded">
                          {service.code || "SRV"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {getServiceDisplayDescription(service)}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Total bookings: <strong className="text-slate-800 dark:text-slate-200">{count}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setEditingServiceId(service.id);
                          setIsServicesModalOpen(true);
                        }}
                        className="font-bold text-sky-600 dark:text-sky-400 hover:underline"
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

        {/* TAB 5: Agency Settings & Security (Change ID & Password) */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <AgencySettingsView
              settings={settings}
              onSaved={(updated) => setSettings(updated)}
              currentUser={user}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="no-print mt-auto border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 py-3.5 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-800 dark:text-slate-200">{settings.agencyName}</strong> &bull; Travel Desk Management & Due Alerts
          </div>
          <div className="text-slate-400 dark:text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} {settings.agencyName}. All rights reserved.
          </div>
        </div>
      </footer>
      </div>

      {/* MODALS */}
      {/* 1. Add / Edit Booking & Customer Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingBooking(null);
          setPreselectedCustomerId(undefined);
        }}
        onSaved={() => fetchData()}
        booking={editingBooking}
        customers={customers}
        serviceTypes={serviceTypes}
        onOpenManageServices={() => {
          setEditingServiceId(null);
          setIsServicesModalOpen(true);
        }}
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
        onEditCustomer={(cust) => {
          setIsCustomerDrawerOpen(false);
          setEditingCustomer(cust);
          setIsCustomerModalOpen(true);
        }}
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

      {/* 3.1 Printable Ledger & Ticket PDF Report Modal (Mounted at root for full-bleed printing) */}
      <TicketReportPdfModal
        isOpen={isReportPdfOpen}
        onClose={() => setIsReportPdfOpen(false)}
        bookings={reportPdfBookings}
        settings={settings}
        filterLabel={reportPdfLabel}
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
        onClose={() => {
          setIsServicesModalOpen(false);
          setEditingServiceId(null);
        }}
        serviceTypes={serviceTypes}
        onRefresh={() => fetchData()}
        initialServiceId={editingServiceId}
      />

      {/* 6. Add / Edit Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        customer={editingCustomer}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onCustomerSaved={(savedCust) => {
          if (savedCust) {
            setCustomers((prev) => {
              const idx = prev.findIndex((c) => c.id === savedCust.id);
              if (idx !== -1) {
                const next = [...prev];
                next[idx] = savedCust;
                return next;
              }
              return [savedCust, ...prev];
            });
          }
          fetchData();
        }}
      />
    </div>
  );
}
