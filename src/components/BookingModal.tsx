"use client";

import React, { useState, useEffect } from "react";
import { Booking, Customer, ServiceType } from "@/lib/types";
import {
  X,
  Plane,
  Train,
  Bus,
  Building,
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
  Check,
  Loader2,
} from "lucide-react";
import {
  getServiceFieldConfig,
  getServiceDisplayDescription,
  formatFlightTrainTime,
  formatTime12h,
  formatTime24h,
  TRAIN_FLIGHT_TIME_PRESETS,
  extractCustomFieldValues,
  getCleanNotes,
  serializeCustomFieldValues,
} from "@/lib/service-config";
import PhoneInput from "./PhoneInput";

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
  const [agentName, setAgentName] = useState("");
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

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
      setNotes(getCleanNotes(booking.notes));

      // Customer info prefilling
      if (booking.customer) {
        setNewCustomerName(booking.customer.name || "");
        setNewCustomerPhone(booking.customer.phone || "");
        setNewCustomerEmail(booking.customer.email || "");
        setNewCustomerCity(booking.customer.city || "");
      }

      // Populate custom fields intelligently from both notes and core fields
      const extracted = extractCustomFieldValues(booking.notes);
      const mergedCustom: Record<string, string> = { ...extracted };

      // Agent Name extraction
      const agentFromCustom = Object.entries(mergedCustom).find(([k]) => {
        const lk = k.toLowerCase();
        return lk.includes("agent") || lk.includes("staff") || lk.includes("issued by") || lk.includes("booked by");
      })?.[1];
      const matchAgent = booking.notes?.match(/(?:Agent|Staff|Issued By|Booked By):\s*([^\n\r,;]+)/i);
      setAgentName(agentFromCustom || matchAgent?.[1]?.trim() || "");

      const currentService = serviceTypes.find((s) => s.id === booking.serviceTypeId) || booking.serviceType;
      const svcConfig = getServiceFieldConfig(currentService);

      if (svcConfig.customFields && svcConfig.customFields.length > 0) {
        for (const f of svcConfig.customFields) {
          if (mergedCustom[f.name] !== undefined && mergedCustom[f.name] !== "") continue;
          const low = f.name.toLowerCase();

          if ((low.includes("flight no") || low.includes("train no") || low.includes("bus no") || low.includes("number")) && booking.flightNo) {
            mergedCustom[f.name] = booking.flightNo;
          } else if ((low.includes("pnr") || low.includes("arn") || low.includes("reference") || low.includes("ref")) && booking.pnr) {
            mergedCustom[f.name] = booking.pnr;
          } else if (low.includes("passport") && booking.passportNo) {
            mergedCustom[f.name] = booking.passportNo;
          } else if ((low.includes("time") || low.includes("departure time") || low.includes("reporting")) && booking.flightTime) {
            mergedCustom[f.name] = booking.flightTime;
          } else if (low.includes("expiry") && booking.expiryDate) {
            mergedCustom[f.name] = booking.expiryDate.substring(0, 10);
          } else if (low.includes("submission") && booking.submissionDate) {
            mergedCustom[f.name] = booking.submissionDate.substring(0, 10);
          } else if ((low.includes("return") || low.includes("check-out")) && booking.returnDate) {
            mergedCustom[f.name] = booking.returnDate.substring(0, 10);
          } else if ((low.includes("date") || low.includes("travel") || low.includes("journey")) && booking.travelDate) {
            mergedCustom[f.name] = booking.travelDate.substring(0, 10);
          } else if ((low.includes("route") || low.includes("sector") || low.includes("destination") || low.includes("hotel") || low.includes("station")) && booking.sector) {
            mergedCustom[f.name] = booking.sector;
          } else if ((low.includes("portal") || low.includes("supplier") || low.includes("booked")) && booking.portal) {
            mergedCustom[f.name] = booking.portal;
          }
        }
      }

      setCustomFieldValues(mergedCustom);
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
      setNotes("");
      setAgentName("");
      setCustomFieldValues({});
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

      let resolvedSector = sector.trim();
      let resolvedFlightNo = flightNo.trim();
      let resolvedPnr = pnr.trim() ? pnr.trim().toUpperCase() : "";
      let resolvedTravelDate = travelDate;
      let resolvedFlightTime = flightTime.trim() ? formatFlightTrainTime(flightTime) : "";
      let resolvedPassportNo = passportNo.trim();
      let resolvedSubmissionDate = submissionDate;
      let resolvedExpiryDate = expiryDate;
      let resolvedPortal = portal.trim();

      // Automatically map any filled custom fields to core fields:
      for (const [key, rawVal] of Object.entries(customFieldValues)) {
        const val = String(rawVal).trim();
        if (!val) continue;
        const low = key.toLowerCase();
        if (low.includes("passport number") || low.includes("passport no")) {
          resolvedPassportNo = val;
        } else if (low.includes("submission date") || low.includes("applied date")) {
          resolvedSubmissionDate = val;
        } else if (low.includes("expiry date") || low.includes("validity date")) {
          resolvedExpiryDate = val;
        } else if (low.includes("time") || low.includes("reporting") || low.includes("departure time")) {
          resolvedFlightTime = formatFlightTrainTime(val);
        } else if (low.includes("date") && !low.includes("expiry") && !low.includes("submission") && !low.includes("return")) {
          resolvedTravelDate = val;
        } else if (low.includes("pnr") || low.includes("arn") || low.includes("reference") || low.includes("file number") || low.includes("confirmation")) {
          resolvedPnr = val.toUpperCase();
        } else if (low.includes("flight no") || low.includes("train no") || low.includes("bus no") || low.includes("package code") || low.includes("ticket no")) {
          resolvedFlightNo = val;
        } else if (low.includes("sector") || low.includes("route") || low.includes("destination") || low.includes("hotel") || low.includes("package") || low.includes("country")) {
          resolvedSector = val;
        } else if (low.includes("portal") || low.includes("supplier") || low.includes("booked from") || low.includes("issue portal") || low.includes("desk")) {
          resolvedPortal = val;
        }
      }

      // Automatically capture or propagate Agent / Staff Name
      let finalAgent = agentName.trim();
      if (!finalAgent) {
        for (const [k, v] of Object.entries(customFieldValues)) {
          if (/agent|staff|booked by|issued by/i.test(k) && v && String(v).trim()) {
            finalAgent = String(v).trim();
            break;
          }
        }
      }
      if (finalAgent) {
        customFieldValues["Agent Name"] = finalAgent;
      }

      if (!resolvedSector) {
        resolvedSector = activeService?.name || "Travel Service";
      }
      if (!resolvedPnr) {
        resolvedPnr = `CCJ-${Date.now().toString().slice(-6)}`;
      }
      if (!resolvedTravelDate) {
        resolvedTravelDate = issueDate || new Date().toISOString().substring(0, 10);
      }

      const payload = {
        customerId: finalCustomerId,
        serviceTypeId: selectedServiceId,
        issueDate: issueDate || null,
        travelDate: resolvedTravelDate || null,
        returnDate: returnDate || null,
        sector: resolvedSector || null,
        flightNo: resolvedFlightNo || null,
        pnr: resolvedPnr || null,
        flightTime: resolvedFlightTime || null,
        portal: resolvedPortal || null,
        passengerCount: Number(passengerCount) || 1,
        passengerNames: passengerNames.trim() || null,
        passportNo: resolvedPassportNo || null,
        submissionDate: resolvedSubmissionDate || null,
        expiryDate: resolvedExpiryDate || null,
        status,
        alertNotes: alertNotes.trim() || null,
        totalAmount: numTotal,
        paidAmount: numPaid,
        balanceAmount: calculatedBalance,
        dueDate: dueDate || null,
        notes: serializeCustomFieldValues(notes, customFieldValues) || null,
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-3xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 dark:bg-slate-950 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
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
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: Service Type (Dynamic Dropdown) */}
          <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-sky-950 dark:text-sky-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Compass size={15} className="text-sky-600" />
                Select Service Type *
              </label>
              <button
                type="button"
                onClick={onOpenManageServices}
                className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-300 underline flex items-center gap-1"
              >
                + Add / Manage Services
              </button>
            </div>

            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              required
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500"
            >
              {serviceTypes.map((st) => {
                const desc = getServiceDisplayDescription(st);
                return (
                  <option key={st.id} value={st.id}>
                    {st.name} {desc ? `— (${desc})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* SECTION 2: Customer / Party Info */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <User size={15} className="text-slate-600 dark:text-slate-400" />
                Customer / Party *
              </label>

              {!booking && (
                <div className="flex rounded-lg bg-slate-200 dark:bg-slate-700 p-0.5 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setCustomerMode("existing")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      customerMode === "existing" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold" : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Select Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode("new")}
                    className={`px-2.5 py-1 rounded-md transition ${
                      customerMode === "new" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold" : "text-slate-600 dark:text-slate-300"
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
                  className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/50"
                >
                  <option value="">-- Choose Customer / Party --</option>
                  {booking?.customer && !customers.some((c) => c.id === booking.customerId) && (
                    <option value={booking.customerId}>
                      {booking.customer.name} — ({booking.customer.phone}) {booking.customer.city ? `• ${booking.customer.city}` : ""}
                    </option>
                  )}
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
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Party / Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammed Rashid / Sky Enterprises"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Mobile No (for WhatsApp Alerts) *</label>
                  <PhoneInput
                    value={newCustomerPhone}
                    onChange={setNewCustomerPhone}
                    required
                    placeholder="e.g. 98470 12345"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. client@gmail.com"
                    value={newCustomerEmail}
                    onChange={(e) => setNewCustomerEmail(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Calicut / Dubai"
                    value={newCustomerCity}
                    onChange={(e) => setNewCustomerCity(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: Dynamic Service Fields */}
          {(() => {
            const config = getServiceFieldConfig(activeService);
            const hasCustomFields = Boolean(config.customFields && config.customFields.length > 0);

            return (
              <div className="space-y-4 border border-sky-100 rounded-xl p-4 bg-sky-50/30">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sky-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    {config.template === "flight" ? (
                      <Plane size={15} className="text-sky-600" />
                    ) : config.template === "train" ? (
                      <Train size={15} className="text-sky-600" />
                    ) : config.template === "bus" ? (
                      <Bus size={15} className="text-sky-600" />
                    ) : config.template === "hotel" ? (
                      <Building size={15} className="text-sky-600" />
                    ) : (
                      <FileText size={15} className="text-sky-600" />
                    )}
                    <span>{config.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                    {activeService?.name || config.template}
                  </span>
                </div>

                {hasCustomFields ? (
                  /* RENDER CONFIGURED FIELDS AS NORMAL FORM FIELDS */
                  <div className="space-y-4">
                    {/* Common Issue & Booking Date */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                          <Calendar size={13} className="text-sky-600 dark:text-sky-400" />
                          Booking / Issue Date
                        </label>
                        <input
                          type="date"
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                        />
                      </div>
                    </div>

                    {/* Clean Form Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {config.customFields!.map((fld) => {
                        const val = customFieldValues[fld.name] || "";

                        if (fld.type === "time") {
                          return (
                            <div key={fld.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1">
                                  <Clock size={13} className="text-sky-600 dark:text-sky-400" />
                                  {fld.name}
                                  {fld.required && <span className="text-rose-500">*</span>}
                                </label>
                                {val && (
                                  <span className="text-[11px] font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                                    🕒 {val} hrs
                                  </span>
                                )}
                              </div>

                              <div className="space-y-2">
                                <input
                                  type="time"
                                  value={formatTime24h(val)}
                                  onChange={(e) => {
                                    const t24 = e.target.value;
                                    setCustomFieldValues((prev) => ({ ...prev, [fld.name]: t24 }));
                                    if (!flightTime) setFlightTime(t24);
                                  }}
                                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold text-xs cursor-pointer focus:ring-2 focus:ring-sky-500"
                                />

                                {/* 24-hour Train & Flight Time Presets (e.g. 22:00) */}
                                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                                  <span className="text-slate-400 dark:text-slate-500 text-[10px] mr-0.5">24h Presets:</span>
                                  {TRAIN_FLIGHT_TIME_PRESETS.map((t) => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => {
                                        setCustomFieldValues((prev) => ({ ...prev, [fld.name]: t }));
                                        if (!flightTime) setFlightTime(t);
                                      }}
                                      className={`px-1.5 py-0.5 rounded border transition font-mono ${
                                        val === t
                                          ? "bg-sky-600 text-white border-sky-600 font-bold"
                                          : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-700"
                                      }`}
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        if (fld.type === "date") {
                          return (
                            <div key={fld.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1">
                                  <Calendar size={13} className="text-sky-600 dark:text-sky-400" />
                                  {fld.name}
                                  {fld.required && <span className="text-rose-500">*</span>}
                                </label>
                                <div className="flex items-center gap-1 text-[10px]">
                                  {[
                                    { label: "Today", days: 0 },
                                    { label: "Tomorrow", days: 1 },
                                    { label: "+3d", days: 3 },
                                    { label: "+7d", days: 7 },
                                  ].map((p) => (
                                    <button
                                      key={p.label}
                                      type="button"
                                      onClick={() => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + p.days);
                                        const dateStr = d.toISOString().substring(0, 10);
                                        setCustomFieldValues((prev) => ({ ...prev, [fld.name]: dateStr }));
                                        if (!travelDate) setTravelDate(dateStr);
                                      }}
                                      className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-slate-600 dark:text-slate-300 font-medium"
                                    >
                                      {p.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input
                                type="date"
                                required={fld.required}
                                value={val}
                                onChange={(e) => {
                                  const dateVal = e.target.value;
                                  setCustomFieldValues((prev) => ({ ...prev, [fld.name]: dateVal }));
                                  const low = fld.name.toLowerCase();
                                  if (low.includes("expiry")) {
                                    setExpiryDate(dateVal);
                                  } else if (low.includes("submission") || low.includes("applied")) {
                                    setSubmissionDate(dateVal);
                                  } else {
                                    setTravelDate(dateVal);
                                  }
                                }}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          );
                        }

                        if (fld.type === "select") {
                          return (
                            <div key={fld.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                              <label className="text-slate-700 dark:text-slate-200 text-xs font-bold">
                                {fld.name}
                                {fld.required && <span className="text-rose-500"> *</span>}
                              </label>
                              <select
                                required={fld.required}
                                value={val}
                                onChange={(e) => {
                                  const selVal = e.target.value;
                                  setCustomFieldValues((prev) => ({ ...prev, [fld.name]: selVal }));
                                  const low = fld.name.toLowerCase();
                                  if (low.includes("portal") || low.includes("supplier") || low.includes("desk") || low.includes("booked")) {
                                    setPortal(selVal);
                                  }
                                }}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500"
                              >
                                <option value="">-- Select {fld.name} --</option>
                                {(fld.options || []).map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        if (fld.type === "number") {
                          return (
                            <div key={fld.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                              <label className="text-slate-700 dark:text-slate-200 text-xs font-bold">
                                {fld.name}
                                {fld.required && <span className="text-rose-500"> *</span>}
                              </label>
                              <input
                                type="number"
                                required={fld.required}
                                placeholder={fld.placeholder || `Enter ${fld.name}`}
                                value={val}
                                onChange={(e) =>
                                  setCustomFieldValues((prev) => ({ ...prev, [fld.name]: e.target.value }))
                                }
                                className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500"
                              />
                            </div>
                          );
                        }

                        // Default Text Field
                        return (
                          <div key={fld.id} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1.5">
                            <label className="text-slate-700 dark:text-slate-200 text-xs font-bold">
                              {fld.name}
                              {fld.required && <span className="text-rose-500"> *</span>}
                            </label>
                            <input
                              type="text"
                              required={fld.required}
                              placeholder={fld.placeholder || `Enter ${fld.name}`}
                              value={val}
                              onChange={(e) => {
                                const textVal = e.target.value;
                                setCustomFieldValues((prev) => ({ ...prev, [fld.name]: textVal }));
                                const low = fld.name.toLowerCase();
                                if (low.includes("pnr") || low.includes("arn") || low.includes("reference") || low.includes("file number")) {
                                  setPnr(textVal.toUpperCase());
                                }
                                if (low.includes("sector") || low.includes("route") || low.includes("destination") || low.includes("hotel") || low.includes("package")) {
                                  setSector(textVal);
                                }
                                if (low.includes("flight no") || low.includes("train no") || low.includes("bus no") || low.includes("package code") || low.includes("ticket no")) {
                                  setFlightNo(textVal);
                                }
                                if (low.includes("portal") || low.includes("supplier") || low.includes("booked from") || low.includes("issue portal") || low.includes("desk")) {
                                  setPortal(textVal);
                                }
                                if (low.includes("agent") || low.includes("staff") || low.includes("issued by") || low.includes("booked by")) {
                                  setAgentName(textVal);
                                }
                              }}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Portal & Agent Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                          Issued From Portal / Supplier
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Al-Rayan, Alhind, Galileo, Indigo Direct"
                          value={portal}
                          onChange={(e) => setPortal(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                          Agent / Staff Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rashid, Sameer, Admin"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    {/* Passenger count and names if enabled */}
                    {config.hasPax && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">No. of Passengers (Pax)</label>
                          <input
                            type="number"
                            min="1"
                            value={passengerCount}
                            onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">Passenger Names</label>
                          <input
                            type="text"
                            placeholder="e.g. Mohammed Rashid, Aysha Rashid"
                            value={passengerNames}
                            onChange={(e) => setPassengerNames(e.target.value)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* LEGACY FALLBACK FOR SERVICES WITHOUT EXPLICIT CUSTOM FIELDS */
                  <div className="space-y-4">
                    {/* Dates & Calendar Shortcuts */}
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-sky-100 dark:border-slate-700 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                          <Calendar size={14} className="text-sky-600 dark:text-sky-400" />
                          {config.dateLabel} *
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-1">Quick Pick:</span>
                          {[
                            { label: "Today", days: 0 },
                            { label: "Tomorrow", days: 1 },
                            { label: "+3 Days", days: 3 },
                            { label: "+7 Days", days: 7 },
                          ].map((p) => (
                            <button
                              key={p.label}
                              type="button"
                              onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() + p.days);
                                setTravelDate(d.toISOString().substring(0, 10));
                              }}
                              className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-sky-100 dark:hover:bg-sky-900 hover:text-sky-800 dark:hover:text-sky-200 text-slate-600 dark:text-slate-300 rounded transition"
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">Issue / Booking Date</label>
                          <input
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-rose-600 dark:text-rose-400 font-bold text-[11px] mb-1">
                            {config.dateLabel} *
                          </label>
                          <input
                            type="date"
                            required
                            value={travelDate}
                            onChange={(e) => setTravelDate(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-rose-500 text-xs"
                          />
                        </div>

                        {config.hasReturnDate ? (
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">Return / End Date (Optional)</label>
                            <input
                              type="date"
                              value={returnDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-slate-500 dark:text-slate-400 text-[11px] mb-1">Agent / Staff Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Rashid, Admin"
                              value={agentName}
                              onChange={(e) => setAgentName(e.target.value)}
                              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Route & Number Identification */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                          {config.routeLabel} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={config.routePlaceholder}
                          value={sector}
                          onChange={(e) => setSector(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                          {config.numberLabel}
                        </label>
                        <input
                          type="text"
                          placeholder={config.numberPlaceholder}
                          value={flightNo}
                          onChange={(e) => setFlightNo(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-semibold"
                        />
                      </div>
                    </div>

                    {/* PNR & TIME SETTER */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                          {config.pnrLabel} *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={config.pnrPlaceholder}
                          value={pnr}
                          onChange={(e) => setPnr(e.target.value.toUpperCase())}
                          className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold tracking-wider"
                        />
                      </div>

                      {/* TIME PICKER (Flight Time / Train Time in 24h format) */}
                      {config.hasTime && (
                        <div className="sm:col-span-2 p-2.5 bg-white dark:bg-slate-800 border border-sky-200 dark:border-slate-700 rounded-xl space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1">
                              <Clock size={13} className="text-sky-600 dark:text-sky-400" />
                              {config.timeLabel}
                            </label>
                            {flightTime && (
                              <span className="text-xs font-mono font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
                                🕒 {flightTime} hrs
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="time"
                              value={formatTime24h(flightTime)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFlightTime(val ? formatFlightTrainTime(val) : "");
                              }}
                              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-sky-500 cursor-pointer"
                            />

                            {/* 24-hour Presets */}
                            <div className="flex flex-wrap items-center gap-1 text-[10px]">
                              {TRAIN_FLIGHT_TIME_PRESETS.map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setFlightTime(t)}
                                  className={`px-1.5 py-1 rounded border transition font-mono ${
                                    flightTime === t
                                      ? "bg-sky-600 text-white border-sky-600 font-bold"
                                      : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-sky-50 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  {t}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {!config.hasTime && config.hasReturnDate && (
                        <div>
                          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                            {config.portalLabel}
                          </label>
                          <input
                            type="text"
                            placeholder={config.portalLabel}
                            value={portal}
                            onChange={(e) => setPortal(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>
                      )}
                    </div>

                    {/* Portal & Agent Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                          {config.portalLabel || "Issued From Portal / Supplier"}
                        </label>
                        <input
                          type="text"
                          placeholder={config.portalLabel || "e.g. Al-Rayan, Alhind, Galileo, Direct Desk"}
                          value={portal}
                          onChange={(e) => setPortal(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                          Agent / Staff Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Rashid, Sameer, Admin"
                          value={agentName}
                          onChange={(e) => setAgentName(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>

                    {/* Passport & Visa specific extra fields */}
                    {(config.hasPassportField || config.hasSubmissionDates) && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">Passport / Doc Number</label>
                          <input
                            type="text"
                            placeholder="e.g. Z5892341"
                            value={passportNo}
                            onChange={(e) => setPassportNo(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">Submission Date</label>
                          <input
                            type="date"
                            value={submissionDate}
                            onChange={(e) => setSubmissionDate(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">Expiry / Validity Date</label>
                          <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Passenger count and names */}
                    {config.hasPax && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">No. of Passengers (Pax)</label>
                          <input
                            type="number"
                            min="1"
                            value={passengerCount}
                            onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">Passenger Names</label>
                          <input
                            type="text"
                            placeholder="e.g. Mohammed Rashid, Aysha Rashid"
                            value={passengerNames}
                            onChange={(e) => setPassengerNames(e.target.value)}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* SECTION 4: Status & Flight Delay / Postponed Alerts */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-3">
            <div className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <AlertCircle size={15} className="text-amber-500" />
              Service Status, Agent & Delay Alerts
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-sky-500 text-xs"
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
                <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                  Agent / Staff Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rashid, Admin"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">
                  Delay / Schedule Notice
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delayed by 2 hours"
                  value={alertNotes}
                  onChange={(e) => setAlertNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Financials & Due Date */}
          <div className="p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/30 space-y-3">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <CreditCard size={15} className="text-emerald-600 dark:text-emerald-400" />
              Pricing, Payment & Due Date
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">Total Fare / Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-emerald-700 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">Balance Due (₹)</label>
                <div
                  className={`p-2 bg-white dark:bg-slate-800 border rounded-lg font-bold ${
                    calculatedBalance > 0 ? "border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400" : "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  ₹{calculatedBalance.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Narration / Notes */}
          <div>
            <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold mb-1">Office Notes / Narration</label>
            <textarea
              rows={2}
              placeholder="e.g. Client requested 30kg baggage allowance. Wheelchair assistance booked."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{booking ? "Updating..." : "Creating..."}</span>
              </>
            ) : booking ? (
              "Update Booking"
            ) : (
              "Create Ticket / Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

