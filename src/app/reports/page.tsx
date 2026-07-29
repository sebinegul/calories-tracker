"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from "recharts";

type DayData = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
  activeCalories: number;
  weight: number | null;
};

type WeekData = DayData & { avgCalories: number; days: number };
type MonthData = WeekData;

type ReportData = {
  days: DayData[];
  weeks: WeekData[];
  months: MonthData[];
  weightLogs: { date: string; weight: number }[];
  user: { weightKg: number | null; heightCm: number | null; dailyCalorieGoal: number | null };
  bmi: number | null;
  bmiCategory: { label: string; color: string } | null;
};

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [view, setView] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(true);

  const fetchData = async (range: string) => {
    const res = await fetch(`/api/reports?range=${range}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) router.push("/login");
      });
    fetchData("week");
  }, [router]);

  const handleViewChange = (v: typeof view) => {
    setView(v);
    setLoading(true);
    const range = v === "daily" ? "week" : v === "weekly" ? "month" : "3months";
    fetchData(range);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = view === "daily" ? data.days : view === "weekly" ? data.weeks : data.months;
  const dateFormatter = (val: string) => {
    const d = new Date(val + "T00:00:00");
    return view === "monthly"
      ? d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
      : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric" });
  };

  const goal = data.user.dailyCalorieGoal || 2200;
  const avgCalories = chartData.reduce((s: number, d: { calories: number }) => s + d.calories, 0) / Math.max(chartData.length, 1);
  const avgSteps = Math.round(chartData.reduce((s: number, d: { steps: number }) => s + d.steps, 0) / Math.max(chartData.length, 1));

  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Reports</h1>
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          {(["daily", "weekly", "monthly"] as const).map((v) => (
            <button
              key={v}
              onClick={() => handleViewChange(v)}
              className={`px-3 h-7 rounded-lg text-[10px] font-medium capitalize transition-all ${
                view === v
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Avg Calories", value: `${Math.round(avgCalories)}`, sub: `/${goal} kcal`, color: "text-amber-600" },
          { label: "Avg Steps", value: avgSteps.toLocaleString(), sub: "/10k goal", color: "text-violet-600" },
          { label: "Days Tracked", value: `${chartData.length}`, sub: "days", color: "text-brand-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
            <p className="text-[10px] text-zinc-500">{s.label}</p>
            <p className={`text-lg font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            <p className="text-[9px] text-zinc-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Calorie Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Calorie Intake</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.5} />
              <XAxis dataKey="date" tickFormatter={dateFormatter} tick={{ fontSize: 10 }} stroke="#a1a1aa" />
              <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
              />
              <Area type="monotone" dataKey="calories" stroke="#10b981" fill="url(#calGrad)" strokeWidth={2} />
              {/* Reference line for goal */}
              <Line type="monotone" dataKey={() => goal} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Macro Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Macros (Protein / Carbs / Fat)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.5} />
              <XAxis dataKey="date" tickFormatter={dateFormatter} tick={{ fontSize: 10 }} stroke="#a1a1aa" />
              <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
              />
              <Bar dataKey="protein" name="Protein" stackId="a" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="carbs" name="Carbs" stackId="a" fill="#f97316" radius={[2, 2, 0, 0]} />
              <Bar dataKey="fat" name="Fat" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight Chart */}
      {data.weightLogs.length > 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Weight Trend</h2>
            <Link href="/weight" className="text-[10px] text-brand-600 font-medium">
              View all
            </Link>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.weightLogs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.5} />
                <XAxis dataKey="date" tickFormatter={(v) => new Date(v + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })} tick={{ fontSize: 10 }} stroke="#a1a1aa" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10 }} stroke="#a1a1aa" tickFormatter={(v) => `${v}kg`} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Steps Chart */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Steps</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.5} />
              <XAxis dataKey="date" tickFormatter={dateFormatter} tick={{ fontSize: 10 }} stroke="#a1a1aa" />
              <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
              />
              <Bar dataKey="steps" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BMI Display */}
      {data.bmi && (
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold opacity-90">Your BMI</p>
              <p className="text-2xl font-bold mt-1">{data.bmi}</p>
              <p className={`text-xs font-medium mt-0.5 opacity-90`}>
                {data.bmiCategory?.label}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">{data.user.weightKg} kg</p>
              <p className="text-xs opacity-80">{data.user.heightCm} cm</p>
            </div>
          </div>
          <div className="relative h-1.5 mt-3 rounded-full overflow-hidden bg-white/20">
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white rounded-full"
              style={{ left: `${Math.min(Math.max(((data.bmi || 18.5) - 15) / 25 * 100, 0), 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[8px] opacity-60 mt-1">
            <span>Underweight</span>
            <span>Normal</span>
            <span>Overweight</span>
            <span>Obese</span>
          </div>
        </div>
      )}
    </div>
  );
}
