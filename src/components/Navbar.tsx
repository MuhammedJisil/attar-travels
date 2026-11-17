"use client";

import React from "react";
import Logo from "./Logo";
import { AgencySettings } from "@/lib/types";
import {
  CalendarDays,
  Users,
  Settings,
  PlusCircle,
  PlaneTakeoff,
  Layers,
  LogOut,
  User,
  Shield,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  settings: AgencySettings;
  activeTab: "dashboard" | "bookings" | "customers" | "services" | "settings";
  setActiveTab: (tab: "dashboard" | "bookings" | "customers" | "services" | "settings") => void;
  onOpenNewBooking: () => void;
  urgentAlertCount?: number;
  currentUser?: { id: string; username: string; name?: string } | null;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export default function Navbar({
  settings,
  activeTab,
  setActiveTab,
  onOpenNewBooking,
  urgentAlertCount = 0,
  currentUser,
  onLogout,
  isDarkMode = false,
  onToggleTheme,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-17 sm:h-18 gap-2 sm:gap-4 pb-0.5 sm:pb-1">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            onClick={() => setActiveTab("dashboard")}
          >
            <Logo logoUrl={settings.logoUrl} agencyName={settings.agencyName} size="sm" />
            <div className="min-w-0">
              <h1 className="font-bold text-slate-900 dark:text-white tracking-tight text-sm sm:text-base group-hover:text-sky-600 transition truncate max-w-[140px] sm:max-w-xs">
                {settings.agencyName || "Travels Office"}
              </h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 hidden lg:block truncate max-w-xs">
                {settings.tagline || "Ticketing & Customer Due Date Alerts"}
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop - strictly 1 clean single line) */}
          <nav className="hidden md:flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
              }`}
            >
              <CalendarDays size={15} />
              <span>Due Alerts</span>
              {urgentAlertCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center min-w-[18px] h-4.5 px-1 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                  {urgentAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition ${
                activeTab === "bookings"
                  ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
              }`}
            >
              <PlaneTakeoff size={15} />
              <span>All Tickets</span>
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition ${
                activeTab === "customers"
                  ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
              }`}
            >
              <Users size={15} />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition ${
                activeTab === "services"
                  ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
              }`}
            >
              <Layers size={15} />
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs lg:text-sm font-semibold transition ${
                activeTab === "settings"
                  ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
              }`}
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>
          </nav>

          {/* Action Buttons, Theme Switcher & Logout */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Light / Dark Mode Toggle */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl text-slate-500 hover:text-amber-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-slate-800 transition"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
              </button>
            )}

            <button
              onClick={onOpenNewBooking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-sky-600 text-white text-xs sm:text-sm font-semibold hover:bg-sky-700 shadow-xs hover:shadow transition active:scale-95"
            >
              <PlusCircle size={15} />
              <span>Add Booking</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Submenu Bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 text-xs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center py-1 px-2 rounded ${
              activeTab === "dashboard" ? "text-sky-600 font-bold" : "text-slate-600"
            }`}
          >
            <div className="relative">
              <CalendarDays size={18} />
              {urgentAlertCount > 0 && (
                <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {urgentAlertCount}
                </span>
              )}
            </div>
            <span>Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex flex-col items-center py-1 px-2 rounded ${
              activeTab === "bookings" ? "text-sky-600 font-bold" : "text-slate-600"
            }`}
          >
            <PlaneTakeoff size={18} />
            <span>Tickets</span>
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex flex-col items-center py-1 px-2 rounded ${
              activeTab === "customers" ? "text-sky-600 font-bold" : "text-slate-600"
            }`}
          >
            <Users size={18} />
            <span>Customers</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex flex-col items-center py-1 px-2 rounded ${
              activeTab === "services" ? "text-sky-600 font-bold" : "text-slate-600"
            }`}
          >
            <Layers size={18} />
            <span>Services</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center py-1 px-2 rounded ${
              activeTab === "settings" ? "text-sky-600 font-bold" : "text-slate-600"
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
