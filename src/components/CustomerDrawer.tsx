"use client";

import React from "react";
import { Customer, Booking, AgencySettings } from "@/lib/types";
import { getDaysDifference, formatDate } from "@/lib/date-utils";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Plane,
  FileText,
  CreditCard,
  Plus,
  MessageCircle,
  Printer,
  Edit2,
  Trash2,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface CustomerDrawerProps {
  customer: Customer | null;
  settings: AgencySettings;
  isOpen: boolean;
  onClose: () => void;
  onAddService: (customerId: string) => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onOpenInvoice: (booking: Booking) => void;
  onOpenWhatsApp: (booking: Booking) => void;
}

export default function CustomerDrawer({
  customer,
  settings,
  isOpen,
  onClose,
  onAddService,
  onEditBooking,
  onDeleteBooking,
  onOpenInvoice,
  onOpenWhatsApp,
}: CustomerDrawerProps) {
  if (!isOpen || !customer) return null;

  const bookings = customer.bookings || [];
  const totalBilled = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalPaid = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalBalance = Math.max(0, totalBilled - totalPaid);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-slideLeft">
        {/* Drawer Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 font-bold text-lg">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{customer.name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-emerald-400" />
                  {customer.phone}
                </span>
                {customer.city && (
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-sky-400" />
                    {customer.city}
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={13} className="text-slate-400" />
                    {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Financial Ledger Summary Cards */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Billed
            </span>
            <span className="text-base font-extrabold text-slate-900">
              ₹{totalBilled.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Paid
            </span>
            <span className="text-base font-extrabold text-emerald-600">
              ₹{totalPaid.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Balance Due
            </span>
            <span className={`text-base font-extrabold ${totalBalance > 0 ? "text-rose-600" : "text-slate-700"}`}>
              ₹{totalBalance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Customer Services List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Booked Services & Tickets ({bookings.length})
              </h3>
              <p className="text-xs text-slate-500">All travel services issued for this customer/party</p>
            </div>

            <button
              onClick={() => onAddService(customer.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition"
            >
              <Plus size={14} />
              <span>Add Service / Ticket</span>
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
              <Plane size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No services booked yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click &quot;Add Service / Ticket&quot; above to create a booking for this customer.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const diff = getDaysDifference(booking.travelDate);
                const isDelayed =
                  booking.status === "Flight Delayed" || booking.status === "Rescheduled / Postponed";

                return (
                  <div
                    key={booking.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition shadow-sm space-y-3"
                  >
                    {/* Top Row: Service & Days Left Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-xs">
                          {booking.serviceType?.name || "Service"}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{booking.bookingNo}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDelayed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <AlertTriangle size={12} />
                            {booking.status}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${diff.badgeClass}`}
                        >
                          <Clock size={12} />
                          {diff.label}
                        </span>
                      </div>
                    </div>

                    {/* Middle details: Sector, Flight No, PNR, Travel Date */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Sector</span>
                        <span className="font-bold text-slate-900">{booking.sector || "N/A"}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Flight / PNR</span>
                        <span className="font-semibold text-slate-800">
                          {booking.flightNo || "—"} {booking.pnr ? `(PNR: ${booking.pnr})` : ""}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Travel Date</span>
                        <span className="font-bold text-slate-900">
                          {booking.travelDate ? formatDate(booking.travelDate) : "—"}{" "}
                          {booking.flightTime && <span className="text-slate-500 font-normal">at {booking.flightTime}</span>}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Portal / Supplier</span>
                        <span className="text-slate-700">{booking.portal || "Direct"}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Fare</span>
                        <span className="font-bold text-slate-900">₹{booking.totalAmount.toLocaleString()}</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Balance Due</span>
                        <span className={`font-bold ${booking.balanceAmount > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                          ₹{booking.balanceAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {booking.alertNotes && (
                      <div className="p-2 bg-amber-50 rounded-lg text-xs text-amber-800 border border-amber-200">
                        <strong>Alert Note:</strong> {booking.alertNotes}
                      </div>
                    )}

                    {/* Action Buttons for this Service */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenWhatsApp(booking)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold transition"
                          title="Send WhatsApp Reminder / Alert"
                        >
                          <MessageCircle size={14} />
                          <span>WhatsApp</span>
                        </button>

                        <button
                          onClick={() => onOpenInvoice(booking)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 text-xs font-semibold transition"
                          title="Generate Printable Invoice"
                        >
                          <Printer size={14} />
                          <span>Invoice</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditBooking(booking)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Edit Service Details"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => onDeleteBooking(booking.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Service"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Registered customer ID: <span className="font-mono">{customer.id}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl font-semibold text-xs text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

