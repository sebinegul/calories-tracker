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

  const activities = await prisma.activityLog.findMany({
    where: {
      userId: user.id,
      activityDate: { gte: range.start, lte: range.end },
    },
    orderBy: { activityDate: "desc" },
  });

  const totals = activities.reduce(
    (acc: { steps: number; calories: number; durationMin: number }, a: { steps: number | null; calories: number | null; durationMin: number | null }) => ({
      steps: acc.steps + (a.steps || 0),
      calories: acc.calories + (a.calories || 0),
      durationMin: acc.durationMin + (a.durationMin || 0),
    }),
    { steps: 0, calories: 0, durationMin: 0 }
  );

  return NextResponse.json({ activities, totals });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, durationMin, calories, steps, distanceKm, source, activityDate, notes } = body;

  const activity = await prisma.activityLog.create({
    data: {
      userId: user.id,
      type: type || "walking",
      durationMin: durationMin || null,
      calories: calories || null,
      steps: steps || null,
      distanceKm: distanceKm || null,
      source: source || "manual",
      activityDate: activityDate ? new Date(activityDate) : new Date(),
      notes,
    },
  });

  return NextResponse.json({ activity });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Activity ID required" }, { status: 400 });

  const activity = await prisma.activityLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.activityLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
