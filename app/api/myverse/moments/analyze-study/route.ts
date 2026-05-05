import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";

export interface StudyAnalysis {
    subject: string;
    topic: string;
    focus: "light" | "moderate" | "deep";
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

    const prompt = `이 사진에서 공부·학습 장면을 분석해줘.

반드시 아래 JSON 형식으로만 답해. 다른 텍스트 없이 JSON만.

{
  "subject": "과목·분야(한국어, 예: 영어·수학·프로그래밍·경제·독서·자격증·언어)",
  "topic": "세부 주제(한국어, 예: 토익 문법·알고리즘·재무제표·파이썬 기초)",
  "focus": "light 또는 moderate 또는 deep"
}

규칙:
- 공부·학습 장면이 없으면 subject와 topic을 빈 문자열로
- focus: 가벼운 훑어보기=light / 집중 공부=moderate / 몰입 심화=deep
- topic은 사진에서 보이는 내용 기반으로 추정, 불분명하면 subject와 동일하게`;

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

    let parsed: { subject: string; topic: string; focus: string };
    try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch?.[0] ?? result.text);
    } catch {
        return NextResponse.json({ error: "parse_failed" }, { status: 500 });
    }

    const focus = (["light", "moderate", "deep"].includes(parsed.focus)
        ? parsed.focus
        : "moderate") as "light" | "moderate" | "deep";
    const safeDuration = Math.min(Math.max(durationMin, 1), 720);

    const study: StudyAnalysis = {
        subject: String(parsed.subject ?? ""),
        topic: String(parsed.topic ?? ""),
        focus,
        duration_min: safeDuration,
    };

    return NextResponse.json({ study } satisfies { study: StudyAnalysis });
}
