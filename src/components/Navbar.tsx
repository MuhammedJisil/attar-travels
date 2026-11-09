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
} from "lucide-react";

interface NavbarProps {
  settings: AgencySettings;
  activeTab: "dashboard" | "bookings" | "customers" | "services" | "settings";
  setActiveTab: (tab: "dashboard" | "bookings" | "customers" | "services" | "settings") => void;
  onOpenNewBooking: () => void;
  urgentAlertCount?: number;
  currentUser?: { id: string; username: string; name?: string } | null;
  onLogout?: () => void;
}

export default function Navbar({
  settings,
  activeTab,
  setActiveTab,
  onOpenNewBooking,
  urgentAlertCount = 0,
  currentUser,
  onLogout,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            onClick={() => setActiveTab("dashboard")}
          >
            <Logo logoUrl={settings.logoUrl} agencyName={settings.agencyName} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 tracking-tight text-sm sm:text-lg group-hover:text-sky-600 transition truncate max-w-[150px] sm:max-w-xs">
                  {settings.agencyName || "Travels Office"}
                </h1>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
                  Desk Manager
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-xs">
                {settings.tagline || "Ticketing & Customer Due Date Alerts"}
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "dashboard"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <CalendarDays size={17} />
              <span>Due Alerts</span>
              {urgentAlertCount > 0 && (
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white animate-pulse">
                  {urgentAlertCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "bookings"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <PlaneTakeoff size={17} />
              <span>All Tickets</span>
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "customers"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Users size={17} />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "services"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Layers size={17} />
              <span>Services</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "settings"
                  ? "bg-sky-50 text-sky-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <Settings size={17} />
              <span>Settings</span>
            </button>
          </nav>

          {/* Action Buttons & User Menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewBooking}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-lg bg-sky-600 text-white text-xs sm:text-sm font-semibold hover:bg-sky-700 shadow-sm hover:shadow transition active:scale-95"
            >
              <PlusCircle size={16} />
              <span className="hidden sm:inline">Add Booking</span>
              <span className="sm:hidden">New</span>
            </button>

            {/* User Profile Pill & Logout */}
            {currentUser && (
              <div className="flex items-center gap-1 pl-1 sm:pl-2 border-l border-slate-200">
                <div
                  onClick={() => setActiveTab("settings")}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition"
                  title="Signed in as admin. Click to manage ID & password."
                >
                  <User size={13} className="text-sky-600" />
                  <span>{currentUser.username}</span>
                </div>

                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
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
