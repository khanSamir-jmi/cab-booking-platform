import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocalBookingForm } from "@/components/booking/LocalBookingForm";

export default function LocalBookingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
          LOC · 02
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          Book a local ride
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Enter your pickup and drop-off to see the fare before you book —
          you won&apos;t need to log in until you&apos;re ready to confirm.
        </p>
        <div className="mt-8">
          <Suspense fallback={<div className="p-8 text-center text-ink/50 font-mono text-sm">Loading booking form...</div>}>
            <LocalBookingForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
