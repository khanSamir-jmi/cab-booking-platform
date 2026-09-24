/**
 * Stand-in for the Google Distance Matrix API, for local development
 * without a Google Cloud billing account. Swap this out for a real call
 * once Maps API access is available — see README "Swapping In Real
 * Google Maps Later".
 *
 * Deterministic on purpose: the same pickup/drop pair always returns the
 * same distance. This matters because /api/bookings/local recomputes the
 * fare server-side and never trusts the client's earlier quote — if this
 * were randomized per call, the price shown at quote time would almost
 * never match the price charged at confirm time, which would look like a
 * bug during testing (and would be a bad customer experience for real).
 */
export function getMockDistanceKm(pickup: string, drop: string): number {
  const seed = `${pickup.trim().toLowerCase()}|${drop.trim().toLowerCase()}`;

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0; // keep it an unsigned 32-bit int
  }

  const normalized = hash / 0xffffffff; // 0..1
  const distanceKm = 5 + normalized * 15; // 5..20 km, per the requested range

  return Math.round(distanceKm * 10) / 10; // one decimal place
}
