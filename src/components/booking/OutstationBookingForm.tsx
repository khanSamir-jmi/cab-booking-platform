"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { OutstationRoute } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";

function defaultScheduledAt() {
  const d = new Date(Date.now() + 2 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const inputClass =
  "mt-1.5 w-full rounded-stub border border-line bg-white px-3 py-2 text-sm text-ink focus:border-route focus:outline-none";

export function OutstationBookingForm({ routes }: { routes: OutstationRoute[] }) {
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || "");
  const [pickup, setPickup] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt());
  const [isShared, setIsShared] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const calculatedFare = selectedRoute
    ? isShared
      ? Math.round(selectedRoute.price * 0.7)
      : selectedRoute.price
    : 0;

  async function handleConfirm() {
    if (!pickup.trim()) {
      setError("Please enter a pickup address.");
      return;
    }
    if (!selectedRoute) {
      setError("Please select a route.");
      return;
    }
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/outstation")}`);
      return;
    }

    setConfirming(true);
    try {
      const res = await fetch("/api/bookings/outstation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routeId: selectedRoute.id,
          pickup,
          scheduledAt: new Date(scheduledAt).toISOString(),
          isShared,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create outstation booking.");
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Ride Type Preference (Private vs Share-a-Cab Carpooling) */}
      <div className="rounded-stub border border-line bg-paper p-1 flex">
        <button
          type="button"
          onClick={() => setIsShared(false)}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-stub transition ${
            !isShared ? "bg-route text-paper shadow-sm" : "text-ink/60 hover:text-ink"
          }`}
        >
          🚘 Book Full Cab (Private)
        </button>
        <button
          type="button"
          onClick={() => setIsShared(true)}
          className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded-stub transition flex items-center justify-center gap-1 ${
            isShared ? "bg-route text-paper shadow-sm" : "text-ink/60 hover:text-ink"
          }`}
        >
          🤝 Share-a-Cab (Save 30%)
        </button>
      </div>

      <div>
        <label htmlFor="route" className="text-sm font-medium text-ink">
          Select Outstation Route & Trip Type
        </label>
        <select
          id="route"
          value={selectedRouteId}
          onChange={(e) => setSelectedRouteId(e.target.value)}
          className={inputClass}
        >
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.from_city} → {r.to_city} ({r.trip_type === "one_way" ? "One-Way" : "Round-Trip"}) — {formatCurrency(isShared ? Math.round(r.price * 0.7) : r.price)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pickup" className="text-sm font-medium text-ink">
            Pickup location ({selectedRoute?.from_city})
          </label>
          <input
            id="pickup"
            type="text"
            required
            placeholder={`Enter pickup address in ${selectedRoute?.from_city || "origin city"}`}
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="scheduledAt" className="text-sm font-medium text-ink">
            Pickup date & time
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

      {selectedRoute && (
        <div className="rounded-stub border border-line bg-paper/60 p-5 space-y-3">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
            Fare Summary
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-display font-bold text-ink">
                {selectedRoute.from_city} → {selectedRoute.to_city}
              </span>
              <span className="ml-2 text-xs font-mono uppercase bg-marigold/20 text-ink px-2 py-0.5 rounded">
                {selectedRoute.trip_type === "one_way" ? "One Way" : "Round Trip"}
              </span>
              {isShared && (
                <span className="ml-2 text-xs font-mono uppercase bg-route/20 text-route px-2 py-0.5 rounded font-bold">
                  🤝 Shared (30% Off)
                </span>
              )}
            </div>
            <div className="text-right">
              {isShared && (
                <span className="block text-xs font-mono line-through text-ink/40">
                  {formatCurrency(selectedRoute.price)}
                </span>
              )}
              <span className="font-mono text-xl font-bold text-route">
                {formatCurrency(calculatedFare)}
              </span>
            </div>
          </div>
          <p className="text-xs text-ink/60">
            {isShared
              ? "Share-a-Cab mode: Split the ride with co-passengers heading on the same route & save 30%."
              : "Private Cab mode: Entire vehicle reserved exclusively for you & your group."}
          </p>
        </div>
      )}

      {error && <p className="text-sm text-alert">{error}</p>}

      <Button type="button" onClick={handleConfirm} disabled={confirming}>
        {confirming ? "Booking Outstation..." : `Confirm ${isShared ? "Shared" : "Private"} Booking →`}
      </Button>
    </div>
  );
}
