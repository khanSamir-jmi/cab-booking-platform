import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getActiveOutstationRoutes } from "@/lib/pricing/outstation";
import { OutstationBookingForm } from "@/components/booking/OutstationBookingForm";

export default async function OutstationBookingPage() {
  const routes = await getActiveOutstationRoutes();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
          OUT · 01
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          Book an outstation cab
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Fixed city-to-city pricing. Pick a route, select your pickup location, and book seamlessly.
        </p>
        <div className="mt-8">
          <OutstationBookingForm routes={routes} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
