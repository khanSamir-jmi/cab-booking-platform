import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { logNotification } from "@/lib/notifications";
import type { BookingStatus } from "@/types/database.types";

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
  const status: BookingStatus | undefined = body?.status;

  if (!status) {
    return NextResponse.json({ error: "New status is required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logNotification(bookingId, "email", `status_changed_${status}`);

  return NextResponse.json({ booking });
}
