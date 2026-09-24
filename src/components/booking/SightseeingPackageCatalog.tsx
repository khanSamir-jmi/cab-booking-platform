"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { SightseeingPackage } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";

function defaultScheduledAt() {
  const d = new Date(Date.now() + 3 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const inputClass =
  "mt-1.5 w-full rounded-stub border border-line bg-white px-3 py-2 text-sm text-ink focus:border-route focus:outline-none";

export function SightseeingPackageCatalog({ packages }: { packages: SightseeingPackage[] }) {
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [pickup, setPickup] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt());
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const selectedPkg = packages.find((p) => p.id === selectedPkgId);

  async function handleConfirm() {
    if (!selectedPkg) return;
    if (!pickup.trim()) {
      setError("Please enter a pickup address.");
      return;
    }
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/sightseeing")}`);
      return;
    }

    setConfirming(true);
    try {
      const res = await fetch("/api/bookings/sightseeing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPkg.id,
          pickup,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create sightseeing booking.");
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {packages.map((pkg) => {
          const isSelected = selectedPkgId === pkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPkgId(pkg.id)}
              className={`cursor-pointer rounded-stub border p-6 transition ${
                isSelected
                  ? "border-route bg-route/5 ring-2 ring-route"
                  : "border-line bg-white hover:border-ink/30"
              }`}
            >
              <span className="font-mono text-xs uppercase text-ink/50">
                {pkg.duration_hours} Hours Package
              </span>
              <h3 className="mt-1 font-display text-xl font-bold text-ink">{pkg.name}</h3>
              <p className="mt-2 text-sm text-ink/70 line-clamp-3">{pkg.description}</p>
              <div className="mt-6 flex items-center justify-between border-t border-line/60 pt-4">
                <span className="font-mono text-xl font-bold text-route">
                  {formatCurrency(pkg.price)}
                </span>
                <Button
                  type="button"
                  variant={isSelected ? "primary" : "secondary"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPkgId(pkg.id);
                  }}
                >
                  {isSelected ? "Selected" : "Select"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPkg && (
        <div className="mx-auto max-w-xl rounded-stub border border-line bg-white p-6 space-y-6">
          <h3 className="font-display text-xl font-bold text-ink">
            Book: {selectedPkg.name}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pickup" className="text-sm font-medium text-ink">
                Pickup Address
              </label>
              <input
                id="pickup"
                type="text"
                required
                placeholder="Enter hotel or home pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="scheduledAt" className="text-sm font-medium text-ink">
                Pickup Date & Time
              </label>
              <input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-sm text-alert">{error}</p>}

          <div className="flex items-center justify-between border-t border-line pt-4">
            <span className="font-mono text-lg font-bold text-ink">
              Total: {formatCurrency(selectedPkg.price)}
            </span>
            <Button type="button" onClick={handleConfirm} disabled={confirming}>
              {confirming ? "Booking..." : "Confirm Sightseeing Booking"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
