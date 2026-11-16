import { ServiceType } from "./types";

export type ServiceTemplateType =
  | "flight"
  | "train"
  | "bus"
  | "passport"
  | "visa"
  | "hotel"
  | "tour"
  | "custom";

export interface ServiceFieldDefinition {
  template: ServiceTemplateType;
  title: string;
  routeLabel: string;
  routePlaceholder: string;
  numberLabel: string;
  numberPlaceholder: string;
  pnrLabel: string;
  pnrPlaceholder: string;
  timeLabel: string;
  hasTime: boolean;
  dateLabel: string;
  hasReturnDate: boolean;
  hasPax: boolean;
  hasPassportField: boolean;
  hasSubmissionDates: boolean;
  portalLabel: string;
  notesPlaceholder: string;
}

export const DEFAULT_TEMPLATES: Record<ServiceTemplateType, ServiceFieldDefinition> = {
  flight: {
    template: "flight",
    title: "Flight Ticket Details",
    routeLabel: "Sector / Route / Narration",
    routePlaceholder: "e.g. CCJ (Calicut) - DXB (Dubai) or Round Trip",
    numberLabel: "Flight Number",
    numberPlaceholder: "e.g. EK 532 / IX 343 / 6E 123",
    pnrLabel: "Airline PNR (6 Digits)",
    pnrPlaceholder: "e.g. Z7K9PL",
    timeLabel: "Flight Departure Time",
    hasTime: true,
    dateLabel: "Travel / Departure Date",
    hasReturnDate: true,
    hasPax: true,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Issued From Portal / Supplier (e.g. Amadeus / Akbar)",
    notesPlaceholder: "Luggage allowance, terminal info, meal preferences...",
  },
  train: {
    template: "train",
    title: "Train Ticket Details",
    routeLabel: "Train Route (From Station - To Station)",
    routePlaceholder: "e.g. Calicut (CLT) - Trivandrum (TVC)",
    numberLabel: "Train No / Name",
    numberPlaceholder: "e.g. 12075 Jan Shatabdi / 16348 Mangalore Exp",
    pnrLabel: "IRCTC PNR (10 Digits)",
    pnrPlaceholder: "e.g. 4521098765",
    timeLabel: "Train Departure Time",
    hasTime: true,
    dateLabel: "Journey Date",
    hasReturnDate: true,
    hasPax: true,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Booked Portal / IRCTC ID",
    notesPlaceholder: "Coach no, Berth / Seat numbers, Class (3A, 2A, SL)...",
  },
  bus: {
    template: "bus",
    title: "Bus / Transport Booking Details",
    routeLabel: "Boarding Point - Drop Point",
    routePlaceholder: "e.g. Calicut Palayam - Bangalore Majestic",
    numberLabel: "Bus Operator & Bus No",
    numberPlaceholder: "e.g. KSRTC Swift / Kallada Travels",
    pnrLabel: "Ticket / Booking Reference No",
    pnrPlaceholder: "e.g. BUS-982145",
    timeLabel: "Bus Departure Time",
    hasTime: true,
    dateLabel: "Boarding / Journey Date",
    hasReturnDate: true,
    hasPax: true,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Portal (e.g. RedBus / AbhiBus / Direct)",
    notesPlaceholder: "Boarding point landmark, seat numbers...",
  },
  passport: {
    template: "passport",
    title: "Passport Service Details",
    routeLabel: "Passport Office / PSK Center",
    routePlaceholder: "e.g. PSK Kozhikode / Regional Passport Office",
    numberLabel: "Existing Passport No (If renewal)",
    numberPlaceholder: "e.g. Z1234567",
    pnrLabel: "File / ARN Number",
    pnrPlaceholder: "e.g. 24-0001234567",
    timeLabel: "Appointment / Reporting Time",
    hasTime: true,
    dateLabel: "Appointment / Submission Date",
    hasReturnDate: false,
    hasPax: false,
    hasPassportField: true,
    hasSubmissionDates: true,
    portalLabel: "Passport Seva Portal User",
    notesPlaceholder: "Police verification status, Tatkal notes, documents collected...",
  },
  visa: {
    template: "visa",
    title: "Visa Processing Details",
    routeLabel: "Destination Country & Category",
    routePlaceholder: "e.g. UAE - 60 Days Tourist Visa / Saudi Work Visa",
    numberLabel: "Passport Number",
    numberPlaceholder: "e.g. V9876543",
    pnrLabel: "Visa Application / Reference No",
    pnrPlaceholder: "e.g. EVSA-98765432",
    timeLabel: "Biometrics / Appointment Time",
    hasTime: true,
    dateLabel: "Application Submission Date",
    hasReturnDate: false,
    hasPax: false,
    hasPassportField: true,
    hasSubmissionDates: true,
    portalLabel: "Embassy / Portal Applied",
    notesPlaceholder: "Sponsor details, stamping status, validity duration...",
  },
  hotel: {
    template: "hotel",
    title: "Hotel / Accommodation Booking Details",
    routeLabel: "City & Destination",
    routePlaceholder: "e.g. Dubai Downtown / Makkah Clock Tower",
    numberLabel: "Hotel / Property Name",
    numberPlaceholder: "e.g. Pullman City Centre / Hilton Makkah",
    pnrLabel: "Hotel Booking Confirmation No",
    pnrPlaceholder: "e.g. HTL-2026-9812",
    timeLabel: "Check-in Time",
    hasTime: true,
    dateLabel: "Check-in Date",
    hasReturnDate: true,
    hasPax: true,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Supplier (e.g. Agoda / Booking.com / Hotelbeds)",
    notesPlaceholder: "Room category, Meal plan (BB, HB), Extra bed...",
  },
  tour: {
    template: "tour",
    title: "Tour / Holiday Package Details",
    routeLabel: "Tour Package Destination",
    routePlaceholder: "e.g. 5N/6D Dubai Shopping Festival / Kashmir Holiday",
    numberLabel: "Package Code / Name",
    numberPlaceholder: "e.g. DXB-PKG-01 / Umrah Group 1448",
    pnrLabel: "Voucher / Package Reference No",
    pnrPlaceholder: "e.g. TOUR-2026-441",
    timeLabel: "Departure / Reporting Time",
    hasTime: true,
    dateLabel: "Tour Start / Departure Date",
    hasReturnDate: true,
    hasPax: true,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Tour Operator / DMC Partner",
    notesPlaceholder: "Itinerary highlights, inclusions, visa and transfers...",
  },
  custom: {
    template: "custom",
    title: "Service Details",
    routeLabel: "Route / Sector / Narration",
    routePlaceholder: "Enter route or narration",
    numberLabel: "Service / Document Number",
    numberPlaceholder: "Enter reference number",
    pnrLabel: "Reference / PNR No",
    pnrPlaceholder: "Enter PNR or Ref",
    timeLabel: "Service Time",
    hasTime: true,
    dateLabel: "Service / Travel Date",
    hasReturnDate: true,
    hasPax: true,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Portal / Supplier",
    notesPlaceholder: "Additional details or notes...",
  },
};

/**
 * Intelligent helper to parse service configuration or infer from name/code
 */
export function getServiceFieldConfig(service?: ServiceType | null): ServiceFieldDefinition {
  if (!service) return DEFAULT_TEMPLATES.flight;

  // Check if description has embedded JSON config
  if (service.description && service.description.startsWith("{") && service.description.endsWith("}")) {
    try {
      const parsed = JSON.parse(service.description);
      const base = DEFAULT_TEMPLATES[parsed.template as ServiceTemplateType] || DEFAULT_TEMPLATES.custom;
      return {
        ...base,
        ...parsed,
        title: parsed.title || `${service.name} Details`,
      };
    } catch {
      // fallback to auto-detection
    }
  }

  // Infer based on name or code
  const n = (service.name + " " + (service.code || "")).toLowerCase();

  if (n.includes("train") || n.includes("rail") || n.includes("irctc")) {
    return DEFAULT_TEMPLATES.train;
  }
  if (n.includes("bus") || n.includes("coach") || n.includes("transport")) {
    return DEFAULT_TEMPLATES.bus;
  }
  if (n.includes("passport")) {
    return DEFAULT_TEMPLATES.passport;
  }
  if (n.includes("visa")) {
    return DEFAULT_TEMPLATES.visa;
  }
  if (n.includes("hotel") || n.includes("resort") || n.includes("stay") || n.includes("accommodation")) {
    return DEFAULT_TEMPLATES.hotel;
  }
  if (n.includes("tour") || n.includes("package") || n.includes("holiday") || n.includes("umrah") || n.includes("hajj")) {
    return DEFAULT_TEMPLATES.tour;
  }
  if (n.includes("flight") || n.includes("airline") || n.includes("air ticket") || n.includes("ticket")) {
    return DEFAULT_TEMPLATES.flight;
  }

  // Default custom
  return {
    ...DEFAULT_TEMPLATES.custom,
    title: `${service.name} Details`,
  };
}

/**
 * Quick 12-hour AM/PM formatter from standard 24h time string (e.g. "14:30" -> "02:30 PM")
 */
export function formatTime12h(timeStr?: string | null): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  // Already has AM/PM
  if (trimmed.toUpperCase().includes("AM") || trimmed.toUpperCase().includes("PM")) {
    return trimmed;
  }
  // Try parsing 24h HH:mm
  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(minutes)) {
      const period = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      const mStr = minutes.toString().padStart(2, "0");
      return `${h12.toString().padStart(2, "0")}:${mStr} ${period}`;
    }
  }
  return trimmed;
}

/**
 * Convert 12h or arbitrary time to standard 24h format for <input type="time"> (e.g. "02:30 PM" -> "14:30")
 */
export function formatTime24h(timeStr?: string | null): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();
  const upper = trimmed.toUpperCase();

  if (upper.includes("AM") || upper.includes("PM")) {
    const isPM = upper.includes("PM");
    const clean = upper.replace(/[APM\s]/g, "");
    const parts = clean.split(":");
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        if (isPM && hours < 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      }
    }
  }

  // If already 24h HH:mm
  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    }
  }

  return "";
}
