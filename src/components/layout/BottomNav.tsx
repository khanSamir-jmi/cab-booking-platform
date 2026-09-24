"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: "🚕" },
    { label: "Fleet", href: "/fleet", icon: "🚘" },
    { label: "Bookings", href: "/bookings", icon: "📋" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ];

  // Hide bottom nav on admin routes
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line bg-paper/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center px-3 py-1 transition ${
                isActive ? "text-route font-bold scale-105" : "text-ink/60 hover:text-ink"
              }`}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="mt-1 font-mono text-[10px] tracking-wide uppercase">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
