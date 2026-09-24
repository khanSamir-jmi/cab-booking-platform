import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getActiveFleet } from "@/lib/fleet";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function FleetPage() {
  const fleet = await getActiveFleet();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 space-y-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            OUR VEHICLE FLEET
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Explore Available Cabs
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            From economic hatchbacks to premium SUVs & luxury cars for self-drive or chauffeur-driven rides.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {fleet.map((v) => (
            <div
              key={v.id}
              className="flex flex-col justify-between rounded-stub border border-line bg-white p-5 space-y-4 shadow-sm hover:border-route/50 transition"
            >
              <div className="space-y-3">
                <div className="h-36 w-full rounded-stub overflow-hidden bg-paper border border-line/40">
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase bg-marigold/20 text-ink px-2 py-0.5 rounded">
                  {v.category}
                </span>
                <h3 className="font-display font-bold text-lg text-ink leading-snug">
                  {v.name}
                </h3>
                <div className="flex items-center gap-3 text-xs text-ink/70 font-mono">
                  <span>👥 {v.capacity_passengers} Seats</span>
                  <span>🧳 {v.capacity_luggage} Bags</span>
                </div>
              </div>

              <div className="border-t border-line/60 pt-4 space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-ink/60">Rate per KM:</span>
                  <span className="font-bold text-route">{formatCurrency(v.price_per_km)}/km</span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-ink/60">Hourly Rate:</span>
                  <span className="font-bold text-route">{formatCurrency(v.price_per_hour)}/hr</span>
                </div>

                <Link href="/local" className="block w-full">
                  <Button variant="secondary" size="sm" className="w-full">
                    Book This Vehicle
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
