import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { todayRange } from "@/lib/nutrition";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  const range = dateStr
    ? (() => {
        const d = new Date(dateStr);
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const end = new Date(start.getTime() + 86400000 - 1);
        return { start, end };
      })()
    : todayRange();

  const meals = await prisma.mealLog.findMany({
    where: {
      userId: user.id,
      loggedAt: { gte: range.start, lte: range.end },
    },
    include: { foodItem: true },
    orderBy: { loggedAt: "desc" },
  });

  const totals = meals.reduce(
    (acc: { calories: number; protein: number; carbs: number; fat: number }, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return NextResponse.json({ meals, totals });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { foodItemId, customFoodName, portionSize, servingUnit, mealType, imageUrl, notes, loggedAt } = body;

  let calories = 0, protein = 0, carbs = 0, fat = 0;
  let foodItem = null;

  if (foodItemId) {
    foodItem = await prisma.foodItem.findUnique({ where: { id: foodItemId } });
    if (foodItem) {
      const multiplier = portionSize || 1;
      calories = Math.round((foodItem.caloriesPer100 / 100) * foodItem.defaultServing * multiplier);
      protein = Math.round(((foodItem.proteinPer100 / 100) * foodItem.defaultServing * multiplier) * 10) / 10;
      carbs = Math.round(((foodItem.carbsPer100 / 100) * foodItem.defaultServing * multiplier) * 10) / 10;
      fat = Math.round(((foodItem.fatPer100 / 100) * foodItem.defaultServing * multiplier) * 10) / 10;
    }
  }

  const meal = await prisma.mealLog.create({
    data: {
      userId: user.id,
      foodItemId: foodItem?.id || null,
      customFoodName: customFoodName || foodItem?.name || "Unknown Food",
      portionSize: portionSize || 1,
      servingUnit: servingUnit || "serving",
      calories,
      protein,
      carbs,
      fat,
      mealType: mealType || "snack",
      imageUrl,
      notes,
      loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
    },
    include: { foodItem: true },
  });

  return NextResponse.json({ meal });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Meal ID required" }, { status: 400 });

  const meal = await prisma.mealLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!meal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mealLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
