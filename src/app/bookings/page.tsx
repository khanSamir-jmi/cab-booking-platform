import Link from "next/link";
import { requireUser, ensureValidUuid } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types/database.types";

const SERVICE_LABEL: Record<string, string> = {
  outstation: "Outstation",
  local: "Local",
  sightseeing: "Sightseeing",
  hourly: "Hourly Rental",
};

export default async function BookingsPage() {
  const user = await requireUser("/login?redirect=/bookings");
  const validUserId = ensureValidUuid(user.id, user.email);
  const db = createAdminClient();

  const { data: bookings } = await db
    .from("bookings")
    .select("*")
    .eq("customer_id", validUserId)
    .order("created_at", { ascending: false });

  const list = (bookings ?? []) as Booking[];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ink/50">
          My Bookings
        </p>

        {list.length === 0 ? (
          <>
            <h1 className="mt-2 font-display text-3xl font-bold text-ink">
              No trips booked yet
            </h1>
            <p className="mt-2 max-w-md text-sm text-ink/60">
              Once you book an outstation trip, local ride, sightseeing
              package, or hourly rental, it&apos;ll show up here with live
              status updates.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center text-sm font-medium text-route hover:underline"
            >
              Browse services →
            </Link>
          </>
        ) : (
          <div className="mt-6 space-y-3">
            {list.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/${b.id}`}
                className="flex items-center justify-between rounded-stub border border-line bg-white p-4 transition-colors hover:bg-paper"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
                    {SERVICE_LABEL[b.service_type] ?? b.service_type}
                  </p>
                  <p className="mt-0.5 font-medium text-ink">
                    {b.pickup_location && b.drop_location
                      ? `${b.pickup_location} → ${b.drop_location}`
                      : new Date(b.scheduled_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink/70">
                    {formatCurrency(b.fare_amount)}
                  </span>
                  <BookingStatusBadge status={b.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
