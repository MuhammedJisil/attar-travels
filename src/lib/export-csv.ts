import { Booking } from "./types";
import { getDaysDifference, formatDate } from "./date-utils";

export function exportBookingsToCSV(bookings: Booking[], filename = "travel_desk_bookings.csv") {
  const headers = [
    "Booking No",
    "Customer / Party Name",
    "Mobile Number",
    "Service Type",
    "Sector / Route",
    "Flight No",
    "PNR",
    "Flight Time",
    "Travel Date",
    "Days Left",
    "Return Date",
    "Ticket Issue Date",
    "Portal / Supplier",
    "Passenger Count",
    "Passenger Names",
    "Status",
    "Alert / Delay Notes",
    "Total Fare (INR)",
    "Paid Amount (INR)",
    "Balance Due (INR)",
    "Payment Status",
    "Payment Due Date",
    "Office Notes",
  ];

  const rows = bookings.map((b) => {
    const diff = getDaysDifference(b.travelDate);
    const escape = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escape(b.bookingNo),
      escape(b.customer?.name || ""),
      escape(b.customer?.phone || ""),
      escape(b.serviceType?.name || "Flight Ticket"),
      escape(b.sector || ""),
      escape(b.flightNo || ""),
      escape(b.pnr || ""),
      escape(b.flightTime || ""),
      escape(b.travelDate ? formatDate(b.travelDate) : ""),
      escape(diff.label),
      escape(b.returnDate ? formatDate(b.returnDate) : ""),
      escape(b.issueDate ? formatDate(b.issueDate) : ""),
      escape(b.portal || ""),
      escape(b.passengerCount || 1),
      escape(b.passengerNames || ""),
      escape(b.status || "Confirmed"),
      escape(b.alertNotes || ""),
      escape(b.totalAmount || 0),
      escape(b.paidAmount || 0),
      escape(b.balanceAmount || 0),
      escape(b.paymentStatus || "Pending"),
      escape(b.dueDate ? formatDate(b.dueDate) : ""),
      escape(b.notes || ""),
    ].join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
