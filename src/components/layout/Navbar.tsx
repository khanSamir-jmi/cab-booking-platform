import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold text-ink flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-route text-marigold font-display font-black text-sm border border-marigold/70 shadow-sm">
            A
          </span>
          <span>
            Anam Tours & Travel<span className="text-marigold">.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
          <Link href="/outstation" className="hover:text-ink">
            Outstation
          </Link>
          <Link href="/local" className="hover:text-ink">
            Local
          </Link>
          <Link href="/fleet" className="hover:text-ink">
            Fleet
          </Link>
          <Link href="/sightseeing" className="hover:text-ink">
            Sightseeing
          </Link>
          <Link href="/hourly" className="hover:text-ink">
            Hourly Rentals
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/bookings"
            className="hidden text-sm font-medium text-ink/70 hover:text-ink sm:block"
          >
            My Bookings
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="hidden text-sm font-medium text-ink/70 hover:text-ink sm:block"
              >
                Profile
              </Link>
              <form action={signOutAction}>
                <Button variant="secondary" type="submit">
                  Log out
                </Button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="secondary">Log in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
