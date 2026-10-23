import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser, ensureValidUuid } from "@/lib/auth";
import { getOutstationRouteById } from "@/lib/pricing/outstation";
import { sendWhatsAppNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const user = await getCurrentUser();

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
    const validUserId = ensureValidUuid(user.id, user.email);
    const db = createAdminClient();

    // Ensure profile row exists for foreign key
    try {
      await db.from("profiles").upsert(
        {
          id: validUserId,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer",
          phone: user.phone || null,
          role: "customer",
        },
        { onConflict: "id" }
      );
    } catch {
      // Safe fallback
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const cleanRouteId = route.id && uuidRegex.test(route.id) ? route.id : null;

    const { data: booking, error } = await db
      .from("bookings")
      .insert({
        customer_id: validUserId,
        service_type: "outstation",
        status: "requested",
        route_id: cleanRouteId,
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
