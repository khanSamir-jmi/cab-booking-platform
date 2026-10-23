"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FareBreakdownCard } from "@/components/booking/FareBreakdownCard";
import { Button } from "@/components/ui/Button";
import type { FareBreakdown } from "@/types/database.types";

function defaultScheduledAt() {
  const d = new Date(Date.now() + 60 * 60 * 1000); // an hour from now
  d.setMinutes(0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

const inputClass =
  "mt-1.5 w-full rounded-stub border border-line bg-white px-3 py-2 text-sm text-ink focus:border-route focus:outline-none";

export function LocalBookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [pickup, setPickup] = useState(searchParams.get("pickup") || "");
  const [drop, setDrop] = useState(searchParams.get("drop") || "");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt());
  const [isSelfDrive, setIsSelfDrive] = useState(searchParams.get("selfDrive") === "true");
  const [fareBreakdown, setFareBreakdown] = useState<FareBreakdown | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canQuote = pickup.trim().length > 2 && drop.trim().length > 2;

  // Auto-quote if initial pickup and drop are provided in search params
  useEffect(() => {
    const initPickup = searchParams.get("pickup");
    const initDrop = searchParams.get("drop");
    if (initPickup && initDrop && initPickup.trim().length > 2 && initDrop.trim().length > 2) {
      calculateFare(initPickup, initDrop);
    }
  }, []);

  async function calculateFare(p = pickup, d = drop) {
    if (p.trim().length <= 2 || d.trim().length <= 2) return;
    setError(null);
    setQuoting(true);
    setFareBreakdown(null);

    try {
      const res = await fetch("/api/bookings/local/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup: p, drop: d }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not calculate a fare.");
      setFareBreakdown(data.fareBreakdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setQuoting(false);
    }
  }

  async function handleConfirm() {
    if (!canQuote || !fareBreakdown) return;
    setError(null);
    setConfirming(true);

    try {
      const res = await fetch("/api/bookings/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup,
          drop,
          scheduledAt: new Date(scheduledAt).toISOString(),
          isSelfDrive,
        }),
      });

      if (res.status === 401) {
        // Redirect to login with return path
        const currentUrl =
          window.location.pathname +
          (window.location.search || `?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}`);
        router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create the booking.");
      router.push(`/bookings/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pickup" className="text-sm font-medium text-ink">
            Pickup location
          </label>
          <input
            id="pickup"
            type="text"
            required
            placeholder="Enter pickup address"
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value);
              setFareBreakdown(null);
            }}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="drop" className="text-sm font-medium text-ink">
            Drop location
          </label>
          <input
            id="drop"
            type="text"
            required
            placeholder="Enter drop address"
            value={drop}
            onChange={(e) => {
              setDrop(e.target.value);
              setFareBreakdown(null);
            }}
            className={inputClass}
          />
        </div>
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
          className={`${inputClass} sm:w-64`}
        />
      </div>

      {!fareBreakdown && (
        <Button type="button" onClick={() => calculateFare()} disabled={!canQuote || quoting}>
          {quoting ? "Calculating fare…" : "Get fare estimate"}
        </Button>
      )}

      {error && <p className="text-sm text-alert">{error}</p>}

      {fareBreakdown && (
        <div className="space-y-4 rounded-stub border border-line bg-white p-5">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
            Your fare
          </p>
          <FareBreakdownCard breakdown={fareBreakdown} />
          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleConfirm} disabled={confirming}>
              {confirming ? "Booking…" : "Confirm booking"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setFareBreakdown(null)}>
              Change details
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
