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
