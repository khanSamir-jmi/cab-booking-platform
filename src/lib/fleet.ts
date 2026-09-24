import { createClient } from "@/lib/supabase/server";

export interface FleetVehicle {
  id: string;
  name: string;
  category: string;
  capacity_passengers: number;
  capacity_luggage: number;
  price_per_km: number;
  price_per_hour: number;
  image_url: string;
  is_active: boolean;
}

export const FALLBACK_FLEET: FleetVehicle[] = [
  {
    id: "v-sedan",
    name: "Maruti Swift Dzire / Etios",
    category: "Sedan",
    capacity_passengers: 4,
    capacity_luggage: 2,
    price_per_km: 14,
    price_per_hour: 150,
    image_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "v-hatchback",
    name: "Compact Hatchback (WagonR)",
    category: "Hatchback",
    capacity_passengers: 4,
    capacity_luggage: 1,
    price_per_km: 11,
    price_per_hour: 120,
    image_url: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "v-suv",
    name: "Toyota Innova / Ertiga",
    category: "SUV",
    capacity_passengers: 6,
    capacity_luggage: 4,
    price_per_km: 20,
    price_per_hour: 250,
    image_url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
  {
    id: "v-luxury",
    name: "Mercedes Benz C-Class",
    category: "Luxury",
    capacity_passengers: 4,
    capacity_luggage: 3,
    price_per_km: 45,
    price_per_hour: 600,
    image_url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80",
    is_active: true,
  },
];

export async function getActiveFleet(): Promise<FleetVehicle[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("fleet_vehicles")
      .select("*")
      .eq("is_active", true)
      .order("price_per_km");

    if (error || !data || data.length === 0) {
      return FALLBACK_FLEET;
    }

    return data.map((v: any) => ({
      ...v,
      price_per_km: Number(v.price_per_km),
      price_per_hour: Number(v.price_per_hour),
    }));
  } catch {
    return FALLBACK_FLEET;
  }
}
