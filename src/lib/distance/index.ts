import { getMockDistanceKm } from "./mock";

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  pickupCoords: [number, number]; // [lat, lng]
  dropCoords: [number, number];   // [lat, lng]
  polyline: [number, number][];   // Array of [lat, lng]
}

const CITY_COORDS: Record<string, [number, number]> = {
  dhanbad: [23.7957, 86.4304],
  "maithon dam": [23.7844, 86.8094],
  bhatinda: [23.6822, 86.3571],
  topchanchi: [23.9015, 86.2045],
  ranchi: [23.3441, 85.3096],
  bokaro: [23.6693, 86.1511],
  jamshedpur: [22.8046, 86.2029],
  kolkata: [22.5726, 88.3639],
  mumbai: [19.076, 72.8777],
  pune: [18.5204, 73.8567],
  bengaluru: [12.9716, 77.5946],
  mysuru: [12.2958, 76.6394],
  delhi: [28.6139, 77.209],
  agra: [27.1767, 78.0081],
};

function getFallbackCoords(name: string): [number, number] {
  const norm = name.toLowerCase().trim();
  for (const k of Object.keys(CITY_COORDS)) {
    if (norm.includes(k)) return CITY_COORDS[k];
  }
  let hash = 0;
  for (let i = 0; i < norm.length; i++) hash = (hash * 31 + norm.charCodeAt(i)) >>> 0;
  return [23.7957 + (hash % 50) * 0.005, 86.4304 + (hash % 40) * 0.005];
}

export async function geocodeLocation(location: string): Promise<[number, number]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ", India")}&limit=1`,
      { headers: { "User-Agent": "TerminalCabs/1.0" } }
    );
    const data = await res.json();
    if (data && data[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.warn("Geocoding notice:", e);
  }
  return getFallbackCoords(location);
}

export async function getDistanceKm(pickup: string, drop: string): Promise<number> {
  const result = await calculateRouteDistance(pickup, drop);
  return result.distanceKm;
}

export async function calculateRouteDistance(
  pickup: string,
  drop: string
): Promise<RouteResult> {
  try {
    const pCoords = await geocodeLocation(pickup);
    const dCoords = await geocodeLocation(drop);

    // OSRM Driving Route API call (Free Open Routing Machine)
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pCoords[1]},${pCoords[0]};${dCoords[1]},${dCoords[0]}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl);
    const data = await res.json();

    if (data?.routes?.[0]) {
      const route = data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
      const durationMinutes = Math.round(route.duration / 60);

      // GeoJSON coordinates are [lng, lat] -> convert to Leaflet [lat, lng]
      const polyline: [number, number][] = route.geometry.coordinates.map(
        (c: [number, number]) => [c[1], c[0]]
      );

      return {
        distanceKm: distanceKm > 0 ? distanceKm : 10,
        durationMinutes: durationMinutes > 0 ? durationMinutes : 25,
        pickupCoords: pCoords,
        dropCoords: dCoords,
        polyline,
      };
    }
  } catch (err) {
    console.warn("OSRM routing notice:", err);
  }

  // Fallback if network offline
  const pCoords = getFallbackCoords(pickup);
  const dCoords = getFallbackCoords(drop);
  const mockDist = getMockDistanceKm(pickup, drop);
  return {
    distanceKm: mockDist,
    durationMinutes: Math.round(mockDist * 3.5),
    pickupCoords: pCoords,
    dropCoords: dCoords,
    polyline: [pCoords, dCoords],
  };
}
