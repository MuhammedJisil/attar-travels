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

  const target = new Date(dateString);
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

export function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
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
    const d = new Date(dateString);
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

