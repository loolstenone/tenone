// Vision API — Claude Vision으로 이미지 자동 태깅·분류
// POST /api/myverse/vision { media_url } — public URL 또는 base64
//
// 동작:
//   1. 사용자 동의 vision_classify=true 검증
//   2. Claude Vision (Sonnet 4.5)에 이미지 + 9 영역 분류 시스템 프롬프트
//   3. 결과: { domain, sub_tags[], description, confidence }
//
// 비용 통제: 사용자가 명시 동의한 경우에만 호출. quota는 ai_usage 테이블 (planners 인프라 재활용).

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";
import { DOMAIN_KEYS } from "@/lib/myverse/domains";
import type { DomainKey } from "@/lib/myverse/domains";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `당신은 일상 사진을 9 영역으로 분류하는 시각 분류기입니다.

영역:
- body: 운동·식사·수면·헬스장·음식 사진
- work: 사무실·미팅·노트북·문서·화이트보드
- study: 책·필기·강의·강의실·도서관
- daily: 일기·일상·기분·집·카페
- schedule: 캘린더·약속·기념일
- travel: 여행지·풍경·관광지·공항·호텔
- move: 차·지하철·길·이동 중
- relation: 사람·단체사진·셀카·미팅 참석자

작업:
1. 사진을 보고 가장 가까운 영역 1개 선택
2. 사진을 1줄로 한국어 묘사
3. 한국어 태그 2~5개 (예: 운동, 데드리프트, 헬스장 / 또는 미팅, 노트북, 회의실)
4. 신뢰도 0~1

출력 (반드시 JSON, 다른 텍스트 금지):
{"domain":"body","description":"헬스장에서 데드리프트하는 모습","tags":["운동","데드리프트","헬스장"],"confidence":0.85}`;

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const mediaUrl = String(body.media_url ?? "");
    if (!mediaUrl) return NextResponse.json({ error: "missing_media_url" }, { status: 400 });

    const admin = createAdminClient();

    // 동의 확인
    const { data: planner } = await admin
        .from("myverse_users")
        .select("auto_capture_consent")
        .eq("member_id", memberId)
        .maybeSingle();

    const consent = (planner?.auto_capture_consent as Record<string, boolean> | null) ?? {};
    if (!consent.vision_classify) {
        return NextResponse.json({
            error: "consent_required",
            hint: "설정 > 사생활 > '이미지 자동 분류'를 켜야 사용 가능합니다",
        }, { status: 403 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "vision_unavailable" }, { status: 500 });

    try {
        const anthropic = new Anthropic({ apiKey });
        const msg = await anthropic.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [{
                role: "user",
                content: [
                    { type: "image", source: { type: "url", url: mediaUrl } },
                    { type: "text", text: "이 사진을 분류해주세요." },
                ],
            }],
        });

        const text = msg.content
            .filter((b) => b.type === "text")
            .map(b => (b as { type: "text"; text: string }).text)
            .join("");

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return NextResponse.json({ error: "parse_failed", raw: text }, { status: 500 });

        const parsed = JSON.parse(jsonMatch[0]) as {
            domain?: string;
            description?: string;
            tags?: string[];
            confidence?: number;
        };

        if (!parsed.domain || !DOMAIN_KEYS.includes(parsed.domain as DomainKey)) {
            return NextResponse.json({ error: "invalid_domain", parsed }, { status: 500 });
        }

        // 사용량 카운트 (myverse_ai_usage 재활용 — 실패해도 Vision 결과 반환)
        try {
            await admin.from("myverse_ai_usage").insert({
                member_id: memberId,
                used_at: new Date().toISOString(),
                kind: "vision_classify",
                tokens_in: msg.usage?.input_tokens ?? 0,
                tokens_out: msg.usage?.output_tokens ?? 0,
            });
        } catch { /* silent */ }

        return NextResponse.json({
            ok: true,
            domain: parsed.domain,
            description: parsed.description ?? null,
            tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
            confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.7)),
            usage: {
                input_tokens: msg.usage?.input_tokens ?? 0,
                output_tokens: msg.usage?.output_tokens ?? 0,
            },
        });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
