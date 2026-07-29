"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

type WeightLog = {
  id: string;
  weightKg: number;
  date: string;
  notes: string | null;
};

export default function WeightPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [weight, setWeight] = useState("");
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState<"week" | "month" | "3months" | "all">("month");

  const load = () => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (!d.user) router.push("/login");
      else if (d.user.weightKg) setWeight(d.user.weightKg.toString());
    });
    fetch(`/api/weight?range=${range}`)
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || []));
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, router]);

  const saveWeight = async () => {
    if (!weight || parseFloat(weight) <= 0) {
      toast.error("Enter a valid weight");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weightKg: parseFloat(weight), date: weightDate, notes }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Weight logged!");
      setNotes("");
      load();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id: string) => {
    const res = await fetch(`/api/weight?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Deleted");
      load();
    }
  };

  const chartData = [...logs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({ date: l.date.split("T")[0], weight: l.weightKg }));

  const latest = logs.length > 0 ? logs.reduce((a: WeightLog, b: WeightLog) => new Date(a.date) > new Date(b.date) ? a : b) : null;
  const first = logs.length > 1 ? logs.reduce((a: WeightLog, b: WeightLog) => new Date(a.date) < new Date(b.date) ? a : b) : null;
  const change = latest && first ? (latest.weightKg - first.weightKg) : 0;

  return (
    <div className="space-y-4 pb-8">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Weight Tracker</h1>

      {/* Log weight form */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Log Weight</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-[10px] font-medium text-zinc-500 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="72.5"
              step="0.1"
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-1">Date</label>
            <input
              type="date"
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <button
            onClick={saveWeight}
            disabled={saving}
            className="h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors shrink-0"
          >
            {saving ? "..." : "Save"}
          </button>
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          className="w-full h-9 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs mt-2 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      {/* Stats */}
      {latest && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Current", value: `${latest.weightKg} kg`, color: "text-brand-600" },
            { label: "Start", value: first ? `${first.weightKg} kg` : "-", color: "text-zinc-600" },
            { label: "Change", value: `${change >= 0 ? "+" : ""}${change.toFixed(1)} kg`, color: change <= 0 ? "text-brand-600" : "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 text-center">
              <p className="text-[10px] text-zinc-500">{s.label}</p>
              <p className={`text-sm font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Range toggle */}
      <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
        {(["week", "month", "3months", "all"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-3 h-7 rounded-lg text-[10px] font-medium capitalize transition-all ${
              range === r
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500"
            }`}
          >
            {r === "3months" ? "3mo" : r}
          </button>
        ))}
      </div>

      {/* Weight chart */}
      {chartData.length > 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  tick={{ fontSize: 10 }}
                  stroke="#a1a1aa"
                />
                <YAxis
                  domain={["dataMin - 1", "dataMax + 1"]}
                  tick={{ fontSize: 10 }}
                  stroke="#a1a1aa"
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                  labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  formatter={(value) => [`${value} kg`, "Weight"]}
                />
                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History */}
      {logs.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2">History</h2>
          <div className="space-y-1">
            {[...logs]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((log) => (
                <div key={log.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {log.weightKg} kg
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      {new Date(log.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      {log.notes ? ` · ${log.notes}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="text-[10px] text-red-400 hover:text-red-600 font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-center py-12 text-sm text-zinc-400">
          No weight logs yet. Start tracking to see your progress!
        </div>
      )}
    </div>
  );
}
