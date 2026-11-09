"use client";

import React, { useState } from "react";
import Logo from "./Logo";
import { AgencySettings } from "@/lib/types";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Plane,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface LoginScreenProps {
  settings: AgencySettings;
  onLoginSuccess: (user: { id: string; username: string; name?: string }) => void;
}

export default function LoginScreen({ settings, onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLoginSuccess(data.user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setUsername("admin");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-8 sm:p-10 space-y-6 animate-fadeIn">
        {/* Top Logo & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex justify-center mb-1">
            <Logo logoUrl={settings.logoUrl} agencyName={settings.agencyName} size="lg" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {settings.agencyName || "Travel Desk"}
          </h1>
          <p className="text-xs text-slate-500">
            Sign in to access your flight tickets, customer records & due date alerts
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Login ID / Username
            </label>
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoFocus
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying credentials...</span>
            ) : (
              <>
                <span>Secure Sign In</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick First-Time Login Hint */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <div className="p-2.5 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-sky-600 shrink-0" />
              <span>Default: <strong>admin</strong> / <strong>admin123</strong></span>
            </span>
            <button
              type="button"
              onClick={fillDefaultCredentials}
              className="text-sky-700 underline font-semibold hover:text-sky-950"
            >
              Auto-fill
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            You can change your Login ID & Password anytime under <strong>Settings</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
