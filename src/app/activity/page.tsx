"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Activity = {
  id: string;
  type: string;
  durationMin: number | null;
  calories: number | null;
  steps: number | null;
  distanceKm: number | null;
  source: string;
  activityDate: string;
  notes: string | null;
};

type ActivityTotals = {
  steps: number;
  calories: number;
  durationMin: number;
};

export default function ActivityPage() {
  const router = useRouter();
  const [user, setUser] = useState<unknown>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totals, setTotals] = useState<ActivityTotals>({ steps: 0, calories: 0, durationMin: 0 });
  const [type, setType] = useState("walking");
  const [steps, setSteps] = useState("");
  const [calories, setCalories] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [logging, setLogging] = useState(false);
  const [fitConnected, setFitConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = () => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/activities").then((r) => r.json()),
      fetch("/api/google-fit").then((r) => r.json()).catch(() => ({ connected: false })),
    ]).then(([userData, data, fitData]) => {
      if (!userData.user) router.push("/login");
      else setUser(userData.user);
      setActivities(data.activities || []);
      setTotals(data.totals || { steps: 0, calories: 0, durationMin: 0 });
      setFitConnected(fitData?.connected || false);
    });
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const logActivity = async () => {
    setLogging(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          steps: parseInt(steps) || null,
          calories: parseFloat(calories) || null,
          durationMin: parseInt(durationMin) || null,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      toast.success("Activity logged!");
      setSteps(""); setCalories(""); setDurationMin("");
      load();
    } catch {
      toast.error("Failed to log activity");
    } finally {
      setLogging(false);
    }
  };

  const connectFit = () => {
    const clientId = "973101047477-qb765af3t5kibel3retrgat9mhc001u2.apps.googleusercontent.com";
    const redirectUri = `${window.location.origin}/api/google-fit/callback`;
    const scope = "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
    window.location.href = url;
  };

  const syncFit = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/google-fit/sync", { method: "POST" });
      if (!res.ok) throw new Error("Sync failed");
      const data = await res.json();
      toast.success(`Synced! ${data.steps?.toLocaleString() || 0} steps`);
      load();
    } catch {
      toast.error("Sync failed. Try reconnecting.");
      setFitConnected(false);
    } finally {
      setSyncing(false);
    }
  };

  if (!user) return null;

  const typeOptions = [
    { value: "walking", label: "🚶 Walking", stepField: true },
    { value: "running", label: "🏃 Running", stepField: false },
    { value: "cycling", label: "🚴 Cycling", stepField: false },
    { value: "workout", label: "🏋️ Workout", stepField: false },
    { value: "yoga", label: "🧘 Yoga", stepField: false },
  ];

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Activity</h1>

      {/* Today's summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Steps", value: totals.steps.toLocaleString(), icon: "👟" },
          { label: "Active kcal", value: Math.round(totals.calories).toString(), icon: "🔥" },
          { label: "Minutes", value: totals.durationMin.toString(), icon: "⏱️" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 card-shadow text-center"
          >
            <span className="text-lg">{s.icon}</span>
            <p className="text-base font-bold text-zinc-800 dark:text-zinc-100 mt-1">{s.value}</p>
            <p className="text-[10px] text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Google Fit / Samsung Health card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 card-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">❤️</span>
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Google Fit</p>
              <p className="text-[10px] text-zinc-400">Samsung Health auto-syncs steps & workouts</p>
            </div>
          </div>
          {fitConnected ? (
            <button
              onClick={syncFit}
              disabled={syncing}
              className="text-[10px] h-7 px-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Sync Now"}
            </button>
          ) : (
            <button
              onClick={connectFit}
              className="text-[10px] h-7 px-3 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700"
            >
              Connect
            </button>
          )}
        </div>
        {fitConnected ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <span className="text-zinc-500">Connected</span>
          </div>
        ) : (
          <div className="text-xs text-zinc-500 space-y-2">
            <p>Connect to auto-sync steps, calories, and workouts from Samsung Health (via Google Fit).</p>
            <p className="text-zinc-400 text-[10px]">Note: Google Fit REST API powers this. You&apos;ll be redirected to Google to authorize.</p>
          </div>
        )}
      </div>

      {/* Log activity form */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 card-shadow space-y-3">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Log Activity</h2>

        <div className="flex gap-1 flex-wrap">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`px-3 h-8 rounded-lg text-[10px] font-medium transition-all ${
                type === opt.value
                  ? "bg-brand-600 text-white"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {typeOptions.find((o) => o.value === type)?.stepField && (
            <div>
              <label className="block text-[10px] text-zinc-500 mb-1">Steps</label>
              <input
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="5000"
                className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] text-zinc-500 mb-1">Calories</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="150"
              className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div>
            <label className="block text-[10px] text-zinc-500 mb-1">Duration (min)</label>
            <input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="30"
              className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        <button
          onClick={logActivity}
          disabled={logging}
          className="w-full h-9 rounded-xl bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {logging ? "Logging..." : "Log Activity"}
        </button>
      </div>

      {/* Recent activities */}
      {activities.length > 0 && (
        <div className="space-y-1">
          <h2 className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Recent</h2>
          {activities.slice(0, 10).map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">
                  {act.type === "walking" ? "🚶" : act.type === "running" ? "🏃" : act.type === "cycling" ? "🚴" : "🏋️"}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 capitalize">{act.type}</p>
                  <p className="text-[10px] text-zinc-400">
                    {act.steps ? `${act.steps.toLocaleString()} steps` : ""}
                    {act.durationMin ? ` ${act.durationMin} min` : ""}
                    {act.source === "google_fit" ? " · Google Fit" : ""}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-600">
                {act.calories ? `${Math.round(act.calories)} kcal` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
