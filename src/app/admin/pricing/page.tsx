import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Footer } from "@/components/layout/Footer";
import { formatCurrency } from "@/lib/utils";

export default async function AdminPricingPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: localPricing } = await supabase
    .from("local_pricing_config")
    .select("*")
    .order("effective_from", { ascending: false })
    .limit(1)
    .single();

  const { data: outstationRoutes } = await supabase
    .from("outstation_routes")
    .select("*")
    .order("from_city");

  const { data: sightseeingPackages } = await supabase
    .from("sightseeing_packages")
    .select("*")
    .order("price");

  const { data: hourlySlabs } = await supabase
    .from("hourly_rental_slabs")
    .select("*")
    .order("duration_hours");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <AdminNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 space-y-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            PRICING MANAGEMENT & CONFIGURATION
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            System Pricing Configuration
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            View active fare structures across Local rides, Outstation routes, Sightseeing, and Hourly rentals.
          </p>
        </div>

        {/* Local Pricing */}
        <section className="rounded-stub border border-line bg-white p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-ink">Local Ride Base Pricing</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-stub bg-paper p-4 border border-line/60">
              <p className="text-xs font-mono uppercase text-ink/50">Base Fare</p>
              <p className="font-mono text-2xl font-bold text-route">
                {formatCurrency(localPricing?.base_fare ?? 50)}
              </p>
            </div>
            <div className="rounded-stub bg-paper p-4 border border-line/60">
              <p className="text-xs font-mono uppercase text-ink/50">Per KM Rate</p>
              <p className="font-mono text-2xl font-bold text-route">
                {formatCurrency(localPricing?.per_km_rate ?? 15)} / km
              </p>
            </div>
          </div>
        </section>

        {/* Outstation Routes */}
        <section className="rounded-stub border border-line bg-white p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-ink">Outstation Route Catalog</h2>
          <div className="divide-y divide-line/60">
            {outstationRoutes?.map((r: any) => (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-ink">
                    {r.from_city} → {r.to_city}
                  </p>
                  <p className="text-xs font-mono uppercase text-ink/50">
                    {r.trip_type === "one_way" ? "One Way" : "Round Trip"}
                  </p>
                </div>
                <span className="font-mono text-lg font-bold text-route">
                  {formatCurrency(r.price)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Sightseeing Packages */}
        <section className="rounded-stub border border-line bg-white p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-ink">Sightseeing Packages</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {sightseeingPackages?.map((p: any) => (
              <div key={p.id} className="rounded-stub bg-paper p-4 border border-line/60 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-ink">{p.name}</h3>
                  <span className="font-mono text-xs text-ink/60">{p.duration_hours} hrs</span>
                </div>
                <p className="text-xs text-ink/70">{p.description}</p>
                <p className="font-mono text-lg font-bold text-route pt-2">
                  {formatCurrency(p.price)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hourly Rental Slabs */}
        <section className="rounded-stub border border-line bg-white p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-ink">Hourly Rental Slabs</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            {hourlySlabs?.map((s: any) => (
              <div key={s.id} className="rounded-stub bg-paper p-4 border border-line/60 text-center space-y-1">
                <p className="font-display font-bold text-lg text-ink">{s.duration_hours} Hours</p>
                <p className="text-xs font-mono text-ink/60">{s.km_limit} km included</p>
                <p className="font-mono text-xl font-bold text-route pt-2">
                  {formatCurrency(s.price)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
