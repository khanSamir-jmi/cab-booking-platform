import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSightseeingPackageById } from "@/lib/pricing/sightseeing";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to book a sightseeing package." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const packageId: string | undefined = body?.packageId;
  const pickup: string | undefined = body?.pickup;
  const scheduledAt: string | undefined = body?.scheduledAt;

  if (!packageId || !pickup?.trim() || !scheduledAt) {
    return NextResponse.json(
      { error: "Missing required package, pickup location, or scheduled date." },
      { status: 400 }
    );
  }

  const scheduledDate = new Date(scheduledAt);
  if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Please choose a valid future date and time." },
      { status: 400 }
    );
  }

  const pkg = await getSightseeingPackageById(packageId);
  if (!pkg) {
    return NextResponse.json(
      { error: "Selected sightseeing package is invalid or no longer active." },
      { status: 400 }
    );
  }

  const fareBreakdown = {
    package_price: pkg.price,
    duration_hours: pkg.duration_hours,
    total: pkg.price,
  };

  try {
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        service_type: "sightseeing",
        status: "requested",
        package_id: pkg.id.startsWith("pkg-") ? null : pkg.id,
        pickup_location: pickup.trim(),
        fare_breakdown: fareBreakdown,
        fare_amount: pkg.price,
        scheduled_at: scheduledDate.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("Sightseeing booking creation error:", err);
    const message = err instanceof Error ? err.message : "Could not create sightseeing booking.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
