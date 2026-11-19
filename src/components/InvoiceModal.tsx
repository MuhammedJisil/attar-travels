"use client";

import React, { useRef, useState, useEffect } from "react";
import Logo from "./Logo";
import { Booking, AgencySettings } from "@/lib/types";
import { formatDate, formatBookingNo } from "@/lib/date-utils";
import { generateWhatsAppUrl } from "@/lib/whatsapp";
import {
  getServiceFieldConfig,
  isFlightOrTravelService,
  isFlightService,
  isTrainService,
  isBusService,
  extractCustomFieldValues,
  DEFAULT_INVOICE_TERMS,
} from "@/lib/service-config";
import {
  Printer,
  Download,
  X,
  MessageCircle,
  FileCheck,
  CreditCard,
  Edit3,
  Check,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react";

interface InvoiceModalProps {
  booking: Booking | null;
  settings: AgencySettings;
  isOpen: boolean;
  onClose: () => void;
}

interface InvoiceFieldItem {
  id: string;
  label: string;
  value: string;
}

interface InvoiceFormData {
  invoiceNo: string;
  date: string;
  paymentStatus: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCity: string;
  serviceName: string;
  portalName: string;
  bookingStatus: string;
  sectionTitle: string;
  refTag: string;
  fields: InvoiceFieldItem[];
  hasPax: boolean;
  passengerNames: string;
  paxCount: number;
  itemTitle: string;
  itemSubtext: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate: string;
  bankDetails: string;
  noticeGuidelines: string;
}

function buildDefaultInvoiceState(booking: Booking, settings: AgencySettings): InvoiceFormData {
  const serviceConfig = getServiceFieldConfig(booking.serviceType);
  const custom = extractCustomFieldValues(booking.notes);

  const isFakeAutoPnr = booking.pnr && /^(CCJ|ATT|TRV)-\d+$/i.test(booking.pnr);
  const realPnr = !isFakeAutoPnr ? booking.pnr : "";
  const customRef = Object.entries(custom).find(([k]) => /tracking|consignment|awb|waybill|arn|file|pnr|ref/i.test(k))?.[1] || "";
  const displayTrackingOrRef = realPnr || customRef;

  let sectionTitle = serviceConfig.title || `${booking.serviceType?.name || "Service"} Details`;
  let refTag = "";
  const fields: InvoiceFieldItem[] = [];

  const isTrain = isTrainService(booking.serviceType);
  const isBus = isBusService(booking.serviceType);
  const isFlight = isFlightService(booking.serviceType);

  if (isTrain) {
    sectionTitle = "Train Ticket & Journey Itinerary";
    refTag = realPnr || custom["IRCTC PNR"] ? `IRCTC PNR: ${realPnr || custom["IRCTC PNR"]}` : "";
    fields.push({
      id: "f_route",
      label: "Train Route (From - To)",
      value: booking.sector || custom["Train Route (From - To)"] || "CLT - TVC",
    });
    fields.push({
      id: "f_train_no",
      label: "Train No / Name",
      value: booking.flightNo || custom["Train No / Name"] || custom["Train No"] || "Train",
    });
    fields.push({
      id: "f_date",
      label: "Journey Date",
      value: booking.travelDate ? formatDate(booking.travelDate) : (booking.issueDate ? formatDate(booking.issueDate) : "—"),
    });
    fields.push({
      id: "f_time",
      label: "Departure Time",
      value: booking.flightTime || custom["Train Departure Time"] || "—",
    });
    if (custom["Coach & Berth / Seat"] || custom["Coach & Seat"] || custom["Coach"]) {
      fields.push({
        id: "f_coach",
        label: "Coach & Berth / Seat",
        value: custom["Coach & Berth / Seat"] || custom["Coach & Seat"] || custom["Coach"] || "",
      });
    }
  } else if (isBus) {
    sectionTitle = "Bus / Transport Booking Details";
    refTag = realPnr ? `Ticket Ref: ${realPnr}` : "";
    fields.push({
      id: "f_route",
      label: "Boarding - Drop Point",
      value: booking.sector || "—",
    });
    fields.push({
      id: "f_bus_op",
      label: "Bus Operator / Bus No",
      value: booking.flightNo || custom["Bus Operator / Bus No"] || "—",
    });
    fields.push({
      id: "f_date",
      label: "Boarding Date",
      value: booking.travelDate ? formatDate(booking.travelDate) : (booking.issueDate ? formatDate(booking.issueDate) : "—"),
    });
    fields.push({
      id: "f_time",
      label: "Departure Time",
      value: booking.flightTime || "—",
    });
    if (custom["Seat Number(s)"] || custom["Seat"]) {
      fields.push({
        id: "f_seat",
        label: "Seat Number(s)",
        value: custom["Seat Number(s)"] || custom["Seat"] || "",
      });
    }
  } else if (isFlight) {
    sectionTitle = "Flight Ticket & Travel Itinerary";
    refTag = realPnr ? `PNR: ${realPnr}` : "";
    fields.push({
      id: "f_route",
      label: "Sector / Route",
      value: booking.sector || "N/A",
    });
    fields.push({
      id: "f_flight_no",
      label: "Flight No",
      value: booking.flightNo || custom["Flight Number"] || custom["Flight No"] || "N/A",
    });
    fields.push({
      id: "f_date_time",
      label: "Travel Date & Time",
      value: `${booking.travelDate ? formatDate(booking.travelDate) : "N/A"}${booking.flightTime ? ` (${booking.flightTime})` : ""}`,
    });
    fields.push({
      id: "f_return_date",
      label: "Return Date",
      value: booking.returnDate ? formatDate(booking.returnDate) : "One-Way",
    });
    if (booking.passportNo) {
      fields.push({
        id: "f_passport",
        label: "Passport No",
        value: booking.passportNo,
      });
    }
  } else {
    // Non-travel service (Courier, Visa, Passport, Certificate, etc.)
    sectionTitle = serviceConfig.title || `${booking.serviceType?.name || "Service"} Details`;
    refTag = displayTrackingOrRef ? `Tracking / Ref: ${displayTrackingOrRef}` : "";
    if (booking.issueDate || booking.travelDate) {
      fields.push({
        id: "f_date",
        label: serviceConfig.dateLabel || "Booking / Issue Date",
        value: formatDate(booking.issueDate || booking.travelDate!),
      });
    }
    for (const fld of serviceConfig.customFields || []) {
      let val = custom[fld.name];
      if (!val) {
        const matchKey = Object.keys(custom).find(
          (k) => k.toLowerCase().trim() === fld.name.toLowerCase().trim()
        );
        if (matchKey) val = custom[matchKey];
      }
      if (!val && fld.name) {
        const fn = fld.name.toLowerCase();
        if (/portal|supplier|provider|carrier/i.test(fn)) val = booking.portal || "";
        else if (/sector|route|destination|city/i.test(fn)) val = booking.sector || "";
        else if (/pnr|tracking|ref|consignment|awb/i.test(fn)) val = realPnr || "";
      }
      const strVal = val ? String(val).trim() : "";
      if (strVal && strVal !== "—") {
        fields.push({
          id: fld.id || `f_${Math.random()}`,
          label: fld.name,
          value: /^\d{4}-\d{2}-\d{2}$/.test(strVal) ? formatDate(strVal) : strVal,
        });
      }
    }
    if (fields.length === 0) {
      if (booking.sector && booking.sector !== booking.serviceType?.name) {
        fields.push({ id: "f_sector", label: serviceConfig.routeLabel || "Details", value: booking.sector });
      }
      if (booking.portal) {
        fields.push({ id: "f_portal", label: serviceConfig.portalLabel || "Supplier / Portal", value: booking.portal });
      }
    }
  }

  // Item title & subtext
  let itemTitle = booking.serviceType?.name || "Service";
  if (isTrain || isFlight || isBus) {
    if (booking.sector) itemTitle += ` - ${booking.sector}`;
  } else if (fields[1]?.value) {
    itemTitle += ` - ${fields[1].value}`;
  }

  let itemSubtext = "";
  if (isTrain) {
    const parts = [];
    if (refTag) parts.push(refTag);
    if (booking.flightNo) parts.push(`Train: ${booking.flightNo}`);
    if (booking.portal) parts.push(`Portal: ${booking.portal}`);
    itemSubtext = parts.join(" | ");
  } else if (isFlight) {
    const parts = [];
    if (refTag) parts.push(refTag);
    if (booking.flightNo) parts.push(`Flight: ${booking.flightNo}`);
    parts.push(`Portal: ${booking.portal || "Desk"}`);
    itemSubtext = parts.join(" | ");
  } else {
    const parts = fields.map((f) => `${f.label}: ${f.value}`);
    itemSubtext = parts.slice(0, 3).join(" | ") || (booking.portal ? `Supplier: ${booking.portal}` : "Standard Service");
  }

  const tmplKey = (serviceConfig.template || (isFlight ? "flight" : isTrain ? "train" : isBus ? "bus" : "custom")) as keyof typeof DEFAULT_INVOICE_TERMS;
  const fallbackTerms = DEFAULT_INVOICE_TERMS[tmplKey] || DEFAULT_INVOICE_TERMS.custom || settings.termsConditions;
  const noticeGuidelines = serviceConfig.invoiceTerms?.trim() || fallbackTerms || settings.termsConditions || "";

  return {
    invoiceNo: formatBookingNo(booking.bookingNo),
    date: booking.issueDate ? formatDate(booking.issueDate) : formatDate(new Date().toISOString()),
    paymentStatus: booking.balanceAmount === 0 ? "PAID IN FULL" : `DUE: ₹${booking.balanceAmount.toLocaleString()}`,
    customerName: booking.customer?.name || "N/A",
    customerPhone: booking.customer?.phone || "N/A",
    customerEmail: booking.customer?.email || "",
    customerCity: booking.customer?.city || "",
    serviceName: booking.serviceType?.name || "Service",
    portalName: booking.portal || "Direct Agency Desk",
    bookingStatus: booking.status || "Confirmed",
    sectionTitle,
    refTag,
    fields,
    hasPax: Boolean(serviceConfig.hasPax),
    passengerNames: booking.passengerNames || "",
    paxCount: serviceConfig.hasPax ? (booking.passengerCount || 1) : 1,
    itemTitle,
    itemSubtext,
    totalAmount: booking.totalAmount || 0,
    paidAmount: booking.paidAmount || 0,
    balanceAmount: booking.balanceAmount || 0,
    dueDate: booking.dueDate ? formatDate(booking.dueDate) : "",
    bankDetails: settings.bankDetails || "",
    noticeGuidelines,
  };
}

export default function InvoiceModal({
  booking,
  settings,
  isOpen,
  onClose,
}: InvoiceModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<InvoiceFormData | null>(null);

  useEffect(() => {
    if (booking) {
      setForm(buildDefaultInvoiceState(booking, settings));
      setIsEditing(false);
    }
  }, [booking, settings]);

  if (!isOpen || !booking || !form) return null;

  const handleReset = () => {
    setForm(buildDefaultInvoiceState(booking, settings));
  };

  const handlePrint = () => {
    setIsEditing(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleDownloadTextVoucher = () => {
    const detailLines = form.fields.map((f) => `${f.label}: ${f.value}`);
    if (form.refTag) detailLines.unshift(form.refTag);
    if (form.hasPax && form.passengerNames) {
      detailLines.push(`Passengers (${form.paxCount} Pax): ${form.passengerNames}`);
    }

    const lines = [
      "===========================================================",
      `            ${settings.agencyName.toUpperCase()}`,
      `     ${settings.tagline || "Travel & Ticketing Services"}`,
      "===========================================================",
      `INVOICE / VOUCHER NO: ${form.invoiceNo}`,
      `DATE: ${form.date}`,
      `STATUS: ${form.bookingStatus.toUpperCase()}`,
      "-----------------------------------------------------------",
      "CUSTOMER DETAILS:",
      `Name: ${form.customerName}`,
      `Mobile: ${form.customerPhone}`,
      form.customerCity ? `City: ${form.customerCity}` : "",
      form.customerEmail ? `Email: ${form.customerEmail}` : "",
      "-----------------------------------------------------------",
      `${form.sectionTitle.toUpperCase()}:`,
      `Service: ${form.serviceName}`,
      `Issued From: ${form.portalName}`,
      ...detailLines,
      "-----------------------------------------------------------",
      "PAYMENT & BILLING SUMMARY:",
      `Item: ${form.itemTitle}`,
      `Quantity: ${form.paxCount}`,
      `Total Amount: Rs. ${form.totalAmount.toLocaleString()}`,
      `Paid Amount:  Rs. ${form.paidAmount.toLocaleString()}`,
      `Balance Due:  Rs. ${form.balanceAmount.toLocaleString()}`,
      `Payment Status: ${form.paymentStatus}`,
      "===========================================================",
      `Agency Contact: ${settings.phone || ""} | ${settings.email || ""}`,
      `${settings.address || ""}`,
      "-----------------------------------------------------------",
      "NOTICE & GUIDELINES:",
      form.noticeGuidelines,
      "===========================================================",
    ].filter(Boolean).join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Invoice-${form.invoiceNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsAppShare = () => {
    if (!form.customerPhone) return;
    const msg = [
      `📄 *INVOICE / VOUCHER: ${form.invoiceNo}*`,
      `━━━━━━━━━━━━━━━━━━`,
      `Dear *${form.customerName}*,`,
      `Greetings from *${settings.agencyName}*! Here is your invoice summary:`,
      ``,
      `💼 *Service:* ${form.serviceName}`,
      `📋 *Reference:* ${form.refTag || form.invoiceNo}`,
      form.fields[0] ? `📍 *${form.fields[0].label}:* ${form.fields[0].value}` : "",
      form.fields[1] ? `ℹ️ *${form.fields[1].label}:* ${form.fields[1].value}` : "",
      form.fields[2] ? `📅 *${form.fields[2].label}:* ${form.fields[2].value}` : "",
      `💵 *Total Amount:* ₹${form.totalAmount.toLocaleString()}`,
      `✅ *Paid Amount:* ₹${form.paidAmount.toLocaleString()}`,
      form.balanceAmount > 0
        ? `⚠️ *Balance Due:* ₹${form.balanceAmount.toLocaleString()}`
        : `🎉 *Status: Paid in Full*`,
      ``,
      `📞 For any assistance, reach us at ${settings.phone || ""}`,
    ].filter(Boolean).join("\n");

    const url = generateWhatsAppUrl(form.customerPhone, msg);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const updateField = (id: string, key: "label" | "value", value: string) => {
    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        fields: prev.fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)),
      };
    });
  };

  const removeField = (id: string) => {
    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        fields: prev.fields.filter((f) => f.id !== id),
      };
    });
  };

  const addField = () => {
    setForm((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        fields: [
          ...prev.fields,
          { id: `f_custom_${Date.now()}`, label: "Field Name", value: "Value" },
        ],
      };
    });
  };

  return (
    <div className="invoice-modal-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-2 sm:p-6 flex justify-center items-start">
      <style>{`
        @media print {
          @page {
            size: A4 portrait !important;
            margin: 6mm 8mm !important;
          }
          html, html.dark, body, html.dark body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            color-scheme: light !important;
          }
          #main-app-content, .no-print, .print\\:hidden {
            display: none !important;
          }
          .invoice-modal-overlay {
            position: static !important;
            display: block !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .invoice-modal-card {
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
          #printable-invoice-sheet {
            padding: 4mm 6mm !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div className="invoice-modal-card bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-auto sm:my-6 overflow-hidden flex flex-col">
        {/* Modal Top Control Bar (Hidden during Print) */}
        <div className="no-print bg-slate-800 text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileCheck size={20} className="text-sky-400" />
            <span className="font-semibold text-sm">Invoice & Voucher</span>
            <span className="text-xs text-slate-300 font-mono">({form.invoiceNo})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit Invoice Toggle Button */}
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                isEditing
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-sm"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
              }`}
              title={isEditing ? "Finish editing and preview printable invoice" : "Edit any title, label, or detail on this invoice"}
            >
              {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
              <span>{isEditing ? "Done Editing" : "Edit Invoice"}</span>
            </button>

            {isEditing && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-300 transition"
                title="Reset to default generated values"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white transition active:scale-95"
              title="Share invoice summary on WhatsApp"
            >
              <MessageCircle size={15} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadTextVoucher}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition active:scale-95"
              title="Download text voucher"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Text Voucher</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-xs font-semibold text-white shadow-sm transition active:scale-95"
              title="Print or Save as PDF"
            >
              <Printer size={15} />
              <span>Download PDF / Print</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Edit Mode Notice Banner */}
        {isEditing && (
          <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <span className="font-semibold flex items-center gap-1.5">
              <span>✏️</span>
              <span><strong>Edit Mode Active:</strong> You can edit labels, titles, dates, amounts, and guidelines directly. All edits print cleanly!</span>
            </span>
            <button
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 bg-amber-600 text-white rounded-md text-xs font-bold hover:bg-amber-700 transition"
            >
              Done Editing
            </button>
          </div>
        )}

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice-sheet" ref={printAreaRef} className="p-6 sm:p-8 text-slate-800 bg-white leading-relaxed">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-slate-200">
            <div className="flex items-start gap-3">
              <Logo logoUrl={settings.logoUrl} agencyName={settings.agencyName} size="lg" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings.agencyName}
                </h2>
                {settings.tagline && (
                  <p className="text-xs font-medium text-sky-700">{settings.tagline}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm whitespace-pre-line">
                  {settings.address}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-slate-600">
                  {settings.phone && <span>📞 {settings.phone}</span>}
                  {settings.email && <span>✉️ {settings.email}</span>}
                </div>
                {settings.taxNumber && (
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">
                    {settings.taxNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right sm:self-start bg-slate-50 p-3.5 rounded-xl border border-slate-200 min-w-[170px]">
              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Invoice / Voucher
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={form.invoiceNo}
                  onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
                  className="w-full text-base font-black text-sky-700 bg-white border border-sky-300 rounded px-1.5 py-0.5 text-right font-mono"
                />
              ) : (
                <div className="text-base font-black text-sky-700 font-mono">{form.invoiceNo}</div>
              )}
              <div className="text-xs text-slate-600 mt-1 flex items-center justify-end gap-1">
                <span className="text-slate-400">Date:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="text-xs bg-white border border-slate-300 rounded px-1 text-right w-24"
                  />
                ) : (
                  <span>{form.date}</span>
                )}
              </div>
              <div className="mt-1.5">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    form.balanceAmount === 0
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {form.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To / Passenger Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
            <div>
              <div className="uppercase tracking-wider font-bold text-slate-400 mb-0.5 text-[10px]">
                Billed To / Customer
              </div>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full text-sm font-bold bg-white border border-slate-300 rounded px-1.5 py-0.5"
                    placeholder="Customer Name"
                  />
                  <input
                    type="text"
                    value={form.customerPhone}
                    onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-300 rounded px-1.5 py-0.5"
                    placeholder="Mobile"
                  />
                </div>
              ) : (
                <>
                  <div className="text-sm font-bold text-slate-900">{form.customerName}</div>
                  <div className="text-slate-600 mt-0.5">📞 {form.customerPhone}</div>
                  {form.customerEmail && <div className="text-slate-600">{form.customerEmail}</div>}
                  {form.customerCity && <div className="text-slate-600">📍 {form.customerCity}</div>}
                </>
              )}
            </div>

            <div>
              <div className="uppercase tracking-wider font-bold text-slate-400 mb-0.5 text-[10px]">
                Booking Information
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Service:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.serviceName}
                    onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                    className="text-xs font-semibold bg-white border border-slate-300 rounded px-1 text-right"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">{form.serviceName}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Issued From Portal:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.portalName}
                    onChange={(e) => setForm({ ...form, portalName: e.target.value })}
                    className="text-xs font-semibold bg-white border border-slate-300 rounded px-1 text-right"
                  />
                ) : (
                  <span className="font-semibold text-slate-800">{form.portalName}</span>
                )}
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500">Booking Status:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={form.bookingStatus}
                    onChange={(e) => setForm({ ...form, bookingStatus: e.target.value })}
                    className="text-xs font-bold text-sky-700 bg-white border border-slate-300 rounded px-1 text-right"
                  />
                ) : (
                  <span className="font-bold text-sky-700">{form.bookingStatus}</span>
                )}
              </div>
            </div>
          </div>

          {/* Service Specific Itinerary / Details Section */}
          <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-sky-50 px-3.5 py-1.5 border-b border-sky-100 flex items-center justify-between text-xs font-bold text-sky-900 uppercase tracking-wide">
              {isEditing ? (
                <input
                  type="text"
                  value={form.sectionTitle}
                  onChange={(e) => setForm({ ...form, sectionTitle: e.target.value })}
                  className="font-bold text-sky-900 bg-white border border-sky-300 rounded px-1.5 py-0.5 uppercase tracking-wide w-72"
                  placeholder="Section Title"
                />
              ) : (
                <span>{form.sectionTitle}</span>
              )}

              {isEditing ? (
                <input
                  type="text"
                  value={form.refTag}
                  onChange={(e) => setForm({ ...form, refTag: e.target.value })}
                  className="bg-white border border-sky-300 text-sky-900 px-2 py-0.5 rounded text-[11px] font-mono text-right w-44"
                  placeholder="PNR / Ref Tag"
                />
              ) : (
                form.refTag && (
                  <span className="bg-sky-200/80 text-sky-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold">
                    {form.refTag}
                  </span>
                )
              )}
            </div>

            <div className="p-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                {form.fields.map((fld) => (
                  <div key={fld.id} className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 relative group">
                    {isEditing ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="text"
                            value={fld.label}
                            onChange={(e) => updateField(fld.id, "label", e.target.value)}
                            className="text-[10px] font-bold text-slate-500 uppercase bg-white border border-slate-300 rounded px-1 py-0.5 w-full"
                          />
                          <button
                            type="button"
                            onClick={() => removeField(fld.id)}
                            className="text-rose-500 hover:text-rose-700 p-0.5"
                            title="Remove field"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={fld.value}
                          onChange={(e) => updateField(fld.id, "value", e.target.value)}
                          className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="block text-slate-400 uppercase text-[10px] font-bold mb-0.5">
                          {fld.label}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                          {fld.value}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={addField}
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 transition"
                  >
                    <Plus size={13} />
                    <span>Add Custom Field / Row</span>
                  </button>
                </div>
              )}

              {/* Passenger names section (only if enabled) */}
              {(form.hasPax || isEditing) && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                  <span className="block text-slate-400 uppercase text-[10px] font-bold mb-0.5">
                    Passenger / Traveler Names {form.hasPax ? `(${form.paxCount} Pax)` : ""}
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={form.passengerNames}
                      onChange={(e) => setForm({ ...form, passengerNames: e.target.value })}
                      placeholder="e.g. Gireesh Ramachandran, Muhsin Mundasseri"
                      className="w-full text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-1"
                    />
                  ) : (
                    form.passengerNames && (
                      <span className="font-semibold text-slate-800">{form.passengerNames}</span>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Billing Table */}
          <div className="mb-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-center">Pax / Qty</th>
                  <th className="py-2 px-3 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3">
                    {isEditing ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={form.itemTitle}
                          onChange={(e) => setForm({ ...form, itemTitle: e.target.value })}
                          className="w-full font-bold text-slate-900 bg-white border border-slate-300 rounded px-1.5 py-0.5"
                        />
                        <input
                          type="text"
                          value={form.itemSubtext}
                          onChange={(e) => setForm({ ...form, itemSubtext: e.target.value })}
                          className="w-full text-slate-500 text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-slate-900">{form.itemTitle}</div>
                        {form.itemSubtext && (
                          <div className="text-slate-500 text-[11px]">{form.itemSubtext}</div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium">
                    {isEditing ? (
                      <input
                        type="number"
                        min="1"
                        value={form.paxCount}
                        onChange={(e) => setForm({ ...form, paxCount: parseInt(e.target.value) || 1 })}
                        className="w-16 text-center bg-white border border-slate-300 rounded p-1 font-medium"
                      />
                    ) : (
                      form.paxCount
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ₹{form.totalAmount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculations Box */}
            <div className="flex justify-end mt-3">
              <div className="w-64 space-y-1 text-xs">
                <div className="flex justify-between items-center py-0.5 text-slate-600">
                  <span>Total Amount:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={form.totalAmount}
                      onChange={(e) => {
                        const tot = Number(e.target.value) || 0;
                        setForm({
                          ...form,
                          totalAmount: tot,
                          balanceAmount: Math.max(0, tot - form.paidAmount),
                        });
                      }}
                      className="w-24 text-right bg-white border border-slate-300 rounded p-1 font-bold text-slate-900"
                    />
                  ) : (
                    <span className="font-bold text-slate-900">₹{form.totalAmount.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-0.5 text-slate-600">
                  <span>Paid Amount:</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={form.paidAmount}
                      onChange={(e) => {
                        const paid = Number(e.target.value) || 0;
                        setForm({
                          ...form,
                          paidAmount: paid,
                          balanceAmount: Math.max(0, form.totalAmount - paid),
                        });
                      }}
                      className="w-24 text-right bg-white border border-slate-300 rounded p-1 font-semibold text-emerald-700"
                    />
                  ) : (
                    <span className="font-semibold text-emerald-700">₹{form.paidAmount.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-1 border-t-2 border-slate-900 text-sm font-bold">
                  <span className="text-slate-900">Balance Due:</span>
                  <span className={form.balanceAmount > 0 ? "text-rose-600 font-black" : "text-emerald-700"}>
                    ₹{form.balanceAmount.toLocaleString()}
                  </span>
                </div>
                {form.dueDate && form.balanceAmount > 0 && (
                  <div className="text-[10px] text-right text-rose-500 font-medium">
                    Payment Due by: {form.dueDate}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank & Payment Details */}
          {(form.bankDetails || isEditing) && (
            <div className="mb-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1 mb-0.5 text-[11px]">
                <CreditCard size={13} className="text-sky-600" />
                Bank / UPI Payment Details:
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={form.bankDetails}
                  onChange={(e) => setForm({ ...form, bankDetails: e.target.value })}
                  className="w-full text-slate-700 font-mono text-[11px] bg-white border border-slate-300 rounded px-1.5 py-0.5"
                />
              ) : (
                <p className="text-slate-600 font-mono text-[11px]">{form.bankDetails}</p>
              )}
            </div>
          )}

          {/* Terms & Conditions / Notice & Guidelines */}
          {(form.noticeGuidelines || isEditing) && (
            <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500 whitespace-pre-line leading-relaxed">
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-0.5 text-[9px]">
                Notice & Guidelines:
              </span>
              {isEditing ? (
                <textarea
                  rows={4}
                  value={form.noticeGuidelines}
                  onChange={(e) => setForm({ ...form, noticeGuidelines: e.target.value })}
                  className="w-full text-[11px] text-slate-700 font-mono bg-white border border-slate-300 rounded p-2 leading-relaxed"
                />
              ) : (
                <p>{form.noticeGuidelines}</p>
              )}
            </div>
          )}

          {/* Signature Stamp Footer */}
          <div className="mt-6 pt-3 flex justify-between items-end text-xs text-slate-400">
            <div className="text-[10px]">This is a computer generated invoice/voucher.</div>
            <div className="text-center">
              <div className="h-8 border-b border-slate-300 w-40"></div>
              <span className="block mt-1 font-semibold text-slate-600 text-xs">Authorized Signatory</span>
              <span className="text-[10px] text-slate-400">{settings.agencyName}</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="no-print bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center">
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="text-xs font-semibold text-sky-700 hover:underline flex items-center gap-1"
          >
            {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
            <span>{isEditing ? "Finish Editing" : "Edit Invoice Content"}</span>
          </button>

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
