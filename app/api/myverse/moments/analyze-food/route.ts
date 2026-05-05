import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portion: number;
}

export interface FoodAnalysis {
    foods: FoodItem[];
    total: { calories: number; protein: number; carbs: number; fat: number };
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "missing_file" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "unsupported_format" }, { status: 400 });
    }

    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "file_too_large", maxMB: 20 }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mediaType = file.type as "image/jpeg" | "image/png" | "image/webp" | "image/gif";

    const prompt = `이 사진에서 음식을 찾아 영양 정보를 분석해줘.

반드시 아래 JSON 형식으로만 답해. 다른 텍스트 없이 JSON만.

{
  "foods": [
    {
      "name": "음식명(한국어)",
      "calories": 칼로리(정수, kcal),
      "protein": 단백질(정수, g),
      "carbs": 탄수화물(정수, g),
      "fat": 지방(정수, g),
      "portion": 1.0
    }
  ]
}

규칙:
- 음식이 없으면 foods를 빈 배열로
- 칼로리는 1인분 기준 평균값
- 음식이 여러 개면 각각 항목으로
- portion은 항상 1.0으로 설정 (사용자가 조정)`;

    let result: { text: string } | null = null;
    try {
        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 512,
            messages: [{
                role: "user",
                content: [
                    { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
                    { type: "text", text: prompt },
                ],
            }],
        });
        result = message.content[0] as { text: string };
    } catch (e) {
        console.error("Haiku vision error:", e);
        return NextResponse.json({ error: "analysis_failed" }, { status: 500 });
    }

    let parsed: { foods: FoodItem[] };
    try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch?.[0] ?? result.text);
    } catch {
        return NextResponse.json({ error: "parse_failed" }, { status: 500 });
    }

    const foods: FoodItem[] = (parsed.foods ?? []).slice(0, 20).map((f: FoodItem) => ({
        name: String(f.name ?? ""),
        calories: Math.round(Number(f.calories) || 0),
        protein: Math.round(Number(f.protein) || 0),
        carbs: Math.round(Number(f.carbs) || 0),
        fat: Math.round(Number(f.fat) || 0),
        portion: 1.0,
    }));

    const total = foods.reduce(
        (acc, f) => ({
            calories: acc.calories + Math.round(f.calories * f.portion),
            protein:  acc.protein  + Math.round(f.protein  * f.portion),
            carbs:    acc.carbs    + Math.round(f.carbs    * f.portion),
            fat:      acc.fat      + Math.round(f.fat      * f.portion),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return NextResponse.json({ foods, total } satisfies FoodAnalysis);
}
