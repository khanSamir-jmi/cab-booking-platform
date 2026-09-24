import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroBookingWidget } from "@/components/booking/HeroBookingWidget";
import { getActiveFleet } from "@/lib/fleet";
import { getActiveSightseeingPackages } from "@/lib/pricing/sightseeing";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function HomePage() {
  const fleet = await getActiveFleet();
  const sightseeingPkgs = await getActiveSightseeingPackages();

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />

      <main className="flex-1 space-y-16 pb-16">
        {/* Hero Section with Sticky-Style Booking Widget */}
        <section className="relative bg-gradient-to-b from-paper via-paper to-white px-6 pt-8 pb-12">
          <div className="mx-auto max-w-6xl grid items-center gap-10 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-6">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-route bg-route/10 px-3 py-1 rounded-full">
                ● Ride On Demand · Dhanbad & All India
              </span>
              <h1 className="font-display text-4xl font-extrabold leading-[1.1] text-ink sm:text-5xl">
                Every route, fixed fare shown upfront.
              </h1>
              <p className="text-base text-ink/70 max-w-lg">
                Book point-to-point local cabs, outstation trips, sightseeing tours, and hourly rentals with transparent pricing. Choose Chauffeur-driven or Self-Drive options!
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-ink/60">
                <span>⚡ Instant Fare Calculation</span>
                <span>🛡️ Verified Drivers</span>
                <span>🚗 Clean Fleet</span>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-6">
              <HeroBookingWidget />
            </div>
          </div>
        </section>

        {/* Fleet Showcase Preview Section */}
        <section className="mx-auto max-w-6xl px-6 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
                FLEET SHOWCASE
              </p>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Choose Your Ride
              </h2>
            </div>
            <Link href="/fleet">
              <Button variant="secondary" size="sm">
                View All Fleet →
              </Button>
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
            {fleet.map((v) => (
              <div
                key={v.id}
                className="min-w-[280px] max-w-[300px] flex-shrink-0 snap-start rounded-stub border border-line bg-white p-5 shadow-sm space-y-4 hover:border-route/50 transition"
              >
                <div className="h-32 w-full rounded-stub overflow-hidden bg-paper border border-line/40">
                  <img src={v.image_url} alt={v.name} className="h-full w-full object-cover" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase bg-marigold/20 text-ink px-2 py-0.5 rounded">
                  {v.category}
                </span>
                <h3 className="font-display font-bold text-base text-ink leading-snug">
                  {v.name}
                </h3>
                <div className="flex items-center justify-between border-t border-line/60 pt-3 font-mono text-xs">
                  <span className="text-ink/60">From {formatCurrency(v.price_per_km)}/km</span>
                  <span className="font-bold text-route">{formatCurrency(v.price_per_hour)}/hr</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dhanbad Localized Sightseeing Section */}
        <section className="mx-auto max-w-6xl px-6 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
                EXPLORE DHANBAD & JHARKHAND
              </p>
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                Popular Sightseeing Packages
              </h2>
            </div>
            <Link href="/sightseeing">
              <Button variant="secondary" size="sm">
                View All Packages →
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {sightseeingPkgs.slice(0, 3).map((pkg) => (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-stub border border-line bg-white p-6 space-y-4 shadow-sm hover:border-route/50 transition"
              >
                <div className="space-y-2">
                  <span className="font-mono text-xs uppercase text-route font-bold bg-route/10 px-2.5 py-1 rounded">
                    {pkg.duration_hours} Hours Tour
                  </span>
                  <h3 className="font-display text-xl font-bold text-ink">{pkg.name}</h3>
                  <p className="text-xs text-ink/70 line-clamp-3">{pkg.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-line/60 pt-4">
                  <span className="font-mono text-xl font-bold text-route">
                    {formatCurrency(pkg.price)}
                  </span>
                  <Link href="/sightseeing">
                    <Button size="sm">Book Package</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
