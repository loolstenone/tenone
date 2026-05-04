// 마이버스 AI 코칭 — "나와의 대화"
// POST /api/myverse/chat { messages: [{role, content}], scope?: { days?: number } }
//
// 사용자 본인 데이터를 컨텍스트로 Haiku 4.5에게 질문 답변.
// 무료 사용자는 일일 5회 한도. 구독자는 무제한.

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/planners/auth";
import {
    fetchDomainStats,
    fetchTopPeople,
    fetchTopPlaces,
    fetchWeeklyTrend,
} from "@/lib/myverse/insights/queries";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const FREE_DAILY_LIMIT = 5;

const SYSTEM_PROMPT = `당신은 사용자 본인의 마이버스 데이터를 토대로 답하는 개인 AI 코치입니다.

원칙:
1. 사용자 데이터에 근거해서만 답한다. 데이터에 없는 것은 모른다고 한다.
2. 9 영역(BODY·업무·공부·일상·일정·여행·이동·관계·사람)을 가로지르는 교차 인사이트를 발견한다.
3. 한국어로 친근하게. 짧고 구체적으로. 숫자 인용은 정확히.
4. 추측·일반론 금지. "데이터에 따르면…"으로 시작하라.

5가지 핵심 질문 패턴:
- 생산성: "가장 생산적인 시기" — 업무 시간과 운동·수면·관계의 상관
- 관계 영향: "이 사람과 만난 후" — relation 다음 24h 패턴
- 장소-집중: "이 카페·이 공간에서 집중 시간"
- 시퀀스: "X 잦은 주 → 다음 주 Y" — 주별 패턴 시퀀스
- 깊이: "가장 깊이 일한 사람·가장 자주 간 곳"

데이터 형식: JSON으로 도메인별 통계, 자주 만난 사람 TOP, 자주 간 장소 TOP, 주별 시계열을 받음.`;

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
    const days = parseInt(String(body.scope?.days ?? 90), 10);

    if (messages.length === 0) return NextResponse.json({ error: "no_messages" }, { status: 400 });

    const admin = createAdminClient();

    // 구독 상태 + 일일 한도 체크
    const { data: planner } = await admin
        .from("planners_users")
        .select("subscription_status")
        .eq("member_id", memberId)
        .maybeSingle();

    const isSubscriber = planner?.subscription_status === "active";

    if (!isSubscriber) {
        // 오늘 사용량 카운트
        const today = new Date().toISOString().slice(0, 10);
        const { count } = await admin
            .from("planners_ai_usage")
            .select("id", { count: "exact", head: true })
            .eq("member_id", memberId)
            .eq("kind", "myverse_chat")
            .gte("used_at", `${today}T00:00:00`);

        if ((count ?? 0) >= FREE_DAILY_LIMIT) {
            return NextResponse.json({
                error: "daily_limit_reached",
                limit: FREE_DAILY_LIMIT,
                hint: "구독하면 무제한 사용 가능합니다",
                upgrade_url: "/planners/purchase",
            }, { status: 429 });
        }
    }

    // 사용자 데이터 컨텍스트 fetch
    const ctx = { member_id: memberId, days };
    const [domainStats, topPeople, topPlaces, weeklyTrend] = await Promise.all([
        fetchDomainStats(ctx),
        fetchTopPeople(ctx, 8),
        fetchTopPlaces(ctx, 8),
        fetchWeeklyTrend(ctx),
    ]);

    const dataContext = `최근 ${days}일 데이터:

[9 영역 통계]
${JSON.stringify(domainStats, null, 0)}

[자주 만난 사람 TOP 8]
${JSON.stringify(topPeople, null, 0)}

[자주 간 장소 TOP 8]
${JSON.stringify(topPlaces, null, 0)}

[주별 도메인별 분(min) 시계열 (최근 8주)]
${JSON.stringify(weeklyTrend.slice(-8), null, 0)}`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ai_unavailable" }, { status: 500 });

    try {
        const anthropic = new Anthropic({ apiKey });
        const msg = await anthropic.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 800,
            system: SYSTEM_PROMPT + "\n\n" + dataContext,
            messages: messages.map(m => ({
                role: m.role,
                content: m.content,
            })),
        });

        const reply = msg.content
            .filter(b => b.type === "text")
            .map(b => (b as { type: "text"; text: string }).text)
            .join("");

        // 사용량 기록
        await admin.from("planners_ai_usage").insert({
            member_id: memberId,
            used_at: new Date().toISOString(),
            kind: "myverse_chat",
            tokens_in: msg.usage?.input_tokens ?? 0,
            tokens_out: msg.usage?.output_tokens ?? 0,
        }).then(() => undefined, () => undefined);

        return NextResponse.json({
            ok: true,
            reply,
            quota_used: !isSubscriber,
            usage: {
                input_tokens: msg.usage?.input_tokens ?? 0,
                output_tokens: msg.usage?.output_tokens ?? 0,
            },
        });
    } catch (e) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 });
    }
}
