# 🚕 Anam Tours & Travel — Modern Cab Booking & Dispatch Platform

A production-ready, full-stack cab booking and automated fleet management application built with **Next.js 14 (App Router)**, **Supabase (Auth & PostgreSQL)**, **Tailwind CSS**, and **Leaflet / OpenStreetMap**.

---

## ✨ Features

### 🚖 Rider & Customer Features
- **Multi-Service Booking Engine:**
  - 🚕 **Local Rides:** Upfront distance-based fare calculation (`Base Fare + Distance × Rate/km`).
  - 🛣️ **Outstation Trips:** One-way and Round-trip bookings with toll and state permit estimates.
  - 🤝 **Share-a-Cab (Carpooling):** Outstation mode offering a **30% discount** for shared seats.
  - 🏰 **Sightseeing Packages:** Curated full-day and half-day tourist packages.
  - ⏱️ **Hourly Rentals:** Flexible duration & kilometer package slabs.
  - 🔑 **Self-Drive Vehicles:** Integrated Document Upload (Driving License & ID) with automated OCR validation.
- **🗺️ Live GPS Route Tracking:** Free, interactive OpenStreetMap & Leaflet route polylines showing origin, destination, estimated driving duration, and live cab tracking (`🚕`).
- **💳 Payments:** Integrated payment links and status management (Cash, UPI, and Direct Payment Links).
- **📱 Smart Authentication:** Dual OTP & Password login with auto-healing user profiles.
- **👤 Customer Dashboard:** Isolated account booking history (`/bookings`) and user profile management (`/profile`).

### 👨‍✈️ Admin & Dispatch Portal (`/admin/dashboard`)
- **Real-Time Dispatch Queue:** Live operational desk to assign drivers, update ride status (`requested` → `confirmed` → `driver_assigned` → `ongoing` → `completed` → `cancelled`), and filter active bookings.
- **Drivers Directory (`/admin/drivers`):** Provision and manage active fleet drivers, phone numbers, vehicle registration numbers, and categories.
- **Role-Based Middleware Security:** Automated middleware redirection ensuring admin access is restricted to verified admin accounts.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL RLS, Supabase Auth SSR)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom "Transit Ticket" design system)
- **Interactive Maps:** [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/) + OSRM Routing Engine
- **Language:** TypeScript

---

## 📁 Repository Structure

```text
├── src/
│   ├── app/                    # Next.js App Router Pages & API Routes
│   │   ├── admin/              # Admin Dispatch Queue & Driver Directory
│   │   ├── api/                # Server-side Auth, Booking & Verification API Routes
│   │   ├── bookings/           # Booking detail pages & Live Map tracking
│   │   ├── fleet/              # Fleet showcase page
│   │   ├── hourly/             # Hourly rentals booking form
│   │   ├── local/              # Local ride booking form
│   │   ├── login/ & signup/    # Authentication pages
│   │   ├── outstation/         # Outstation booking form (with Share-a-Cab)
│   │   └── sightseeing/        # Sightseeing package booking form
│   ├── components/             # Reusable UI, Forms, Maps & Admin components
│   ├── lib/                    # Supabase SSR clients, Auth helpers & OSRM Distance module
│   └── types/                  # TypeScript database definitions
├── supabase/
│   └── migrations/             # SQL Migrations (0001_init.sql to 0006_fix_rls_policies.sql)
├── .env.example                # Template environment variables
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/cab-booking-platform.git
cd cab-booking-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env.local
```
Fill in your Supabase project credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_EMAIL=admin@anamtourstravel.com
```

### 4. Database Setup
Run all migration files located in `supabase/migrations/` inside your **Supabase Dashboard → SQL Editor** in sequential order:
1. `0001_init.sql` — Core schemas & RLS policies
2. `0002_fix_policies.sql` — Policy refinements
3. `0003_seed.sql` — Initial fleet data
4. `0004_fix_schema.sql` — Database column additions
5. `0005_production_prep.sql` — Carpooling & OCR document status columns
6. `0006_fix_rls_policies.sql` — Driver directory & admin bypass policies

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security Notice

This repository includes a strict `.gitignore` to prevent any secret environment variables (`.env.local`), database keys, or private logs from being exposed to GitHub.

---

## 📦 Production Build & Deployment

To verify the production build locally:
```bash
npm run build
```

### Deploying to Vercel:
1. Push this repository to your GitHub account.
2. Import the repository into [Vercel](https://vercel.com/).
3. Add your Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`) in the Vercel Dashboard settings.
4. Click **Deploy**!

---

## 📄 License

MIT License. Free to use and modify.
