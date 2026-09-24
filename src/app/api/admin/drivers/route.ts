import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: drivers, error } = await supabase
    .from("drivers")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ drivers });
}

export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name: string | undefined = body?.name;
  const phone: string | undefined = body?.phone;
  const vehicleNumber: string | undefined = body?.vehicle_number;
  const vehicleType: string | undefined = body?.vehicle_type;

  if (!name?.trim() || !phone?.trim() || !vehicleNumber?.trim()) {
    return NextResponse.json(
      { error: "Driver name, phone, and vehicle number are required." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data: driver, error } = await supabase
    .from("drivers")
    .insert({
      name: name.trim(),
      phone: phone.trim(),
      vehicle_number: vehicleNumber.trim(),
      vehicle_type: vehicleType?.trim() || "Sedan",
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Driver creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ driver });
}
