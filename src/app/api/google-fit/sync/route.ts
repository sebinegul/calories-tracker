import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fitToken = await prisma.googleFitToken.findUnique({
    where: { userId: user.id },
  });

  if (!fitToken) {
    return NextResponse.json({ connected: false });
  }

  // Check if token is expired and try to refresh
  if (fitToken.expiresAt && new Date() > fitToken.expiresAt) {
    if (fitToken.refreshToken) {
      try {
        const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            refresh_token: fitToken.refreshToken,
            client_id: process.env.GOOGLE_FIT_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_FIT_CLIENT_SECRET || "",
            grant_type: "refresh_token",
          }),
        });
        const tokens = await refreshRes.json();
        if (tokens.access_token) {
          await prisma.googleFitToken.update({
            where: { userId: user.id },
            data: {
              accessToken: tokens.access_token,
              expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            },
          });
          return NextResponse.json({ connected: true, token: tokens.access_token });
        }
      } catch {
        return NextResponse.json({ connected: false });
      }
    }
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({ connected: true, token: fitToken.accessToken });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const fitToken = await prisma.googleFitToken.findUnique({
    where: { userId: user.id },
  });
  if (!fitToken) return NextResponse.json({ error: "Not connected" }, { status: 400 });

  try {
    // Fetch fitness data from Google Fit
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get steps
    const stepsResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${fitToken.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: "com.google.step_count.delta",
            dataSourceId: "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps",
          }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startOfDay.getTime(),
          endTimeMillis: now.getTime(),
        }),
      }
    );

    const stepsData = await stepsResponse.json();
    const totalSteps = stepsData.bucket?.[0]?.dataset?.[0]?.point?.reduce(
      (sum: number, p: any) => sum + (p.value?.[0]?.intVal || 0), 0
    ) || 0;

    // Get calories
    const caloriesResponse = await fetch(
      `https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${fitToken.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: "com.google.calories.expended",
            dataSourceId: "derived:com.google.calories.expended:com.google.android.gms:from_bmr",
          }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startOfDay.getTime(),
          endTimeMillis: now.getTime(),
        }),
      }
    );

    const caloriesData = await caloriesResponse.json();
    const activeCalories = caloriesData.bucket?.[0]?.dataset?.[0]?.point?.reduce(
      (sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0
    ) || 0;

    // Save activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: "walking",
        steps: totalSteps,
        calories: Math.round(activeCalories),
        durationMin: Math.round(totalSteps / 100), // rough estimate
        source: "google_fit",
        activityDate: now,
      },
    });

    return NextResponse.json({ steps: totalSteps, calories: activeCalories });
  } catch (error) {
    console.error("Google Fit sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
