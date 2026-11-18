"use client";

import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar Skeleton */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-17 sm:h-18 gap-3">
            {/* Brand Logo & Name Skeleton */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
              <div className="space-y-1.5">
                <div className="w-32 sm:w-40 h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-24 sm:w-48 h-2.5 bg-slate-200/70 dark:bg-slate-800/70 rounded animate-pulse hidden sm:block" />
              </div>
            </div>

            {/* Nav Tabs Skeleton */}
            <div className="hidden md:flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-20 lg:w-24 h-8 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"
                />
              ))}
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="w-24 sm:w-32 h-8 rounded-xl bg-sky-200 dark:bg-sky-900/50 animate-pulse" />
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Skeleton */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 space-y-6">
        {/* Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="w-56 sm:w-72 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="w-40 sm:w-96 h-3.5 bg-slate-200/80 dark:bg-slate-800/80 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="w-28 h-9 bg-sky-200 dark:bg-sky-900/50 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* 5 Stat Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
              </div>
              <div className="w-10 h-7 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              <div className="w-20 h-2.5 bg-slate-200/70 dark:bg-slate-800/70 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Search & Filter Bar Skeleton */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-72 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="w-28 sm:w-36 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="w-28 sm:w-36 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="w-24 h-9 bg-rose-100 dark:bg-rose-950/40 rounded-xl animate-pulse" />
            </div>
          </div>

          {/* Table Rows Skeleton */}
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="w-32 sm:w-44 h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="w-20 sm:w-28 h-2.5 bg-slate-200/70 dark:bg-slate-700/70 rounded animate-pulse" />
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-4">
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="w-20 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="w-16 h-5 bg-sky-100 dark:bg-sky-950 rounded-full animate-pulse" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
