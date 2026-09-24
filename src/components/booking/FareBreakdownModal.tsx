"use client";

import { useState } from "react";
import type { FareBreakdown } from "@/types/database.types";
import { formatCurrency } from "@/lib/utils";

export function FareBreakdownModal({ breakdown }: { breakdown: FareBreakdown }) {
  const [isOpen, setIsOpen] = useState(false);

  const baseFare = breakdown.base_fare ?? 50;
  const distanceKm = breakdown.distance_km ?? 10;
  const perKmRate = breakdown.per_km_rate ?? 15;
  const distanceCharge = Math.round(distanceKm * perKmRate);
  const estimatedTaxes = Math.round(breakdown.total * 0.05); // 5% GST
  const driverAllowance = 200;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1 font-mono text-xs text-route font-bold hover:underline"
        title="View Fare Breakdown"
      >
        <span>ℹ️ View Line Items</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-stub border border-line bg-white p-6 shadow-xl space-y-6 animate-fade-up">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-lg font-bold text-ink">Fare Breakdown Details</h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-ink/50 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs text-ink/80">
              <div className="flex justify-between">
                <span>Base Fare:</span>
                <span>{formatCurrency(baseFare)}</span>
              </div>
              {breakdown.distance_km && (
                <div className="flex justify-between">
                  <span>Distance ({distanceKm} km × ₹{perKmRate}/km):</span>
                  <span>{formatCurrency(distanceCharge)}</span>
                </div>
              )}
              {breakdown.package_price && (
                <div className="flex justify-between">
                  <span>Package Base Price:</span>
                  <span>{formatCurrency(breakdown.package_price)}</span>
                </div>
              )}
              {breakdown.slab_price && (
                <div className="flex justify-between">
                  <span>Rental Slab Base Price:</span>
                  <span>{formatCurrency(breakdown.slab_price)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink/60">
                <span>Estimated Taxes (5% GST):</span>
                <span>{formatCurrency(estimatedTaxes)}</span>
              </div>
              <div className="flex justify-between text-ink/60">
                <span>Chauffeur / Night Allowance:</span>
                <span>Included</span>
              </div>

              <div className="border-t border-line pt-3 flex justify-between font-bold text-sm text-ink">
                <span>Total Upfront Amount:</span>
                <span className="text-route">{formatCurrency(breakdown.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full rounded-stub bg-route py-2.5 text-xs font-bold text-paper"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
