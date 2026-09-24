import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { Footer } from "@/components/layout/Footer";
import { DriverDirectoryManager } from "@/components/admin/DriverDirectoryManager";

export default async function AdminDriversPage() {
  await requireAdmin();
  const supabase = createClient();

  const { data: drivers } = await supabase
    .from("drivers")
    .select("*")
    .order("name");

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <AdminNavbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink/50">
            FLEET MANAGEMENT
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Driver Directory
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Manage drivers, phone numbers, and vehicle details assigned to dispatch operations.
          </p>
        </div>

        <div className="mt-8">
          <DriverDirectoryManager initialDrivers={drivers || []} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
