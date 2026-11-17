"use client";

import React from "react";
import { Booking, AgencySettings } from "@/lib/types";
import { formatDate } from "@/lib/date-utils";
import Logo from "./Logo";
import {
  X,
  Printer,
  FileText,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";

interface TicketReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  settings: AgencySettings;
  filterLabel?: string;
}

export default function TicketReportPdfModal({
  isOpen,
  onClose,
  bookings,
  settings,
  filterLabel = "All Bookings & Tickets",
}: TicketReportPdfModalProps) {
  if (!isOpen) return null;

  // Aggregate Metrics
  const totalBookings = bookings.length;
  const totalPax = bookings.reduce((acc, b) => acc + (b.passengerCount || 1), 0);
  const totalVolume = bookings.reduce((acc, b) => acc + (Number(b.totalAmount) || 0), 0);
  const totalPaid = bookings.reduce((acc, b) => acc + (Number(b.paidAmount) || 0), 0);
  const totalBalance = bookings.reduce((acc, b) => acc + (Number(b.balanceAmount) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const reportElem = document.getElementById("printable-pdf-report");
    if (!reportElem) return;
    const cleanAgency = settings.agencyName.replace(/[^a-zA-Z0-9]/g, "_");
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${settings.agencyName} - Ledger Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: A4 landscape; margin: 8mm; }
      body { background: white; margin: 0; padding: 0; }
    }
  </style>
</head>
<body class="bg-white p-6 text-slate-800">
  ${reportElem.innerHTML}
  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cleanAgency}_Ledger_${new Date().toISOString().substring(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="report-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Container */}
      <div className="report-modal-card bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Action Bar (Hidden in Print) */}
        <div className="no-print print:hidden px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-xs">
              <FileText size={17} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Travel Ledger & PDF Report</h3>
              <p className="text-[11px] text-slate-400">
                {bookings.length} record{bookings.length === 1 ? "" : "s"} &bull; {filterLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition active:scale-95"
              title="Download standalone HTML file with instant print script"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Save File</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div id="printable-pdf-report" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 bg-white">
          {/* Document Header with Agency Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <Logo logoUrl={settings.logoUrl} agencyName={settings.agencyName} size="lg" />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings.agencyName || "Al-Madina Travels & Tours"}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {settings.tagline || "Your Trusted Travel & Ticketing Partner"}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-600">
                  {settings.phone && (
                    <span className="flex items-center gap-1 font-semibold">
                      <Phone size={12} className="text-sky-600" /> {settings.phone}
                    </span>
                  )}
                  {settings.email && (
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-sky-600" /> {settings.email}
                    </span>
                  )}
                  {settings.taxNumber && (
                    <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {settings.taxNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-lg mb-1">
                TICKETS & LEDGER REPORT
              </span>
              <p className="text-[11px] text-slate-500">
                Generated: <strong className="text-slate-800">{currentDate}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Filter: <strong className="text-sky-700">{filterLabel}</strong>
              </p>
            </div>
          </div>

          {/* Key Metric KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Bookings
              </span>
              <span className="text-lg font-black text-slate-900">{totalBookings}</span>
              <span className="text-[10px] text-slate-500 block">({totalPax} Pax)</span>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-center">
              <span className="text-[10px] uppercase font-bold text-sky-700 block tracking-wider">
                Total Amount
              </span>
              <span className="text-lg font-black text-sky-950">₹{totalVolume.toLocaleString()}</span>
              <span className="text-[10px] text-sky-600 block">Gross Volume</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                Collected
              </span>
              <span className="text-lg font-black text-emerald-800">₹{totalPaid.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 block">Paid in full/partial</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">
                Balance Due
              </span>
              <span className="text-lg font-black text-rose-700">₹{totalBalance.toLocaleString()}</span>
              <span className="text-[10px] text-rose-600 block">Outstanding dues</span>
            </div>
          </div>

          {/* Detailed Ledger Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Booking No</th>
                  <th className="py-2.5 px-3">Customer / Mobile</th>
                  <th className="py-2.5 px-3">Service & Route</th>
                  <th className="py-2.5 px-3">Travel Date & Time</th>
                  <th className="py-2.5 px-3">PNR / Ref</th>
                  <th className="py-2.5 px-3 text-right">Fare (₹)</th>
                  <th className="py-2.5 px-3 text-right">Due (₹)</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                      No tickets match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b, idx) => (
                    <tr key={b.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{b.bookingNo}</td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">{b.customer?.name || "N/A"}</div>
                        <div className="text-[10px] font-mono text-slate-500">{b.customer?.phone}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900">{b.sector || b.serviceType?.name || "Service"}</div>
                        <div className="text-[10px] text-slate-500">
                          {b.flightNo ? `No: ${b.flightNo}` : b.serviceType?.name}
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800">
                          {b.travelDate ? formatDate(b.travelDate) : "N/A"}
                        </div>
                        {b.flightTime && (
                          <div className="text-[10px] font-semibold text-sky-700">🕒 {b.flightTime}</div>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {b.pnr ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {b.pnr}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{b.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600">
                        {b.balanceAmount > 0 ? `₹${b.balanceAmount.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === "Confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : b.status === "Flight Delayed"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {bookings.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                    <td colSpan={6} className="py-2.5 px-3 text-right uppercase tracking-wider">
                      Grand Totals:
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-950 font-black">
                      ₹{totalVolume.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-700 font-black">
                      ₹{totalBalance.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[10px] text-slate-500">
                      {bookings.length} Tickets
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Footer Notes & Signature Box */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700">{settings.agencyName}</p>
              <p className="text-[11px] text-slate-500">{settings.address}</p>
              {settings.bankDetails && (
                <p className="text-[10px] text-slate-400 mt-1">Bank / UPI: {settings.bankDetails}</p>
              )}
            </div>

            <div className="text-right sm:self-end">
              <div className="border-b border-slate-400 w-40 mb-1"></div>
              <p className="text-[11px] font-bold text-slate-700 uppercase">Authorized Signature & Stamp</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Hidden in Print) */}
        <div className="print:hidden px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tip: When the print dialog opens, select <strong>"Save as PDF"</strong> in the destination menu.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold hover:bg-slate-100 text-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
