import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { logNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  const bookingId = params.id;
  const body = await request.json().catch(() => null);
  const driverId: string | undefined = body?.driverId;

  if (!driverId) {
    return NextResponse.json({ error: "Driver ID is required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      driver_id: driverId,
      status: "driver_assigned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logNotification(bookingId, "sms", "driver_assigned");

  return NextResponse.json({ booking });
}
