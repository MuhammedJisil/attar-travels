# ✈️ TravelDesk — Travels Office & Flight Ticket Management App

A modern, fast, and simple web application designed specifically for **Travels Offices & Ticketing Agencies** to replace Excel sheets with an automated customer ledger, **flight due-date alert radar**, customizable services, **WhatsApp flight reminders**, and **printable invoices**.

Built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **PostgreSQL with Prisma ORM**, ready for **Vercel** deployment and **Supabase** or **Neon DB** hosting.

---

## 🌟 Key Features

1. **🚨 Flight Due Date Alert Radar & Days-Left Badges**
   - Live countdown of days remaining until travel:
     - 🚨 **Today (0 days left)** — highlighted with alert animation
     - ⏰ **Tomorrow (1 day left)**
     - ✈️ **In 3 Days**
     - 📅 **This Week (Next 7 Days)**
   - One-click filters to immediately isolate passengers traveling today or this week.
   - Special tracking for **Flight Delayed** and **Rescheduled / Postponed** flights with custom delay narration.

2. **📋 Dynamic Services Management (Dropdown CRUD)**
   - Dynamic services dropdown: Flight Ticket, Passport Service, Visa Processing, Hotel Booking, Tour Packages, Bus/Train, etc.
   - Easily **Add**, **Edit**, or **Delete** any service from the dropdown without modifying code.

3. **✈️ Smart Service & Ticket Entry Form**
   - Automatically adapts fields according to the selected service:
     - **For Flight Tickets:** Issue Date, Travel Date, Return Date, Sector / Route narration (e.g. `CCJ - DXB`), Flight No (`IX 343`), Airline PNR, Departure Time, Ticket Issued Portal / Supplier (`Amadeus`, `Galileo`, `Akbar Travels`, `Indigo Direct`), Passenger Count & Names.
     - **For Passport / Visa Services:** Passport No, Submission Date, Expiry / Validity Date.
     - **For Payments & Ledgers:** Total Fare / Fee, Paid Amount, Balance Due (auto-calculated), Payment Due Date.
   - Select an existing customer or create a new customer inline in the same popup.

4. **👥 Single Customer 360° Profile & Services Timeline**
   - Click any customer / party name to open their profile.
   - View **all tickets and services booked by that single customer** in one clean timeline list.
   - Full CRUD: Add a new service for that customer, edit their services, or delete records.
   - View their total volume billed, total paid, and outstanding balance.

5. **💬 1-Click WhatsApp Alerts & Reminders**
   - Automatically generates WhatsApp messages (`wa.me`) with pre-filled details:
     - 🛫 **Flight Travel Reminder:** Flight No, Sector, Travel Date, Departure Time, PNR, and airport reporting guidelines (3 hours international / 2 hours domestic).
     - ⚠️ **Flight Delay / Postpone Alert:** Urgent notice with revised timing and agency contact.
     - 💳 **Payment Due Reminder:** Outstanding balance amount, due date, and agency bank/UPI details.
     - 📄 **Booking Confirmation & Invoice summary.**
   - User can edit or customize the text before sending directly from browser or WhatsApp desktop.

6. **🧾 Professional Printable Invoices & Travel Vouchers**
   - Clean, tax-compliant invoice / booking voucher formatted for standard A4 printing and PDF export.
   - Displays Agency Name, Logo, Address, Contact, GST/Tax ID, Bank & UPI payment QR info.
   - Itemized ticket details: Sector, Flight No, PNR, Travel Date, Passenger Names, Total Fare, Amount Paid, and Balance Due.
   - Shareable directly to the customer on WhatsApp with one click.

7. **🎨 Flexible Logo & Agency Branding Placeholder**
   - Dedicated **Agency Settings** tab.
   - Upload your logo image directly from your computer, or place `logo.png` in `/public/logo.png`.
   - Live logo preview that automatically syncs across the navigation bar, app icon, and printed customer invoices.

---

## 📁 Project Structure & How Next.js Works

If you are new to Next.js, here is how the pieces fit together:

```
travels/
├── prisma/
│   └── schema.prisma         # Database models (Customer, Booking, ServiceType, AgencySettings)
├── public/                   # Static assets (place your logo.png here)
│   └── favicon.ico
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # Server-side Backend API Routes (Node.js)
│   │   │   ├── bookings/     # /api/bookings (GET, POST, PUT, DELETE)
│   │   │   ├── customers/    # /api/customers (GET, POST, PUT, DELETE)
│   │   │   ├── services/     # /api/services (Dynamic dropdown CRUD)
│   │   │   └── settings/     # /api/settings (Agency info & logo)
│   │   ├── globals.css       # Tailwind CSS & print styles
│   │   ├── layout.tsx        # Root HTML layout & metadata
│   │   └── page.tsx          # Main Single-Page Application (SPA) dashboard
│   ├── components/           # Reusable React UI Components
│   │   ├── Navbar.tsx        # Top navigation & agency header
│   │   ├── Logo.tsx          # Logo renderer with fallback aviation badge
│   │   ├── DueAlertsWidget.tsx # Stat cards & 1-click days-left filter pills
│   │   ├── BookingList.tsx   # Tickets table with search & WhatsApp buttons
│   │   ├── BookingModal.tsx  # Modal for adding/editing tickets & customers
│   │   ├── CustomerList.tsx  # Customer directory
│   │   ├── CustomerDrawer.tsx# Shows all services from a single customer
│   │   ├── InvoiceModal.tsx  # Printable travel invoice & voucher
│   │   ├── WhatsAppModal.tsx # Customizable WhatsApp message dispatcher
│   │   ├── ServiceManagementModal.tsx # Manage services dropdown
│   │   └── AgencySettingsView.tsx    # Logo & office configuration
│   └── lib/
│       ├── prisma.ts         # Prisma client connection singleton
│       ├── data-store.ts     # Data store layer (Prisma Postgres + memory fallback)
│       ├── types.ts          # TypeScript type definitions
│       ├── date-utils.ts     # Days-left calculations & date formatting
│       └── whatsapp.ts       # WhatsApp deep link & message templates
├── .env                      # Local environment variables (DATABASE_URL)
├── .env.example              # Sample environment template
└── package.json
```

---

## 🚀 Getting Started Locally

### 1. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> **Note:** The app works immediately out of the box with sample data even before connecting an external database.

---

## 🗄️ Setting Up PostgreSQL (Neon or Supabase)

You can use either **Neon DB** (Serverless Postgres) or **Supabase**:

### Option A: Using Neon (Recommended for Vercel)
1. Go to [neon.tech](https://neon.tech) and create a free PostgreSQL project.
2. Copy your connection string from the Neon dashboard.
3. Open `.env` and set:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### Option B: Using Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In Project Settings -> Database -> Connection string (URI / Session pooler):
   ```env
   DATABASE_URL="postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
   ```

### Apply Schema to PostgreSQL
Run this single command:
```bash
npm run db:push
```
This automatically creates all the tables (`Customer`, `Booking`, `ServiceType`, `AgencySettings`) in your PostgreSQL database!

To visually inspect or edit your database tables in a browser:
```bash
npm run db:studio
```

---

## ☁️ Deploying to Vercel

1. Push your code to GitHub / GitLab.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In the **Environment Variables** section on Vercel:
   - Add `DATABASE_URL` = your Neon or Supabase connection string.
   - Add `DIRECT_URL` = your direct PostgreSQL connection string.
4. Click **Deploy**. Vercel will automatically run `prisma generate && next build`.

---

## 🖼️ How to Set Your Logo

You can set your agency logo in two easy ways:

1. **Via the Web Interface (Simplest):**
   - Click the **Settings** tab in the top navigation.
   - Under **Agency Logo & Branding**, either click **Choose File** to upload an image from your computer, or paste an image URL.
   - Click **Save Settings**.
2. **Via Project Folder:**
   - Place your image file at `public/logo.png`.
   - In Settings, set the logo URL to `/logo.png`.
