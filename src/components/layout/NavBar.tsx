"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string;
};

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage flag first for immediate feedback
    const stored = localStorage.getItem("kalTrackAuth");
    if (!stored) {
      setLoading(false);
      return;
    }

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("kalTrackAuth", "true");
        } else {
          setUser(null);
          localStorage.removeItem("kalTrackAuth");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]); // re-check on page change

  // Don't show nav on auth pages
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/log", label: "Log", icon: "📷" },
    { href: "/foods", label: "Foods", icon: "🥘" },
    { href: "/reports", label: "Reports", icon: "📈" },
    { href: "/activity", label: "Activity", icon: "👟" },
    { href: "/weight", label: "Weight", icon: "⚖️" },
    { href: "/tracker", label: "Profile", icon: "📏" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return false;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop top nav */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 hidden sm:block">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-brand-600 dark:text-brand-400">
            <span className="w-7 h-7 rounded-lg calorie-gradient flex items-center justify-center text-xs text-white font-bold">
              K
            </span>
            <span className="text-sm">KalTrack</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {!loading && !user && (
              <Link
                href="/login"
                className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700"
              >
                Sign in
              </Link>
            )}
            {!loading && user && (
              <Link href="/tracker" className="text-xs text-zinc-400 hover:text-zinc-600">
                {user.name || user.email}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 sm:hidden">
        <div className="flex items-center justify-around h-14 px-2">
          {navItems.filter((_, i) => i < 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "text-brand-600 dark:text-brand-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-14 sm:hidden" />
    </>
  );
}
