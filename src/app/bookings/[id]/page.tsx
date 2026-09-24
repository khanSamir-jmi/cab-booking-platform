import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FareBreakdownCard } from "@/components/booking/FareBreakdownCard";
import { FareBreakdownModal } from "@/components/booking/FareBreakdownModal";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { BookingStatusTimeline } from "@/components/booking/BookingStatusTimeline";
import { LiveRouteMap } from "@/components/map/LiveRouteMap";
import type { Booking } from "@/types/database.types";
import { Button } from "@/components/ui/Button";

const SERVICE_LABEL: Record<string, string> = {
  outstation: "Outstation",
  local: "Local",
  sightseeing: "Sightseeing",
  hourly: "Hourly Rental",
};

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser(`/login?redirect=/bookings/${params.id}`);
  const supabase = createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, drivers(*)")
    .eq("id", params.id)
    .single();

  if (!booking) notFound();

  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("booking_id", params.id)
    .order("created_at", { ascending: false });

  const b = booking as Booking & { drivers?: any; is_self_drive?: boolean };
  const latestPayment = payments?.[0];

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
              {SERVICE_LABEL[b.service_type] ?? b.service_type} · #{b.id.substring(0, 8)}
            </span>
            {b.is_self_drive ? (
              <span className="font-mono text-[10px] font-bold uppercase bg-marigold text-ink px-2 py-0.5 rounded">
                ⚡ Self-Drive
              </span>
            ) : (
              <span className="font-mono text-[10px] font-bold uppercase bg-route/10 text-route px-2 py-0.5 rounded">
                🚕 Chauffeur-Driven
              </span>
            )}
          </div>
          <BookingStatusBadge status={b.status} />
        </div>

        <h1 className="mt-2 font-display text-2xl font-bold leading-snug text-ink sm:text-3xl">
          {b.pickup_location && b.drop_location
            ? `${b.pickup_location} → ${b.drop_location}`
            : b.pickup_location || "Your booking"}
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Scheduled for:{" "}
          <span className="font-semibold text-ink">
            {new Date(b.scheduled_at).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        </p>

        {/* Assigned Driver Details Card (If Chauffeur) */}
        {!b.is_self_drive && b.drivers && (
          <div className="rounded-stub border border-route bg-route/5 p-5 space-y-2">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-route font-bold">
              Assigned Driver & Cab Details
            </p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-display text-lg font-bold text-ink">{b.drivers.name}</p>
                <p className="text-xs font-mono text-ink/70">
                  Vehicle: <span className="font-bold text-ink">{b.drivers.vehicle_number}</span> ({b.drivers.vehicle_type || "Sedan"})
                </p>
              </div>
              <a
                href={`tel:${b.drivers.phone}`}
                className="rounded-stub bg-route text-paper font-mono text-xs font-bold px-4 py-2 hover:bg-route/90 transition"
              >
                📞 Call Driver ({b.drivers.phone})
              </a>
            </div>
          </div>
        )}

        {/* Self-Drive Instructions (If Self-Drive) */}
        {b.is_self_drive && (
          <div className="rounded-stub border border-marigold bg-marigold/10 p-5 space-y-2">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink">
              🔑 Self-Drive Pickup Information
            </p>
            <p className="text-xs text-ink/80">
              Please carry your original Driving License and Aadhaar Card to the pickup hub at {b.pickup_location}. Vehicle inspection will be completed on site.
            </p>
          </div>
        )}

        {/* Live Route Map (OpenStreetMap / Leaflet Google Maps Alternative) */}
        <div className="space-y-2">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
            🗺️ Live GPS Route Tracking Map
          </p>
          <LiveRouteMap
            pickupLocation={b.pickup_location || "Pickup Location"}
            dropLocation={b.drop_location || "Destination"}
            driverName={b.drivers?.name}
            vehicleNumber={b.drivers?.vehicle_number}
          />
        </div>

        {/* Payment Link / Status Banner */}
        {latestPayment && (
          <div className="rounded-stub border border-line bg-white p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="font-mono text-xs uppercase text-ink/50 font-medium">Payment Status</p>
              <p className="font-display font-bold text-ink capitalize">
                {latestPayment.status === "paid"
                  ? "✅ Payment Received (Paid)"
                  : latestPayment.status === "link_sent"
                  ? "💳 Payment Link Active"
                  : latestPayment.status}
              </p>
              {latestPayment.payment_reference && (
                <p className="text-xs font-mono text-ink/60">
                  Ref: {latestPayment.payment_reference}
                </p>
              )}
            </div>

            {latestPayment.link_url && latestPayment.status !== "paid" && (
              <a
                href={latestPayment.link_url}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="primary">Pay Now via UPI / Card</Button>
              </a>
            )}
          </div>
        )}

        <div className="grid gap-10 sm:grid-cols-2 pt-4">
          <div>
            <p className="mb-4 font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
              Live Trip Progress
            </p>
            <BookingStatusTimeline status={b.status} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
                Fare Breakdown
              </p>
              <FareBreakdownModal breakdown={b.fare_breakdown} />
            </div>
            <FareBreakdownCard breakdown={b.fare_breakdown} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
