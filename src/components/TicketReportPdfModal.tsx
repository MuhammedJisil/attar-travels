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
    const cleanAgency = (settings.agencyName || "Travels").replace(/[^a-zA-Z0-9]/g, "_");
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${settings.agencyName} - Ledger Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { size: A4 landscape; margin: 6mm 8mm; }
      body { background: white; margin: 0; padding: 0; }
    }
  </style>
</head>
<body class="bg-white p-4 text-slate-800">
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
      {/* Landscape Print Specific Rules to prevent horizontal cutoffs */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 6mm 8mm !important;
          }
          html, html.dark, body, html.dark body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            color-scheme: light !important;
          }
          #main-app-content, .no-print {
            display: none !important;
          }
          .report-modal-overlay {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .report-modal-card {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          #printable-pdf-report {
            padding: 4mm 6mm !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Container */}
      <div className="report-modal-card bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl overflow-hidden flex flex-col max-h-[95vh]">
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
        <div id="printable-pdf-report" className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-slate-800 bg-white">
          {/* Document Header with Agency Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-slate-900">
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
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Bookings
              </span>
              <span className="text-base font-black text-slate-900">{totalBookings}</span>
              <span className="text-[10px] text-slate-500 block">({totalPax} Pax)</span>
            </div>

            <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 text-center">
              <span className="text-[10px] uppercase font-bold text-sky-700 block tracking-wider">
                Total Amount
              </span>
              <span className="text-base font-black text-sky-950">₹{totalVolume.toLocaleString()}</span>
              <span className="text-[10px] text-sky-600 block">Gross Volume</span>
            </div>

            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                Collected
              </span>
              <span className="text-base font-black text-emerald-800">₹{totalPaid.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 block">Paid in full/partial</span>
            </div>

            <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700 block tracking-wider">
                Balance Due
              </span>
              <span className="text-base font-black text-rose-700">₹{totalBalance.toLocaleString()}</span>
              <span className="text-[10px] text-rose-600 block">Outstanding dues</span>
            </div>
          </div>

          {/* Detailed Ledger Table (Optimized for full-bleed printing with zero side cutoffs) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-[11px] border-collapse table-auto">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider">
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-2.5 whitespace-nowrap">Booking No</th>
                  <th className="py-2 px-2.5">Customer / Mobile</th>
                  <th className="py-2 px-2.5">Service & Route</th>
                  <th className="py-2 px-2.5 whitespace-nowrap">Travel Date & Time</th>
                  <th className="py-2 px-2.5 whitespace-nowrap">PNR / Ref</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">Fare (₹)</th>
                  <th className="py-2 px-2.5 text-right whitespace-nowrap">Due (₹)</th>
                  <th className="py-2 px-2.5 text-center whitespace-nowrap">Status</th>
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
                      <td className="py-1.5 px-2 text-center font-mono text-slate-400 text-[10px]">{idx + 1}</td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">{b.bookingNo}</td>
                      <td className="py-1.5 px-2.5">
                        <div className="font-bold text-slate-900 leading-tight">{b.customer?.name || "N/A"}</div>
                        <div className="text-[10px] font-mono text-slate-500">{b.customer?.phone}</div>
                      </td>
                      <td className="py-1.5 px-2.5">
                        <div className="font-semibold text-slate-900 leading-tight">{b.sector || b.serviceType?.name || "Service"}</div>
                        <div className="text-[10px] text-slate-500">
                          {b.flightNo ? `No: ${b.flightNo}` : b.serviceType?.name}
                        </div>
                      </td>
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {b.travelDate ? formatDate(b.travelDate) : "N/A"}
                        </div>
                        {b.flightTime && (
                          <div className="text-[10px] font-semibold text-sky-700">🕒 {b.flightTime}</div>
                        )}
                        {b.returnDate && (
                          <div className="text-[10px] text-slate-500">↩ Ret: {formatDate(b.returnDate)}</div>
                        )}
                      </td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {b.pnr ? (
                          <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                            {b.pnr}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        ₹{b.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-bold text-rose-600 whitespace-nowrap">
                        {b.balanceAmount > 0 ? `₹${b.balanceAmount.toLocaleString()}` : "—"}
                      </td>
                      <td className="py-1.5 px-2.5 text-center whitespace-nowrap">
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
                    <td className="py-2.5 px-3 text-right text-slate-950 font-black whitespace-nowrap">
                      ₹{totalVolume.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-700 font-black whitespace-nowrap">
                      ₹{totalBalance.toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Footer Notes */}
          <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
            <span>Generated from {settings.agencyName} Travel Desk</span>
            <span>Page 1 &bull; End of Manifest</span>
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
