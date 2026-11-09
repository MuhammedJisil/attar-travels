export interface ServiceType {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt?: string | Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  createdAt?: string | Date;
  bookings?: Booking[];
  _count?: {
    bookings: number;
  };
}

export interface Booking {
  id: string;
  bookingNo: string;
  customerId: string;
  customer?: Customer;
  serviceTypeId: string;
  serviceType?: ServiceType;

  // Flight Ticket specific fields
  issueDate?: string | null;
  travelDate?: string | null;
  returnDate?: string | null;
  sector?: string | null;
  flightNo?: string | null;
  pnr?: string | null;
  flightTime?: string | null;
  portal?: string | null;
  passengerCount?: number;
  passengerNames?: string | null;

  // Passport / Visa / General service fields
  passportNo?: string | null;
  submissionDate?: string | null;
  expiryDate?: string | null;

  // Status & Alerts
  status: "Confirmed" | "Flight Delayed" | "Rescheduled / Postponed" | "Cancelled" | "Completed" | "In Process" | string;
  alertNotes?: string | null;

  // Financials & Payment Tracking
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate?: string | null;
  paymentStatus: "Paid" | "Partial" | "Pending" | string;

  notes?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AgencySettings {
  id: string;
  agencyName: string;
  tagline?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  taxNumber?: string | null;
  bankDetails?: string | null;
  termsConditions?: string | null;
}

export const initialAgencySettings: AgencySettings = {
  id: "default",
  agencyName: "Al-Madina Travels & Tours",
  tagline: "Your Trusted Travel & Ticketing Partner",
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "booking@almadinatravels.com",
  address: "Shop No. 12, Ground Floor, Skyline Commercial Complex, Calicut, Kerala - 673001",
  logoUrl: "",
  taxNumber: "GSTIN: 32AAAAA0000A1Z5",
  bankDetails: "A/C: 50200012345678 | HDFC Bank, Calicut Branch | IFSC: HDFC0001234 | UPI: almadinatravels@hdfcbank",
  termsConditions: "1. Please report at airport 3 hours prior to international departure and 2 hours for domestic.\n2. Date change & cancellation charges are applicable as per airline fare rules.\n3. Verify passport validity (minimum 6 months from travel date required).",
};
