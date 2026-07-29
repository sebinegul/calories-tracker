"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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

type MealWithFood = {
  id: string;
  foodItem: { name: string } | null;
  customFoodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  loggedAt: string;
};

type DailyTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type WeightLog = {
  date: string;
  weightKg: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<MealWithFood[]>([]);
  const [totals, setTotals] = useState<DailyTotals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [activityTotals, setActivityTotals] = useState({ steps: 0, calories: 0 });
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  const goal = user?.dailyCalorieGoal || 2200;
  const progress = Math.min((totals.calories / goal) * 100, 100);
  const remaining = Math.max(goal - totals.calories, 0);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/meals").then((r) => r.json()),
      fetch("/api/activities").then((r) => r.json()),
      fetch("/api/weight?range=month").then((r) => r.json()),
    ])
      .then(([userData, mealsData, activityData, weightData]) => {
        if (userData.user) setUser(userData.user);
        setMeals(mealsData.meals || []);
        setTotals(mealsData.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 });
        setActivityTotals(activityData.totals || { steps: 0, calories: 0 });
        setWeightLogs((weightData.logs || []).map((l: any) => ({
          date: l.date.split("T")[0],
          weightKg: l.weightKg,
        })));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60dvh]">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-4">
        <p className="text-zinc-500 text-sm">Sign in to see your dashboard</p>
        <Link
          href="/login"
          className="h-10 px-5 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors inline-flex items-center"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const mealTypeOrder = ["breakfast", "lunch", "dinner", "snack"];
  const sortedMeals = [...meals].sort(
    (a, b) => mealTypeOrder.indexOf(a.mealType) - mealTypeOrder.indexOf(b.mealType)
  );

  return (
    <div className="space-y-4 pb-4">
      {/* Calorie Ring + Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Hello{user.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Here&apos;s your daily summary</p>
        </div>
        <Link
          href="/log"
          className="h-9 px-4 rounded-xl bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors shadow-sm inline-flex items-center gap-1.5"
        >
          <span>+</span> Log Meal
        </Link>
      </div>

      {/* Calorie Progress Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-zinc-500">Daily Calories</span>
          <span className="text-xs text-zinc-400">
            {totals.calories} / {goal} kcal
          </span>
        </div>
        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-zinc-500">
            {remaining > 0 ? `${remaining} kcal remaining` : "Goal reached!"}
          </span>
          <span className="text-zinc-400">{Math.round(progress)}%</span>
        </div>

        {/* Macro pills */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: "Protein", value: `${Math.round(totals.protein)}g`, color: "bg-blue-500" },
            { label: "Carbs", value: `${Math.round(totals.carbs)}g`, color: "bg-orange-500" },
            { label: "Fat", value: `${Math.round(totals.fat)}g`, color: "bg-red-500" },
          ].map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{m.value}</span>
              <span className="text-[10px] text-zinc-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links Row */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/reports"
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center gap-3 hover:border-brand-300 transition-colors"
        >
          <span className="text-lg">📈</span>
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Reports</p>
            <p className="text-[10px] text-zinc-400">Charts & trends</p>
          </div>
        </Link>
        <Link
          href="/weight"
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex items-center gap-3 hover:border-brand-300 transition-colors"
        >
          <span className="text-lg">⚖️</span>
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Weight</p>
            <p className="text-[10px] text-zinc-400">Track progress</p>
          </div>
        </Link>
      </div>

      {/* Weight mini chart */}
      {weightLogs.length > 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-500">Weight Trend (30d)</span>
            <Link href="/weight" className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
              View all
            </Link>
          </div>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightLogs}>
                <XAxis dataKey="date" hide />
                <YAxis domain={["dataMin - 1", "dataMax + 1"]} hide />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e4e4e7" }}
                  formatter={(value) => [`${value} kg`, "Weight"]}
                  labelFormatter={(l) => new Date(l + "T00:00:00").toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                />
                <Line type="monotone" dataKey="weightKg" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activity Mini Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500">Today&apos;s Activity</span>
          <Link href="/activity" className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
            View all
          </Link>
        </div>
        <div className="flex items-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">👟</span>
            <div>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {activityTotals.steps.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 block">Steps</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <div>
              <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {Math.round(activityTotals.calories)}
              </span>
              <span className="text-[10px] text-zinc-400 block">Active kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Meals */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Today&apos;s Meals</h2>
        {sortedMeals.length === 0 ? (
          <div className="text-center py-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-400">No meals logged today</p>
            <Link
              href="/log"
              className="inline-block mt-3 text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Log your first meal
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedMeals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">
                    {meal.mealType === "breakfast" ? "🌅" : meal.mealType === "lunch" ? "☀️" : meal.mealType === "dinner" ? "🌙" : "🍿"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {meal.customFoodName}
                    </p>
                    <p className="text-[10px] text-zinc-400 capitalize">{meal.mealType}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {Math.round(meal.calories)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
