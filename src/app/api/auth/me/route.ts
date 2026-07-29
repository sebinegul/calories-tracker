import { NextResponse } from "next/server";
import { getAuthUser, clearAuthCookie } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
