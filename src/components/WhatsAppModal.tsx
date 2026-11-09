"use client";

import React, { useState, useEffect } from "react";
import { Booking, AgencySettings } from "@/lib/types";
import {
  generateWhatsAppUrl,
  createFlightReminderMessage,
  createFlightDelayMessage,
  createPaymentReminderMessage,
  createInvoiceShareMessage,
} from "@/lib/whatsapp";
import {
  MessageCircle,
  X,
  Send,
  Copy,
  Check,
  Plane,
  AlertTriangle,
  CreditCard,
  FileText,
} from "lucide-react";

interface WhatsAppModalProps {
  booking: Booking | null;
  settings: AgencySettings;
  isOpen: boolean;
  onClose: () => void;
  defaultTemplate?: "reminder" | "delay" | "payment" | "invoice";
}

export default function WhatsAppModal({
  booking,
  settings,
  isOpen,
  onClose,
  defaultTemplate = "reminder",
}: WhatsAppModalProps) {
  const [template, setTemplate] = useState<"reminder" | "delay" | "payment" | "invoice">(defaultTemplate);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!booking) return;

    // Auto-select delay template if status is delayed or postponed
    if (booking.status === "Flight Delayed" || booking.status === "Rescheduled / Postponed") {
      setTemplate("delay");
    } else {
      setTemplate(defaultTemplate);
    }
  }, [booking, defaultTemplate]);

  useEffect(() => {
    if (!booking) return;

    if (template === "reminder") {
      setMessage(createFlightReminderMessage(booking, settings));
    } else if (template === "delay") {
      setMessage(createFlightDelayMessage(booking, settings));
    } else if (template === "payment") {
      setMessage(createPaymentReminderMessage(booking, settings));
    } else if (template === "invoice") {
      setMessage(createInvoiceShareMessage(booking, settings));
    }
  }, [template, booking, settings]);

  if (!isOpen || !booking) return null;

  const phone = booking.customer?.phone || "";
  const waUrl = generateWhatsAppUrl(phone, message);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Send WhatsApp Alert</h3>
              <p className="text-xs text-emerald-100">
                To: <span className="font-semibold">{booking.customer?.name}</span> ({phone})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Template Selectors */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Message Template:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTemplate("reminder")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                  template === "reminder"
                    ? "border-sky-500 bg-sky-50 text-sky-700 ring-2 ring-sky-200"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <Plane size={18} className="text-sky-600" />
                <span>Flight Reminder</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate("delay")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                  template === "delay"
                    ? "border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-200"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <AlertTriangle size={18} className="text-amber-600" />
                <span>Delay Alert</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate("payment")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                  template === "payment"
                    ? "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <CreditCard size={18} className="text-rose-600" />
                <span>Payment Due</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplate("invoice")}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                  template === "invoice"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <FileText size={18} className="text-emerald-600" />
                <span>Invoice / Ref</span>
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Message Preview (You can edit before sending):
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 py-0.5 px-2 rounded hover:bg-slate-100 transition"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={11}
              className="w-full text-xs font-mono p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-800 leading-relaxed"
            />
          </div>

          {/* Phone verification note */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800">
            <MessageCircle size={16} className="text-emerald-600 shrink-0" />
            <span>
              Target WhatsApp number: <strong className="font-semibold">{phone || "Not set"}</strong>.
              Clicking &quot;Send via WhatsApp&quot; will open WhatsApp Web or Desktop application directly.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={!phone}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            <span>Send via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
