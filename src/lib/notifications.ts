import { createAdminClient } from "@/lib/supabase/server";

export async function logNotification(bookingId: string, channel: "email" | "sms", status: string) {
  try {
    const supabase = createAdminClient();
    await supabase.from("notifications_log").insert({
      booking_id: bookingId,
      channel,
      status,
    });
  } catch (err) {
    console.warn("Failed to write to notifications_log:", err);
  }
}

/**
 * WhatsApp Notification Hook.
 * Plug in your Twilio, Interakt, or Aisensy API credentials here for real-time WhatsApp updates.
 */
export async function sendWhatsAppNotification(bookingId: string, templateName = "booking_confirmation") {
  console.log(`[WhatsApp Notification Hook] Triggered template '${templateName}' for Booking ID: ${bookingId}`);

  try {
    // Write notification audit log
    await logNotification(bookingId, "sms", `whatsapp_${templateName}`);

    // TODO: Plug in Twilio / Interakt API call:
    // const res = await fetch("https://api.interakt.ai/v1/public/message/", {
    //   method: "POST",
    //   headers: { Authorization: `Basic ${process.env.INTERAKT_API_KEY}` },
    //   body: JSON.stringify({ bookingId, templateName }),
    // });
    return { success: true, mocked: true };
  } catch (err) {
    console.error("[WhatsApp Notification Error]:", err);
    return { success: false, error: err };
  }
}
