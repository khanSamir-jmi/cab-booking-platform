import { formatCurrency } from "@/lib/utils";
import type { FareBreakdown } from "@/types/database.types";

export function FareBreakdownCard({ breakdown }: { breakdown: FareBreakdown }) {
  return (
    <div className="rounded-stub border border-dashed border-line bg-paper p-4 font-mono text-sm">
      {breakdown.base_fare !== undefined && (
        <div className="flex justify-between text-ink/70">
          <span>Base fare</span>
          <span>{formatCurrency(breakdown.base_fare)}</span>
        </div>
      )}
      {breakdown.distance_km !== undefined &&
        breakdown.per_km_rate !== undefined && (
          <div className="mt-1 flex justify-between text-ink/70">
            <span>
              {breakdown.distance_km} km × {formatCurrency(breakdown.per_km_rate)}
            </span>
            <span>
              {formatCurrency(breakdown.distance_km * breakdown.per_km_rate)}
            </span>
          </div>
        )}
      {breakdown.package_price !== undefined && (
        <div className="flex justify-between text-ink/70">
          <span>Package price</span>
          <span>{formatCurrency(breakdown.package_price)}</span>
        </div>
      )}
      {breakdown.slab_price !== undefined && (
        <div className="flex justify-between text-ink/70">
          <span>Rental price</span>
          <span>{formatCurrency(breakdown.slab_price)}</span>
        </div>
      )}
      <div className="mt-2 flex justify-between border-t border-line pt-2 font-medium text-ink">
        <span>Total</span>
        <span>{formatCurrency(breakdown.total)}</span>
      </div>
    </div>
  );
}
