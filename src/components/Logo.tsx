"use client";

import React from "react";
import { Plane } from "lucide-react";

interface LogoProps {
  logoUrl?: string | null;
  agencyName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({
  logoUrl,
  agencyName = "Travels Office",
  size = "md",
  className = "",
}: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  if (logoUrl && logoUrl.trim() !== "") {
    return (
      <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl border border-sky-200 bg-white shadow-sm ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={agencyName}
          className={`${sizeClasses[size]} object-contain p-1`}
          onError={(e) => {
            // Fallback if image path fails
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  // Modern travels agency branding placeholder icon
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 text-white shadow-md shadow-sky-500/20 ${sizeClasses[size]} ${className}`}
      title={agencyName}
    >
      <Plane size={iconSizes[size]} className="transform -rotate-45" />
    </div>
  );
}

