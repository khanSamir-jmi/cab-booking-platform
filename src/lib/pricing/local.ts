import { createClient } from "@/lib/supabase/server";
import type { FareBreakdown } from "@/types/database.types";

const DEFAULT_LOCAL_PRICING = {
  base_fare: 50,
  per_km_rate: 15,
};

export async function getActiveLocalPricing() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("local_pricing_config")
      .select("base_fare, per_km_rate")
      .order("effective_from", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.warn(
        "Local pricing config row not found in database; using default fallback pricing (₹50 base, ₹15/km)."
      );
      return DEFAULT_LOCAL_PRICING;
    }

    return {
      base_fare: Number(data.base_fare),
      per_km_rate: Number(data.per_km_rate),
    };
  } catch (err) {
    console.warn("Error fetching local pricing config; using default fallback pricing:", err);
    return DEFAULT_LOCAL_PRICING;
  }
}

export function computeLocalFare(
  distanceKm: number,
  baseFare: number,
  perKmRate: number,
  surgeMultiplier: number = 1.0
): FareBreakdown {
  const roundedDistance = Math.round(distanceKm * 100) / 100;
  const rawTotal = Number(baseFare) + roundedDistance * Number(perKmRate);
  const total = Math.round(rawTotal * surgeMultiplier);

  return {
    base_fare: Number(baseFare),
    per_km_rate: Number(perKmRate),
    distance_km: roundedDistance,
    total,
  };
}
