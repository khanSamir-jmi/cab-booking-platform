"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { HourlyRentalSlab } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";

function defaultScheduledAt() {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const inputClass =
  "mt-1.5 w-full rounded-stub border border-line bg-white px-3 py-2 text-sm text-ink focus:border-route focus:outline-none";

export function HourlyRentalSlabPicker({ slabs }: { slabs: HourlyRentalSlab[] }) {
  const [selectedSlabId, setSelectedSlabId] = useState<string>(slabs[0]?.id || "");
  const [pickup, setPickup] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt());
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const selectedSlab = slabs.find((s) => s.id === selectedSlabId) || slabs[0];

  async function handleConfirm() {
    if (!pickup.trim()) {
      setError("Please enter a pickup address.");
      return;
    }
    if (!selectedSlab) {
      setError("Please select a rental slab.");
      return;
    }
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/hourly")}`);
      return;
    }

    setConfirming(true);
    try {
      const res = await fetch("/api/bookings/hourly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slabId: selectedSlab.id,
          pickup,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create hourly booking.");
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <label className="text-sm font-medium text-ink">Choose Rental Slab</label>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {slabs.map((slab) => {
            const isSelected = selectedSlabId === slab.id;
            return (
              <div
                key={slab.id}
                onClick={() => setSelectedSlabId(slab.id)}
                className={`cursor-pointer rounded-stub border p-5 transition ${
                  isSelected
                    ? "border-route bg-route/5 ring-2 ring-route"
                    : "border-line bg-white hover:border-ink/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-lg text-ink">
                    {slab.duration_hours} Hours
                  </span>
                  <span className="font-mono text-xs bg-paper px-2 py-0.5 rounded text-ink/70">
                    {slab.km_limit} km incl.
                  </span>
                </div>
                <div className="mt-4 font-mono text-2xl font-bold text-route">
                  {formatCurrency(slab.price)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-stub border border-line bg-white p-6 space-y-6 max-w-xl mx-auto">
        <h3 className="font-display text-xl font-bold text-ink">Rental Pickup & Time</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pickup" className="text-sm font-medium text-ink">
              Pickup Address
            </label>
            <input
              id="pickup"
              type="text"
              required
              placeholder="Enter pickup address"
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
          <div>
            <p className="text-xs text-ink/50 uppercase font-mono">Selected Package</p>
            <p className="font-display font-bold text-ink">
              {selectedSlab?.duration_hours} hrs / {selectedSlab?.km_limit} km — {formatCurrency(selectedSlab?.price || 0)}
            </p>
          </div>
          <Button type="button" onClick={handleConfirm} disabled={confirming}>
            {confirming ? "Booking..." : "Confirm Hourly Booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}
