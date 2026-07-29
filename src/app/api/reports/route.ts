import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { calculateBMI, getBMICategory } from "@/lib/nutrition";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "week";

  const now = new Date();
  let startDate: Date;
  switch (range) {
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case "3months":
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case "week":
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  // Get meals in range
  const meals = await prisma.mealLog.findMany({
    where: {
      userId: user.id,
      loggedAt: { gte: startDate },
    },
    include: { foodItem: true },
    orderBy: { loggedAt: "asc" },
  });

  // Get weight logs in range
  const weightLogs = await prisma.weightLog.findMany({
    where: {
      userId: user.id,
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  // Get activities in range
  const activities = await prisma.activityLog.findMany({
    where: {
      userId: user.id,
      activityDate: { gte: startDate },
    },
    orderBy: { activityDate: "asc" },
  });

  // Aggregate by day
  const dayMap = new Map<string, {
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    steps: number;
    activeCalories: number;
    weight: number | null;
  }>();

  // Initialize date range
  const endDate = new Date();
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    dayMap.set(key, { date: key, calories: 0, protein: 0, carbs: 0, fat: 0, steps: 0, activeCalories: 0, weight: null });
  }

  for (const meal of meals) {
    const key = new Date(meal.loggedAt).toISOString().split("T")[0];
    const day = dayMap.get(key);
    if (day) {
      day.calories += meal.calories;
      day.protein += meal.protein;
      day.carbs += meal.carbs;
      day.fat += meal.fat;
    }
  }

  for (const act of activities) {
    const key = new Date(act.activityDate).toISOString().split("T")[0];
    const day = dayMap.get(key);
    if (day) {
      day.steps += act.steps || 0;
      day.activeCalories += act.calories || 0;
    }
  }

  for (const wl of weightLogs) {
    const key = new Date(wl.date).toISOString().split("T")[0];
    const day = dayMap.get(key);
    if (day) {
      day.weight = wl.weightKg;
    }
  }

  const days = Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // Weekly aggregates
  const weeks = aggregateByWeek(days);

  // Monthly aggregates
  const months = aggregateByMonth(days);

  // BMI
  let bmi = null;
  let bmiCategory = null;
  if (user.weightKg && user.heightCm) {
    bmi = calculateBMI(user.weightKg, user.heightCm);
    bmiCategory = getBMICategory(bmi);
  }

  return NextResponse.json({
    days,
    weeks,
    months,
    weightLogs: weightLogs.map(w => ({ date: w.date.toISOString().split("T")[0], weight: w.weightKg })),
    user: {
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      dailyCalorieGoal: user.dailyCalorieGoal,
    },
    bmi,
    bmiCategory,
  });
}

function aggregateByWeek(days: { date: string; calories: number; protein: number; carbs: number; fat: number; steps: number; activeCalories: number; weight: number | null }[]) {
  const weekMap = new Map<string, typeof days[0] & { days: number }>();
  
  for (const day of days) {
    const d = new Date(day.date);
    const dayOfWeek = d.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(d);
    monday.setDate(d.getDate() - diff);
    const key = monday.toISOString().split("T")[0];
    
    const existing = weekMap.get(key);
    if (existing) {
      existing.calories += day.calories;
      existing.protein += day.protein;
      existing.carbs += day.carbs;
      existing.fat += day.fat;
      existing.steps += day.steps;
      existing.activeCalories += day.activeCalories;
      existing.days += 1;
      if (day.weight) existing.weight = day.weight;
    } else {
      weekMap.set(key, { ...day, days: 1 });
    }
  }
  return Array.from(weekMap.values()).map(w => ({
    ...w,
    avgCalories: Math.round(w.calories / w.days),
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateByMonth(days: { date: string; calories: number; protein: number; carbs: number; fat: number; steps: number; activeCalories: number; weight: number | null }[]) {
  const monthMap = new Map<string, typeof days[0] & { days: number }>();
  
  for (const day of days) {
    const key = day.date.substring(0, 7); // YYYY-MM
    
    const existing = monthMap.get(key);
    if (existing) {
      existing.calories += day.calories;
      existing.protein += day.protein;
      existing.carbs += day.carbs;
      existing.fat += day.fat;
      existing.steps += day.steps;
      existing.activeCalories += day.activeCalories;
      existing.days += 1;
      if (day.weight) existing.weight = day.weight;
    } else {
      monthMap.set(key, { ...day, days: 1 });
    }
  }
  return Array.from(monthMap.values()).map(m => ({
    ...m,
    avgCalories: Math.round(m.calories / m.days),
  })).sort((a, b) => a.date.localeCompare(b.date));
}
