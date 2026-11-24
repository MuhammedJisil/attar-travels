"use client";

import React, { useState, useMemo } from "react";
import { Booking, ServiceType, AgencySettings, initialAgencySettings } from "@/lib/types";
import { getDaysDifference, getServiceTimeline, formatDate, formatBookingNo, formatFlightTimeDisplay } from "@/lib/date-utils";
import { exportBookingsToCSV } from "@/lib/export-csv";
import { extractCustomFieldValues, getServiceFieldConfig, isFlightOrTravelService, resolveBookingDates } from "@/lib/service-config";
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
  Calendar,
  X,
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

function toSingleTitle(text: string): string {
  if (!text) return "";
  const t = text.trim();
  const low = t.toLowerCase();

  if (low.includes("destination")) return "DESTINATION";
  if (low.includes("travel date") || low.includes("departure date") || low.includes("travel")) return "TRAVEL DATE";
  if (low.includes("journey date")) return "JOURNEY DATE";
  if (low.includes("appointment date")) return "APPOINTMENT DATE";
  if (low.includes("dispatch date") || low.includes("booking date")) return "BOOKING DATE";
  if (low.includes("flight no") || low.includes("flight number")) return "FLIGHT NO";
  if (low.includes("airline pnr") || low.includes("pnr")) return "PNR";
  if (low.includes("tracking") || low.includes("consignment") || low.includes("waybill") || low.includes("awb")) return "TRACKING NO";
  if (low.includes("irctc")) return "IRCTC PNR";
  if (low.includes("courier") || low.includes("carrier")) return "COURIER COMPANY";
  if (low.includes("sector")) return "SECTOR";
  if (low.includes("portal")) return "PORTAL";
  if (low.includes("supplier") || low.includes("provider")) return "SUPPLIER";
  if (low.includes("party name") || low.includes("customer")) return "PARTY NAME";
  if (low.includes("days left") || low.includes("timeline")) return "TIMELINE";
  if (low.includes("fare") || low.includes("dues")) return "FARE & DUES";
  if (low.includes("status")) return "STATUS";
  if (low.includes("action")) return "ACTIONS";

  if (t.includes("/")) {
    return t.split("/")[0].trim().toUpperCase();
  }
  return t.toUpperCase();
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
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  // Reorder services: All Services, Flight Ticket, Courier Service, Passport Service, Visa Service, then others
  const orderedServiceTypes = useMemo(() => {
    const getRank = (name: string) => {
      const low = name.toLowerCase();
      if (low.includes("flight")) return 1;
      if (low.includes("courier") || low.includes("coriur")) return 2;
      if (low.includes("passport")) return 3;
      if (low.includes("visa")) return 4;
      return 10;
    };
    return [...serviceTypes].sort((a, b) => {
      const rA = getRank(a.name);
      const rB = getRank(b.name);
      if (rA !== rB) return rA - rB;
      return a.name.localeCompare(b.name);
    });
  }, [serviceTypes]);

  // Extract unique agents with booking counts
  const agentsList = useMemo(() => {
    const map: Record<string, number> = {};
    for (const b of bookings) {
      const ag = getAgentName(b);
      if (ag) {
        map[ag] = (map[ag] || 0) + 1;
      }
    }
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [bookings]);

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

  // Memoized filter calculation for instant response
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (selectedService !== "all" && b.serviceTypeId !== selectedService) return false;
      if (selectedStatus !== "all" && b.status !== selectedStatus) return false;

      // Agent filter
      if (selectedAgent !== "all") {
        const ag = getAgentName(b);
        if (!ag || ag.toLowerCase() !== selectedAgent.toLowerCase()) return false;
      }

      // Dedicated calendar date filter: Filter by TICKET / SERVICE ISSUE DATE
      if (selectedDate) {
        const customVals = extractCustomFieldValues(b.notes);
        const customIssueDate = Object.entries(customVals).find(([k]) =>
          /issue\s*date|booking\s*date|dispatch\s*date|applied\s*date/i.test(k)
        )?.[1];

        const issueIso = b.issueDate ? String(b.issueDate).substring(0, 10) : null;
        const createdIso = b.createdAt ? String(b.createdAt).substring(0, 10) : null;
        const customIssueIso = (customIssueDate && typeof customIssueDate === "string") ? customIssueDate.substring(0, 10) : null;

        const matchesIssuedDate =
          issueIso === selectedDate ||
          customIssueIso === selectedDate ||
          (!issueIso && !customIssueIso && createdIso === selectedDate);

        if (!matchesIssuedDate) return false;
      }

      // Text search without date matching interference
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
          flightTime.includes(q) ||
          passportNo.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [bookings, selectedService, selectedStatus, selectedAgent, selectedDate, searchTerm]);

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
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      {/* Search and Filters Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-2.5 sm:gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search party name, mobile, PNR, flight, sector, portal, agent..."
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
          {/* Calendar Date Filter (Issued Date) */}
          <div className="relative flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 sm:py-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
              <Calendar size={13} className="text-sky-500 shrink-0" />
              <span className="hidden sm:inline">Issued:</span>
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
              title="Filter records by Issue / Booking Date"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate("");
                  setCurrentPage(1);
                }}
                className="p-0.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                title="Clear issue date filter"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Service Dropdown (Strictly Ordered: Flight -> Courier -> Passport -> Visa -> Others) */}
          <select
            value={selectedService}
            onChange={(e) => {
              setSelectedService(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Services</option>
            {orderedServiceTypes.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Agent Filter Dropdown */}
          <select
            value={selectedAgent}
            onChange={(e) => {
              setSelectedAgent(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Agents ({bookings.length})</option>
            {agentsList.map(({ name, count }) => (
              <option key={name} value={name}>
                👤 {name} ({count})
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
                  : selectedAgent !== "all"
                  ? `Agent: ${selectedAgent}`
                  : selectedDate
                  ? `Date: ${selectedDate}`
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

          {(searchTerm || selectedService !== "all" || selectedStatus !== "all" || selectedAgent !== "all" || selectedDate) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedService("all");
                setSelectedStatus("all");
                setSelectedAgent("all");
                setSelectedDate("");
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
      <div className="md:hidden space-y-2 w-full max-w-full overflow-hidden">
        {paginatedBookings.length === 0 ? (
          <div className="py-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <Plane size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No tickets match criteria</p>
          </div>
        ) : (
          paginatedBookings.map((b) => {
            const { travelDate: effectiveTravelDate, returnDate: effectiveReturnDate } = resolveBookingDates(b);
            const diff = getServiceTimeline(effectiveTravelDate, b.serviceType?.name, effectiveReturnDate, b.status);
            const isDelay = b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";
            const isFlight = isFlightOrTravelService(b.serviceType);
            const custom = extractCustomFieldValues(b.notes);
            const isFakeAutoPnr = !isFlight && b.pnr && /^CCJ-\d+$/i.test(b.pnr);
            const customRef = Object.entries(custom).find(([k]) => /tracking|consignment|awb|waybill|arn|file|pnr|ref/i.test(k))?.[1];
            const displayPnr = (!isFakeAutoPnr && b.pnr) ? b.pnr : (customRef || null);

            return (
              <div
                key={b.id}
                onClick={() => setQuickViewBooking(b)}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm hover:border-sky-300 dark:hover:border-sky-700 transition flex items-center justify-between gap-2 cursor-pointer"
              >
                {/* Left: Customer Name + Days Left / Departed Count only */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {b.customer?.name}
                    </span>
                    {isDelay && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" title={b.status} />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {diff.isCancelled ? (
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Cancelled
                      </span>
                    ) : (
                      <>
                        <span className={`font-semibold ${diff.days <= 1 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-sky-700 dark:text-sky-400"}`}>
                          {diff.label}
                        </span>
                        {effectiveReturnDate && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            ↩ Ret: {formatDate(effectiveReturnDate)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Icon Buttons Only (WhatsApp, Invoice, Edit, Delete) */}
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 1. WhatsApp Alert Icon */}
                  <button
                    onClick={() => onOpenWhatsApp(b)}
                    className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition active:scale-95 shadow-sm"
                    title="Send WhatsApp Alert"
                  >
                    <MessageCircle size={17} />
                  </button>

                  {/* 2. Invoice Icon */}
                  <button
                    onClick={() => onOpenInvoice(b)}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
                    title="Print / View Invoice"
                  >
                    <Printer size={17} />
                  </button>

                  {/* 3. Edit Icon */}
                  <button
                    onClick={() => onEditBooking(b)}
                    className="p-2 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* 4. Delete Icon */}
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
      {(() => {
        // When a single non-flight service is displayed (or selected in dropdown), automatically show its dedicated custom columns
        const singleServiceId = bookings.length > 0 && bookings.every((b) => b.serviceTypeId && b.serviceTypeId === bookings[0].serviceTypeId)
          ? bookings[0].serviceTypeId
          : null;
        const activeFilteredService = serviceTypes.find((s) => s.id === selectedService)
          || (selectedService === "all" && singleServiceId ? serviceTypes.find((s) => s.id === singleServiceId) : null);
        const filteredConfig = activeFilteredService ? getServiceFieldConfig(activeFilteredService) : null;
        const isFilteredFlight = !activeFilteredService || isFlightOrTravelService(activeFilteredService);

        // When a non-flight service is selected, show ONLY the configured mandatory fields as columns
        const serviceCustomFields = filteredConfig?.customFields || [];
        const mandatoryFields = serviceCustomFields.filter((f) => f.required);
        const nonFlightColumns = mandatoryFields.length > 0 ? mandatoryFields : serviceCustomFields;
        const isDynamicServiceView = !isFilteredFlight && nonFlightColumns.length > 0;

        const tableFields = serviceCustomFields.filter((f) => f.showInTable && !f.required);
        const allPrimaryFields = [...mandatoryFields, ...tableFields];

        const routeField = mandatoryFields.find((f) => /route|sector|destination|delivery|city|location|station|from|to/i.test(f.name))
          || mandatoryFields.find((f) => f.type === "text" && !/pnr|track|ref|awb|arn|file|no|num|code/i.test(f.name))
          || allPrimaryFields[0];

        const pnrField = mandatoryFields.find((f) => /pnr|track|consignment|awb|waybill|arn|file|ref|ticket/i.test(f.name))
          || mandatoryFields.find((f) => /code|id|number|no/i.test(f.name) && !/flight|train|bus/i.test(f.name))
          || allPrimaryFields.find((f) => f.id !== routeField?.id);

        const dateField = mandatoryFields.find((f) => f.type === "date" && !/expiry|return|birth/i.test(f.name))
          || mandatoryFields.find((f) => f.type === "date")
          || allPrimaryFields.find((f) => f.type === "date");

        const portalField = allPrimaryFields.find((f) => /portal|supplier|carrier|partner|company|network|desk|vendor/i.test(f.name));

        const col1Header = filteredConfig ? (isFilteredFlight ? "Days Left" : "Timeline") : "Days Left";
        const col4Header = routeField?.name || filteredConfig?.routeLabel || (selectedService === "all" ? "Sector / Route" : "Details");
        const col5Header = pnrField?.name || filteredConfig?.pnrLabel || (selectedService === "all" ? "PNR" : "Ref No");
        const col6Header = dateField?.name || (filteredConfig ? (isFilteredFlight ? "Travel Date & Time" : filteredConfig.dateLabel) : "Travel Date");
        const col7Header = portalField?.name || filteredConfig?.portalLabel || "Portal / Supplier";

        return (
          <div className="hidden md:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold text-[11px]">
                    <th className="py-3 px-4">{toSingleTitle(col1Header)}</th>
                    <th className="py-3 px-4">{toSingleTitle("Party Name")}</th>
                    <th className="py-3 px-4">SERVICE</th>
                    {isDynamicServiceView ? (
                      nonFlightColumns.map((fld) => (
                        <th key={fld.id || fld.name} className="py-3 px-4 whitespace-nowrap">
                          {fld.name.trim().toUpperCase()}
                        </th>
                      ))
                    ) : (
                      <>
                        <th className="py-3 px-4">{toSingleTitle(col4Header)}</th>
                        <th className="py-3 px-4">{toSingleTitle(col5Header)}</th>
                        <th className="py-3 px-4">{toSingleTitle(col6Header)}</th>
                        <th className="py-3 px-4">{toSingleTitle(col7Header)}</th>
                      </>
                    )}
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 text-right">FARE & DUES</th>
                    <th className="py-3 px-4 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={isDynamicServiceView ? (6 + nonFlightColumns.length) : 10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        <Plane size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-slate-600 dark:text-slate-300">No tickets or bookings match your criteria</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((b) => {
                      const { travelDate: effectiveTravelDate, returnDate: effectiveReturnDate } = resolveBookingDates(b);
                      const diff = getServiceTimeline(effectiveTravelDate, b.serviceType?.name, effectiveReturnDate, b.status);
                      const isDelay =
                        b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed";
                      const portalDisplay = getDisplayPortal(b);
                      const serviceConfig = getServiceFieldConfig(b.serviceType);
                      const isFlight = isFlightOrTravelService(b.serviceType);
                      const custom = extractCustomFieldValues(b.notes);

                      // User-selected custom table fields
                      const tableCustomFields = (serviceConfig.customFields || []).filter(
                        (f) => f.showInTable && custom[f.name] && custom[f.name].trim() !== ""
                      );

                      // Route / Sector resolution (clean fallback if b.sector matches service name)
                      const isSectorSameAsServiceName = b.sector && b.serviceType?.name && b.sector.toLowerCase().trim() === b.serviceType.name.toLowerCase().trim();
                      const customRoute = Object.entries(custom).find(([k]) => /route|destination|delivery|city|hotel|package|item|office|application/i.test(k))?.[1];
                      let displayRoute = (!isSectorSameAsServiceName && b.sector) ? b.sector : (customRoute || (!isSectorSameAsServiceName ? b.sector : null) || "—");

                      // If routeField is matched from selected service, prefer its value
                      if (routeField && custom[routeField.name]) {
                        displayRoute = custom[routeField.name];
                      }

                      // PNR / Tracking / Ref resolution (prevent fake autogenerated PNR on non-flight)
                      const isFakeAutoPnr = !isFlight && b.pnr && /^(CCJ|ATT|TRV)-\d+$/i.test(b.pnr);
                      const customRef = Object.entries(custom).find(([k]) => /tracking|consignment|awb|waybill|arn|file|pnr|ref|application/i.test(k))?.[1];
                      let displayPnr = (!isFakeAutoPnr && b.pnr) ? b.pnr : (customRef || null);

                      // If pnrField is matched from selected service, prefer its value
                      if (pnrField && custom[pnrField.name]) {
                        displayPnr = custom[pnrField.name];
                      }

                      // Date resolution
                      let displayDateVal = effectiveTravelDate ? formatDate(effectiveTravelDate) : (b.issueDate ? formatDate(b.issueDate) : "—");
                      if (dateField && custom[dateField.name]) {
                        displayDateVal = /\d{4}-\d{2}-\d{2}/.test(custom[dateField.name])
                          ? formatDate(custom[dateField.name])
                          : custom[dateField.name];
                      }

                      // Portal / Supplier resolution
                      let displayPortalVal = portalDisplay;
                      if (portalField && custom[portalField.name]) {
                        displayPortalVal = custom[portalField.name];
                      }

                      return (
                        <tr
                          key={b.id}
                          className={`hover:bg-sky-50/40 dark:hover:bg-slate-800/50 transition group ${
                            isDelay ? "bg-amber-50/20 dark:bg-amber-950/20" : ""
                          }`}
                        >
                          {/* 1. Days Left / Timeline Alert Badge */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            {diff.isCancelled ? (
                              <span className="text-slate-400 dark:text-slate-600 font-mono text-xs pl-2">—</span>
                            ) : (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${diff.badgeClass}`}
                              >
                                <Clock size={12} />
                                {diff.label}
                              </span>
                            )}
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
                            ) : isFlight ? (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                {formatBookingNo(b.bookingNo)}
                              </div>
                            ) : null}
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

                          {isDynamicServiceView ? (
                            nonFlightColumns.map((fld) => {
                              let val: any = custom[fld.name];
                              if (val === undefined || val === null || String(val).trim() === "") {
                                const matchKey = Object.keys(custom).find(
                                  (k) => k.toLowerCase().trim() === fld.name.toLowerCase().trim()
                                );
                                if (matchKey) val = custom[matchKey];
                              }
                              if ((val === undefined || val === null || String(val).trim() === "") && fld.name) {
                                const fn = fld.name.toLowerCase();
                                if (/portal|supplier|carrier|network|provider/i.test(fn)) val = portalDisplay;
                                else if (/sector|route|destination|city/i.test(fn)) val = b.sector;
                                else if (/pnr|tracking|ref|consignment|awb|waybill/i.test(fn)) val = b.pnr;
                                else if (/date/i.test(fn)) val = b.travelDate || b.issueDate;
                              }

                              const strVal = val !== undefined && val !== null ? String(val).trim() : "";
                              if (!strVal || strVal === "—") {
                                return (
                                  <td key={fld.id || fld.name} className="py-3 px-4 whitespace-nowrap text-slate-400 dark:text-slate-500">
                                    —
                                  </td>
                                );
                              }

                              // Date format
                              if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) {
                                return (
                                  <td key={fld.id || fld.name} className="py-3 px-4 whitespace-nowrap">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {formatDate(strVal)}
                                    </span>
                                  </td>
                                );
                              }

                              // Tracking / PNR / Ref / Consignment / Code format
                              if (/tracking|consignment|awb|waybill|arn|file|pnr|ref|code|id|number|no/i.test(fld.name) && !/name|type|status/i.test(fld.name)) {
                                return (
                                  <td key={fld.id || fld.name} className="py-3 px-4 whitespace-nowrap">
                                    <span className="inline-block px-2 py-0.5 rounded font-mono font-bold text-xs bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                      📦 {strVal}
                                    </span>
                                  </td>
                                );
                              }

                              // Category / Type / Attestation dropdown values
                              if (fld.type === "select" || /type|category|attestaion|service|embassy/i.test(fld.name)) {
                                return (
                                  <td key={fld.id || fld.name} className="py-3 px-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                      {/attestaion|embassy/i.test(fld.name) ? "📦 " : ""}
                                      {strVal}
                                    </span>
                                  </td>
                                );
                              }

                              // Default text column (e.g. Supplier Name)
                              return (
                                <td key={fld.id || fld.name} className="py-3 px-4">
                                  <div className="font-bold text-slate-900 dark:text-white max-w-[200px] truncate" title={strVal}>
                                    {strVal}
                                  </div>
                                </td>
                              );
                            })
                          ) : (
                            <>
                              {/* 4. Route / Destination / Mandatory Field 1 */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 dark:text-white max-w-[180px] truncate" title={displayRoute || ""}>
                                  {displayRoute}
                                </div>
                                {(() => {
                                  const customFlightNo = custom["Flight Number"] || custom["Flight No"] || custom["Flight"] || "";
                                  const displayFlightNo = b.flightNo || customFlightNo;
                                  return displayFlightNo ? (
                                    <div className="text-[11px] text-sky-700 dark:text-sky-400 font-semibold font-mono">
                                      {isFlight ? `✈️ ${displayFlightNo}` : displayFlightNo}
                                    </div>
                                  ) : null;
                                })()}
                                {/* Display user-selected custom fields */}
                                {tableCustomFields
                                  .filter((f) => f.id !== routeField?.id && f.id !== pnrField?.id && f.id !== dateField?.id && f.id !== portalField?.id)
                                  .map((fld) => (
                                    <div key={fld.id} className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[180px] mt-0.5">
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">{fld.name}:</span> {custom[fld.name]}
                                    </div>
                                  ))}
                              </td>

                              {/* 5. PNR / Tracking / Mandatory Field 2 */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                {displayPnr ? (
                                  <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                    {isFlight ? displayPnr : `📦 ${displayPnr}`}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-500">—</span>
                                )}
                              </td>

                              {/* 6. Date / Timing / Mandatory Field 3 */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {displayDateVal}
                                </div>
                                {(() => {
                                  const depVal = custom["Flight Departure Time"] || custom["Flight Time"] || "";
                                  const arrVal = custom["Flight Arrivel Time"] || custom["Flight Arrival Time"] || "";
                                  const customTime = Object.entries(custom).find(([k]) => /reporting|appointment\s*time|appt\s*time/i.test(k))?.[1];
                                  let timeDisplay = "";
                                  if (depVal && arrVal) {
                                    timeDisplay = `🕒 ${depVal} - ${arrVal} hrs`;
                                  } else if (depVal) {
                                    timeDisplay = `🕒 ${depVal} hrs`;
                                  } else if (customTime) {
                                    timeDisplay = `🕒 ${customTime} hrs`;
                                  } else if (b.flightTime) {
                                    timeDisplay = isFlight ? formatFlightTimeDisplay(b.flightTime) : `🕒 ${b.flightTime}`;
                                  }
                                  return timeDisplay ? (
                                    <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium font-mono">
                                      {timeDisplay}
                                    </div>
                                  ) : null;
                                })()}
                                {effectiveReturnDate && (
                                  <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 flex items-center gap-1">
                                    <span>↩</span>
                                    <span>Ret: {formatDate(effectiveReturnDate)}</span>
                                  </div>
                                )}
                              </td>

                              {/* 7. Portal / Supplier / Carrier */}
                              <td className="py-3 px-4 whitespace-nowrap">
                                <span className="text-slate-700 dark:text-slate-300 font-medium">
                                  {displayPortalVal}
                                </span>
                              </td>
                            </>
                          )}

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
    );
  })()}

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
