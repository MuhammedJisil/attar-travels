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
  Database,
  Upload,
  Download,
  FileJson,
  Archive,
  RefreshCw,
  Pencil,
  X,
  Eye,
  EyeOff,
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
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Active section currently in edit mode: null = read-only overview
  const [editSection, setEditSection] = useState<"profile" | "payment" | "security" | "logo" | null>(null);

  // Security Credentials state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState(currentUser?.username || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credSuccess, setCredSuccess] = useState(false);
  const [credError, setCredError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Backup & Restore state
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePayload, setRestorePayload] = useState<any | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Live Database Info state
  const [dbInfo, setDbInfo] = useState<{
    host?: string;
    database?: string;
    envSource?: string;
    provider?: string;
    counts?: { customers: number; bookings: number };
  } | null>(null);

  React.useEffect(() => {
    fetch("/api/db-status")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.connected) setDbInfo(d);
      })
      .catch(() => {});
  }, []);

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setBackupError(null);
    setBackupSuccess(null);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to download backup");
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().substring(0, 10);
      a.href = url;
      a.download = `attar_travels_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupSuccess(`Backup file created! (${data.metadata?.totalCustomers || 0} customers, ${data.metadata?.totalBookings || 0} bookings)`);
      setTimeout(() => setBackupSuccess(null), 5000);
    } catch (err: unknown) {
      setBackupError(err instanceof Error ? err.message : "Backup failed");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleSelectRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFile(file);
    setRestoreError(null);
    setRestoreSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.data || (!parsed.data.customers && !parsed.data.bookings)) {
          throw new Error("Invalid backup format. Expected an Attar Travels backup JSON.");
        }
        setRestorePayload(parsed);
      } catch (err: unknown) {
        setRestoreError(err instanceof Error ? err.message : "Failed to parse backup JSON file");
        setRestorePayload(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!restorePayload) return;
    if (!confirm("Are you sure you want to restore data from this backup? Existing records will be synced and updated in your database.")) {
      return;
    }

    setRestoreLoading(true);
    setRestoreError(null);
    setRestoreSuccess(null);

    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restorePayload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to restore backup");
      }

      const resData = await res.json();
      setRestoreSuccess(`Restore completed! Restored ${resData.restored?.customers || 0} customers, ${resData.restored?.bookings || 0} bookings, ${resData.restored?.services || 0} services. Refreshing...`);
      setRestoreFile(null);
      setRestorePayload(null);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: unknown) {
      setRestoreError(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setRestoreLoading(false);
    }
  };

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

  const handleSaveSettings = async (sectionName?: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      const updated = await res.json();
      onSaved(updated);
      setEditSection(null);
      setSuccess(sectionName ? `${sectionName} updated successfully!` : "Settings updated successfully!");
      setTimeout(() => setSuccess(null), 3500);
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
      setEditSection(null);
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Logo logoUrl={formData.logoUrl} agencyName={formData.agencyName} size="lg" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{formData.agencyName || "Travels Office"}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your office branding, security credentials, contact details, invoices and database backups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editSection !== null && (
            <button
              onClick={() => {
                setFormData(settings);
                setEditSection(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
            >
              <X size={14} />
              <span>Cancel Editing</span>
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center gap-2 text-sm">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 rounded-2xl flex items-center gap-2 text-sm">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: AGENCY DETAILS & CONTACT                                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Travel Agency Profile
            </h3>
          </div>

          {editSection !== "profile" ? (
            <button
              onClick={() => setEditSection("profile")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs transition active:scale-95"
            >
              <Pencil size={13} />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              onClick={() => setEditSection(null)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X size={13} /> Close
            </button>
          )}
        </div>

        {editSection !== "profile" ? (
          /* READ-ONLY DISPLAY VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Agency / Office Name
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {formData.agencyName || "Not configured"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Tagline / Slogan
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1">
                {formData.tagline || "None"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Phone size={12} className="text-sky-600" /> Office Phone
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {formData.phone || "Not set"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MessageCircle size={12} className="text-emerald-600" /> WhatsApp Alert Number
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {formData.whatsapp || "Not set"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Mail size={12} className="text-sky-600" /> Email Address
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                {formData.email || "Not set"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                GSTIN / Tax ID
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                {formData.taxNumber || "None"}
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <MapPin size={12} className="text-rose-600" /> Office Address (Invoice Header)
              </span>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-line">
                {formData.address || "Not set"}
              </p>
            </div>
          </div>
        ) : (
          /* EDITING FORM */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSettings("Agency Profile");
            }}
            className="space-y-4 pt-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Travel Agency / Office Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.agencyName}
                  onChange={(e) => handleChange("agencyName", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline || ""}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  placeholder="e.g. Your Trusted Travel Partner"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Office Phone Number</label>
                <input
                  type="text"
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">WhatsApp Alert Number</label>
                <input
                  type="text"
                  value={formData.whatsapp || ""}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="e.g. bookings@myagency.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN / Tax ID</label>
                <input
                  type="text"
                  value={formData.taxNumber || ""}
                  onChange={(e) => handleChange("taxNumber", e.target.value)}
                  placeholder="e.g. GSTIN: 32AAAAA0000A1Z5"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Physical Office Address</label>
                <textarea
                  rows={2}
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Full address printed on customer invoices"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {saving ? <Save size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: LOGO & BRANDING                                                */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Logo & Visual Branding
            </h3>
          </div>

          {editSection !== "logo" ? (
            <button
              onClick={() => setEditSection("logo")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold text-xs transition active:scale-95"
            >
              <Pencil size={13} />
              <span>Change Logo</span>
            </button>
          ) : (
            <button
              onClick={() => setEditSection(null)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X size={13} /> Close
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {editSection === "logo" ? (
            /* EDITING LOGO */
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Upload Logo Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 dark:file:bg-sky-950 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Or Paste Direct Logo Image URL / Path
                </label>
                <input
                  type="text"
                  placeholder="e.g. /logo.png or https://example.com/logo.png"
                  value={formData.logoUrl || ""}
                  onChange={(e) => handleChange("logoUrl", e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditSection(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveSettings("Logo")}
                  className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Logo"}
                </button>
              </div>
            </div>
          ) : (
            /* READ ONLY LOGO INFO */
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Logo Status & Path
                </span>
                <p className="font-mono text-slate-700 dark:text-slate-300 break-all">
                  {formData.logoUrl ? (
                    formData.logoUrl.startsWith("data:") ? "Custom Image Uploaded (Base64)" : formData.logoUrl
                  ) : (
                    "Default SVG Logo (/logo.png)"
                  )}
                </p>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                This logo appears directly on customer PDF invoices, vouchers, and the dashboard navigation header.
              </p>
            </div>
          )}

          {/* Logo Live Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Live Header & Invoice Preview
            </span>
            <Logo logoUrl={formData.logoUrl} agencyName={formData.agencyName} size="lg" />
            <div className="mt-3 font-bold text-slate-800 dark:text-slate-200 text-sm">
              {formData.agencyName || "Your Agency Name"}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{formData.tagline || "Tagline"}</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: INVOICE BANK DETAILS & TERMS                                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Invoice Bank Details & Guidelines
            </h3>
          </div>

          {editSection !== "payment" ? (
            <button
              onClick={() => setEditSection("payment")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs transition active:scale-95"
            >
              <Pencil size={13} />
              <span>Edit Payment & Terms</span>
            </button>
          ) : (
            <button
              onClick={() => setEditSection(null)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X size={13} /> Close
            </button>
          )}
        </div>

        {editSection !== "payment" ? (
          /* READ-ONLY VIEW */
          <div className="space-y-3 pt-1">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Bank & UPI Payment Information (Printed on Invoices)
              </span>
              <p className="text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {formData.bankDetails || "No bank details provided yet."}
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Terms, Airport Reporting & Guidelines
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {formData.termsConditions || "No terms or guidelines specified."}
              </p>
            </div>
          </div>
        ) : (
          /* EDITING FORM */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveSettings("Invoice Payment & Terms");
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Bank & UPI Details (Printed on Invoices for Customer Payments)
              </label>
              <textarea
                rows={3}
                value={formData.bankDetails || ""}
                onChange={(e) => handleChange("bankDetails", e.target.value)}
                placeholder="Account Name, A/C No, Bank, IFSC Code, UPI ID"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Terms, Airport Reporting & Guidelines (Printed on Invoices)
              </label>
              <textarea
                rows={4}
                value={formData.termsConditions || ""}
                onChange={(e) => handleChange("termsConditions", e.target.value)}
                placeholder="Reporting time guidelines, baggage rules, visa validity notices"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setEditSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                {saving ? <Save size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save Payment & Terms</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: SECURITY & LOGIN CREDENTIALS                                   */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Security & Login Credentials
            </h3>
          </div>

          {editSection !== "security" ? (
            <button
              onClick={() => setEditSection("security")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs transition active:scale-95"
            >
              <KeyRound size={13} />
              <span>Change ID & Password</span>
            </button>
          ) : (
            <button
              onClick={() => setEditSection(null)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <X size={13} /> Close
            </button>
          )}
        </div>

        {credSuccess && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Login ID and Password updated successfully!</span>
          </div>
        )}

        {credError && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{credError}</span>
          </div>
        )}

        {editSection !== "security" ? (
          /* READ-ONLY CREDENTIALS OVERVIEW */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <User size={12} className="text-sky-600" /> Current Login ID
              </span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                {currentUser?.username || "admin"}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Lock size={12} className="text-slate-500" /> Password Status
              </span>
              <p className="text-sm font-mono tracking-widest text-slate-600 dark:text-slate-400 mt-1">
                ••••••••••••
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
              <span className="block text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Admin Protection
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                <ShieldCheck size={14} /> Active & Secured
              </span>
            </div>
          </div>
        ) : (
          /* EDITING FORM */
          <form onSubmit={handleUpdateCredentials} className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Login ID / Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. traveladmin or your email"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
                  Current Password (Required) *
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password (Optional)
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setEditSection(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={credSaving || !currentPassword}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <ShieldCheck size={15} />
                <span>{credSaving ? "Updating Security..." : "Save ID & Password"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: DATABASE BACKUP & RESTORE                                      */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={18} className="text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Database Backup & Restore
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <Archive size={13} /> Complete Data Protection
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Export your entire travels database (all customers, bookings, custom service types, and settings) into a JSON backup file or restore previously saved data anytime.
        </p>

        {backupSuccess && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{backupSuccess}</span>
          </div>
        )}

        {backupError && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{backupError}</span>
          </div>
        )}

        {restoreSuccess && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl flex items-center gap-2 text-xs">
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{restoreSuccess}</span>
          </div>
        )}

        {restoreError && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{restoreError}</span>
          </div>
        )}

        {/* Live Database Status Pill */}
        {dbInfo && (
          <div className="p-4 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-sky-950 dark:text-sky-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected Database: {dbInfo.provider} ({dbInfo.counts?.customers || 0} Customers, {dbInfo.counts?.bookings || 0} Bookings)
              </span>
              <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                Host: <strong className="text-slate-900 dark:text-white">{dbInfo.host}</strong> | DB: <strong className="text-slate-900 dark:text-white">{dbInfo.database}</strong>
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 self-start sm:self-center">
              Source: {dbInfo.envSource}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Card 1: Download Backup */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">
                <Download size={16} className="text-sky-600 dark:text-sky-400" />
                <span>1. Download Full System Backup</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly generates a timestamped <code className="text-slate-700 dark:text-slate-300 font-mono">.json</code> file with all your bookings, customer records, and settings.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={backupLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {backupLoading ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
              <span>{backupLoading ? "Generating Backup..." : "Download Backup (.json)"}</span>
            </button>
          </div>

          {/* Card 2: Restore from Backup */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">
                <Upload size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>2. Restore Data from Backup File</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Upload a valid <code className="text-slate-700 dark:text-slate-300 font-mono">.json</code> backup to restore your records into the database.
              </p>

              <label className="block p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl bg-white dark:bg-slate-800 text-center cursor-pointer transition">
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleSelectRestoreFile}
                  className="hidden"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                  <FileJson size={16} className="text-emerald-600 dark:text-emerald-400" />
                  {restoreFile ? restoreFile.name : "Click to select .json backup file"}
                </span>
              </label>

              {restorePayload && (
                <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                  <span>
                    ✓ Valid Backup: {restorePayload.data?.customers?.length || 0} Customers,{" "}
                    {restorePayload.data?.bookings?.length || 0} Bookings
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRestoreFile(null);
                      setRestorePayload(null);
                    }}
                    className="text-rose-600 dark:text-rose-400 font-bold hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleExecuteRestore}
              disabled={!restorePayload || restoreLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {restoreLoading ? <RefreshCw size={15} className="animate-spin" /> : <Upload size={15} />}
              <span>{restoreLoading ? "Restoring Records..." : "Restore into Database"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
