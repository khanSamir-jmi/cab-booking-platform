import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-line bg-white text-ink">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Company Info & Location */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <Link href="/" className="font-display text-2xl font-bold text-ink">
              Terminal<span className="text-marigold">.</span>
            </Link>
            <p className="text-xs text-ink/70 leading-relaxed">
              India&apos;s transparent cab platform. Fixed upfront fares for Local rides, Outstation trips, Dhanbad Sightseeing, and Hourly rentals.
            </p>
            <div className="space-y-1.5 font-mono text-xs text-ink/70 pt-1">
              <p className="flex items-start gap-1.5">
                <span className="text-route font-bold">📍</span>
                <span>Head Office: Park Market, Hirapur, Dhanbad, Jharkhand - 826001, India</span>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-route font-bold">📞</span>
                <a href="tel:+919876543210" className="hover:text-route transition">
                  +91 98765 43210 (24x7 Helpdesk)
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-route font-bold">✉️</span>
                <a href="mailto:support@terminalcabs.in" className="hover:text-route transition">
                  support@terminalcabs.in
                </a>
              </p>
            </div>
          </div>

          {/* Quick Service Links */}
          <div className="space-y-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
              Services
            </p>
            <ul className="space-y-2 text-xs font-medium text-ink/70">
              <li>
                <Link href="/local" className="hover:text-route transition">
                  🚕 Local Point-to-Point Rides
                </Link>
              </li>
              <li>
                <Link href="/outstation" className="hover:text-route transition">
                  🛣️ Outstation City-to-City
                </Link>
              </li>
              <li>
                <Link href="/fleet" className="hover:text-route transition">
                  🚘 Vehicle Fleet Directory
                </Link>
              </li>
              <li>
                <Link href="/sightseeing" className="hover:text-route transition">
                  🏞️ Dhanbad Sightseeing Packages
                </Link>
              </li>
              <li>
                <Link href="/hourly" className="hover:text-route transition">
                  ⏱️ Hourly Cab Rentals
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer & Admin */}
          <div className="space-y-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
              Account & Portal
            </p>
            <ul className="space-y-2 text-xs font-medium text-ink/70">
              <li>
                <Link href="/bookings" className="hover:text-route transition">
                  📋 My Bookings & Live Tracker
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-route transition">
                  👤 My Profile & Addresses
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-route transition">
                  📱 Sign In / OTP Login
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-route transition text-route font-bold">
                  🔐 Admin Dispatch Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media & Mobile App Notice */}
          <div className="space-y-3">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
              Connect With Us
            </p>
            <p className="text-xs text-ink/70">
              Follow our social channels for festive ride offers and Dhanbad travel guides.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-stub border border-line bg-paper px-3 py-1.5 font-mono text-xs font-bold text-ink hover:border-route hover:text-route transition"
              >
                📸 Instagram
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-stub border border-line bg-paper px-3 py-1.5 font-mono text-xs font-bold text-ink hover:border-route hover:text-route transition"
              >
                𝕏 Twitter / X
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-stub border border-line bg-paper px-3 py-1.5 font-mono text-xs font-bold text-ink hover:border-route hover:text-route transition"
              >
                📘 Facebook
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-stub border border-line bg-paper px-3 py-1.5 font-mono text-xs font-bold text-ink hover:border-route hover:text-route transition"
              >
                💼 LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between border-t border-line/60 pt-6 text-xs text-ink/50 font-mono">
          <p>© {new Date().getFullYear()} Terminal Cabs India. All rights reserved.</p>
          <p>Built with Next.js 14, Tailwind CSS & Supabase</p>
        </div>
      </div>
    </footer>
  );
}
