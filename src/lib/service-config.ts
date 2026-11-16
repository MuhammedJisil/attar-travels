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

export interface CustomFieldDefinition {
  id: string;
  name: string; // e.g. "Reporting Time", "Coach No", "Room Category"
  type: "text" | "number" | "date" | "time" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for type === 'select'
}

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
  customFields?: CustomFieldDefinition[];
}

export const DEFAULT_TEMPLATES: Record<ServiceTemplateType, ServiceFieldDefinition> = {
  flight: {
    template: "flight",
    title: "Flight Ticket Details",
    routeLabel: "Sector / Route / Narration",
    routePlaceholder: "e.g. CCJ (Calicut) - DXB (Dubai)",
    numberLabel: "Flight Number",
    numberPlaceholder: "e.g. EK 532 / IX 343",
    pnrLabel: "Airline PNR (6 Digits)",
    pnrPlaceholder: "e.g. Z7K9PL",
    timeLabel: "Flight Departure Time",
    hasTime: true,
    dateLabel: "Travel / Departure Date",
    hasReturnDate: true,
    hasPax: true,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Issued From Portal / Supplier",
    notesPlaceholder: "Luggage allowance, terminal info, meal preferences...",
    customFields: [
      { id: "f_fdate", name: "Travel / Departure Date", type: "date", required: true },
      { id: "f_ftime", name: "Flight Departure Time", type: "time" },
      { id: "f_route", name: "Sector / Route", type: "text", required: true, placeholder: "e.g. CCJ - DXB" },
      { id: "f_no", name: "Flight Number", type: "text", placeholder: "e.g. EK 532" },
      { id: "f_pnr", name: "Airline PNR", type: "text", required: true, placeholder: "e.g. Z7K9PL" },
      { id: "f_rdate", name: "Return Date (Optional)", type: "date" },
    ],
  },
  train: {
    template: "train",
    title: "Train Ticket Details",
    routeLabel: "Train Route (From Station - To Station)",
    routePlaceholder: "e.g. Calicut (CLT) - Trivandrum (TVC)",
    numberLabel: "Train No / Name",
    numberPlaceholder: "e.g. 12075 Jan Shatabdi",
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
    customFields: [
      { id: "f_tdate", name: "Journey Date", type: "date", required: true },
      { id: "f_ttime", name: "Train Departure Time", type: "time" },
      { id: "f_troute", name: "Train Route (From - To)", type: "text", required: true, placeholder: "e.g. CLT - TVC" },
      { id: "f_tno", name: "Train No / Name", type: "text", placeholder: "e.g. 12075 Jan Shatabdi" },
      { id: "f_tpnr", name: "IRCTC PNR", type: "text", required: true, placeholder: "10-digit PNR" },
      { id: "f_tcoach", name: "Coach & Berth / Seat", type: "text", placeholder: "e.g. B2 - 45, 46" },
    ],
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
    customFields: [
      { id: "f_bdate", name: "Boarding Date", type: "date", required: true },
      { id: "f_btime", name: "Bus Departure Time", type: "time" },
      { id: "f_broute", name: "Boarding - Drop Point", type: "text", required: true, placeholder: "e.g. Calicut - Bangalore" },
      { id: "f_bop", name: "Bus Operator / Bus No", type: "text", placeholder: "e.g. KSRTC Swift" },
      { id: "f_bpnr", name: "Ticket / PNR Ref", type: "text", placeholder: "e.g. BUS-1234" },
      { id: "f_bseat", name: "Seat Number(s)", type: "text", placeholder: "e.g. 12, 13" },
    ],
  },
  passport: {
    template: "passport",
    title: "Passport Service Details",
    routeLabel: "Passport Office / PSK Center",
    routePlaceholder: "e.g. PSK Kozhikode",
    numberLabel: "Passport Number",
    numberPlaceholder: "e.g. Z1234567",
    pnrLabel: "File / ARN Number",
    pnrPlaceholder: "e.g. 24-0001234567",
    timeLabel: "Appointment / Reporting Time",
    hasTime: true,
    dateLabel: "Appointment Date",
    hasReturnDate: false,
    hasPax: false,
    hasPassportField: true,
    hasSubmissionDates: true,
    portalLabel: "Passport Seva Portal User",
    notesPlaceholder: "Police verification status, Tatkal notes...",
    customFields: [
      { id: "f_pnum", name: "Passport Number", type: "text", placeholder: "e.g. Z1234567" },
      { id: "f_parn", name: "ARN / File Number", type: "text", placeholder: "e.g. 24-0001234567" },
      { id: "f_pdate", name: "Appointment Date", type: "date" },
      { id: "f_ptime", name: "Appointment / Reporting Time", type: "time" },
      { id: "f_ppsk", name: "Passport Office / PSK Center", type: "text", placeholder: "e.g. PSK Calicut" },
      { id: "f_pexp", name: "Expiry Date", type: "date" },
    ],
  },
  visa: {
    template: "visa",
    title: "Visa Processing Details",
    routeLabel: "Destination Country & Category",
    routePlaceholder: "e.g. UAE - 60 Days Tourist Visa",
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
    notesPlaceholder: "Sponsor details, stamping status...",
    customFields: [
      { id: "f_vcountry", name: "Destination Country & Category", type: "text", required: true, placeholder: "e.g. UAE 60 Days Tourist" },
      { id: "f_vpass", name: "Passport Number", type: "text", required: true, placeholder: "e.g. V9876543" },
      { id: "f_vref", name: "Visa Application / Ref No", type: "text", placeholder: "e.g. EVSA-98765432" },
      { id: "f_vsub", name: "Submission Date", type: "date" },
      { id: "f_vbio", name: "Biometrics / Appointment Time", type: "time" },
      { id: "f_vexp", name: "Visa Expiry Date", type: "date" },
    ],
  },
  hotel: {
    template: "hotel",
    title: "Hotel / Accommodation Booking Details",
    routeLabel: "City & Destination",
    routePlaceholder: "e.g. Dubai Downtown / Makkah Clock Tower",
    numberLabel: "Hotel / Property Name",
    numberPlaceholder: "e.g. Pullman City Centre",
    pnrLabel: "Hotel Booking Confirmation No",
    pnrPlaceholder: "e.g. HTL-2026-9812",
    timeLabel: "Check-in Time",
    hasTime: true,
    dateLabel: "Check-in Date",
    hasReturnDate: true,
    hasPax: true,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Supplier (e.g. Agoda / Booking.com)",
    notesPlaceholder: "Room category, Meal plan...",
    customFields: [
      { id: "f_hname", name: "Hotel / Property Name", type: "text", required: true, placeholder: "e.g. Pullman City Centre" },
      { id: "f_hcity", name: "City & Location", type: "text", placeholder: "e.g. Dubai Downtown" },
      { id: "f_hcin", name: "Check-in Date", type: "date", required: true },
      { id: "f_hctime", name: "Check-in Time", type: "time" },
      { id: "f_hcout", name: "Check-out Date", type: "date" },
      { id: "f_hpnr", name: "Booking Confirmation No", type: "text", placeholder: "e.g. HTL-2026-9812" },
      { id: "f_hroom", name: "Room Category", type: "text", placeholder: "e.g. Deluxe Double Room" },
    ],
  },
  tour: {
    template: "tour",
    title: "Tour / Holiday Package Details",
    routeLabel: "Tour Package Destination",
    routePlaceholder: "e.g. 5N/6D Dubai Shopping Festival",
    numberLabel: "Package Code / Name",
    numberPlaceholder: "e.g. DXB-PKG-01",
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
    notesPlaceholder: "Itinerary highlights, inclusions...",
    customFields: [
      { id: "f_tname", name: "Package / Tour Name", type: "text", required: true, placeholder: "e.g. 5N/6D Dubai Shopping Festival" },
      { id: "f_tsdate", name: "Tour Start Date", type: "date", required: true },
      { id: "f_tstime", name: "Departure / Reporting Time", type: "time" },
      { id: "f_tedate", name: "Tour Return Date", type: "date" },
      { id: "f_tpnr", name: "Voucher / Reference No", type: "text", placeholder: "e.g. TOUR-2026-441" },
    ],
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
    customFields: [],
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

const CUSTOM_FIELDS_MARKER = "\n\n__CUSTOM_FIELDS__\n";

/**
 * Extract custom field key-values from booking notes
 */
export function extractCustomFieldValues(notes?: string | null): Record<string, string> {
  if (!notes) return {};
  const markerIdx = notes.indexOf(CUSTOM_FIELDS_MARKER);
  if (markerIdx === -1) return {};

  try {
    const jsonStr = notes.substring(markerIdx + CUSTOM_FIELDS_MARKER.length);
    return JSON.parse(jsonStr) || {};
  } catch {
    return {};
  }
}

/**
 * Extract clean human readable notes without the custom fields JSON string
 */
export function getCleanNotes(notes?: string | null): string {
  if (!notes) return "";
  const markerIdx = notes.indexOf(CUSTOM_FIELDS_MARKER);
  if (markerIdx === -1) return notes;
  return notes.substring(0, markerIdx).trim();
}

/**
 * Serialize clean notes and custom fields dictionary into notes string
 */
export function serializeCustomFieldValues(
  cleanNotes: string,
  customFields: Record<string, string>
): string {
  const trimmed = cleanNotes.trim();
  const keys = Object.keys(customFields).filter((k) => customFields[k] !== undefined && customFields[k] !== "");
  if (keys.length === 0) return trimmed;

  const filtered: Record<string, string> = {};
  for (const k of keys) {
    filtered[k] = customFields[k];
  }

  const jsonStr = JSON.stringify(filtered);
  if (!trimmed) {
    return `${CUSTOM_FIELDS_MARKER.trim()}\n${jsonStr}`;
  }
  return `${trimmed}${CUSTOM_FIELDS_MARKER}${jsonStr}`;
}
