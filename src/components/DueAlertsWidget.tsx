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
  });

  return (
    <div className="space-y-3">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Today Alert Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "today" ? "all" : "today")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "today"
              ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400 shadow-sm"
              : "bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              Today
            </span>
            <Plane size={16} className="text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1">{todayCount}</div>
          <div className="text-[11px] text-rose-600 font-medium truncate">Departing Today</div>
        </button>

        {/* Tomorrow Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "tomorrow" ? "all" : "tomorrow")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "tomorrow"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400 shadow-sm"
              : "bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Tomorrow</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1">{tomorrowCount}</div>
          <div className="text-[11px] text-amber-700 font-medium truncate">1 Day Left</div>
        </button>

        {/* 3 Days Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "3days" ? "all" : "3days")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "3days"
              ? "bg-orange-50 border-orange-300 ring-2 ring-orange-400 shadow-sm"
              : "bg-white border-slate-200 hover:border-orange-200 hover:bg-orange-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Next 3 Days</span>
            <Calendar size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-800 mt-1">{next3DaysCount}</div>
          <div className="text-[11px] text-orange-700 font-medium truncate">Urgent Follow-ups</div>
        </button>

        {/* 7 Days Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "7days" ? "all" : "7days")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "7days"
              ? "bg-sky-50 border-sky-300 ring-2 ring-sky-400 shadow-sm"
              : "bg-white border-slate-200 hover:border-sky-200 hover:bg-sky-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Next 7 Days</span>
            <Calendar size={16} className="text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-800 mt-1">{next7DaysCount}</div>
          <div className="text-[11px] text-sky-700 font-medium truncate">Upcoming Week</div>
        </button>

        {/* Flight Delay / Rescheduled Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "delayed" ? "all" : "delayed")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "delayed"
              ? "bg-purple-50 border-purple-300 ring-2 ring-purple-400 shadow-sm"
              : "bg-white border-slate-200 hover:border-purple-200 hover:bg-purple-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
              <AlertTriangle size={13} className="text-purple-600" />
              Delayed
            </span>
          </div>
          <div className="text-2xl font-black text-purple-900 mt-1">{delayedCount}</div>
          <div className="text-[11px] text-purple-700 font-medium truncate">Schedule Changes</div>
        </button>

        {/* Balance Pending Card */}
        <button
          type="button"
          onClick={() => onSelectFilter(activeFilter === "pending_balance" ? "all" : "pending_balance")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            activeFilter === "pending_balance"
              ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 shadow-sm"
              : "bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/30"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Dues Pending</span>
            <CreditCard size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{paymentPendingCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium truncate">Payment Follow-up</div>
        </button>
      </div>

      {/* Filter Quick Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
        <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 px-1">
          <Filter size={13} />
          Filter:
        </span>

        <button
          onClick={() => onSelectFilter("all")}
          className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
            activeFilter === "all"
              ? "bg-slate-900 text-white font-bold"
              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
        >
          All Tickets & Services ({bookings.length})
        </button>

        <button
          onClick={() => onSelectFilter("today")}
          className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
            activeFilter === "today"
              ? "bg-rose-600 text-white font-bold shadow-sm"
              : "bg-white border border-slate-200 text-rose-700 hover:bg-rose-50"
          }`}
        >
          🚨 Today ({todayCount})
        </button>

        <button
          onClick={() => onSelectFilter("tomorrow")}
          className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
            activeFilter === "tomorrow"
              ? "bg-amber-600 text-white font-bold shadow-sm"
              : "bg-white border border-slate-200 text-amber-800 hover:bg-amber-50"
          }`}
        >
          ⏰ Tomorrow ({tomorrowCount})
        </button>

        <button
          onClick={() => onSelectFilter("3days")}
          className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
            activeFilter === "3days"
              ? "bg-orange-600 text-white font-bold shadow-sm"
              : "bg-white border border-slate-200 text-orange-800 hover:bg-orange-50"
          }`}
        >
          In 3 Days ({next3DaysCount})
        </button>

        <button
          onClick={() => onSelectFilter("7days")}
          className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
            activeFilter === "7days"
              ? "bg-sky-600 text-white font-bold shadow-sm"
              : "bg-white border border-slate-200 text-sky-800 hover:bg-sky-50"
          }`}
        >
          This Week ({next7DaysCount})
        </button>

        <button
          onClick={() => onSelectFilter("delayed")}
          className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
            activeFilter === "delayed"
              ? "bg-purple-600 text-white font-bold shadow-sm"
              : "bg-white border border-slate-200 text-purple-700 hover:bg-purple-50"
          }`}
        >
          ⚠️ Delayed / Rescheduled ({delayedCount})
        </button>

        <button
          onClick={() => onSelectFilter("pending_balance")}
          className={`px-3 py-1 rounded-full font-medium transition shrink-0 ${
            activeFilter === "pending_balance"
              ? "bg-emerald-600 text-white font-bold shadow-sm"
              : "bg-white border border-slate-200 text-emerald-800 hover:bg-emerald-50"
          }`}
        >
          💳 Payment Dues ({paymentPendingCount})
        </button>
      </div>
    </div>
  );
}
