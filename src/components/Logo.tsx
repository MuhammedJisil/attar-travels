"use client";

import React, { useState } from "react";
import { Plane } from "lucide-react";

interface LogoProps {
  logoUrl?: string | null;
  agencyName?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({
  logoUrl,
  agencyName = "Attar Tour & Travels",
  size = "md",
  className = "",
}: LogoProps) {
  const [loadFailed, setLoadFailed] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-14 h-14 rounded-2xl",
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  const imageSrc = logoUrl && logoUrl.trim() !== "" ? logoUrl : "/logo.png";

  if (!loadFailed) {
    return (
      <div
        className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-slate-700/20 bg-[#013b3d] ${sizeClasses[size]} ${className}`}
        title={agencyName}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={agencyName}
          className="w-full h-full object-cover rounded-[inherit]"
          onError={() => setLoadFailed(true)}
        />
      </div>
    );
  }

  // Modern travels agency branding placeholder fallback
  return (
    <div
      className={`inline-flex items-center justify-center bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-700 text-white shadow-md shadow-sky-500/20 shrink-0 ${sizeClasses[size]} ${className}`}
      title={agencyName}
    >
      <Plane size={iconSizes[size]} className="transform -rotate-45" />
    </div>
  );
}

