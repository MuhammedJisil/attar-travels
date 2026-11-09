"use client";

import React, { useRef } from "react";
import Logo from "./Logo";
import { Booking, AgencySettings } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import { generateWhatsAppUrl, createInvoiceShareMessage } from "@/lib/whatsapp";
import {
  Printer,
  X,
  MessageCircle,
  FileCheck,
  Building2,
  Calendar,
  CreditCard,
  ShieldAlert,
} from "lucide-react";

interface InvoiceModalProps {
  booking: Booking | null;
  settings: AgencySettings;
  isOpen: boolean;
  onClose: () => void;
}

export default function InvoiceModal({
  booking,
  settings,
  isOpen,
  onClose,
}: InvoiceModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!booking.customer?.phone) return;
    const msg = createInvoiceShareMessage(booking, settings);
    const url = generateWhatsAppUrl(booking.customer.phone, msg);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const invoiceDate = booking.issueDate ? formatDate(booking.issueDate) : formatDate(new Date().toISOString());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col">
        {/* Modal Top Control Bar (Hidden during Print) */}
        <div className="no-print bg-slate-800 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck size={20} className="text-sky-400" />
            <span className="font-semibold text-sm">Travel Invoice & Booking Voucher</span>
            <span className="text-xs text-slate-300">({booking.bookingNo})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition"
              title="Share invoice summary on WhatsApp"
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-xs font-semibold text-white transition"
            >
              <Printer size={15} />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div ref={printAreaRef} className="p-8 sm:p-10 text-slate-800 bg-white leading-relaxed">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div className="flex items-start gap-3.5">
              <Logo logoUrl={settings.logoUrl} agencyName={settings.agencyName} size="lg" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {settings.agencyName}
                </h2>
                {settings.tagline && (
                  <p className="text-xs font-medium text-sky-700">{settings.tagline}</p>
                )}
                <p className="text-xs text-slate-500 mt-1 max-w-sm whitespace-pre-line">
                  {settings.address}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-slate-600">
                  {settings.phone && <span>📞 {settings.phone}</span>}
                  {settings.email && <span>✉️ {settings.email}</span>}
                </div>
                {settings.taxNumber && (
                  <p className="text-xs font-semibold text-slate-700 mt-1">
                    {settings.taxNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right sm:self-start bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[200px]">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Invoice / Voucher
              </div>
              <div className="text-lg font-black text-sky-700">{booking.bookingNo}</div>
              <div className="text-xs text-slate-600 mt-1">
                <span className="text-slate-400">Date:</span> {invoiceDate}
              </div>
              <div className="mt-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    booking.balanceAmount === 0
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {booking.balanceAmount === 0 ? "PAID IN FULL" : `BALANCE DUE: ₹${booking.balanceAmount.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To / Passenger Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
            <div>
              <div className="uppercase tracking-wider font-bold text-slate-400 mb-1">
                Billed To / Customer
              </div>
              <div className="text-sm font-bold text-slate-900">{booking.customer?.name}</div>
              <div className="text-slate-600 mt-0.5">📞 {booking.customer?.phone}</div>
              {booking.customer?.email && <div className="text-slate-600">{booking.customer.email}</div>}
              {booking.customer?.city && (
                <div className="text-slate-600">📍 {booking.customer.city}</div>
              )}
            </div>

            <div>
              <div className="uppercase tracking-wider font-bold text-slate-400 mb-1">
                Booking Information
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{booking.serviceType?.name || "Flight Ticket"}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Issued From Portal:</span>
                <span className="font-semibold text-slate-800">{booking.portal || "Direct Agency Desk"}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Booking Status:</span>
                <span className="font-bold text-sky-700">{booking.status}</span>
              </div>
            </div>
          </div>

          {/* Flight / Travel Details Section */}
          <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-sky-50 px-4 py-2 border-b border-sky-100 flex items-center justify-between text-xs font-bold text-sky-900 uppercase tracking-wide">
              <span>Service & Travel Itinerary</span>
              {booking.pnr && (
                <span className="bg-sky-200/80 text-sky-900 px-2 py-0.5 rounded">
                  Airline PNR: {booking.pnr}
                </span>
              )}
            </div>

            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="block text-slate-400 uppercase text-[10px] font-bold">Sector / Route</span>
                <span className="text-sm font-bold text-slate-900">{booking.sector || "N/A"}</span>
              </div>

              <div>
                <span className="block text-slate-400 uppercase text-[10px] font-bold">Flight No</span>
                <span className="text-sm font-bold text-slate-900">{booking.flightNo || "N/A"}</span>
              </div>

              <div>
                <span className="block text-slate-400 uppercase text-[10px] font-bold">Travel Date & Time</span>
                <span className="text-sm font-bold text-slate-900">
                  {booking.travelDate ? formatDate(booking.travelDate) : "N/A"}
                </span>
                {booking.flightTime && <span className="block text-slate-600">{booking.flightTime}</span>}
              </div>

              <div>
                <span className="block text-slate-400 uppercase text-[10px] font-bold">Return Date</span>
                <span className="text-sm font-semibold text-slate-700">
                  {booking.returnDate ? formatDate(booking.returnDate) : "One-Way"}
                </span>
              </div>

              {booking.passengerNames && (
                <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-100">
                  <span className="block text-slate-400 uppercase text-[10px] font-bold">
                    Passenger Names ({booking.passengerCount} Pax)
                  </span>
                  <span className="font-semibold text-slate-800">{booking.passengerNames}</span>
                </div>
              )}

              {booking.passportNo && (
                <div className="col-span-2 pt-2 border-t border-slate-100">
                  <span className="block text-slate-400 uppercase text-[10px] font-bold">Passport No</span>
                  <span className="font-semibold text-slate-800">{booking.passportNo}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Billing Table */}
          <div className="mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-center">Pax / Qty</th>
                  <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">
                      {booking.serviceType?.name || "Air Ticket"} - {booking.sector || booking.flightNo || "Travel Service"}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      PNR: {booking.pnr || "N/A"} | Portal: {booking.portal || "Desk"}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-medium">{booking.passengerCount}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">
                    ₹{booking.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Box */}
            <div className="flex justify-end mt-4">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Total Amount:</span>
                  <span className="font-bold text-slate-900">₹{booking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Paid Amount:</span>
                  <span className="font-semibold text-emerald-700">₹{booking.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 border-t-2 border-slate-900 text-sm font-bold">
                  <span className="text-slate-900">Balance Due:</span>
                  <span className={booking.balanceAmount > 0 ? "text-rose-600 font-black" : "text-emerald-700"}>
                    ₹{booking.balanceAmount.toLocaleString()}
                  </span>
                </div>
                {booking.dueDate && booking.balanceAmount > 0 && (
                  <div className="text-[11px] text-right text-rose-500 font-medium">
                    Payment Due by: {formatDate(booking.dueDate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank & Payment Details */}
          {settings.bankDetails && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                <CreditCard size={14} className="text-sky-600" />
                Bank / UPI Payment Details:
              </span>
              <p className="text-slate-600 font-mono text-[11px]">{settings.bankDetails}</p>
            </div>
          )}

          {/* Terms & Conditions */}
          {settings.termsConditions && (
            <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Notice & Guidelines:
              </span>
              {settings.termsConditions}
            </div>
          )}

          {/* Signature Stamp Footer */}
          <div className="mt-8 pt-4 flex justify-between items-end text-xs text-slate-400">
            <div>This is a computer generated invoice/voucher.</div>
            <div className="text-center">
              <div className="h-10 border-b border-slate-300 w-44"></div>
              <span className="block mt-1 font-semibold text-slate-600">Authorized Signatory</span>
              <span className="text-[10px] text-slate-400">{settings.agencyName}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="no-print bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

