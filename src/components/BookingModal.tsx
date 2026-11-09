"use client";

import React, { useState, useEffect } from "react";
import { Booking, Customer, ServiceType } from "@/lib/types";
import {
  X,
  Plane,
  FileText,
  User,
  Phone,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  AlertCircle,
  Plus,
  Compass,
} from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  booking?: Booking | null; // If passed, editing mode; else adding mode
  customers: Customer[];
  serviceTypes: ServiceType[];
  onOpenManageServices: () => void;
  preselectedCustomerId?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  onSaved,
  booking,
  customers,
  serviceTypes,
  onOpenManageServices,
  preselectedCustomerId,
}: BookingModalProps) {
  // Form mode: existing customer or new customer
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // New customer inline fields
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerCity, setNewCustomerCity] = useState("");

  // Service selection
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  // Service specific fields
  const [issueDate, setIssueDate] = useState<string>("");
  const [travelDate, setTravelDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");
  const [sector, setSector] = useState("");
  const [flightNo, setFlightNo] = useState("");
  const [pnr, setPnr] = useState("");
  const [flightTime, setFlightTime] = useState("");
  const [portal, setPortal] = useState("");
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [passengerNames, setPassengerNames] = useState("");

  // Passport / Visa fields
  const [passportNo, setPassportNo] = useState("");
  const [submissionDate, setSubmissionDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  // Status & Delay
  const [status, setStatus] = useState<string>("Confirmed");
  const [alertNotes, setAlertNotes] = useState("");

  // Financials
  const [totalAmount, setTotalAmount] = useState<number | string>(0);
  const [paidAmount, setPaidAmount] = useState<number | string>(0);
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form
  useEffect(() => {
    if (booking) {
      // Editing mode
      setCustomerMode("existing");
      setSelectedCustomerId(booking.customerId);
      setSelectedServiceId(booking.serviceTypeId);
      setIssueDate(booking.issueDate ? booking.issueDate.substring(0, 10) : "");
      setTravelDate(booking.travelDate ? booking.travelDate.substring(0, 10) : "");
      setReturnDate(booking.returnDate ? booking.returnDate.substring(0, 10) : "");
      setSector(booking.sector || "");
      setFlightNo(booking.flightNo || "");
      setPnr(booking.pnr || "");
      setFlightTime(booking.flightTime || "");
      setPortal(booking.portal || "");
      setPassengerCount(booking.passengerCount || 1);
      setPassengerNames(booking.passengerNames || "");
      setPassportNo(booking.passportNo || "");
      setSubmissionDate(booking.submissionDate ? booking.submissionDate.substring(0, 10) : "");
      setExpiryDate(booking.expiryDate ? booking.expiryDate.substring(0, 10) : "");
      setStatus(booking.status || "Confirmed");
      setAlertNotes(booking.alertNotes || "");
      setTotalAmount(booking.totalAmount);
      setPaidAmount(booking.paidAmount);
      setDueDate(booking.dueDate ? booking.dueDate.substring(0, 10) : "");
      setNotes(booking.notes || "");
    } else {
      // Create mode
      const defaultService = serviceTypes.find((s) => s.code === "FLIGHT") || serviceTypes[0];
      setSelectedServiceId(defaultService?.id || "");
      if (preselectedCustomerId) {
        setSelectedCustomerId(preselectedCustomerId);
        setCustomerMode("existing");
      } else {
        setSelectedCustomerId(customers[0]?.id || "");
      }
      const today = new Date().toISOString().substring(0, 10);
      setIssueDate(today);
      setTravelDate("");
      setReturnDate("");
      setSector("");
      setFlightNo("");
      setPnr("");
      setFlightTime("");
      setPortal("");
      setPassengerCount(1);
      setPassengerNames("");
      setPassportNo("");
      setSubmissionDate("");
      setExpiryDate("");
      setStatus("Confirmed");
      setAlertNotes("");
      setTotalAmount(0);
      setPaidAmount(0);
      setDueDate("");
      setNotes("");
      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setNewCustomerCity("");
    }
  }, [booking, serviceTypes, customers, preselectedCustomerId, isOpen]);

  if (!isOpen) return null;

  // Identify current selected service type
  const activeService = serviceTypes.find((s) => s.id === selectedServiceId);
  const isFlightService =
    !activeService ||
    activeService.code === "FLIGHT" ||
    activeService.name.toLowerCase().includes("flight") ||
    activeService.name.toLowerCase().includes("ticket");
  const isPassportOrVisa =
    activeService?.code === "PASSPORT" ||
    activeService?.code === "VISA" ||
    activeService?.name.toLowerCase().includes("passport") ||
    activeService?.name.toLowerCase().includes("visa");

  // Calculated balance
  const numTotal = Number(totalAmount) || 0;
  const numPaid = Number(paidAmount) || 0;
  const calculatedBalance = Math.max(0, numTotal - numPaid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let finalCustomerId = selectedCustomerId;

      // Create new customer if needed
      if (customerMode === "new") {
        if (!newCustomerName.trim() || !newCustomerPhone.trim()) {
          throw new Error("Customer / Party Name and Mobile number are required.");
        }
        const custRes = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newCustomerName.trim(),
            phone: newCustomerPhone.trim(),
            email: newCustomerEmail.trim() || null,
            city: newCustomerCity.trim() || null,
          }),
        });
        if (!custRes.ok) {
          const errData = await custRes.json();
          throw new Error(errData.error || "Failed to create customer");
        }
        const createdCustomer = await custRes.json();
        finalCustomerId = createdCustomer.id;
      }

      if (!finalCustomerId) {
        throw new Error("Please select or add a customer/party.");
      }
      if (!selectedServiceId) {
        throw new Error("Please select a service type.");
      }

      const payload = {
        customerId: finalCustomerId,
        serviceTypeId: selectedServiceId,
        issueDate: issueDate || null,
        travelDate: travelDate || null,
        returnDate: returnDate || null,
        sector: sector.trim() || null,
        flightNo: flightNo.trim() || null,
        pnr: pnr.trim() ? pnr.trim().toUpperCase() : null,
        flightTime: flightTime.trim() || null,
        portal: portal.trim() || null,
        passengerCount: Number(passengerCount) || 1,
        passengerNames: passengerNames.trim() || null,
        passportNo: passportNo.trim() || null,
        submissionDate: submissionDate || null,
        expiryDate: expiryDate || null,
        status,
        alertNotes: alertNotes.trim() || null,
        totalAmount: numTotal,
        paidAmount: numPaid,
        balanceAmount: calculatedBalance,
        dueDate: dueDate || null,
        notes: notes.trim() || null,
      };

      const url = booking ? `/api/bookings/${booking.id}` : "/api/bookings";
      const method = booking ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save booking");
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              {isFlightService ? <Plane size={20} /> : <FileText size={20} />}
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                {booking ? `Edit Ticket / Service (${booking.bookingNo})` : "Add New Customer / Ticket"}
              </h2>
              <p className="text-xs text-slate-400">
                {isFlightService ? "Flight ticket entry with PNR & due date alerts" : "Service booking & customer ledger"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: Service Type (Dynamic Dropdown) */}
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-sky-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Compass size={15} className="text-sky-600" />
                Select Service Type *
              </label>
              <button
                type="button"
                onClick={onOpenManageServices}
                className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline flex items-center gap-1"
              >
                + Add / Manage Services
              </button>
            </div>

            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              required
              className="w-full p-2.5 bg-white border border-sky-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              {serviceTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.description ? `— (${st.description})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* SECTION 2: Customer / Party Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <User size={15} className="text-slate-600" />
                Customer / Party *
              </label>

              {!booking && (
                <div className="flex rounded-lg bg-slate-200 p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setCustomerMode("existing")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      customerMode === "existing" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600"
                    }`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode("new")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      customerMode === "new" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600"
                    }`}
                  >
                    + New Customer
                  </button>
                </div>
              )}
            </div>

            {customerMode === "existing" ? (
              <div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  disabled={!!booking}
                  required
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
                >
                  <option value="">-- Choose Customer / Party --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — ({c.phone}) {c.city ? `• ${c.city}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-slate-500 text-xs mb-1">Party / Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammed Rashid / Sky Enterprises"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-xs mb-1">Mobile No (for WhatsApp Alerts) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +91 98470 12345"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-xs mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. client@gmail.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-xs mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Calicut / Dubai"
                    value={newCustomerCity}
                    onChange={(e) => setNewCustomerCity(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Dynamic Service Fields */}
          {isFlightService ? (
            <div className="space-y-4 border border-sky-100 rounded-xl p-4 bg-sky-50/30">
              <div className="font-bold text-sky-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Plane size={15} className="text-sky-600" />
                Flight Ticket Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Ticket Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-rose-600 font-bold text-xs mb-1">
                    Travel / Departure Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full p-2 bg-white border border-rose-300 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Return Date (Optional)</label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 text-xs font-semibold mb-1">
                    Sector / Route / Narration *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CCJ (Calicut) - DXB (Dubai) or Narration"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Flight Number</label>
                  <input
                    type="text"
                    placeholder="e.g. EK 532 / IX 343 / 6E 123"
                    value={flightNo}
                    onChange={(e) => setFlightNo(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">
                    Airline PNR *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Z7K9PL"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono font-bold tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Flight Departure Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:30 AM / 22:15"
                    value={flightTime}
                    onChange={(e) => setFlightTime(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">
                    Issued From Portal / Supplier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amadeus / Akbar / Galileo / Indigo"
                    value={portal}
                    onChange={(e) => setPortal(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">No. of Passengers (Pax)</label>
                  <input
                    type="number"
                    min="1"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Passenger Names</label>
                  <input
                    type="text"
                    placeholder="e.g. Mohammed Rashid, Aysha Rashid"
                    value={passengerNames}
                    onChange={(e) => setPassengerNames(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <FileText size={15} className="text-slate-600" />
                {activeService?.name || "Service"} Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Passport / Doc Number</label>
                  <input
                    type="text"
                    placeholder="e.g. Z5892341"
                    value={passportNo}
                    onChange={(e) => setPassportNo(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Submission Date</label>
                  <input
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">
                    Expiry / Validity Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Service Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Tatkal passport renewal / 30 days Dubai visit visa"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          )}

          {/* SECTION 4: Status & Flight Delay / Postponed Alerts */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <AlertCircle size={15} className="text-amber-500" />
              Service Status & Delay / Postpone Alerts
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Confirmed">✅ Confirmed</option>
                  <option value="Flight Delayed">⚠️ Flight Delayed</option>
                  <option value="Rescheduled / Postponed">🔄 Rescheduled / Postponed</option>
                  <option value="In Process">⏳ In Process</option>
                  <option value="Completed">🏁 Completed</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 text-xs font-semibold mb-1">
                  Delay / Postpone Narration (Included in WhatsApp alert)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delayed by 2 hours. New departure: 16:30"
                  value={alertNotes}
                  onChange={(e) => setAlertNotes(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Financials & Due Date */}
          <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-3">
            <div className="font-bold text-emerald-900 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <CreditCard size={15} className="text-emerald-600" />
              Pricing, Payment & Due Date
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Total Fare / Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Balance Due (₹)</label>
                <div
                  className={`p-2 bg-white border rounded-lg font-bold ${
                    calculatedBalance > 0 ? "border-rose-300 text-rose-600" : "border-emerald-300 text-emerald-700"
                  }`}
                >
                  ₹{calculatedBalance.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Narration / Notes */}
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">Office Notes / Narration</label>
            <textarea
              rows={2}
              placeholder="e.g. Client requested 30kg baggage allowance. Wheelchair assistance booked."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Saving..." : booking ? "Update Booking" : "Create Ticket / Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

