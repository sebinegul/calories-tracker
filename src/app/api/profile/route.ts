import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { calculateBMR, calculateTDEE, calculateBMI, getBMICategory, getWeightGoalCalories, calculateMacros } from "@/lib/nutrition";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, age, heightCm, weightKg, gender, activityLevel, dailyCalorieGoal } = body;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name ?? undefined,
      age: age ?? undefined,
      heightCm: heightCm ?? undefined,
      weightKg: weightKg ?? undefined,
      gender: gender ?? undefined,
      activityLevel: activityLevel ?? undefined,
      dailyCalorieGoal: dailyCalorieGoal ?? undefined,
    },
  });

  // Calculate health metrics
  let bmi = null;
  let bmiCategory = null;
  let tdee = null;
  let bmr = null;
  let macros = null;
  let goalCalories = null;

  if (updated.weightKg && updated.heightCm && updated.age && updated.gender) {
    bmr = calculateBMR(updated.weightKg, updated.heightCm, updated.age, updated.gender);
    tdee = calculateTDEE(bmr, updated.activityLevel || "moderate");
    bmi = calculateBMI(updated.weightKg, updated.heightCm);
    bmiCategory = getBMICategory(bmi);
    goalCalories = getWeightGoalCalories(tdee, "maintain");
    macros = calculateMacros(goalCalories);
  }

  return NextResponse.json({
    user: updated,
    metrics: { bmi, bmiCategory, bmr, tdee, goalCalories, macros },
  });
}
