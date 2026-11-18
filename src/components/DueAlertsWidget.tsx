"use client";

import React from "react";
import { Booking } from "@/lib/types";
import { getDaysDifference } from "@/lib/date-utils";
import {
  AlertTriangle,
  Clock,
  Calendar,
  Plane,
  CreditCard,
  CheckCircle2,
  Filter,
  FileText,
  ShieldAlert,
} from "lucide-react";

interface DueAlertsWidgetProps {
  bookings: Booking[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export default function DueAlertsWidget({
  bookings,
  activeFilter,
  onSelectFilter,
}: DueAlertsWidgetProps) {
  // Compute counts
  let todayCount = 0;
  let tomorrowCount = 0;
  let next3DaysCount = 0;
  let next7DaysCount = 0;
  let delayedCount = 0;
  let paymentPendingCount = 0;
  let passportAlertCount = 0;
  let visaAlertCount = 0;

  bookings.forEach((b) => {
    const diff = getDaysDifference(b.travelDate);
    if (diff.isToday) todayCount++;
    if (diff.isTomorrow) tomorrowCount++;
    if (diff.days >= 0 && diff.days <= 3) next3DaysCount++;
    if (diff.days >= 0 && diff.days <= 7) next7DaysCount++;

    if (b.status === "Flight Delayed" || b.status === "Rescheduled / Postponed") {
      delayedCount++;
    }

    if (b.balanceAmount > 0) {
      paymentPendingCount++;
    }

    // Passport Alerts calculation (ONLY for actual Passport service):
    const isPassport =
      b.serviceType?.code === "PASSPORT" ||
      (b.serviceType?.name || "").toLowerCase().includes("passport");

    if (isPassport) {
      const expDiff = b.expiryDate ? getDaysDifference(b.expiryDate) : null;
      const isExpiringSoon = expDiff ? expDiff.days <= 180 : false;
      const isSubmissionPending = Boolean(b.submissionDate && b.status !== "Completed");
      if (isExpiringSoon || isSubmissionPending) {
        passportAlertCount++;
      }
    }

    // Visa Alerts calculation (ONLY for Visa processing service):
    const isVisa =
      b.serviceType?.code === "VISA" ||
      (b.serviceType?.name || "").toLowerCase().includes("visa");

    if (isVisa) {
      const expDiff = b.expiryDate ? getDaysDifference(b.expiryDate) : null;
      const isExpiringSoon = expDiff ? expDiff.days <= 60 : false;
      const isProcessing = b.status !== "Completed" && b.status !== "Cancelled";
      if (isProcessing || isExpiringSoon || Boolean(b.submissionDate)) {
        visaAlertCount++;
      }
    }
  });

  return (
    <div className="space-y-3">
      {/* Overview Stat Cards (Clean 6-Card Responsive Layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today Alert Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "today" ? "all" : "today")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "today"
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 ring-2 ring-rose-400 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-200 hover:bg-rose-50/30 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Today
            </span>
            <Plane size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{todayCount}</div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium truncate">Departing Today</div>
        </button>

        {/* Tomorrow Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "tomorrow" ? "all" : "tomorrow")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "tomorrow"
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 ring-2 ring-amber-400 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-200 hover:bg-amber-50/30 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Tomorrow</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">{tomorrowCount}</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium truncate">1 Day Left</div>
        </button>

        {/* 3 Days Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "3days" ? "all" : "3days")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "3days"
              ? "bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 ring-2 ring-orange-400 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-orange-200 hover:bg-orange-50/30 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">Next 3 Days</span>
            <Calendar size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-800 dark:text-orange-300 mt-1">{next3DaysCount}</div>
          <div className="text-[11px] text-orange-700 dark:text-orange-400 font-medium truncate">Urgent Follow-ups</div>
        </button>

        {/* Balance Pending Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "pending_balance" ? "all" : "pending_balance")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "pending_balance"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-400 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-200 hover:bg-emerald-50/30 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Dues Pending</span>
            <CreditCard size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1">{paymentPendingCount}</div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate">Payment Follow-up</div>
        </button>

        {/* Passport Alerts Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "passports" ? "all" : "passports")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "passports"
              ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-400 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-200 hover:bg-indigo-50/30 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1">
              {passportAlertCount > 0 && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>}
              Passport Alerts
            </span>
            <FileText size={16} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-800 dark:text-indigo-300 mt-1">{passportAlertCount}</div>
          <div className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium truncate">Expiry & Renewal</div>
        </button>

        {/* Visa Alerts Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "visas" ? "all" : "visas")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "visas"
              ? "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 ring-2 ring-purple-400 shadow-sm"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-200 hover:bg-purple-50/30 dark:hover:bg-slate-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1">
              {visaAlertCount > 0 && <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping"></span>}
              Visa Alerts
            </span>
            <ShieldAlert size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-800 dark:text-purple-300 mt-1">{visaAlertCount}</div>
          <div className="text-[11px] text-purple-700 dark:text-purple-400 font-medium truncate">Processing & Expiry</div>
        </button>
      </div>
    </div>
  );
}

