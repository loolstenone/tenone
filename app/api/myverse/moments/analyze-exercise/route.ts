import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export interface ExerciseAnalysis {
    type: string;
    muscle_groups: string[];
    duration_min: number;
    calories_burned: number;
    intensity: "low" | "medium" | "high";
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const INTENSITY_CALORIES: Record<string, number> = {
    low: 4,
    medium: 6,
    high: 9,
};

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const durationMin = Number(form.get("duration_min") ?? 30);

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

    const prompt = `이 사진에서 운동 장면을 분석해줘.

반드시 아래 JSON 형식으로만 답해. 다른 텍스트 없이 JSON만.

{
  "type": "운동 종류(한국어, 예: 벤치프레스·스쿼트·달리기·수영·요가·사이클)",
  "muscle_groups": ["주요 운동 부위 한국어 배열, 예: 가슴, 어깨, 하체"],
  "intensity": "low 또는 medium 또는 high"
}

규칙:
- 운동 장면이 없으면 type을 빈 문자열로, muscle_groups를 빈 배열로
- intensity: 저강도(걷기·요가·스트레칭)=low / 중강도(조깅·수영·자전거)=medium / 고강도(HIIT·웨이트·스프린트)=high
- 운동 부위는 최대 4개까지`;

    let result: { text: string } | null = null;
    try {
        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 256,
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

    let parsed: { type: string; muscle_groups: string[]; intensity: string };
    try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch?.[0] ?? result.text);
    } catch {
        return NextResponse.json({ error: "parse_failed" }, { status: 500 });
    }

    const intensity = (["low", "medium", "high"].includes(parsed.intensity) ? parsed.intensity : "medium") as "low" | "medium" | "high";
    const caloriesPerMin = INTENSITY_CALORIES[intensity];
    const safeDuration = Math.min(Math.max(durationMin, 1), 300);

    const exercise: ExerciseAnalysis = {
        type: String(parsed.type ?? ""),
        muscle_groups: Array.isArray(parsed.muscle_groups) ? parsed.muscle_groups.slice(0, 4).map(String) : [],
        duration_min: safeDuration,
        calories_burned: Math.round(caloriesPerMin * safeDuration),
        intensity,
    };

    return NextResponse.json({ exercise } satisfies { exercise: ExerciseAnalysis });
}
