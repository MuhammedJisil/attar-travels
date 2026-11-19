import { ServiceType } from "./types";

export type ServiceTemplateType =
  | "flight"
  | "train"
  | "bus"
  | "passport"
  | "visa"
  | "hotel"
  | "tour"
  | "courier"
  | "custom";

export interface CustomFieldDefinition {
  id: string;
  name: string; // e.g. "Reporting Time", "Coach No", "Room Category"
  type: "text" | "number" | "date" | "time" | "select";
  required?: boolean;
  placeholder?: string;
  options?: string[]; // for type === 'select'
  showInTable?: boolean; // display as column/badge on main dashboard table
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
  hasPaxExplicit?: boolean;
  hasPassportField: boolean;
  hasSubmissionDates: boolean;
  portalLabel: string;
  notesPlaceholder: string;
  userDescription?: string;
  customFields?: CustomFieldDefinition[];
  whatsappTemplate?: string;
  whatsappTemplates?: {
    reminder?: string;
    delay?: string;
    payment?: string;
    invoice?: string;
  };
  invoiceTitle?: string;
  invoiceTerms?: string;
}

export const DEFAULT_INVOICE_TERMS: Record<ServiceTemplateType, string> = {
  flight: `1. Please report at airport 3 hours prior to international departure and 2 hours for domestic.
2. Date change & cancellation charges are applicable as per airline fare rules.
3. Verify passport validity (minimum 6 months from travel date required).
4. Carry valid Visa, Passport, and travel insurance documents.`,

  train: `1. Please arrive at the railway station at least 30 minutes before departure.
2. Carry valid Government-issued original Photo ID proof for all passengers.
3. Cancellation & refund rules are applicable as per IRCTC / Indian Railways guidelines.`,

  bus: `1. Please report at the boarding point 15 minutes before scheduled departure.
2. Carry booking confirmation SMS / WhatsApp message and valid photo ID.
3. Luggage allowance and cancellation policies are subject to the bus operator's rules.`,

  passport: `1. Please report at the PSK / Passport Office 15 minutes before your scheduled appointment.
2. Carry all original documents, 2 sets of self-attested photocopies, and payment receipts.
3. Police verification must be attended promptly upon notification from the local police station.`,

  visa: `1. Visa approval, processing time, and issuance are at the sole discretion of the Embassy / Consulate.
2. Visa processing fees are non-refundable once submitted to the embassy.
3. Ensure your passport is valid for at least 6 months with sufficient blank pages.`,

  hotel: `1. Standard check-in time is 2:00 PM and check-out is 12:00 PM (subject to hotel policy).
2. Carry original photo ID and booking confirmation voucher at the time of check-in.
3. Incidental charges, taxes, and security deposits must be settled directly with the property.`,

  tour: `1. Itinerary schedule and sightseeing are subject to local weather and traffic conditions.
2. Please follow the instructions of the tour guide/representative during excursions.
3. Cancellation and refund terms apply as per the holiday package agreement.`,

  courier: `1. Please verify recipient address, postal code, and contact number before dispatch.
2. Tracking updates may take 12 to 24 hours to reflect on the carrier tracking network.
3. Fragile, liquid, or high-value items must be declared prior to booking.
4. Delivery timelines are subject to courier network operations, weather, and customs clearance.`,

  custom: `1. Please verify all details, names, and dates printed on this invoice/voucher.
2. Any discrepancy must be reported to the agency within 24 hours of issue.
3. Service charges and booking payments are subject to our agency terms and cancellation policy.`,
};

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
    whatsappTemplate: `✈️ *FLIGHT TRAVEL REMINDER*
━━━━━━━━━━━━━━━━━━
Dear *{customer_name}*,

Greetings from *{agency_name}*! Here are the details for your upcoming travel:

📋 *Booking Ref:* {booking_no}
🛫 *Flight:* {number}
📍 *Sector:* {route}
📅 *Travel Date:* {date}
⏰ *Flight Time:* {time}
⏳ *Airport Reporting:* Please arrive at the airport at least 3 hours prior to departure for international flights, and 2 hours for domestic flights. Don't forget your original Passport/ID and Visa.
🎫 *PNR:* {pnr}
👥 *Passengers:* {passengers}
📌 *Status:* {status}

Wishing you a safe and pleasant journey! 🌟
📞 For queries, reach us at: {agency_phone}`,
    customFields: [
      { id: "f_fdate", name: "Travel / Departure Date", type: "date", required: true },
      { id: "f_ftime", name: "Flight Departure Time", type: "time" },
      { id: "f_atime", name: "Flight Arrival Time", type: "time" },
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
    whatsappTemplate: `🛂 *PASSPORT SERVICE APPOINTMENT DETAILS*
━━━━━━━━━━━━━━━━━━
Dear *{customer_name}*,

Greetings from *{agency_name}*! Here are your passport appointment details:

📋 *Booking Ref:* {booking_no}
🏢 *Passport Office / PSK:* {route}
📄 *File / ARN Number:* {pnr}
📅 *Appointment Date:* {date}
🕒 *Reporting Time:* {time}
📌 *Status:* {status}

⚠️ *Notice:* Please report at the PSK center 15 minutes before your appointment time. Carry all original documents, photocopies, and payment receipt.
📞 For queries, reach us at: {agency_phone}`,
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
    whatsappTemplate: `🌐 *VISA APPLICATION STATUS UPDATE*
━━━━━━━━━━━━━━━━━━
Dear *{customer_name}*,

Greetings from *{agency_name}*! Here is the status of your visa application:

📋 *Booking Ref:* {booking_no}
🌍 *Country / Category:* {route}
📄 *Passport / App No:* {passport_no}
📅 *Submission Date:* {date}
📌 *Status:* {status}

We are tracking your visa processing and will notify you immediately once approved.
📞 For queries, reach us at: {agency_phone}`,
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
  courier: {
    template: "courier",
    title: "Courier & Cargo Shipment Details",
    routeLabel: "Destination / Delivery City",
    routePlaceholder: "e.g. Dubai, UAE / Calicut to Riyadh",
    numberLabel: "AWB / Waybill Number",
    numberPlaceholder: "e.g. AWB-9821457",
    pnrLabel: "Tracking / Consignment No",
    pnrPlaceholder: "e.g. DHL-782190",
    timeLabel: "Dispatch / Pickup Time",
    hasTime: false,
    dateLabel: "Booking / Dispatch Date",
    hasReturnDate: false,
    hasPax: false,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Courier Company / Network (e.g. DHL, FedEx, BlueDart)",
    notesPlaceholder: "Weight, parcel contents, receiver address, contact...",
    whatsappTemplate: `📦 *COURIER & SHIPMENT BOOKING UPDATE*
━━━━━━━━━━━━━━━━━━
Dear *{customer_name}*,

Greetings from *{agency_name}*! Here are the details for your courier shipment:

📋 *Booking Ref:* {booking_no}
📦 *Service:* {service_name}
📍 *Destination:* {route}
🚚 *Tracking No:* {pnr}
🏢 *Courier Partner:* {portal}
📅 *Booking / Dispatch Date:* {date}
📌 *Status:* {status}

Track your shipment with your tracking number or contact us for delivery updates.
📞 For queries, reach us at: {agency_phone}`,
    customFields: [
      { id: "c_date", name: "Booking / Dispatch Date", type: "date", required: true, showInTable: true },
      { id: "c_route", name: "Destination / Delivery City", type: "text", required: true, placeholder: "e.g. Dubai, UAE", showInTable: true },
      { id: "c_track", name: "Tracking / Consignment No", type: "text", required: true, placeholder: "e.g. DHL-9812401", showInTable: true },
      { id: "c_partner", name: "Courier Company / Network", type: "text", placeholder: "e.g. DHL Express, Aramex, DTDC", showInTable: true },
      { id: "c_weight", name: "Weight / Package Type", type: "text", placeholder: "e.g. 2.5 kg Document", showInTable: false },
      { id: "c_receiver", name: "Receiver Name & Phone", type: "text", placeholder: "e.g. Ahmed (+971 50 1234567)", showInTable: false },
    ],
  },
  custom: {
    template: "custom",
    title: "Service Details",
    routeLabel: "Destination / Route",
    routePlaceholder: "Enter destination or route",
    numberLabel: "Reference Number",
    numberPlaceholder: "Enter reference number",
    pnrLabel: "Ref / Tracking No",
    pnrPlaceholder: "Enter PNR or Ref",
    timeLabel: "Time",
    hasTime: false,
    dateLabel: "Booking Date",
    hasReturnDate: false,
    hasPax: false,
    hasPassportField: false,
    hasSubmissionDates: false,
    portalLabel: "Provider / Supplier",
    notesPlaceholder: "Additional details or notes...",
    whatsappTemplate: `📋 *{service_name} BOOKING DETAILS*
━━━━━━━━━━━━━━━━━━
Dear *{customer_name}*,

Greetings from *{agency_name}*! Here are the details of your booking:

📋 *Booking Ref:* {booking_no}
💼 *Service:* {service_name}
📍 *Details:* {route}
🎫 *Ref / Tracking No:* {pnr}
📅 *Date:* {date}
📌 *Status:* {status}

Thank you for choosing *{agency_name}*!
📞 For queries, reach us at: {agency_phone}`,
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
      const mergedFields: CustomFieldDefinition[] = parsed.customFields ? [...parsed.customFields] : (base.customFields ? [...base.customFields] : []);

      const isFlight = (parsed.template === "flight") || (service.name && /flight|ticket|airline|air/i.test(service.name));
      if (isFlight && mergedFields.length > 0) {
        const hasDep = mergedFields.some((f) => /dep|departure/i.test(f.name) && f.type === "time");
        if (!hasDep) {
          const arrIdx = mergedFields.findIndex((f) => /arr|arrival|arrivel/i.test(f.name) && f.type === "time");
          const depFld: CustomFieldDefinition = {
            id: "f_ftime_dep",
            name: "Flight Departure Time",
            type: "time"
          };
          if (arrIdx !== -1) {
            mergedFields.splice(arrIdx, 0, depFld);
          } else {
            mergedFields.unshift(depFld);
          }
        }
      }

      // If custom fields exist, dynamically bind routeLabel, pnrLabel, dateLabel, portalLabel to mandatory/configured field titles
      const mandatoryFields = mergedFields.filter((f) => f.required);
      const rFld = mandatoryFields.find((f) => /route|sector|destination|delivery|city|location|station|from|to/i.test(f.name))
        || mandatoryFields.find((f) => f.type === "text" && !/pnr|track|ref|awb|arn|file|no|num|code/i.test(f.name))
        || mergedFields.find((f) => /route|sector|destination|delivery|city/i.test(f.name));

      const pFld = mandatoryFields.find((f) => /pnr|track|consignment|awb|waybill|arn|file|ref|ticket/i.test(f.name))
        || mandatoryFields.find((f) => /code|id|number|no/i.test(f.name) && !/flight|train|bus/i.test(f.name))
        || mergedFields.find((f) => /pnr|track|consignment|awb|waybill|arn|file|ref/i.test(f.name));

      const dFld = mandatoryFields.find((f) => f.type === "date" && !/expiry|return|birth/i.test(f.name))
        || mandatoryFields.find((f) => f.type === "date")
        || mergedFields.find((f) => f.type === "date" && !/expiry|return|birth/i.test(f.name));

      const supFld = mergedFields.find((f) => /portal|supplier|carrier|partner|company|network|desk|vendor/i.test(f.name));

      const isOldGenericRoute = !parsed.routeLabel || parsed.routeLabel.includes("Route / Sector / Narration");
      const isOldGenericPnr = !parsed.pnrLabel || parsed.pnrLabel.includes("Reference / PNR No");
      const isOldGenericDate = !parsed.dateLabel || parsed.dateLabel.includes("Service / Travel Date");
      const isOldGenericPortal = !parsed.portalLabel || parsed.portalLabel.includes("Portal / Supplier");

      const resolvedRouteLabel = rFld?.name || (!isOldGenericRoute ? parsed.routeLabel : undefined) || base.routeLabel;
      const resolvedPnrLabel = pFld?.name || (!isOldGenericPnr ? parsed.pnrLabel : undefined) || base.pnrLabel;
      const resolvedDateLabel = dFld?.name || (!isOldGenericDate ? parsed.dateLabel : undefined) || base.dateLabel;
      const resolvedPortalLabel = supFld?.name || (!isOldGenericPortal ? parsed.portalLabel : undefined) || base.portalLabel;

      const isCourierOrAttestation = service?.name && /courier|coriur|cargo|attest|certificate/i.test(service.name);
      const isPassportOrVisa = service?.name && /passport|visa/i.test(service.name);

      // Determine hasPax:
      // If service is courier/cargo/attestation/certificate/visa/passport, default hasPax to false unless explicitly enabled
      let finalHasPax = parsed.hasPax !== undefined ? Boolean(parsed.hasPax) : base.hasPax;
      if ((isCourierOrAttestation || isPassportOrVisa) && !mergedFields.some((f) => /passenger|pax/i.test(f.name))) {
        finalHasPax = parsed.hasPaxExplicit ? Boolean(parsed.hasPax) : false;
      }

      const tmplKey = (parsed.template as ServiceTemplateType) || (isCourierOrAttestation ? "courier" : isPassportOrVisa ? (service?.name.toLowerCase().includes("passport") ? "passport" : "visa") : "custom");
      const defaultTerms = DEFAULT_INVOICE_TERMS[tmplKey] || DEFAULT_INVOICE_TERMS.custom;
      const resolvedInvoiceTerms = parsed.invoiceTerms || defaultTerms;
      const resolvedInvoiceTitle = parsed.invoiceTitle || parsed.title || `${service.name} Details`;

      return {
        ...base,
        ...parsed,
        hasPax: finalHasPax,
        invoiceTitle: resolvedInvoiceTitle,
        invoiceTerms: resolvedInvoiceTerms,
        routeLabel: resolvedRouteLabel,
        pnrLabel: resolvedPnrLabel,
        dateLabel: resolvedDateLabel,
        portalLabel: resolvedPortalLabel,
        whatsappTemplate: parsed.whatsappTemplate || base.whatsappTemplate,
        whatsappTemplates: parsed.whatsappTemplates || (parsed.whatsappTemplate ? { reminder: parsed.whatsappTemplate } : (base.whatsappTemplate ? { reminder: base.whatsappTemplate } : undefined)),
        customFields: mergedFields,
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
  if (n.includes("courier") || n.includes("coriur") || n.includes("cargo") || n.includes("parcel") || n.includes("shipment") || n.includes("delivery") || n.includes("dhl") || n.includes("dtdc")) {
    return DEFAULT_TEMPLATES.courier;
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

export function isTrainService(service?: ServiceType | null): boolean {
  if (!service) return false;
  const n = (service.name + " " + (service.code || "")).toLowerCase();
  return n.includes("train") || n.includes("rail") || n.includes("irctc");
}

export function isBusService(service?: ServiceType | null): boolean {
  if (!service) return false;
  const n = (service.name + " " + (service.code || "")).toLowerCase();
  return n.includes("bus") || n.includes("coach") || n.includes("transport");
}

export function isFlightService(service?: ServiceType | null): boolean {
  if (!service) return true;
  const n = (service.name + " " + (service.code || "")).toLowerCase();
  if (isTrainService(service) || isBusService(service)) return false;
  const isNonFlight = /courier|coriur|cargo|parcel|shipment|delivery|passport|visa|attest|certificate|document|hotel|stay|resort|insurance/i.test(n);
  if (isNonFlight) return false;
  return /flight|airline|air\s*ticket|air/i.test(n) || n === "ticket";
}

/**
 * Check if a service is a flight or passenger transport service (where departure times & flight/bus/train terminology apply)
 */
export function isFlightOrTravelService(service?: ServiceType | null): boolean {
  if (!service) return true;
  const n = (service.name + " " + (service.code || "")).toLowerCase();
  const isNonTravel = /courier|coriur|cargo|parcel|shipment|delivery|passport|visa|attest|certificate|document|insurance/i.test(n);
  if (isNonTravel) return false;
  return /flight|airline|air\s*ticket|train|rail|irctc|bus|coach|tour|package|holiday|umrah|hajj/i.test(n) || n === "ticket";
}

/**
 * Standard 24h train & flight time presets (aviation/railway notation, e.g. 22:00)
 */
export const TRAIN_FLIGHT_TIME_PRESETS = [
  "06:00",
  "09:30",
  "12:15",
  "15:45",
  "18:30",
  "20:15",
  "22:00",
  "23:45",
];

/**
 * Format any time string strictly to 24-hour Train / Flight time format (e.g. "22:00" or "08:30")
 */
export function formatFlightTrainTime(timeStr?: string | null): string {
  if (!timeStr) return "";
  const t24 = formatTime24h(timeStr);
  return t24 || timeStr.trim();
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

/**
 * Get human-readable description for a service, ensuring raw JSON is NEVER shown on cards.
 */
export function getServiceDisplayDescription(service?: { name: string; description?: string | null } | null): string {
  if (!service || !service.description) return "Active service category";
  const desc = service.description.trim();
  if (!desc.startsWith("{")) {
    return desc;
  }
  try {
    const parsed = JSON.parse(desc);
    if (parsed.userDescription && typeof parsed.userDescription === "string" && parsed.userDescription.trim()) {
      return parsed.userDescription.trim();
    }
    const count = parsed.customFields?.length || 0;
    const title = parsed.title || service.name;
    return `${title} (${count} field${count === 1 ? "" : "s"})`;
  } catch {
    return "Configured service";
  }
}

const CUSTOM_MARKER = "__CUSTOM_FIELDS__";

/**
 * Extract custom field key-values from booking notes
 */
export function extractCustomFieldValues(notes?: string | null): Record<string, string> {
  if (!notes) return {};
  const markerIdx = notes.indexOf(CUSTOM_MARKER);
  if (markerIdx === -1) return {};

  try {
    const jsonStr = notes.substring(markerIdx + CUSTOM_MARKER.length).trim();
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
  const markerIdx = notes.indexOf(CUSTOM_MARKER);
  if (markerIdx === -1) return notes.trim();
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
  const keys = Object.keys(customFields).filter(
    (k) => customFields[k] !== undefined && customFields[k] !== null && String(customFields[k]).trim() !== ""
  );
  if (keys.length === 0) return trimmed;

  const filtered: Record<string, string> = {};
  for (const k of keys) {
    filtered[k] = String(customFields[k]).trim();
  }

  const jsonStr = JSON.stringify(filtered);
  if (!trimmed) {
    return `${CUSTOM_MARKER}\n${jsonStr}`;
  }
  return `${trimmed}\n\n${CUSTOM_MARKER}\n${jsonStr}`;
}

/**
 * Resolves the true travel / departure date and return date from booking record & custom fields
 * Prevents corrupted or swapped return dates from overriding travel date
 */
export function resolveBookingDates(b?: {
  travelDate?: Date | string | null;
  returnDate?: Date | string | null;
  issueDate?: Date | string | null;
  submissionDate?: Date | string | null;
  expiryDate?: Date | string | null;
  notes?: string | null;
  serviceType?: { name?: string | null; code?: string | null } | null;
} | null): {
  travelDate: string | null;
  returnDate: string | null;
} {
  if (!b) return { travelDate: null, returnDate: null };

  const isFlight = isFlightOrTravelService(b.serviceType as any);
  const custom = extractCustomFieldValues(b.notes);
  const hasCustomNotes = Boolean(b.notes && b.notes.includes(CUSTOM_MARKER));

  // If NON-TRAVEL service (Courier, Attestation, Certificate, Document, etc.):
  if (!isFlight) {
    // 1. Check custom fields for any date (dispatch date, issue date, booking date, etc.)
    const customCourierDate = Object.entries(custom).find(([k]) =>
      /date/i.test(k) && !/expiry|birth/i.test(k)
    )?.[1];

    let effectiveDate: string | null = null;
    if (customCourierDate && customCourierDate.trim()) {
      effectiveDate = customCourierDate.trim();
    } else if (b.issueDate) {
      effectiveDate = typeof b.issueDate === "string" ? b.issueDate : (b.issueDate instanceof Date ? b.issueDate.toISOString() : String(b.issueDate));
    } else if (b.submissionDate) {
      effectiveDate = typeof b.submissionDate === "string" ? b.submissionDate : (b.submissionDate instanceof Date ? b.submissionDate.toISOString() : String(b.submissionDate));
    } else if (b.travelDate) {
      effectiveDate = typeof b.travelDate === "string" ? b.travelDate : (b.travelDate instanceof Date ? b.travelDate.toISOString() : String(b.travelDate));
    }

    return {
      travelDate: effectiveDate,
      returnDate: null, // Courier & non-travel services NEVER have return dates!
    };
  }

  // FLIGHT / TRAVEL SERVICE:
  // Search custom fields for departure / travel date
  const customTravel = Object.entries(custom).find(([k]) =>
    /^(travel|departure|journey)\s*(\/\s*departure\s*)?date/i.test(k) && !/return/i.test(k)
  )?.[1];

  // Search custom fields for return date
  const customReturn = Object.entries(custom).find(([k]) =>
    /return\s*date/i.test(k)
  )?.[1];

  let travelDate: string | null = null;
  if (customTravel && customTravel.trim()) {
    travelDate = customTravel.trim();
  } else if (b.travelDate) {
    travelDate = typeof b.travelDate === "string" ? b.travelDate : (b.travelDate instanceof Date ? b.travelDate.toISOString() : String(b.travelDate));
  } else if (b.issueDate) {
    travelDate = typeof b.issueDate === "string" ? b.issueDate : (b.issueDate instanceof Date ? b.issueDate.toISOString() : String(b.issueDate));
  }

  // Return date logic:
  // ONLY show return date if user explicitly entered a return date in custom fields,
  // or (for legacy records without custom fields) if b.returnDate is distinct from travelDate.
  let returnDate: string | null = null;
  if (customReturn && customReturn.trim()) {
    returnDate = customReturn.trim();
  } else if (!hasCustomNotes && b.returnDate) {
    const rawRet = typeof b.returnDate === "string" ? b.returnDate : (b.returnDate instanceof Date ? b.returnDate.toISOString() : String(b.returnDate));
    const rawTravel = travelDate || (b.travelDate ? (typeof b.travelDate === "string" ? b.travelDate : (b.travelDate instanceof Date ? b.travelDate.toISOString() : String(b.travelDate))) : null);
    if (!rawTravel || rawRet.substring(0, 10) !== rawTravel.substring(0, 10)) {
      returnDate = rawRet;
    }
  }

  // If travelDate and returnDate are identical, it is a one-way flight, NOT a round trip!
  if (travelDate && returnDate && travelDate.substring(0, 10) === returnDate.substring(0, 10)) {
    returnDate = null;
  }

  return { travelDate, returnDate };
}

/**
 * Format customized WhatsApp message template using booking data and agency settings
 */
export function formatCustomWhatsAppMessage(
  template: string,
  booking: {
    bookingNo?: string | number | null;
    sector?: string | null;
    pnr?: string | null;
    flightNo?: string | null;
    travelDate?: string | null;
    flightTime?: string | null;
    portal?: string | null;
    passengerCount?: number | null;
    passengerNames?: string | null;
    passportNo?: string | null;
    totalAmount?: number | null;
    paidAmount?: number | null;
    balanceAmount?: number | null;
    status?: string | null;
    notes?: string | null;
    customer?: { name?: string | null; phone?: string | null } | null;
    serviceType?: { name?: string | null; code?: string | null } | null;
  },
  agency?: { agencyName?: string | null; phone?: string | null } | null
): string {
  if (!template) return "";
  const customerName = booking.customer?.name || "Valued Customer";
  const agencyName = agency?.agencyName || "Travel Desk";
  const agencyPhone = agency?.phone || "";
  const bookingNo = booking.bookingNo ? `ATT-2026-${String(booking.bookingNo).replace(/^(CCJ|TRV|ATT)-/i, "").padStart(3, "0")}` : "N/A";
  const serviceName = booking.serviceType?.name || "Service";
  const custom = extractCustomFieldValues(booking.notes);

  const isFlight = isFlightOrTravelService(booking.serviceType as any);
  const isFakeAutoPnr = !isFlight && booking.pnr && /^(CCJ|ATT|TRV)-\d+$/i.test(booking.pnr);
  const customRef = Object.entries(custom).find(([k]) => /tracking|consignment|awb|waybill|arn|file|pnr|ref/i.test(k))?.[1];
  const pnrVal = (!isFakeAutoPnr && booking.pnr) ? booking.pnr : (customRef || "—");

  const customRoute = Object.entries(custom).find(([k]) => /route|destination|delivery|city|hotel|package|item/i.test(k))?.[1];
  const isSectorSameAsService = booking.sector && booking.serviceType?.name && booking.sector.toLowerCase().trim() === booking.serviceType.name.toLowerCase().trim();
  const routeVal = (!isSectorSameAsService && booking.sector) ? booking.sector : (customRoute || (!isSectorSameAsService ? booking.sector : null) || "—");

  const dateVal = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const timeVal = booking.flightTime ? formatFlightTrainTime(booking.flightTime) : "—";
  const portalVal = booking.portal || "—";
  const statusVal = booking.status || "Confirmed";
  const paxVal = booking.passengerNames || `${booking.passengerCount || 1} Pax`;
  const numberVal = booking.flightNo || "—";
  const passportVal = booking.passportNo || "—";
  const totalAmount = `₹${(booking.totalAmount || 0).toLocaleString()}`;
  const paidAmount = `₹${(booking.paidAmount || 0).toLocaleString()}`;
  const balanceDue = `₹${(booking.balanceAmount || 0).toLocaleString()}`;
  const alertNotesVal = (booking as any).alertNotes || "Status has been updated.";
  const dueDateVal = (booking as any).dueDate
    ? new Date((booking as any).dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : "Immediate";

  return template
    .replace(/{customer_name}/gi, customerName)
    .replace(/{agency_name}/gi, agencyName)
    .replace(/{agency_phone}/gi, agencyPhone)
    .replace(/{booking_no}/gi, bookingNo)
    .replace(/{service_name}/gi, serviceName)
    .replace(/{route}/gi, routeVal)
    .replace(/{destination}/gi, routeVal)
    .replace(/{sector}/gi, routeVal)
    .replace(/{pnr}/gi, pnrVal)
    .replace(/{tracking_no}/gi, pnrVal)
    .replace(/{date}/gi, dateVal)
    .replace(/{time}/gi, timeVal)
    .replace(/{portal}/gi, portalVal)
    .replace(/{supplier}/gi, portalVal)
    .replace(/{status}/gi, statusVal)
    .replace(/{passengers}/gi, paxVal)
    .replace(/{pax}/gi, paxVal)
    .replace(/{number}/gi, numberVal)
    .replace(/{flight_no}/gi, numberVal)
    .replace(/{passport_no}/gi, passportVal)
    .replace(/{total_amount}/gi, totalAmount)
    .replace(/{paid_amount}/gi, paidAmount)
    .replace(/{balance_due}/gi, balanceDue)
    .replace(/{notes}/gi, alertNotesVal)
    .replace(/{alert_notes}/gi, alertNotesVal)
    .replace(/{delay_reason}/gi, alertNotesVal)
    .replace(/{due_date}/gi, dueDateVal);
}
