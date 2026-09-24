import { NextResponse } from "next/server";
import { getDistanceKm } from "@/lib/distance";
import { getActiveLocalPricing, computeLocalFare } from "@/lib/pricing/local";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const pickup: string | undefined = body?.pickup;
  const drop: string | undefined = body?.drop;
  const surgeMultiplier: number = Number(body?.surgeMultiplier || 1.0);

  if (!pickup?.trim() || !drop?.trim()) {
    return NextResponse.json(
      { error: "Pickup and drop locations are required." },
      { status: 400 }
    );
  }

  try {
    const distanceKm = await getDistanceKm(pickup, drop);
    const { base_fare, per_km_rate } = await getActiveLocalPricing();
    const fareBreakdown = computeLocalFare(distanceKm, base_fare, per_km_rate, surgeMultiplier);
    return NextResponse.json({ fareBreakdown, distanceKm });
  } catch (err) {
    console.error("Local quote error:", err);
    const message = err instanceof Error ? err.message : "Could not calculate a fare.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
