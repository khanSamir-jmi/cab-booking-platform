import { createClient } from "@/lib/supabase/server";
import type { SightseeingPackage } from "@/types/database.types";

const MOCK_SIGHTSEEING_PACKAGES: SightseeingPackage[] = [
  {
    id: "pkg-city-highlights",
    name: "City Highlights & Heritage Tour",
    description: "Full-day coverage of major heritage sites, monuments, local markets, and popular photo spots with an experienced driver.",
    price: 2800,
    duration_hours: 8,
    is_active: true,
  },
  {
    id: "pkg-express-half-day",
    name: "Express Half-Day Tour",
    description: "4-hour whirlwind tour covering top 4 popular attractions for visitors short on time.",
    price: 1600,
    duration_hours: 4,
    is_active: true,
  },
  {
    id: "pkg-night-lights",
    name: "City Evening & Night Lights Tour",
    description: "3-hour evening drive exploring illuminated landmarks, scenic promenades, and night food streets.",
    price: 1400,
    duration_hours: 3,
    is_active: true,
  },
];

export async function getActiveSightseeingPackages(): Promise<SightseeingPackage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sightseeing_packages")
      .select("*")
      .eq("is_active", true)
      .order("price");

    if (error || !data || data.length === 0) {
      return MOCK_SIGHTSEEING_PACKAGES;
    }

    return data.map((p: any) => ({
      ...p,
      price: Number(p.price),
      duration_hours: Number(p.duration_hours),
    }));
  } catch {
    return MOCK_SIGHTSEEING_PACKAGES;
  }
}

export async function getSightseeingPackageById(id: string): Promise<SightseeingPackage | null> {
  const pkgs = await getActiveSightseeingPackages();
  return pkgs.find((p) => p.id === id) ?? null;
}
