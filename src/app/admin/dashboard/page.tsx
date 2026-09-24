import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Footer } from "@/components/layout/Footer";
import { DispatchQueueTable } from "@/components/admin/DispatchQueueTable";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, drivers(id, name, phone, vehicle_number)")
    .order("created_at", { ascending: false });

  const { data: drivers } = await supabase
    .from("drivers")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <AdminNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
              DISPATCH QUEUE · REAL-TIME OPERATIONAL DESK
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">
              All Cab Bookings
            </h1>
          </div>
          <span className="font-mono text-xs bg-route/10 text-route px-3 py-1 rounded-full font-medium">
            ● Live System Active
          </span>
        </div>

        <div className="mt-8">
          <DispatchQueueTable initialBookings={bookings || []} drivers={drivers || []} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
