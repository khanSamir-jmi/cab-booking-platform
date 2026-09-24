import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { logNotification } from "@/lib/notifications";
import type { PaymentMethod } from "@/types/database.types";

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  const bookingId = params.bookingId;
  const body = await request.json().catch(() => null);
  const method: PaymentMethod = body?.method || "cash";
  const reference: string | undefined = body?.reference;

  const supabase = createClient();
  const { data: booking, error: bError } = await supabase
    .from("bookings")
    .select("id, fare_amount")
    .eq("id", bookingId)
    .single();

  if (bError || !booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const { data: payment, error: pError } = await supabase
    .from("payments")
    .insert({
      booking_id: bookingId,
      amount: booking.fare_amount,
      method,
      status: "paid",
      payment_reference: reference?.trim() || `MANUAL-${Date.now()}`,
    })
    .select()
    .single();

  if (pError) {
    return NextResponse.json({ error: pError.message }, { status: 500 });
  }

  await logNotification(bookingId, "email", "payment_received_manual");

  return NextResponse.json({ payment });
}
