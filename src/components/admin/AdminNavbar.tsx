import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { signOutAction } from "@/app/actions/auth";

export function AdminNavbar() {
  return (
    <header className="border-b border-line bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin/dashboard" className="font-display text-xl font-bold text-paper">
            Admin Portal<span className="text-marigold">.</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-paper/70">
            <Link href="/admin/dashboard" className="hover:text-paper">
              Dispatch Queue
            </Link>
            <Link href="/admin/drivers" className="hover:text-paper">
              Drivers Directory
            </Link>
            <Link href="/admin/pricing" className="hover:text-paper">
              Pricing Config
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/bookings" className="text-xs font-mono uppercase text-paper/60 hover:text-paper">
            Customer View
          </Link>
          <form action={signOutAction}>
            <Button variant="secondary" size="sm" type="submit">
              Log out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
