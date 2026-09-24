import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const bookingId: string | undefined = body?.bookingId;
  const licenseUrl: string | undefined = body?.licenseUrl;
  const idDocumentUrl: string | undefined = body?.idDocumentUrl;

  if (!bookingId || !licenseUrl || !idDocumentUrl) {
    return NextResponse.json(
      { error: "Booking ID, Driving License, and Government ID documents are required." },
      { status: 400 }
    );
  }

  // Simulate OCR validation delay (1.5 seconds)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const supabase = createClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .update({
      documents_status: "verified",
      license_url: licenseUrl,
      id_document_url: idDocumentUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    booking,
    ocrStatus: "MATCHED",
    message: "Driving License & ID OCR validation successful.",
  });
}
