import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOutstationRouteById } from "@/lib/pricing/outstation";
import { sendWhatsAppNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to book an outstation trip." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const routeId: string | undefined = body?.routeId;
  const pickup: string | undefined = body?.pickup;
  const scheduledAt: string | undefined = body?.scheduledAt;
  const isShared: boolean = Boolean(body?.isShared);

  if (!routeId || !pickup?.trim() || !scheduledAt) {
    return NextResponse.json(
      { error: "Missing required route, pickup location, or scheduled date." },
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

  const route = await getOutstationRouteById(routeId);
  if (!route) {
    return NextResponse.json(
      { error: "Selected outstation route is invalid or no longer active." },
      { status: 400 }
    );
  }

  // 30% discount if carpooling / shared ride
  const finalPrice = isShared ? Math.round(route.price * 0.7) : route.price;

  const fareBreakdown = {
    total: finalPrice,
    base_route_price: route.price,
    is_shared: isShared,
    discount: isShared ? Math.round(route.price * 0.3) : 0,
    route_name: `${route.from_city} to ${route.to_city} (${route.trip_type === "one_way" ? "One Way" : "Round Trip"})`,
  };

  try {
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        service_type: "outstation",
        status: "requested",
        route_id: route.id.startsWith("route-") ? null : route.id,
        pickup_location: pickup.trim(),
        drop_location: `${route.to_city}`,
        fare_breakdown: fareBreakdown,
        fare_amount: finalPrice,
        is_shared: isShared,
        scheduled_at: scheduledDate.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await sendWhatsAppNotification(booking.id, "outstation_booking_created");

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("Outstation booking creation error:", err);
    const message = err instanceof Error ? err.message : "Could not create outstation booking.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
