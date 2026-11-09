"use client";

import React, { useState } from "react";
import Logo from "./Logo";
import { AgencySettings } from "@/lib/types";
import {
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  KeyRound,
  Lock,
  User,
} from "lucide-react";

interface AgencySettingsViewProps {
  settings: AgencySettings;
  onSaved: (updated: AgencySettings) => void;
  currentUser?: { id: string; username: string; name?: string } | null;
}

export default function AgencySettingsView({
  settings,
  onSaved,
  currentUser,
}: AgencySettingsViewProps) {
  const [formData, setFormData] = useState<AgencySettings>(settings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security Credentials state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(currentUser?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credSuccess, setCredSuccess] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);

  const handleChange = (field: keyof AgencySettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange("logoUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      const updated = await res.json();
      onSaved(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(false);

    if (!currentPassword) {
      setCredError("Please enter your current password to authorize changes.");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setCredError("New password and confirmation password do not match.");
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setCredError("New password must be at least 4 characters.");
      return;
    }

    setCredSaving(true);
    try {
      const res = await fetch("/api/auth/change-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update credentials");
      }

      setCredSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setCredSuccess(false), 4000);
    } catch (err: unknown) {
      setCredError(err instanceof Error ? err.message : "Error updating security credentials");
    } finally {
      setCredSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo logoUrl={formData.logoUrl} agencyName={formData.agencyName} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{formData.agencyName || "Travels Office"}</h2>
            <p className="text-xs text-slate-500">
              Customize your office name, login security, logo, contact information, and invoice header
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-sm transition active:scale-95 disabled:opacity-50"
        >
          {saving ? <Save size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Agency settings and invoice branding updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: SECURITY & LOGIN CREDENTIALS (Requested: Change ID & Pass)     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound size={18} className="text-sky-600" />
            Security & Login Credentials (Change ID & Password)
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
            <ShieldCheck size={13} /> Active Admin
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Protect your travels office data. You can change your Login ID (Username) and Password here.
        </p>

        {credSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Login ID and Password updated successfully! Future logins will use these new credentials.</span>
          </div>
        )}

        {credError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{credError}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Login ID / Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. traveladmin or your email"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-700 mb-1">
                Current Password (Required to authorize change) *
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-rose-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (Optional, leave blank to keep same)
              </label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Min 4 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={credSaving || !currentPassword}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck size={15} />
              <span>{credSaving ? "Updating Security..." : "Update ID & Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: LOGO & BRANDING                                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon size={18} className="text-sky-600" />
          Agency Logo & Branding
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Logo Image (Upload File or Enter URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Or Paste Direct Logo Image URL / Path
              </label>
              <input
                type="text"
                placeholder="e.g. /logo.png or https://example.com/logo.png"
                value={formData.logoUrl || ""}
                onChange={(e) => handleChange("logoUrl", e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono"
              />
            </div>

            <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-800 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <HelpCircle size={14} /> Logo Replacement Tip:
              </span>
              <p>
                You can upload your logo right here, or place your logo image in the{" "}
                <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-sky-900">public/logo.png</code>{" "}
                folder and set the URL to <code className="bg-sky-100 px-1 py-0.5 rounded font-mono text-sky-900">/logo.png</code>.
              </p>
            </div>
          </div>

          {/* Logo Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Live Logo Preview
            </span>
            <Logo logoUrl={formData.logoUrl} agencyName={formData.agencyName} size="lg" />
            <div className="mt-3 font-bold text-slate-800 text-sm">
              {formData.agencyName || "Your Agency Name"}
            </div>
            <div className="text-xs text-slate-400">{formData.tagline || "Tagline"}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: AGENCY DETAILS & INVOICE HEADERS                               */}
      {/* ========================================================================= */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 size={18} className="text-sky-600" />
            Travel Agency Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Travel Agency / Office Name *
              </label>
              <input
                type="text"
                required
                value={formData.agencyName}
                onChange={(e) => handleChange("agencyName", e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline || ""}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="e.g. Your Trusted Travel Partner"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Office Phone Number</label>
              <input
                type="text"
                value={formData.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp Alert Number</label>
              <input
                type="text"
                value={formData.whatsapp || ""}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="e.g. bookings@myagency.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">GSTIN / Tax ID</label>
              <input
                type="text"
                value={formData.taxNumber || ""}
                onChange={(e) => handleChange("taxNumber", e.target.value)}
                placeholder="e.g. GSTIN: 32AAAAA0000A1Z5"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Physical Office Address</label>
              <textarea
                rows={2}
                value={formData.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Full address printed on customer invoices"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* INVOICE & PAYMENT DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-600" />
            Invoice Bank Details & Terms
          </h3>

          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Bank & UPI Details (Printed on Invoices for Customer Payments)
              </label>
              <textarea
                rows={2}
                value={formData.bankDetails || ""}
                onChange={(e) => handleChange("bankDetails", e.target.value)}
                placeholder="Account Name, A/C No, Bank, IFSC Code, UPI ID"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Terms, Airport Reporting & Guidelines (Printed on Invoices)
              </label>
              <textarea
                rows={4}
                value={formData.termsConditions || ""}
                onChange={(e) => handleChange("termsConditions", e.target.value)}
                placeholder="Reporting time guidelines, baggage rules, visa validity notices"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {saving ? <Save size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Save Office Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
