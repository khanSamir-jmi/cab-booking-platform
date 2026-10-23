import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentUser, ensureValidUuid } from "@/lib/auth";
import { getMockDistanceKm } from "@/lib/distance/mock";
import { getDistanceKm } from "@/lib/distance";
import { getActiveLocalPricing, computeLocalFare } from "@/lib/pricing/local";
import { sendWhatsAppNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to book." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const pickup: string | undefined = body?.pickup;
  const drop: string | undefined = body?.drop;
  const scheduledAt: string | undefined = body?.scheduledAt;
  const isSelfDrive: boolean = Boolean(body?.isSelfDrive);

  if (!pickup?.trim() || !drop?.trim() || !scheduledAt) {
    return NextResponse.json(
      { error: "Missing pickup, drop, or scheduled time." },
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

  try {
    let distanceKm = 15;
    try {
      distanceKm = await getDistanceKm(pickup, drop);
    } catch {
      distanceKm = getMockDistanceKm(pickup, drop);
    }

    const { base_fare, per_km_rate } = await getActiveLocalPricing();
    const fareBreakdown = computeLocalFare(distanceKm, base_fare, per_km_rate);

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

    const { data: booking, error } = await db
      .from("bookings")
      .insert({
        customer_id: validUserId,
        service_type: "local",
        status: "requested",
        pickup_location: pickup.trim(),
        drop_location: drop.trim(),
        distance_km: fareBreakdown.distance_km,
        fare_breakdown: fareBreakdown,
        fare_amount: fareBreakdown.total,
        scheduled_at: scheduledDate.toISOString(),
        is_self_drive: isSelfDrive,
      })
      .select()
      .single();

    if (error) throw error;

    await sendWhatsAppNotification(booking.id, "local_booking_confirmed");

    return NextResponse.json({ booking });
  } catch (err) {
    console.error("Local booking creation error:", err);
    const message = err instanceof Error ? err.message : "Could not create the booking.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
