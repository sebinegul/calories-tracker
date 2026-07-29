"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          router.replace("/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[70dvh]">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70dvh] text-center gap-6 px-4">
      <div className="w-16 h-16 rounded-2xl calorie-gradient flex items-center justify-center text-2xl shadow-lg">
        🥗
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Track every bite
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400 max-w-md text-sm sm:text-base leading-relaxed">
        Log meals with AI photo recognition, track calories, calculate your BMI,
        and monitor your daily nutrition goals. Built for South Indian cuisine.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Link
          href="/register"
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Sign In
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 w-full max-w-2xl">
        {[
          { emoji: "📷", label: "Photo Log", desc: "Snap & identify food" },
          { emoji: "🥘", label: "Indian Foods", desc: "50+ South Indian dishes" },
          { emoji: "📏", label: "BMI Calc", desc: "Track your metrics" },
          { emoji: "👟", label: "Activity", desc: "Steps & workouts" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 card-shadow"
          >
            <span className="text-xl">{item.emoji}</span>
            <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
            <span className="text-[10px] text-zinc-400">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
