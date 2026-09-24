import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { logNotification } from "@/lib/notifications";

export async function POST(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
  }

  const bookingId = params.bookingId;
  const supabase = createClient();

  const { data: booking, error: bError } = await supabase
    .from("bookings")
    .select("id, fare_amount")
    .eq("id", bookingId)
    .single();

  if (bError || !booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  // Simulated Razorpay Payment Link generation
  const linkUrl = `https://rzp.io/i/pay_${bookingId.substring(0, 8)}`;

  const { data: payment, error: pError } = await supabase
    .from("payments")
    .insert({
      booking_id: bookingId,
      amount: booking.fare_amount,
      method: "link",
      status: "link_sent",
      link_url: linkUrl,
    })
    .select()
    .single();

  if (pError) {
    return NextResponse.json({ error: pError.message }, { status: 500 });
  }

  await logNotification(bookingId, "sms", "payment_link_sent");

  return NextResponse.json({ payment, link_url: linkUrl });
}
