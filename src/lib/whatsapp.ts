import { Booking, AgencySettings } from "./types";
import { formatBookingNo, formatFlightTimeDisplay } from "./date-utils";
import { getServiceFieldConfig, formatCustomWhatsAppMessage, isFlightOrTravelService } from "./service-config";

export function formatPhoneNumber(phone: string): string {
  // Strip non-digits
  const cleaned = phone.replace(/[^\d]/g, "");
  // If Indian 10 digits without country code, prefix with 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
}

export function createFlightReminderMessage(
  booking: Booking,
  agency?: Partial<AgencySettings>
): string {
  const customerName = booking.customer?.name || "Valued Customer";
  const agencyName = agency?.agencyName || "Travel Desk";
  const travelDateStr = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Upcoming date";

  return `✈️ *FLIGHT TRAVEL REMINDER*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Greetings from *${agencyName}*! Here are the details for your upcoming travel:

📋 *Booking Ref:* ${formatBookingNo(booking.bookingNo)}
🛫 *Flight:* ${booking.flightNo || "N/A"}
📍 *Sector:* ${booking.sector || "N/A"}
📅 *Travel Date:* ${travelDateStr}
⏰ *Flight Time:* ${booking.flightTime ? formatFlightTimeDisplay(booking.flightTime) : "As per ticket"}
⏳ *Airport Reporting:* Please arrive at the airport at least 3 hours prior to departure for international flights, and 2 hours for domestic flights. Don't forget your original Passport/ID and Visa.
🎫 *PNR:* ${booking.pnr || "N/A"}
👥 *Passengers:* ${booking.passengerNames || `${booking.passengerCount} Pax`}
📌 *Status:* ${booking.status}

Wishing you a safe and pleasant journey! 🌟
For any queries, reach us at: ${agency?.phone || "+91-TravelDesk"}`;
}

export function createServiceReminderMessage(
  booking: Booking,
  agency?: Partial<AgencySettings>
): string {
  // If service has a configured custom WhatsApp template, use it!
  const serviceConfig = getServiceFieldConfig(booking.serviceType);
  if (serviceConfig.whatsappTemplate && serviceConfig.whatsappTemplate.trim() !== "") {
    return formatCustomWhatsAppMessage(serviceConfig.whatsappTemplate, booking, agency);
  }

  const serviceName = booking.serviceType?.name || "Travel Service";
  const n = serviceName.toLowerCase();

  // If Flight Ticket / Airline -> use specific Flight message with airport reporting
  if (
    (n.includes("flight") || n.includes("airline") || n.includes("air ticket")) &&
    !n.includes("courier") &&
    !n.includes("coriur")
  ) {
    return createFlightReminderMessage(booking, agency);
  }

  const customerName = booking.customer?.name || "Valued Customer";
  const agencyName = agency?.agencyName || "Travel Desk";
  const dateStr = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Scheduled";

  const bookingRef = formatBookingNo(booking.bookingNo);

  // If Courier / Cargo / Parcel
  if (n.includes("courier") || n.includes("coriur") || n.includes("cargo") || n.includes("parcel") || n.includes("shipment")) {
    return `📦 *COURIER & SHIPMENT BOOKING UPDATE*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Greetings from *${agencyName}*! Here are the details for your courier shipment:

📋 *Booking Ref:* ${bookingRef}
📦 *Service:* ${serviceName}
📍 *Destination / Delivery City:* ${booking.sector || "As per consignment"}
🚚 *Tracking / Consignment No:* ${booking.pnr || "Will be updated"}
🏢 *Courier Partner / Network:* ${booking.portal || "Direct Desk"}
📅 *Booking / Dispatch Date:* ${dateStr}
👥 *Sender / Receiver:* ${booking.passengerNames || customerName}
📌 *Status:* ${booking.status}

Track your shipment with your tracking number or contact us for delivery updates.
📞 For any queries, reach us at: ${agency?.phone || ""}`;
  }

  // If Passport Service
  if (n.includes("passport")) {
    return `🛂 *PASSPORT SERVICE APPOINTMENT DETAILS*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Greetings from *${agencyName}*! Here are your passport appointment details:

📋 *Booking Ref:* ${bookingRef}
🏢 *Passport Office / PSK:* ${booking.sector || "PSK Center"}
📄 *File / ARN Number:* ${booking.pnr || "N/A"}
📅 *Appointment Date:* ${dateStr}
🕒 *Reporting Time:* ${booking.flightTime || "As per appointment schedule"}
📌 *Status:* ${booking.status}

⚠️ *Notice:* Please report at the PSK center 15 minutes before your appointment time. Carry all original documents, photocopies, and payment receipt.
📞 For any queries, reach us at: ${agency?.phone || ""}`;
  }

  // If Visa Processing
  if (n.includes("visa")) {
    return `🌐 *VISA APPLICATION STATUS UPDATE*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Greetings from *${agencyName}*! Here is the status of your visa application:

📋 *Booking Ref:* ${bookingRef}
🌍 *Country / Destination:* ${booking.sector || "N/A"}
📄 *Passport / App No:* ${booking.passportNo || booking.pnr || "N/A"}
📅 *Submission / Travel Date:* ${dateStr}
📌 *Status:* ${booking.status}

We are tracking your visa processing and will notify you immediately once approved.
📞 For any queries, reach us at: ${agency?.phone || ""}`;
  }

  // If Train / Bus Transport
  if (n.includes("train") || n.includes("rail") || n.includes("bus")) {
    return `🚆 *JOURNEY & TICKET CONFIRMATION*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Greetings from *${agencyName}*! Here are your travel ticket details:

📋 *Booking Ref:* ${bookingRef}
🚆 *Service:* ${serviceName} (${booking.flightNo || "Transport"})
📍 *Route (From - To):* ${booking.sector || "N/A"}
📅 *Journey Date:* ${dateStr}
⏰ *Departure Time:* ${booking.flightTime || "As per ticket"}
🎫 *PNR / Ticket Ref:* ${booking.pnr || "N/A"}
👥 *Passengers:* ${booking.passengerNames || `${booking.passengerCount} Pax`}
📌 *Status:* ${booking.status}

Wishing you a safe and pleasant journey!
📞 For any queries, reach us at: ${agency?.phone || ""}`;
  }

  // General / Custom Service
  return `📋 *${serviceName.toUpperCase()} BOOKING DETAILS*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Greetings from *${agencyName}*! Here are the details for your booking:

📋 *Booking Ref:* ${bookingRef}
💼 *Service:* ${serviceName}
📍 *Details / Route:* ${booking.sector || "Confirmed"}
🎫 *Reference No:* ${booking.pnr || bookingRef}
📅 *Date:* ${dateStr}
${booking.flightTime ? `⏰ *Time:* ${booking.flightTime}\n` : ""}📌 *Status:* ${booking.status}

Thank you for choosing *${agencyName}*!
📞 For any queries, reach us at: ${agency?.phone || ""}`;
}

export function createFlightDelayMessage(
  booking: Booking,
  agency?: Partial<AgencySettings>
): string {
  // Check if service has custom delay/status alert template
  const serviceConfig = getServiceFieldConfig(booking.serviceType);
  if (serviceConfig.whatsappTemplates?.delay && serviceConfig.whatsappTemplates.delay.trim() !== "") {
    return formatCustomWhatsAppMessage(serviceConfig.whatsappTemplates.delay, booking, agency);
  }

  const isFlight = isFlightOrTravelService(booking.serviceType);
  const customerName = booking.customer?.name || "Valued Customer";
  const agencyName = agency?.agencyName || "Travel Desk";

  if (!isFlight) {
    const serviceName = booking.serviceType?.name || "Service";
    return `⚠️ *${serviceName.toUpperCase()} STATUS UPDATE ALERT*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

This is an update notification from *${agencyName}* regarding your ${serviceName} booking.

📋 *Booking Ref:* ${formatBookingNo(booking.bookingNo)}
📦 *Service:* ${serviceName}
📍 *Details:* ${booking.sector || "As booked"}
🚨 *Updated Status:* *${booking.status.toUpperCase()}*
📝 *Notes:* ${booking.alertNotes || "Status has been updated."}

Please contact our desk if you require any assistance:
📞 *Call/WhatsApp:* ${agency?.phone || ""}`;
  }

  return `⚠️ *FLIGHT STATUS UPDATE ALERT*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

This is an urgent notification from *${agencyName}* regarding your flight booking *${booking.pnr ? `(PNR: ${booking.pnr})` : ""}*.

🛫 *Flight No:* ${booking.flightNo || "N/A"}
📍 *Sector:* ${booking.sector || "N/A"}
🚨 *Updated Status:* *${booking.status.toUpperCase()}*
📝 *Details:* ${booking.alertNotes || "Flight schedule has been revised by the airline. Please verify before heading to airport."}

We are tracking your flight. Please contact our desk immediately if you require any assistance or rescheduling:
📞 *Call/WhatsApp:* ${agency?.phone || "+91-TravelDesk"}`;
}

export function createPaymentReminderMessage(
  booking: Booking,
  agency?: Partial<AgencySettings>
): string {
  // Check if service has custom payment reminder template
  const serviceConfig = getServiceFieldConfig(booking.serviceType);
  if (serviceConfig.whatsappTemplates?.payment && serviceConfig.whatsappTemplates.payment.trim() !== "") {
    return formatCustomWhatsAppMessage(serviceConfig.whatsappTemplates.payment, booking, agency);
  }

  const customerName = booking.customer?.name || "Valued Customer";
  const agencyName = agency?.agencyName || "Travel Desk";
  const dueDateStr = booking.dueDate
    ? new Date(booking.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Immediate";

  return `💳 *PAYMENT DUE REMINDER*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Greetings from *${agencyName}*.

This is a gentle reminder regarding the outstanding balance for your travel booking:

📋 *Booking Ref:* ${formatBookingNo(booking.bookingNo)}
🎫 *Service:* ${booking.serviceType?.name || "Travel Booking"} (${booking.sector || booking.flightNo || "Details"})
💰 *Total Amount:* ₹${booking.totalAmount.toLocaleString()}
✅ *Paid Amount:* ₹${booking.paidAmount.toLocaleString()}
⚠️ *Balance Due:* *₹${booking.balanceAmount.toLocaleString()}*
📅 *Due Date:* ${dueDateStr}

${agency?.bankDetails ? `🏦 *Payment Details:*\n${agency.bankDetails}\n` : ""}
Kindly arrange the payment at your earliest convenience to avoid cancellation or disruption.
Please ignore if already paid. Thank you!`;
}

export function createInvoiceShareMessage(
  booking: Booking,
  agency?: Partial<AgencySettings>
): string {
  // Check if service has custom invoice share template
  const serviceConfig = getServiceFieldConfig(booking.serviceType);
  if (serviceConfig.whatsappTemplates?.invoice && serviceConfig.whatsappTemplates.invoice.trim() !== "") {
    return formatCustomWhatsAppMessage(serviceConfig.whatsappTemplates.invoice, booking, agency);
  }

  const isFlight = isFlightOrTravelService(booking.serviceType);
  const customerName = booking.customer?.name || "Valued Customer";
  const agencyName = agency?.agencyName || "Travel Desk";

  return `📄 *BOOKING INVOICE & CONFIRMATION*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Thank you for choosing *${agencyName}*. Here are your booking details:

🧾 *Booking Ref:* ${formatBookingNo(booking.bookingNo)}
💼 *Service:* ${booking.serviceType?.name || "Travel Service"}
📍 *Details:* ${booking.sector || "N/A"}
${booking.pnr ? `🎫 *Reference / Tracking:* ${booking.pnr}\n` : ""}${isFlight && booking.flightNo ? `🛫 *Flight No:* ${booking.flightNo}\n` : ""}💰 *Total Amount:* ₹${booking.totalAmount.toLocaleString()}
💳 *Paid:* ₹${booking.paidAmount.toLocaleString()}
⚖️ *Balance:* ₹${booking.balanceAmount.toLocaleString()}

${agency?.bankDetails ? `🏦 *Payment Details:*\n${agency.bankDetails}\n` : ""}📞 For queries, contact: ${agency?.phone || ""}`;
}

