import { createClient } from "@/lib/supabase/server";
import type { HourlyRentalSlab } from "@/types/database.types";

const MOCK_HOURLY_SLABS: HourlyRentalSlab[] = [
  {
    id: "slab-2hr-20km",
    duration_hours: 2,
    km_limit: 20,
    price: 600,
    is_active: true,
  },
  {
    id: "slab-4hr-40km",
    duration_hours: 4,
    km_limit: 40,
    price: 1200,
    is_active: true,
  },
  {
    id: "slab-8hr-80km",
    duration_hours: 8,
    km_limit: 80,
    price: 2200,
    is_active: true,
  },
  {
    id: "slab-12hr-120km",
    duration_hours: 12,
    km_limit: 120,
    price: 3200,
    is_active: true,
  },
];

export async function getActiveHourlySlabs(): Promise<HourlyRentalSlab[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("hourly_rental_slabs")
      .select("*")
      .eq("is_active", true)
      .order("duration_hours");

    if (error || !data || data.length === 0) {
      return MOCK_HOURLY_SLABS;
    }

    return data.map((s: any) => ({
      ...s,
      duration_hours: Number(s.duration_hours),
      km_limit: Number(s.km_limit),
      price: Number(s.price),
    }));
  } catch {
    return MOCK_HOURLY_SLABS;
  }
}

export async function getHourlySlabById(id: string): Promise<HourlyRentalSlab | null> {
  const slabs = await getActiveHourlySlabs();
  return slabs.find((s) => s.id === id) ?? null;
}
