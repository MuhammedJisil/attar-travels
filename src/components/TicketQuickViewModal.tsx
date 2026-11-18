"use client";

import React from "react";
import { Booking } from "@/lib/types";
import { getDaysDifference, formatDate, formatBookingNo, formatFlightTimeDisplay } from "@/lib/date-utils";
import { getServiceFieldConfig, extractCustomFieldValues } from "@/lib/service-config";
import {
  X,
  Plane,
  Train,
  Bus,
  Clock,
  Phone,
  User,
  CreditCard,
  MessageCircle,
  Printer,
  Edit2,
  AlertTriangle,
  Building,
  Calendar,
  FileText,
} from "lucide-react";

interface TicketQuickViewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenWhatsApp: (b: Booking) => void;
  onOpenInvoice: (b: Booking) => void;
  onEditBooking: (b: Booking) => void;
}

export default function TicketQuickViewModal({
  booking,
  isOpen,
  onClose,
  onOpenWhatsApp,
  onOpenInvoice,
  onEditBooking,
}: TicketQuickViewModalProps) {
  if (!isOpen || !booking) return null;

  const diff = getDaysDifference(booking.travelDate);
  const isDelay = booking.status === "Flight Delayed" || booking.status === "Rescheduled / Postponed";

  return (
    <div className="no-print print:hidden fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Plane size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Ticket & Flight Details</h3>
              <p className="text-xs text-slate-400 font-mono">{formatBookingNo(booking.bookingNo)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Days Left and Status Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Days Left:</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${diff.badgeClass}`}>
                <Clock size={12} />
                {diff.label}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Status:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isDelay
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                  : booking.status === "Confirmed"
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          {booking.alertNotes && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs space-y-0.5">
              <span className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                <AlertTriangle size={14} /> Delay / Postpone Narration:
              </span>
              <p>{booking.alertNotes}</p>
            </div>
          )}

          {/* Customer / Party Info */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Customer / Party
            </span>
            <div className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <User size={16} className="text-sky-600 dark:text-sky-400" />
              <span>{booking.customer?.name}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-mono text-xs">
              <Phone size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>{booking.customer?.phone}</span>
            </div>
          </div>

          {/* Service Details Grid */}
          {(() => {
            const config = getServiceFieldConfig(booking.serviceType);
            const custom = extractCustomFieldValues(booking.notes);
            const hasCustomFields = Boolean(config.customFields && config.customFields.length > 0);

            return (
              <div className="p-3.5 rounded-xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 block">
                    {booking.serviceType?.name || config.title}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                    {booking.serviceType?.code || "SRV"}
                  </span>
                </div>

                {hasCustomFields ? (
                  /* NORMAL INTEGRATED SERVICE FIELDS */
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {config.customFields!.map((fld) => {
                      const val = custom[fld.name] || "";
                      let displayVal = val;
                      if (!displayVal) {
                        const low = fld.name.toLowerCase();
                        if (low.includes("flight no") || low.includes("train no") || low.includes("number")) {
                          displayVal = booking.flightNo || "";
                        } else if (low.includes("pnr") || low.includes("reference") || low.includes("arn")) {
                          displayVal = booking.pnr || "";
                        } else if (low.includes("passport")) {
                          displayVal = booking.passportNo || "";
                        } else if (low.includes("dep") && (low.includes("time") || low.includes("departure"))) {
                          const dep = booking.flightTime ? booking.flightTime.split(/[-–—]/)[0]?.trim() || booking.flightTime : "";
                          displayVal = dep ? `${dep} hrs` : "";
                        } else if ((low.includes("arr") || low.includes("arriv")) && low.includes("time")) {
                          const arr = booking.flightTime ? booking.flightTime.split(/[-–—]/)[1]?.trim() || "" : "";
                          displayVal = arr ? `${arr} hrs` : "";
                        } else if (low.includes("time")) {
                          displayVal = booking.flightTime ? `${booking.flightTime} hrs` : "";
                        } else if (low.includes("expiry")) {
                          displayVal = booking.expiryDate ? formatDate(booking.expiryDate) : "";
                        } else if (low.includes("submission")) {
                          displayVal = booking.submissionDate ? formatDate(booking.submissionDate) : "";
                        } else if (low.includes("date") && booking.travelDate) {
                          displayVal = formatDate(booking.travelDate);
                        } else if (low.includes("route") || low.includes("sector") || low.includes("destination")) {
                          displayVal = booking.sector || "";
                        }
                      } else if (fld.type === "time") {
                        displayVal = `🕒 ${val} hrs`;
                      } else if (fld.type === "date" && val) {
                        displayVal = formatDate(val);
                      }

                      return (
                        <div key={fld.id || fld.name} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-sky-100 dark:border-slate-700/60">
                          <span className="text-slate-400 dark:text-slate-400 block text-[10px] uppercase font-bold">{fld.name}</span>
                          <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{displayVal || "—"}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* LEGACY FALLBACK */
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{config.routeLabel}</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">{booking.sector || "N/A"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{config.numberLabel}</span>
                      <span className="font-bold text-sky-700 dark:text-sky-300 text-sm">{booking.flightNo || "N/A"}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{config.pnrLabel}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 inline-block">
                        {booking.pnr || "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{config.timeLabel}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {booking.flightTime ? formatFlightTimeDisplay(booking.flightTime) : "As per ticket"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">{config.dateLabel}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {booking.travelDate ? formatDate(booking.travelDate) : "N/A"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Issued Portal</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{booking.portal || "Desk"}</span>
                    </div>
                  </div>
                )}

                {booking.passengerNames && (
                  <div className="pt-2 border-t border-sky-100 dark:border-sky-900/40">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">
                      Passenger Names ({booking.passengerCount} Pax)
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{booking.passengerNames}</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Financials Box */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Fare</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">₹{booking.totalAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Paid</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">₹{booking.paidAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Balance Due</span>
              <span className={`font-bold text-sm ${booking.balanceAmount > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"}`}>
                ₹{booking.balanceAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons in Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenWhatsApp(booking);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition active:scale-95"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Alert</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInvoice(booking);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs shadow-sm transition active:scale-95"
            >
              <Printer size={15} />
              <span>Invoice</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEditBooking(booking);
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs transition"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

