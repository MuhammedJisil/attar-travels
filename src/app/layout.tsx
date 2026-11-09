import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TravelDesk - Travels Office Customer & Flight Due Date Alerts",
  description:
    "Next.js, Tailwind CSS and PostgreSQL web application for travels offices. Track passenger flights, due date alerts, dynamic services, invoices, and WhatsApp reminders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
