"use client";

import React, { useState, useMemo } from "react";
import { Booking, ServiceType } from "@/lib/types";
import { getDaysDifference, formatDate } from "@/lib/date-utils";
import { exportBookingsToCSV } from "@/lib/export-csv";
import TicketQuickViewModal from "./TicketQuickViewModal";
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
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface BookingListProps {
  bookings: Booking[];
  serviceTypes: ServiceType[];
  onOpenInvoice: (booking: Booking) => void;
  onOpenWhatsApp: (booking: Booking) => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onSelectCustomer: (customerId: string) => void;
}

export default function BookingList({
  bookings,
  serviceTypes,
  onOpenInvoice,
  onOpenWhatsApp,
  onEditBooking,
  onDeleteBooking,
  onSelectCustomer,
}: BookingListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Quick View modal state
  const [quickViewBooking, setQuickViewBooking] = useState<Booking | null>(null);

  // Memoized filter calculation for instant response
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
        const portal = b.portal?.toLowerCase() || "";
        const bookingNo = b.bookingNo.toLowerCase();

        return (
          party.includes(q) ||
          phone.includes(q) ||
          pnr.includes(q) ||
          flt.includes(q) ||
          sector.includes(q) ||
          portal.includes(q) ||
          bookingNo.includes(q)
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
      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search party name, mobile, PNR, flight, sector, portal..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 transition"
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
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
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
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Flight Delayed">Flight Delayed</option>
            <option value="Rescheduled / Postponed">Rescheduled / Postponed</option>
            <option value="In Process">In Process</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            title="Export filtered records to Excel / CSV"
          >
            <FileSpreadsheet size={15} className="text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {(searchTerm || selectedService !== "all" || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedService("all");
                setSelectedStatus("all");
                setCurrentPage(1);
              }}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MOBILE OPTIMIZED VIEW: Customer Name + Icons Only (As requested)      */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-2">
        {paginatedBookings.length === 0 ? (
          <div className="py-10 text-center bg-white rounded-2xl border border-slate-200 p-4">
            <Plane size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No tickets match criteria</p>
          </div>
        ) : (
          paginatedBookings.map((b) => {
            const diff = getDaysDifference(b.travelDate);
            const isDelay = b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:border-sky-300 transition flex items-center justify-between gap-2"
              >
                {/* Left: Customer Name + Quick Badge */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      onClick={() => setQuickViewBooking(b)}
                      className="font-bold text-sm text-slate-900 truncate hover:text-sky-600 cursor-pointer"
                    >
                      {b.customer?.name}
                    </span>
                    {isDelay && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" title={b.status} />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className={`font-semibold ${diff.days <= 1 ? "text-rose-600 font-bold" : "text-sky-700"}`}>
                      {diff.label}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{b.flightNo || b.serviceType?.name || "Service"}</span>
                    {b.pnr && (
                      <>
                        <span>•</span>
                        <span className="font-mono font-bold text-slate-700">{b.pnr}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Icon Buttons Only (WhatsApp, View, Invoice, Edit, Delete) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* 1. View Full Details Icon */}
                  <button
                    onClick={() => setQuickViewBooking(b)}
                    className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition active:scale-95"
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
                    className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition active:scale-95"
                    title="Print / View Invoice"
                  >
                    <Printer size={17} />
                  </button>

                  {/* 4. Edit Icon */}
                  <button
                    onClick={() => onEditBooking(b)}
                    className="p-2 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* 5. Delete Icon */}
                  <button
                    onClick={() => onDeleteBooking(b.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
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
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Days Left</th>
                <th className="py-3 px-4">Party Name & Mobile</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Sector / Flight</th>
                <th className="py-3 px-4">PNR</th>
                <th className="py-3 px-4">Travel Date & Time</th>
                <th className="py-3 px-4">Portal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Fare & Dues</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Plane size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">No tickets or bookings match your criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((b) => {
                  const diff = getDaysDifference(b.travelDate);
                  const isDelay =
                    b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";

                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-sky-50/40 transition group ${
                        isDelay ? "bg-amber-50/20" : ""
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
                          className="cursor-pointer group-hover:text-sky-600"
                        >
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <span>{b.customer?.name}</span>
                            <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition" />
                          </div>
                          <div className="text-slate-500 font-mono text-[11px]">
                            {b.customer?.phone}
                          </div>
                        </div>
                      </td>

                      {/* 3. Service Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          {b.serviceType?.name || "Flight"}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {b.bookingNo}
                        </div>
                      </td>

                      {/* 4. Sector / Flight No */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 max-w-[180px] truncate" title={b.sector || ""}>
                          {b.sector || "—"}
                        </div>
                        {b.flightNo && (
                          <div className="text-[11px] text-sky-700 font-semibold">
                            {b.flightNo}
                          </div>
                        )}
                      </td>

                      {/* 5. Airline PNR */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {b.pnr ? (
                          <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                            {b.pnr}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* 6. Travel Date & Flight Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {b.travelDate ? formatDate(b.travelDate) : "—"}
                        </div>
                        {b.flightTime && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            🕒 {b.flightTime}
                          </div>
                        )}
                      </td>

                      {/* 7. Issued Portal */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">
                          {b.portal || "Direct Desk"}
                        </span>
                      </td>

                      {/* 8. Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isDelay ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <AlertTriangle size={12} />
                            {b.status}
                          </span>
                        ) : (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              b.status === "Confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "Completed"
                                ? "bg-slate-100 text-slate-700"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {b.status}
                          </span>
                        )}
                      </td>

                      {/* 9. Financials / Balance */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          ₹{b.totalAmount.toLocaleString()}
                        </div>
                        {b.balanceAmount > 0 ? (
                          <div className="text-[11px] font-bold text-rose-600">
                            Due: ₹{b.balanceAmount.toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-600 font-semibold">
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
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
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
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                            title="Print / View Invoice"
                          >
                            <Printer size={15} />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => onEditBooking(b)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                            title="Edit Ticket Details"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onDeleteBooking(b.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Ticket"
                          >
                            <Trash2 size={15} />
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
      <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Showing{" "}
            <strong>
              {totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1}
            </strong>{" "}
            to <strong>{Math.min(safeCurrentPage * pageSize, totalItems)}</strong> of{" "}
            <strong>{totalItems}</strong> records
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="p-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
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
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="First Page"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="px-3 py-1 font-semibold text-slate-800">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={safeCurrentPage >= totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
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
    </div>
  );
}
