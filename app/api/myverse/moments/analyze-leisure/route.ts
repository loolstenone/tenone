import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export interface LeisureAnalysis {
    activity: string;
    category: string;
    mood: "relaxing" | "exciting" | "social" | "creative";
    duration_min: number;
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const durationMin = Number(form.get("duration_min") ?? 60);

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

    const prompt = `이 사진에서 여가·취미 활동을 분석해줘.

반드시 아래 JSON 형식으로만 답해. 다른 텍스트 없이 JSON만.

{
  "activity": "활동명(한국어, 예: 영화 관람·카페 방문·등산·독서·게임·전시 관람·여행)",
  "category": "활동 분류(한국어, 예: 문화생활·야외활동·엔터테인먼트·취미·사교·휴식)",
  "mood": "relaxing 또는 exciting 또는 social 또는 creative"
}

규칙:
- 여가 활동이 없으면 activity를 빈 문자열로, category를 빈 문자열로
- mood: 느긋하고 편안한=relaxing / 활동적이고 신나는=exciting / 사람들과 함께하는=social / 만들거나 표현하는=creative`;

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

    let parsed: { activity: string; category: string; mood: string };
    try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch?.[0] ?? result.text);
    } catch {
        return NextResponse.json({ error: "parse_failed" }, { status: 500 });
    }

    const mood = (["relaxing", "exciting", "social", "creative"].includes(parsed.mood)
        ? parsed.mood
        : "relaxing") as "relaxing" | "exciting" | "social" | "creative";
    const safeDuration = Math.min(Math.max(durationMin, 1), 720);

    const leisure: LeisureAnalysis = {
        activity: String(parsed.activity ?? ""),
        category: String(parsed.category ?? ""),
        mood,
        duration_min: safeDuration,
    };

    return NextResponse.json({ leisure } satisfies { leisure: LeisureAnalysis });
}
