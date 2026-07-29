import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "week";

  const now = new Date();
  let start: Date;
  switch (range) {
    case "month":
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case "3months":
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case "all":
      start = new Date(2020, 0, 1);
      break;
    default: // week
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const logs = await prisma.weightLog.findMany({
    where: {
      userId: user.id,
      date: { gte: start },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ logs });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { weightKg, date, notes } = body;

  if (!weightKg) {
    return NextResponse.json({ error: "Weight is required" }, { status: 400 });
  }

  // If date provided, update existing entry for that date or create new
  const logDate = date ? new Date(date) : new Date();
  const dayStart = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
  const dayEnd = new Date(dayStart.getTime() + 86400000 - 1);

  const existing = await prisma.weightLog.findFirst({
    where: {
      userId: user.id,
      date: { gte: dayStart, lte: dayEnd },
    },
  });

  if (existing) {
    const updated = await prisma.weightLog.update({
      where: { id: existing.id },
      data: { weightKg, notes: notes ?? undefined },
    });
    return NextResponse.json({ log: updated });
  }

  const log = await prisma.weightLog.create({
    data: {
      userId: user.id,
      weightKg,
      date: logDate,
      notes,
    },
  });

  return NextResponse.json({ log });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const log = await prisma.weightLog.findFirst({
    where: { id, userId: user.id },
  });
  if (!log) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.weightLog.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
