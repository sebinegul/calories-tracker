import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = image.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Try Gemini API if configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const result = await analyzeWithGemini(dataUrl, geminiKey);
      return NextResponse.json(result);
    }

    // Try OpenAI if configured
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const result = await analyzeWithOpenAI(dataUrl, openaiKey);
      return NextResponse.json(result);
    }

    // Fallback: return the image data URL so the user can identify it manually
    return NextResponse.json({
      imageDataUrl: dataUrl,
      detectedFoods: [],
      message: "No AI vision API configured. Set GEMINI_API_KEY or OPENAI_API_KEY in .env.local",
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

async function analyzeWithGemini(dataUrl: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "You are a food recognition expert specializing in South Indian cuisine. Identify ALL food items visible in this image. For each item, provide: name (in English), estimated portion size, estimated calories, protein (g), carbs (g), fat (g). Also estimate the total meal calories. Respond ONLY with a JSON object in this exact format: { \"items\": [{\"name\": \"Idli\", \"portion\": \"2 pieces\", \"calories\": 80, \"protein\": 4.4, \"carbs\": 33, \"fat\": 0.2}], \"totalCalories\": 80, \"mealType\": \"breakfast\" }" },
            { inlineData: { mimeType: dataUrl.split(";")[0].split(":")[1], data: dataUrl.split(",")[1] } },
          ],
        }],
      }),
    }
  );

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  // Extract JSON from the response (it may have markdown code fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return { items: [], totalCalories: 0, mealType: "snack" };
}

async function analyzeWithOpenAI(dataUrl: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "You are a food recognition expert specializing in South Indian cuisine. Identify ALL food items visible in this image. For each item, provide: name (in English), estimated portion size, estimated calories, protein (g), carbs (g), fat (g). Also estimate the total meal calories. Respond ONLY with a JSON object in this exact format: { \"items\": [{\"name\": \"Idli\", \"portion\": \"2 pieces\", \"calories\": 80, \"protein\": 4.4, \"carbs\": 33, \"fat\": 0.2}], \"totalCalories\": 80, \"mealType\": \"breakfast\" }" },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  const result = await response.json();
  const text = result?.choices?.[0]?.message?.content || "{}";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return { items: [], totalCalories: 0, mealType: "snack" };
}
