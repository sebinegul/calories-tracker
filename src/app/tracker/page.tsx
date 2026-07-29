"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  calculateBMI,
  getBMICategory,
  calculateBMR,
  calculateTDEE,
  getWeightGoalCalories,
  calculateMacros,
} from "@/lib/nutrition";

type User = {
  id: string;
  name: string | null;
  email: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  gender: string | null;
  activityLevel: string | null;
  dailyCalorieGoal: number | null;
};

type Metrics = {
  bmi: number | null;
  bmiCategory: { label: string; color: string } | null;
  bmr: number | null;
  tdee: number | null;
  goalCalories: number | null;
  macros: { protein: number; carbs: number; fat: number } | null;
};

export default function TrackerPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  const [age, setAge] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) router.push("/login");
        else {
          setUser(data.user);
          setAge(data.user.age?.toString() || "");
          setHeightCm(data.user.heightCm?.toString() || "");
          setWeightKg(data.user.weightKg?.toString() || "");
          setGender(data.user.gender || "male");
          setActivityLevel(data.user.activityLevel || "moderate");
        }
      });
  }, [router]);

  const calculate = () => {
    const a = parseInt(age);
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);

    if (!a || !h || !w) {
      toast.error("Fill in age, height, and weight");
      return;
    }

    const bmi = calculateBMI(w, h);
    const bmiCategory = getBMICategory(bmi);
    const bmr = calculateBMR(w, h, a, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const goalCalories = getWeightGoalCalories(tdee, goal);
    const macros = calculateMacros(goalCalories);

    setMetrics({ bmi, bmiCategory, bmr, tdee, goalCalories, macros });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: parseInt(age) || null,
          heightCm: parseFloat(heightCm) || null,
          weightKg: parseFloat(weightKg) || null,
          gender,
          activityLevel,
          dailyCalorieGoal: metrics?.goalCalories || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Profile saved!");
      if (data.metrics) setMetrics(data.metrics);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Health Tracker</h1>

      {/* Profile form */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 card-shadow space-y-3">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Your Profile</h2>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-1">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="30"
              className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full h-9 px-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-1">Height (cm)</label>
            <input
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="170"
              step="0.1"
              className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-zinc-500 mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="70"
              step="0.1"
              className="w-full h-9 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-zinc-500 mb-1">Activity Level</label>
          <div className="flex gap-1">
            {[
              { value: "sedentary", label: "Desk job" },
              { value: "light", label: "Light" },
              { value: "moderate", label: "Moderate" },
              { value: "active", label: "Active" },
              { value: "very_active", label: "Very Active" },
            ].map((al) => (
              <button
                key={al.value}
                onClick={() => setActivityLevel(al.value)}
                className={`flex-1 h-8 rounded-lg text-[10px] font-medium transition-all ${
                  activityLevel === al.value
                    ? "bg-brand-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                {al.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-medium text-zinc-500 mb-1">Goal</label>
          <div className="flex gap-1">
            {[
              { value: "lose", label: "Lose Weight" },
              { value: "maintain", label: "Maintain" },
              { value: "gain", label: "Gain Weight" },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value as typeof goal)}
                className={`flex-1 h-8 rounded-lg text-[10px] font-medium transition-all ${
                  goal === g.value
                    ? "bg-brand-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={calculate}
            className="flex-1 h-9 rounded-xl bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors"
          >
            Calculate
          </button>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex-1 h-9 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Metrics display */}
      {metrics && (
        <div className="space-y-3">
          {/* BMI */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">BMI</span>
              <span className={`text-[10px] font-semibold ${metrics.bmiCategory?.color}`}>
                {metrics.bmiCategory?.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 mt-1">
              {metrics.bmi}
            </p>

            {/* BMI bar */}
            <div className="relative h-2 mt-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-brand-400 to-amber-400 to-red-400">
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-zinc-900 dark:bg-white rounded-full transition-all"
                style={{
                  left: `${Math.min(Math.max(((metrics.bmi || 18.5) - 15) / 25 * 100, 0), 100)}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-zinc-400 mt-1">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
          </div>

          {/* Calories */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "BMR", value: `${metrics.bmr} kcal`, desc: "Resting" },
              { label: "TDEE", value: `${metrics.tdee} kcal`, desc: "Daily burn" },
              { label: "Goal", value: `${metrics.goalCalories} kcal`, desc: "Daily target" },
              { label: "Macros", value: `${metrics.macros?.protein}P / ${metrics.macros?.carbs}C / ${metrics.macros?.fat}F`, desc: "Recommended" },
            ].map((m) => (
              <div key={m.label} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 card-shadow">
                <span className="text-[10px] text-zinc-500">{m.label}</span>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">{m.value}</p>
                <span className="text-[9px] text-zinc-400">{m.desc}</span>
              </div>
            ))}
          </div>

          {/* Recommendation card */}
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl p-4 text-white">
            <p className="text-xs font-semibold opacity-90">Recommended Daily Intake</p>
            <p className="text-2xl font-bold mt-1">{metrics.goalCalories} kcal</p>
            <p className="text-xs opacity-80 mt-1">
              Based on your {goal === "lose" ? "weight loss" : goal === "gain" ? "weight gain" : "maintenance"} goal
              and {activityLevel.replace("_", " ")} activity level
            </p>
            <div className="flex gap-4 mt-3 text-xs">
              <span>Protein: {metrics.macros?.protein}g</span>
              <span>Carbs: {metrics.macros?.carbs}g</span>
              <span>Fat: {metrics.macros?.fat}g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
