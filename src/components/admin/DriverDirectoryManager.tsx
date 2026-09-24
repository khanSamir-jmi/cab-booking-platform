"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { Driver } from "@/types/database.types";

const inputClass =
  "mt-1 w-full rounded-stub border border-line bg-white px-3 py-2 text-sm text-ink focus:border-route focus:outline-none";

export function DriverDirectoryManager({ initialDrivers }: { initialDrivers: Driver[] }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Sedan");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function handleAddDriver(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          vehicle_number: vehicleNumber,
          vehicle_type: vehicleType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add driver.");

      setName("");
      setPhone("");
      setVehicleNumber("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating driver");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Form */}
      <div className="lg:col-span-1 rounded-stub border border-line bg-white p-6 space-y-4">
        <h3 className="font-display text-lg font-bold text-ink">Add New Driver</h3>
        <form onSubmit={handleAddDriver} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink">Driver Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Phone Number</label>
            <input
              type="tel"
              required
              placeholder="e.g. +91 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Vehicle Number</label>
            <input
              type="text"
              required
              placeholder="e.g. MH 12 AB 1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink">Vehicle Category</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className={inputClass}
            >
              <option value="Sedan">Sedan (Dzire / Etios)</option>
              <option value="SUV">SUV (Ertiga / Innova)</option>
              <option value="Hatchback">Hatchback (WagonR)</option>
            </select>
          </div>

          {error && <p className="text-xs text-alert">{error}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Saving..." : "Add Driver"}
          </Button>
        </form>
      </div>

      {/* Directory List */}
      <div className="lg:col-span-2 rounded-stub border border-line bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-ink">Active Fleet Directory</h3>
          <span className="font-mono text-xs text-ink/50">{initialDrivers.length} Drivers</span>
        </div>

        <div className="divide-y divide-line/60">
          {initialDrivers.length === 0 ? (
            <p className="py-8 text-center font-mono text-sm text-ink/50">
              No drivers added yet. Use the form to provision your first driver.
            </p>
          ) : (
            initialDrivers.map((d) => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-ink">{d.name}</p>
                  <p className="text-xs font-mono text-ink/60">
                    📞 {d.phone} | 🚗 {d.vehicle_number} ({d.vehicle_type})
                  </p>
                </div>
                <span
                  className={`font-mono text-xs px-2.5 py-1 rounded ${
                    d.is_active
                      ? "bg-route/10 text-route"
                      : "bg-paper text-ink/50"
                  }`}
                >
                  {d.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
