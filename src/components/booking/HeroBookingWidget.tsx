"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const inputClass =
  "w-full rounded-stub border border-line bg-paper px-3.5 py-3 text-sm text-ink focus:border-route focus:bg-white focus:outline-none transition-all";

export function HeroBookingWidget() {
  const [rideType, setRideType] = useState<"local" | "outstation" | "hourly">("local");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [isSelfDrive, setIsSelfDrive] = useState(false);

  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rideType === "local") {
      router.push(`/local?pickup=${encodeURIComponent(pickup)}&drop=${encodeURIComponent(drop)}&selfDrive=${isSelfDrive}`);
    } else if (rideType === "outstation") {
      router.push(`/outstation?pickup=${encodeURIComponent(pickup)}&selfDrive=${isSelfDrive}`);
    } else {
      router.push(`/hourly?pickup=${encodeURIComponent(pickup)}&selfDrive=${isSelfDrive}`);
    }
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-line bg-white p-6 shadow-lg space-y-6">
      {/* Ride Type Selector Tabs */}
      <div className="flex items-center justify-between rounded-stub bg-paper p-1 border border-line/60">
        <button
          type="button"
          onClick={() => setRideType("local")}
          className={`flex-1 rounded-stub py-2 font-mono text-xs font-bold uppercase transition ${
            rideType === "local" ? "bg-route text-paper shadow" : "text-ink/60 hover:text-ink"
          }`}
        >
          🚕 Local
        </button>
        <button
          type="button"
          onClick={() => setRideType("outstation")}
          className={`flex-1 rounded-stub py-2 font-mono text-xs font-bold uppercase transition ${
            rideType === "outstation" ? "bg-route text-paper shadow" : "text-ink/60 hover:text-ink"
          }`}
        >
          🛣️ Outstation
        </button>
        <button
          type="button"
          onClick={() => setRideType("hourly")}
          className={`flex-1 rounded-stub py-2 font-mono text-xs font-bold uppercase transition ${
            rideType === "hourly" ? "bg-route text-paper shadow" : "text-ink/60 hover:text-ink"
          }`}
        >
          ⏱️ Hourly
        </button>
      </div>

      {/* Driver Mode Toggle: Chauffeur vs Self-Drive */}
      <div className="flex items-center justify-between rounded-stub border border-line/80 bg-paper/50 px-4 py-2.5">
        <div>
          <p className="font-display text-sm font-bold text-ink">Driving Preference</p>
          <p className="text-xs text-ink/60">
            {isSelfDrive ? "You pick up and drive the car yourself" : "Includes professional verified chauffeur"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSelfDrive(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-stub transition ${
              !isSelfDrive ? "bg-marigold text-ink shadow-sm" : "bg-white text-ink/60 border border-line"
            }`}
          >
            Chauffeur
          </button>
          <button
            type="button"
            onClick={() => setIsSelfDrive(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-stub transition ${
              isSelfDrive ? "bg-marigold text-ink shadow-sm" : "bg-white text-ink/60 border border-line"
            }`}
          >
            Self-Drive
          </button>
        </div>
      </div>

      {/* Booking Form Inputs */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-mono font-medium uppercase text-ink/60">
            Pickup Location
          </label>
          <input
            type="text"
            required
            placeholder="Enter pickup address or city"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            className={inputClass}
          />
        </div>

        {rideType === "local" && (
          <div>
            <label className="text-xs font-mono font-medium uppercase text-ink/60">
              Drop Location
            </label>
            <input
              type="text"
              required
              placeholder="Enter drop address or landmark"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        <Button type="submit" size="lg" className="w-full text-base font-bold shadow-md">
          {rideType === "local"
            ? "Calculate Live Fare →"
            : rideType === "outstation"
            ? "Explore Outstation Routes →"
            : "Select Rental Slabs →"}
        </Button>
      </form>
    </div>
  );
}
