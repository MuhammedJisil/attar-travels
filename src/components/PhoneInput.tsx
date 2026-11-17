"use client";

import React, { useState, useEffect } from "react";
import { COUNTRY_CODES, parsePhoneNumber, formatFullPhoneNumber } from "@/lib/country-codes";
import { Phone, ChevronDown } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (fullPhone: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function PhoneInput({
  value,
  onChange,
  required = false,
  placeholder = "Mobile Number (e.g. 98471 23456)",
  className = "",
  id,
}: PhoneInputProps) {
  const parsed = parsePhoneNumber(value);
  const [selectedCode, setSelectedCode] = useState(parsed.countryCode || "+91");
  const [localNumber, setLocalNumber] = useState(parsed.localNumber || "");

  // Sync state if external value changes (e.g. when editing different customers)
  useEffect(() => {
    const p = parsePhoneNumber(value);
    setSelectedCode(p.countryCode || "+91");
    setLocalNumber(p.localNumber || "");
  }, [value]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setSelectedCode(newCode);
    const full = formatFullPhoneNumber(newCode, localNumber);
    onChange(full);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // If user pasted a full number with "+", auto-detect
    if (raw.startsWith("+")) {
      const p = parsePhoneNumber(raw);
      setSelectedCode(p.countryCode);
      setLocalNumber(p.localNumber);
      onChange(formatFullPhoneNumber(p.countryCode, p.localNumber));
      return;
    }

    setLocalNumber(raw);
    const full = formatFullPhoneNumber(selectedCode, raw);
    onChange(full);
  };

  const currentCountry = COUNTRY_CODES.find((c) => c.dialCode === selectedCode);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Country Code Dropdown */}
      <div className="relative shrink-0">
        <select
          value={selectedCode}
          onChange={handleCodeChange}
          className="appearance-none pl-7 pr-6 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-sky-500 cursor-pointer"
          title="Select Country Dial Code"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={`${c.code}-${c.dialCode}`} value={c.dialCode}>
              {c.flag} {c.dialCode} ({c.name})
            </option>
          ))}
        </select>
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none">
          {currentCountry?.flag || "🌐"}
        </div>
        <ChevronDown
          size={13}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>

      {/* Local Phone Number Input */}
      <div className="relative flex-1">
        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type="tel"
          required={required}
          value={localNumber}
          onChange={handleNumberChange}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs sm:text-sm font-mono focus:bg-white focus:ring-2 focus:ring-sky-500 font-medium"
        />
      </div>
    </div>
  );
}
