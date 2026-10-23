import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getActiveHourlySlabs } from "@/lib/pricing/hourly";
import { HourlyRentalSlabPicker } from "@/components/booking/HourlyRentalSlabPicker";

export default async function HourlyRentalPage() {
  const slabs = await getActiveHourlySlabs();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
          HRLY · 04
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          Hourly Cab Rentals
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Rent a cab by the hour with fixed km limits included. Ideal for multi-stop city errands or business meetings.
        </p>
        <div className="mt-8">
          <Suspense fallback={<div className="p-8 text-center text-ink/50 font-mono text-sm">Loading hourly packages...</div>}>
            <HourlyRentalSlabPicker slabs={slabs} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
