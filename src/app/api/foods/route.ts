import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { nameLocal: { contains: query } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const foods = await prisma.foodItem.findMany({
    where,
    orderBy: { name: "asc" },
    take: 50,
  });

  return NextResponse.json({ foods });
}
