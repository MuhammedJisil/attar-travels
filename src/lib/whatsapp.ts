import { Booking, AgencySettings } from "./types";

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

📋 *Booking Ref:* ${booking.bookingNo}
🛫 *Flight:* ${booking.flightNo || "N/A"}
📍 *Sector:* ${booking.sector || "N/A"}
📅 *Travel Date:* ${travelDateStr}
⏰ *Flight Time:* ${booking.flightTime || "As per ticket"}
🎫 *PNR:* ${booking.pnr || "N/A"}
👥 *Passengers:* ${booking.passengerNames || `${booking.passengerCount} Pax`}
📌 *Status:* ${booking.status}

⚠️ *Airport Reporting:* Please arrive at the airport at least 3 hours prior to departure for international flights, and 2 hours for domestic flights. Don't forget your original Passport/ID and Visa.

Wishing you a safe and pleasant journey! 🌟
For any queries, reach us at: ${agency?.phone || "+91-TravelDesk"}`;
}

export function createFlightDelayMessage(
  booking: Booking,
  agency?: Partial<AgencySettings>
): string {
  const customerName = booking.customer?.name || "Valued Customer";
  const agencyName = agency?.agencyName || "Travel Desk";

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

📋 *Booking Ref:* ${booking.bookingNo}
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
  const customerName = booking.customer?.name || "Valued Customer";
  const agencyName = agency?.agencyName || "Travel Desk";

  return `📄 *TRAVEL INVOICE / BOOKING CONFIRMATION*
━━━━━━━━━━━━━━━━━━
Dear *${customerName}*,

Thank you for choosing *${agencyName}*. Here is your booking confirmation:

🧾 *Invoice/Booking No:* ${booking.bookingNo}
💼 *Service:* ${booking.serviceType?.name || "Flight Ticket"}
📍 *Sector/Details:* ${booking.sector || "N/A"}
🎫 *PNR / Ref:* ${booking.pnr || "N/A"}
🛫 *Flight No:* ${booking.flightNo || "N/A"}
💰 *Total Fare:* ₹${booking.totalAmount.toLocaleString()}
💳 *Paid:* ₹${booking.paidAmount.toLocaleString()}
⚖️ *Balance:* ₹${booking.balanceAmount.toLocaleString()}

Official invoice is attached / available on request. Have a wonderful trip!
Contact: ${agency?.phone || ""}`;
}
