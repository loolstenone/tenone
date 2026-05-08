// AI 자동 분류 — Claude Vision 으로 9 영역 + 태그 + 캡션 추출
// POST /api/myverse/moments/[id]/classify
//
// 동작:
//   1. moment 행 조회 (소유권 확인)
//   2. media_url 다운로드 → base64 (이미지 only; 영상은 thumbnail_url 사용)
//   3. Claude Haiku에 전송 → JSON 응답 (domain / tags / caption_suggestion)
//   4. row UPDATE: domain, sub_tags, content_axis (검색용), classification_version+1
//
// 비용: Claude Haiku 4.5 — 약 $0.001/이미지

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const CLASSIFY_PROMPT = `너는 Myverse의 AI 분류기다. 사용자의 흔적(사진)을 보고 9 영역 중 하나로 분류하고, 의미 있는 태그와 한 줄 캡션을 만들어 준다.

도메인 (반드시 하나):
- body: 운동·식사·수면·신체 활동
- work: 업무·회의·작업·문서·프로젝트
- study: 강의·책·필기·학습·자기 계발
- daily: 일상·여가·집·카페·취미·자유 기록 (애매하면 여기)
- schedule: 일정·약속·기념일·이벤트
- travel: 여행·관광지·여행지·먼 곳
- move: 이동·교통·길거리·차/지하철
- relation: 사람과의 관계·모임·가족·친구

응답 형식 (JSON only, 다른 말 하지 마):
{
  "domain": "daily",
  "tags": ["커피", "카페", "오후"],
  "caption_suggestion": "오후의 커피 한 잔",
  "confidence": 0.85
}

원칙:
- tags: 3-7개, 한국어 명사 중심, 검색에 유용한 키워드
- caption_suggestion: 한국어 한 줄 (15자 이내), 시적이지 않고 사실적으로
- 사진에 사람이 있으면 relation도 후보로 고려하되, 명확한 모임/만남 맥락이 아니면 다른 영역 우선`;

async function fetchImageAsBase64(url: string): Promise<{ base64: string; mediaType: string } | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type") || "image/jpeg";
        if (!contentType.startsWith("image/")) return null;
        const buf = await res.arrayBuffer();
        // Claude는 5MB 이하 권장
        if (buf.byteLength > 5 * 1024 * 1024) return null;
        const base64 = Buffer.from(buf).toString("base64");
        return { base64, mediaType: contentType };
    } catch {
        return null;
    }
}

interface ClassifyResult {
    domain: string;
    tags: string[];
    caption_suggestion: string;
    confidence: number;
}

async function callClaude(imageBase64: string, mediaType: string): Promise<ClassifyResult | null> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return null;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 400,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
                        { type: "text", text: CLASSIFY_PROMPT },
                    ],
                },
            ],
        }),
    });

    if (!res.ok) {
        console.error("[classify] Claude error:", res.status, await res.text().catch(() => ""));
        return null;
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== "string") return null;

    // JSON 파싱 (Claude가 가끔 ```json fence를 붙임)
    const jsonText = text.replace(/```(?:json)?\s*/g, "").replace(/```\s*$/g, "").trim();
    try {
        const parsed = JSON.parse(jsonText) as ClassifyResult;
        // 도메인 검증
        const validDomains = ["body", "work", "study", "daily", "schedule", "travel", "move", "relation"];
        if (!validDomains.includes(parsed.domain)) parsed.domain = "daily";
        if (!Array.isArray(parsed.tags)) parsed.tags = [];
        parsed.tags = parsed.tags.slice(0, 7).map(t => String(t).slice(0, 30));
        if (typeof parsed.caption_suggestion !== "string") parsed.caption_suggestion = "";
        parsed.caption_suggestion = parsed.caption_suggestion.slice(0, 60);
        if (typeof parsed.confidence !== "number") parsed.confidence = 0.5;
        return parsed;
    } catch (e) {
        console.error("[classify] JSON parse error:", e, text);
        return null;
    }
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    const admin = createAdminClient();
    const { data: moment, error: fetchErr } = await admin
        .from("myverse_daily_moments")
        .select("id, member_id, media_type, media_url, thumbnail_url, caption, content_axis")
        .eq("id", id)
        .single();

    if (fetchErr || !moment) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (moment.member_id !== memberId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

    // 이미지: media_url / 영상: thumbnail_url 사용
    const imageUrl = moment.media_type === "image" ? moment.media_url : moment.thumbnail_url;
    if (!imageUrl) return NextResponse.json({ error: "no_image" }, { status: 400 });

    const fetched = await fetchImageAsBase64(imageUrl);
    if (!fetched) return NextResponse.json({ error: "image_fetch_failed" }, { status: 500 });

    const result = await callClaude(fetched.base64, fetched.mediaType);
    if (!result) return NextResponse.json({ error: "ai_failed" }, { status: 500 });

    // 검색 인덱스: 캡션 + 태그 합쳐서 content_axis에 저장
    const searchText = [moment.caption, result.caption_suggestion, ...result.tags].filter(Boolean).join(" ");

    const { error: updateErr } = await admin
        .from("myverse_daily_moments")
        .update({
            domain: result.domain,
            sub_tags: result.tags,
            content_axis: searchText.slice(0, 1000),
            classification_version: 1,
        })
        .eq("id", id);

    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    return NextResponse.json({
        ok: true,
        domain: result.domain,
        tags: result.tags,
        caption_suggestion: result.caption_suggestion,
        confidence: result.confidence,
    });
}
