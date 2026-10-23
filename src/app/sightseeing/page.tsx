import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getActiveSightseeingPackages } from "@/lib/pricing/sightseeing";
import { SightseeingPackageCatalog } from "@/components/booking/SightseeingPackageCatalog";

export default async function SightseeingPage() {
  const packages = await getActiveSightseeingPackages();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
          SIGHT · 03
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">
          Sightseeing Tour Packages
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Explore top city attractions with custom full-day and half-day cab tour packages.
        </p>
        <div className="mt-8">
          <Suspense fallback={<div className="p-8 text-center text-ink/50 font-mono text-sm">Loading sightseeing packages...</div>}>
            <SightseeingPackageCatalog packages={packages} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
