import { createClient } from "@/lib/supabase/server";
import type { OutstationRoute } from "@/types/database.types";

const MOCK_OUTSTATION_ROUTES: OutstationRoute[] = [
  {
    id: "route-mumbai-pune-ow",
    from_city: "Mumbai",
    to_city: "Pune",
    trip_type: "one_way",
    price: 2500,
    is_active: true,
  },
  {
    id: "route-mumbai-pune-rt",
    from_city: "Mumbai",
    to_city: "Pune",
    trip_type: "round_trip",
    price: 4500,
    is_active: true,
  },
  {
    id: "route-bengaluru-mysuru-ow",
    from_city: "Bengaluru",
    to_city: "Mysuru",
    trip_type: "one_way",
    price: 3000,
    is_active: true,
  },
  {
    id: "route-delhi-agra-ow",
    from_city: "Delhi",
    to_city: "Agra",
    trip_type: "one_way",
    price: 3500,
    is_active: true,
  },
];

export async function getActiveOutstationRoutes(): Promise<OutstationRoute[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("outstation_routes")
      .select("*")
      .eq("is_active", true)
      .order("from_city");

    if (error || !data || data.length === 0) {
      return MOCK_OUTSTATION_ROUTES;
    }

    return data.map((r: any) => ({
      ...r,
      price: Number(r.price),
    }));
  } catch {
    return MOCK_OUTSTATION_ROUTES;
  }
}

export async function getOutstationRouteById(id: string): Promise<OutstationRoute | null> {
  const routes = await getActiveOutstationRoutes();
  return routes.find((r) => r.id === id) ?? null;
}
