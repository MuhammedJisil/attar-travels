"use client";

import React, { useState } from "react";
import { Customer } from "@/lib/types";
import {
  Users,
  Search,
  Phone,
  MapPin,
  Mail,
  Plus,
  Plane,
  ChevronRight,
  CreditCard,
  Edit2,
  Trash2,
} from "lucide-react";

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customerId: string) => void;
  onAddBookingForCustomer: (customerId: string) => void;
  onDeleteCustomer: (customerId: string) => void;
  onOpenNewCustomer: () => void;
}

export default function CustomerList({
  customers,
  onSelectCustomer,
  onAddBookingForCustomer,
  onDeleteCustomer,
  onOpenNewCustomer,
}: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name, mobile, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>

        <button
          onClick={onOpenNewCustomer}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus size={16} />
          <span>Add New Customer / Party</span>
        </button>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">Add a new customer to start recording bookings</p>
          </div>
        ) : (
          filteredCustomers.map((cust) => {
            const bookings = cust.bookings || [];
            const bookingCount = bookings.length;
            const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            const totalBalance = bookings.reduce((sum, b) => sum + (b.balanceAmount || 0), 0);

            return (
              <div
                key={cust.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 transition shadow-sm hover:shadow p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Customer Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        onClick={() => onSelectCustomer(cust.id)}
                        className="font-bold text-base text-slate-900 group-hover:text-sky-600 cursor-pointer transition flex items-center gap-1.5"
                      >
                        <span>{cust.name}</span>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition" />
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-mono">
                        <Phone size={13} className="text-emerald-500" />
                        <span>{cust.phone}</span>
                      </div>
                      {cust.city && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <MapPin size={13} className="text-sky-500" />
                          <span>{cust.city}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-100">
                        {bookingCount} {bookingCount === 1 ? "Service" : "Services"}
                      </span>
                    </div>
                  </div>

                  {/* Financial Stats */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Volume</span>
                      <span className="font-bold text-slate-800 text-sm">₹{totalSpent.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending Balance</span>
                      <span
                        className={`font-bold text-sm ${
                          totalBalance > 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        ₹{totalBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Quick recent booking preview */}
                  {bookings.length > 0 && (
                    <div className="mt-3 text-xs text-slate-600">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Latest Booking
                      </span>
                      <div className="p-2 bg-sky-50/50 rounded-lg border border-sky-100 flex items-center justify-between">
                        <div className="truncate font-medium">
                          {bookings[0].sector || bookings[0].serviceType?.name || "Service"}
                        </div>
                        {bookings[0].pnr && (
                          <span className="font-mono text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                            {bookings[0].pnr}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectCustomer(cust.id)}
                    className="text-xs font-bold text-sky-600 hover:text-sky-800"
                  >
                    View All Services ({bookingCount}) →
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAddBookingForCustomer(cust.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-semibold transition"
                      title="Add Ticket / Service for this customer"
                    >
                      <Plus size={13} />
                      <span>Book</span>
                    </button>

                    <button
                      onClick={() => onDeleteCustomer(cust.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                      title="Delete Customer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
