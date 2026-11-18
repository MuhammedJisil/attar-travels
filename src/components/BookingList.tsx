"use client";

import React, { useState, useMemo } from "react";
import { Booking, ServiceType, AgencySettings, initialAgencySettings } from "@/lib/types";
import { getDaysDifference, formatDate, formatBookingNo, formatFlightTimeDisplay } from "@/lib/date-utils";
import { exportBookingsToCSV } from "@/lib/export-csv";
import { extractCustomFieldValues } from "@/lib/service-config";
import TicketQuickViewModal from "./TicketQuickViewModal";
import TicketReportPdfModal from "./TicketReportPdfModal";
import {
  Search,
  MessageCircle,
  Printer,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  Plane,
  Eye,
  FileSpreadsheet,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from "lucide-react";

interface BookingListProps {
  bookings: Booking[];
  serviceTypes: ServiceType[];
  settings?: AgencySettings;
  onOpenInvoice: (booking: Booking) => void;
  onOpenWhatsApp: (booking: Booking) => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onOpenReportPdf?: (bookings: Booking[], filterLabel?: string) => void;
}

export function getDisplayPortal(b: Booking): string {
  if (b.portal && b.portal !== "Direct Desk" && b.portal.trim() !== "") return b.portal;
  const custom = extractCustomFieldValues(b.notes);
  for (const [k, v] of Object.entries(custom)) {
    const lk = k.toLowerCase();
    if ((lk.includes("portal") || lk.includes("supplier") || lk.includes("desk") || lk.includes("booked")) && v && v.trim() !== "") {
      return v;
    }
  }
  return b.portal || "Direct Desk";
}

export function getAgentName(b: Booking): string | null {
  const custom = extractCustomFieldValues(b.notes);
  for (const [k, v] of Object.entries(custom)) {
    const lk = k.toLowerCase();
    if (
      (lk.includes("agent") ||
        lk.includes("staff") ||
        lk.includes("issued by") ||
        lk.includes("booked by") ||
        lk.includes("operator")) &&
      v &&
      String(v).trim() !== ""
    ) {
      const val = String(v).trim();
      if (!/^(admin|select|--\s*select.*--)$/i.test(val)) {
        return val;
      }
    }
  }

  if (b.notes) {
    const match = b.notes.match(/(?:Agent|Staff|Issued By|Booked By):\s*([^\n\r,;]+)/i);
    if (match && match[1]?.trim()) {
      const val = match[1].trim();
      if (!/^(admin|select|--\s*select.*--)$/i.test(val)) {
        return val;
      }
    }
  }

  return null;
}

export default function BookingList({
  bookings,
  serviceTypes,
  onOpenInvoice,
  onOpenWhatsApp,
  onEditBooking,
  onDeleteBooking,
  onSelectCustomer,
  onOpenReportPdf,
  settings = initialAgencySettings,
}: BookingListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // PDF Export Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Quick View modal state
  const [quickViewBooking, setQuickViewBooking] = useState<Booking | null>(null);

  // Deleting booking state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await onDeleteBooking(id);
    } finally {
      setDeletingId(null);
    }
  };

  // Memoized filter calculation for instant response with date searching support
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedService !== "all" && b.serviceTypeId !== selectedService) return false;
      if (selectedStatus !== "all" && b.status !== selectedStatus) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const party = b.customer?.name?.toLowerCase() || "";
        const phone = b.customer?.phone?.toLowerCase() || "";
        const pnr = b.pnr?.toLowerCase() || "";
        const flt = b.flightNo?.toLowerCase() || "";
        const sector = b.sector?.toLowerCase() || "";
        const portal = getDisplayPortal(b).toLowerCase();
        const bookingNo = b.bookingNo.toLowerCase();
        const ccjBookingNo = formatBookingNo(b.bookingNo).toLowerCase();
        const agent = getAgentName(b)?.toLowerCase() || "";

        // Filter date by ticket issue date or customer creation date (NOT travel date)
        const issueDate = b.issueDate ? String(b.issueDate).toLowerCase() : "";
        const formattedIssueDate = b.issueDate ? formatDate(String(b.issueDate)).toLowerCase() : "";
        const createdAtDate = b.createdAt ? formatDate(String(b.createdAt)).toLowerCase() : "";

        const flightTime = b.flightTime?.toLowerCase() || "";
        const passportNo = b.passportNo?.toLowerCase() || "";
        const notes = b.notes?.toLowerCase() || "";

        return (
          party.includes(q) ||
          phone.includes(q) ||
          pnr.includes(q) ||
          flt.includes(q) ||
          sector.includes(q) ||
          portal.includes(q) ||
          bookingNo.includes(q) ||
          ccjBookingNo.includes(q) ||
          agent.includes(q) ||
          issueDate.includes(q) ||
          formattedIssueDate.includes(q) ||
          createdAtDate.includes(q) ||
          flightTime.includes(q) ||
          passportNo.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [bookings, selectedService, selectedStatus, searchTerm]);

  // Pagination calculations
  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedBookings = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredBookings.slice(start, start + pageSize);
  }, [filteredBookings, safeCurrentPage, pageSize]);

  // Handle Export to Excel / CSV
  const handleExportCSV = () => {
    exportBookingsToCSV(filteredBookings, `traveldesk_tickets_${new Date().toISOString().substring(0, 10)}.csv`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search party name, mobile, PNR, flight, sector, portal, date (e.g. 14 Nov)..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-sky-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Filter Controls & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Service Dropdown */}
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Services</option>
            {serviceTypes.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Flight Delayed">Flight Delayed</option>
            <option value="Rescheduled / Postponed">Rescheduled / Postponed</option>
            <option value="In Process">In Process</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Export to PDF Button */}
          <button
            onClick={() => {
              const label =
                selectedService !== "all"
                  ? `Service: ${serviceTypes.find((s) => s.id === selectedService)?.name || selectedService}`
                  : selectedStatus !== "all"
                  ? `Status: ${selectedStatus}`
                  : "All Active Tickets";
              if (onOpenReportPdf) {
                onOpenReportPdf(filteredBookings, label);
              } else {
                setIsPdfModalOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold transition shadow-xs active:scale-95"
            title="Export & Print Filtered Ledger as PDF"
          >
            <FileText size={15} className="text-rose-600 dark:text-rose-400" />
            <span>Export PDF</span>
          </button>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium transition"
            title="Export filtered records to Excel / CSV"
          >
            <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {(searchTerm || selectedService !== "all" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedService("all");
                setSelectedStatus("all");
                setCurrentPage(1);
              }}
              className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-800 font-semibold px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE OPTIMIZED VIEW: Customer Name + Icons Only                      */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-2">
        {paginatedBookings.length === 0 ? (
          <div className="py-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <Plane size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No tickets match criteria</p>
          </div>
        ) : (
          paginatedBookings.map((b) => {
            const diff = getDaysDifference(b.travelDate);
            const isDelay = b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition flex items-center justify-between gap-2"
              >
                {/* Left: Customer Name + Quick Badge */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => setQuickViewBooking(b)}
                      className="font-bold text-sm text-slate-900 dark:text-white truncate hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer"
                    >
                      {b.customer?.name}
                    </span>
                    {isDelay && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" title={b.status} />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className={`font-semibold ${diff.days <= 1 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-sky-700 dark:text-sky-400"}`}>
                      {diff.label}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{b.flightNo || b.serviceType?.name || "Service"}</span>
                    {getAgentName(b) ? (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-sky-700 dark:text-sky-300">👤 {getAgentName(b)}</span>
                      </>
                    ) : (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-400">{formatBookingNo(b.bookingNo)}</span>
                      </>
                    )}
                    {b.pnr && (
                      <>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{b.pnr}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Icon Buttons Only (WhatsApp, View, Invoice, Edit, Delete) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* 1. View Full Details Icon */}
                  <button
                    onClick={() => setQuickViewBooking(b)}
                    className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition active:scale-95"
                    title="View Full Details"
                  >
                    <Eye size={17} />
                  </button>

                  {/* 2. WhatsApp Alert Icon */}
                  <button
                    onClick={() => onOpenWhatsApp(b)}
                    className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition active:scale-95 shadow-sm"
                    title="Send WhatsApp Alert"
                  >
                    <MessageCircle size={17} />
                  </button>

                  {/* 3. Invoice Icon */}
                  <button
                    onClick={() => onOpenInvoice(b)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
                    title="Print / View Invoice"
                  >
                    <Printer size={17} />
                  </button>

                  {/* 4. Edit Icon */}
                  <button
                    onClick={() => onEditBooking(b)}
                    className="p-2 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* 5. Delete Icon */}
                  <button
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    {deletingId === b.id ? (
                      <Loader2 size={16} className="animate-spin text-rose-500" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW: Full Detailed Table                                      */}
      {/* ========================================================================= */}
      <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Days Left</th>
                <th className="py-3 px-4">Party Name & Mobile</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Sector / Flight</th>
                <th className="py-3 px-4">PNR</th>
                <th className="py-3 px-4">Travel Date & Return</th>
                <th className="py-3 px-4">Portal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Fare & Dues</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <Plane size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">No tickets or bookings match your criteria</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => {
                  const diff = getDaysDifference(b.travelDate);
                  const isDelay =
                    b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";
                  const portalDisplay = getDisplayPortal(b);

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-sky-50/40 dark:hover:bg-slate-800/50 transition group ${
                        isDelay ? "bg-amber-50/20 dark:bg-amber-950/20" : ""
                      }`}
                    >
                      {/* 1. Days Left Alert Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${diff.badgeClass}`}
                        >
                          <Clock size={12} />
                          {diff.label}
                        </span>
                      </td>

                      {/* 2. Customer / Party Name */}
                      <td className="py-3 px-4">
                        <div
                          onClick={() => onSelectCustomer(b.customerId)}
                          className="cursor-pointer group-hover:text-sky-600 dark:group-hover:text-sky-400"
                        >
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            <span>{b.customer?.name}</span>
                            <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition" />
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                            {b.customer?.phone}
                          </div>
                        </div>
                      </td>

                      {/* 3. Service Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {b.serviceType?.name || "Flight"}
                        </span>
                        {getAgentName(b) ? (
                          <div className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 mt-0.5 flex items-center gap-1">
                            <span className="text-[10px]">👤</span>
                            <span className="truncate max-w-[120px]" title={`Agent: ${getAgentName(b)}`}>
                              {getAgentName(b)}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                            {formatBookingNo(b.bookingNo)}
                          </div>
                        )}
                        {b.passportNo && (
                          <div className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-800 mt-1 flex items-center gap-1">
                            <span>🛂</span>
                            <span>{b.passportNo}</span>
                          </div>
                        )}
                        {b.expiryDate && (() => {
                          const exp = getDaysDifference(b.expiryDate);
                          if (exp.days <= 180) {
                            return (
                              <div className={`text-[10px] font-bold mt-0.5 ${exp.days <= 30 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}`}>
                                ⚠️ Exp: {formatDate(b.expiryDate)} ({exp.days < 0 ? "Expired" : `${exp.days}d left`})
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </td>

                      {/* 4. Sector / Flight No */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white max-w-[180px] truncate" title={b.sector || ""}>
                          {b.sector || "—"}
                        </div>
                        {b.flightNo && (
                          <div className="text-[11px] text-sky-700 dark:text-sky-400 font-semibold">
                            {b.flightNo}
                          </div>
                        )}
                      </td>

                      {/* 5. Airline PNR */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {b.pnr ? (
                          <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            {b.pnr}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* 6. Travel Date, Flight Time & Return Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {b.travelDate ? formatDate(b.travelDate) : "—"}
                        </div>
                        {b.flightTime && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium font-mono">
                            {formatFlightTimeDisplay(b.flightTime)}
                          </div>
                        )}
                        {b.returnDate && (
                          <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                            <span>↩</span>
                            <span>Ret: {formatDate(b.returnDate)}</span>
                          </div>
                        )}
                      </td>

                      {/* 7. Issued Portal */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {portalDisplay}
                        </span>
                      </td>

                      {/* 8. Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isDelay ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
                            <AlertTriangle size={12} />
                            {b.status}
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              b.status === "Confirmed"
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : b.status === "Completed"
                                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                : "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                            }`}
                          >
                            {b.status}
                          </span>
                        )}
                      </td>

                      {/* 9. Financials / Balance */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">
                          ₹{b.totalAmount.toLocaleString()}
                        </div>
                        {b.balanceAmount > 0 ? (
                          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                            Due: ₹{b.balanceAmount.toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Paid Full
                          </div>
                        )}
                      </td>

                      {/* 10. Actions & Alerts */}
                      <td className="py-3 px-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick View Button */}
                          <button
                            onClick={() => setQuickViewBooking(b)}
                            className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition"
                            title="Quick View Details"
                          >
                            <Eye size={15} />
                          </button>

                          {/* WhatsApp Alert Button */}
                          <button
                            onClick={() => onOpenWhatsApp(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm transition active:scale-95"
                            title="Send WhatsApp Reminder / Alert"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp</span>
                          </button>

                          {/* Invoice Button */}
                          <button
                            onClick={() => onOpenInvoice(b)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                            title="Print / View Invoice"
                          >
                            <Printer size={15} />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => onEditBooking(b)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 transition"
                            title="Edit Ticket Details"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(b.id)}
                            disabled={deletingId === b.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Ticket"
                          >
                            {deletingId === b.id ? (
                              <Loader2 size={15} className="animate-spin text-rose-500" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PAGINATION CONTROLS & SUMMARY (Responsive)                             */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            Showing{" "}
            <strong className="text-slate-800 dark:text-slate-200">
              {totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
            </strong>{" "}
            to <strong className="text-slate-800 dark:text-slate-200">{Math.min(safeCurrentPage * pageSize, totalItems)}</strong> of{" "}
            <strong className="text-slate-800 dark:text-slate-200">{totalItems}</strong> records
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 dark:text-slate-500">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
            title="First Page"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-800 dark:text-slate-200">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300"
            title="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>

      {/* Quick View Popup Modal */}
      <TicketQuickViewModal
        booking={quickViewBooking}
        isOpen={!!quickViewBooking}
        onClose={() => setQuickViewBooking(null)}
        onOpenWhatsApp={onOpenWhatsApp}
        onOpenInvoice={onOpenInvoice}
        onEditBooking={onEditBooking}
      />

      {/* PDF Export Report Modal */}
      <TicketReportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        bookings={filteredBookings}
        settings={settings}
        filterLabel={
          selectedService !== "all"
            ? `Service: ${serviceTypes.find((s) => s.id === selectedService)?.name || selectedService}`
            : selectedStatus !== "all"
            ? `Status: ${selectedStatus}`
            : "All Active Tickets"
        }
      />
    </div>
  );
}
