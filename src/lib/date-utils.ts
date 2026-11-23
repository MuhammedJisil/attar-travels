export function getDaysDifference(dateString?: string | null): {
  days: number;
  isPast: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  label: string;
  badgeClass: string;
} {
  if (!dateString) {
    return {
      days: 999,
      isPast: false,
      isToday: false,
      isTomorrow: false,
      label: "No date set",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    };
  }

  let target: Date;
  if (typeof dateString === "string" && /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.test(dateString.trim())) {
    const parts = dateString.trim().split(/[\/\-]/);
    target = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  } else {
    target = new Date(dateString);
  }
  const now = new Date();

  // Reset to midnight for clean day difference
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = targetMidnight.getTime() - nowMidnight.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      days,
      isPast: true,
      isToday: false,
      isTomorrow: false,
      label: absDays === 1 ? "Departed yesterday" : `Departed ${absDays}d ago`,
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
    };
  }

  if (days === 0) {
    return {
      days: 0,
      isPast: false,
      isToday: true,
      isTomorrow: false,
      label: "Today! 🚨",
      badgeClass: "bg-rose-100 text-rose-700 border-rose-300 font-bold animate-pulse",
    };
  }

  if (days === 1) {
    return {
      days: 1,
      isPast: false,
      isToday: false,
      isTomorrow: true,
      label: "Tomorrow (1 day)",
      badgeClass: "bg-amber-100 text-amber-800 border-amber-300 font-semibold",
    };
  }

  if (days <= 3) {
    return {
      days,
      isPast: false,
      isToday: false,
      isTomorrow: false,
      label: `In ${days} days`,
      badgeClass: "bg-orange-100 text-orange-800 border-orange-300 font-medium",
    };
  }

  if (days <= 7) {
    return {
      days,
      isPast: false,
      isToday: false,
      isTomorrow: false,
      label: `In ${days} days`,
      badgeClass: "bg-sky-100 text-sky-800 border-sky-300",
    };
  }

  return {
    days,
    isPast: false,
    isToday: false,
    isTomorrow: false,
    label: `In ${days} days`,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
}

/**
 * Service-aware timeline label:
 * Flight / Train / Bus -> "Departed Xd ago", "Today! 🚨", "In X days", or if departed & return date exists: "Return in Xd ↩"
 * Courier / Cargo -> "Dispatched Xd ago", "Dispatch Today 📦", "In Xd"
 * Passport / Visa -> "Appt Xd ago", "Appointment Today! 🚨", "Appt in Xd"
 * General -> "Booked Xd ago", "Scheduled Today 📌", "In X days"
 */
export function getServiceTimeline(
  dateString?: string | null,
  serviceName?: string | null,
  returnDateString?: string | null,
  status?: string | null
): {
  days: number;
  isPast: boolean;
  isToday: boolean;
  isTomorrow: boolean;
  isCancelled: boolean;
  label: string;
  badgeClass: string;
} {
  const isCancelled = Boolean(status && /cancel/i.test(status));
  if (isCancelled) {
    return {
      days: 999,
      isPast: false,
      isToday: false,
      isTomorrow: false,
      isCancelled: true,
      label: "—",
      badgeClass: "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700",
    };
  }

  const base = { ...getDaysDifference(dateString), isCancelled: false };
  const n = (serviceName || "").toLowerCase();
  const isFlight =
    (n.includes("flight") || n.includes("airline") || n.includes("ticket") || n.includes("train") || n.includes("bus")) &&
    !n.includes("courier") &&
    !n.includes("coriur") &&
    !n.includes("cargo");
  const isCourier = n.includes("courier") || n.includes("coriur") || n.includes("cargo") || n.includes("parcel") || n.includes("shipment");
  const isDoc = n.includes("passport") || n.includes("visa");

  // If travel date has passed and a return date exists: provide countdown / reminder for the return date!
  if ((base.isPast || !dateString) && returnDateString) {
    const retDiff = getDaysDifference(returnDateString);
    if (retDiff.days !== 999) {
      if (retDiff.isToday) {
        return {
          days: 0,
          isPast: false,
          isToday: true,
          isTomorrow: false,
          isCancelled: false,
          label: "Return Today ↩",
          badgeClass: "bg-rose-50 text-rose-700 border-rose-300 font-bold animate-pulse",
        };
      }
      if (retDiff.isTomorrow) {
        return {
          days: 1,
          isPast: false,
          isToday: false,
          isTomorrow: true,
          isCancelled: false,
          label: "Return Tomorrow (1d) ↩",
          badgeClass: "bg-amber-50 text-amber-700 border-amber-300 font-semibold",
        };
      }
      if (retDiff.days > 0) {
        return {
          days: retDiff.days,
          isPast: false,
          isToday: false,
          isTomorrow: false,
          isCancelled: false,
          label: `Return in ${retDiff.days}d ↩`,
          badgeClass: "bg-sky-50 text-sky-700 border-sky-200 font-semibold",
        };
      }
      if (retDiff.isPast) {
        const absRetDays = Math.abs(retDiff.days);
        return {
          days: retDiff.days,
          isPast: true,
          isToday: false,
          isTomorrow: false,
          isCancelled: false,
          label: absRetDays === 1 ? "Returned yesterday ↩" : `Returned ${absRetDays}d ago ↩`,
          badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
        };
      }
    }
  }

  if (!dateString || base.days === 999) return base;

  if (isFlight) {
    return base;
  }

  const absDays = Math.abs(base.days);

  if (base.isPast) {
    if (isCourier) {
      return { ...base, label: absDays === 1 ? "Dispatched yesterday" : `Dispatched ${absDays}d ago` };
    }
    if (isDoc) {
      return { ...base, label: absDays === 1 ? "Appt yesterday" : `Appt ${absDays}d ago` };
    }
    return { ...base, label: absDays === 1 ? "Booked yesterday" : `Booked ${absDays}d ago` };
  }

  if (base.isToday) {
    if (isCourier) return { ...base, label: "Dispatch Today 📦" };
    if (isDoc) return { ...base, label: "Appointment Today! 🚨" };
    return { ...base, label: "Scheduled Today 📌" };
  }

  if (base.isTomorrow) {
    if (isCourier) return { ...base, label: "Dispatch Tomorrow (1d)" };
    if (isDoc) return { ...base, label: "Appt Tomorrow (1d)" };
    return { ...base, label: "Tomorrow (1d)" };
  }

  if (isDoc) {
    return { ...base, label: `Appt in ${base.days}d` };
  }
  if (isCourier) {
    return { ...base, label: `In ${base.days}d` };
  }
  return { ...base, label: `In ${base.days} days` };
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    let d: Date;
    if (typeof dateString === "string" && /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.test(dateString.trim())) {
      const parts = dateString.trim().split(/[\/\-]/);
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      d = new Date(dateString);
    }
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    let d: Date;
    if (typeof dateString === "string" && /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.test(dateString.trim())) {
      const parts = dateString.trim().split(/[\/\-]/);
      d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      d = new Date(dateString);
    }
    if (isNaN(d.getTime())) return String(dateString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateString);
  }
}

/**
 * Universal helper to format booking numbers, always displaying ATT- (Attar Travels)
 */
export function formatBookingNo(bookingNo?: string | number | null): string {
  if (!bookingNo) return "";
  let cleaned = String(bookingNo).trim();
  // Strip duplicate prefixes e.g. "ATT-2026-2026-341" -> "ATT-2026-341"
  cleaned = cleaned.replace(/^(?:ATT|CCJ|TRV)[-_]?(?:2026[-_]?)+/i, "ATT-2026-");
  if (/^\d+$/.test(cleaned)) {
    return `ATT-2026-${cleaned.padStart(3, "0")}`;
  }
  return cleaned
    .replace(/^TRV-/i, "ATT-")
    .replace(/^CCJ-/i, "ATT-")
    .replace(/^TRV/i, "ATT")
    .replace(/^CCJ/i, "ATT");
}

/**
 * Calculate airport reporting time (strictly 3 hours prior to departure)
 * e.g. "20:20" -> "17:20", "02:15" -> "23:15", "00:45" -> "21:45"
 */
export function calculateReportingTime(timeStr?: string | null, hoursBefore: number = 3): string {
  if (!timeStr) return "";
  const cleaned = timeStr.replace(/hrs|am|pm/gi, "").trim();
  const noDate = cleaned.replace(/^\d{4}-\d{2}-\d{2}\s*[-–—]?\s*/, "").trim();
  const dep = noDate.split(/\s*[-–—]\s*/)[0]?.trim() || noDate;
  const match = dep.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "";
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (isNaN(hours) || isNaN(minutes)) return "";
  if (hours > 23) {
    hours = parseInt(String(hours).slice(-2), 10);
  }

  let repHours = (hours - hoursBefore) % 24;
  if (repHours < 0) repHours += 24;

  const hStr = repHours.toString().padStart(2, "0");
  const mStr = minutes.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
}

/**
 * Helper to display flight times clearly (showing departure and arrival if available)
 */
function cleanTimePart(str: string): string {
  const trimmed = str.trim();
  if (/^\d{3,4}$/.test(trimmed)) {
    const padded = trimmed.padStart(4, "0");
    return `${padded.slice(0, 2)}:${padded.slice(2)}`;
  }
  return trimmed;
}

export function formatFlightTimeDisplay(timeStr?: string | null): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  // Strip any date prefix e.g. "2026-11-30 - 0845" -> "0845"
  const cleaned = trimmed.replace(/^\d{4}-\d{2}-\d{2}\s*[-–—]?\s*/, "").trim();
  if (!cleaned) return "";

  if (cleaned.includes("-") || cleaned.includes("–") || cleaned.includes("—")) {
    const parts = cleaned.split(/\s*[-–—]\s*/).map((s) => s.trim());
    const validParts = parts.filter((p) => !/^\d{4}$/.test(p));
    if (validParts.length >= 2) {
      return `🕒 ${cleanTimePart(validParts[0])} - ${cleanTimePart(validParts[1])} hrs`;
    } else if (validParts.length === 1) {
      return `🕒 ${cleanTimePart(validParts[0])} hrs`;
    }
  }
  return `🕒 ${cleanTimePart(cleaned)} hrs`;
}

