"use client";

import React from "react";
import { Booking } from "@/lib/types";
import { getDaysDifference, formatDate } from "@/lib/date-utils";
import {
  X,
  Plane,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Plane size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Ticket & Flight Details</h3>
              <p className="text-xs text-slate-400 font-mono">{booking.bookingNo}</p>
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
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Days Left:</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${diff.badgeClass}`}>
                <Clock size={12} />
                {diff.label}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isDelay
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : booking.status === "Confirmed"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : "bg-sky-100 text-sky-800 border border-sky-200"
              }`}>
                {booking.status}
              </span>
            </div>
          </div>

          {booking.alertNotes && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-0.5">
              <span className="font-bold flex items-center gap-1 text-amber-800">
                <AlertTriangle size={14} /> Delay / Postpone Narration:
              </span>
              <p>{booking.alertNotes}</p>
            </div>
          )}

          {/* Customer / Party Info */}
          <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Customer / Party
            </span>
            <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <User size={16} className="text-sky-600" />
              <span>{booking.customer?.name}</span>
            </div>
            <div className="text-slate-600 flex items-center gap-1.5 font-mono text-xs">
              <Phone size={14} className="text-emerald-600" />
              <span>{booking.customer?.phone}</span>
            </div>
          </div>

          {/* Flight Details Grid */}
          <div className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/40 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
              Flight & Travel Information
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sector / Route</span>
                <span className="font-bold text-slate-900 text-sm">{booking.sector || "N/A"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Flight No</span>
                <span className="font-bold text-sky-700 text-sm">{booking.flightNo || "N/A"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Airline PNR</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                  {booking.pnr || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Departure Time</span>
                <span className="font-bold text-slate-800">{booking.flightTime || "As per ticket"}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Travel Date</span>
                <span className="font-bold text-slate-900">
                  {booking.travelDate ? formatDate(booking.travelDate) : "N/A"}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Issued Portal</span>
                <span className="font-medium text-slate-800">{booking.portal || "Desk"}</span>
              </div>
            </div>

            {booking.passengerNames && (
              <div className="pt-2 border-t border-sky-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Passenger Names ({booking.passengerCount} Pax)
                </span>
                <span className="font-medium text-slate-800">{booking.passengerNames}</span>
              </div>
            )}
          </div>

          {/* Financials Box */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Fare</span>
              <span className="font-bold text-slate-900 text-sm">₹{booking.totalAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Paid</span>
              <span className="font-bold text-emerald-600 text-sm">₹{booking.paidAmount.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Balance Due</span>
              <span className={`font-bold text-sm ${booking.balanceAmount > 0 ? "text-rose-600" : "text-slate-700"}`}>
                ₹{booking.balanceAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons in Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-sm transition active:scale-95"
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
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition"
            >
              <Edit2 size={14} />
              <span>Edit</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
