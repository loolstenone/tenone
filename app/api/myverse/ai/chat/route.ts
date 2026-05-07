// Myverse AI 채팅 — 사이드패널의 대화 백엔드
// 사용자의 현재 컨텍스트(오늘 날짜·요약·이번주 task) 를 system 에 자동 주입.
// Phase 2 — A2 AI 채팅 사이드패널

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

async function getMember(): Promise<{ id: string; name: string | null } | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() { /* read-only */ },
            },
            auth: { storageKey: "tenone-auth" },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const admin = createAdminClient();
    const { data: m } = await admin
        .from("members")
        .select("id, name")
        .eq("auth_id", user.id)
        .maybeSingle();
    return m ? { id: m.id, name: m.name ?? null } : null;
}

// 최근 7일 컨텍스트 + 이번 주 task + 활성 프로젝트 수집 (간소화)
async function gatherContext(memberId: string, today: string): Promise<string> {
    const admin = createAdminClient();
    const lines: string[] = [`오늘 = ${today}`];

    // identity
    const { data: identity } = await admin
        .from("myverse_identities")
        .select("vision, mission")
        .eq("member_id", memberId)
        .maybeSingle();
    if (identity?.vision)  lines.push(`Vision: ${identity.vision}`);
    if (identity?.mission) lines.push(`Mission: ${identity.mission}`);

    // 최근 7일 daily — task / 노트 요약
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    const startStr = start.toISOString().slice(0, 10);
    const { data: dailies } = await admin
        .from("myverse_daily")
        .select("date, tasks")
        .eq("member_id", memberId)
        .gte("date", startStr)
        .lte("date", today)
        .order("date", { ascending: false })
        .limit(7);

    if (dailies && dailies.length > 0) {
        lines.push("\n최근 7일 task 현황:");
        for (const d of dailies) {
            const tasks = Array.isArray(d.tasks) ? d.tasks : [];
            const todo = tasks.filter((t: { status?: string }) => t.status === "todo").length;
            const done = tasks.filter((t: { status?: string }) => t.status === "done").length;
            const carry = tasks.filter((t: { status?: string }) => t.status === "carry").length;
            if (todo + done + carry > 0) {
                lines.push(`- ${d.date}: 할일 ${todo} / 완료 ${done} / 이월 ${carry}`);
            }
        }
    }

    // 활성 프로젝트 (최대 5개)
    const { data: projects } = await admin
        .from("myverse_projects")
        .select("title, status, deadline")
        .eq("member_id", memberId)
        .eq("status", "active")
        .limit(5);
    if (projects && projects.length > 0) {
        lines.push("\n활성 프로젝트:");
        for (const p of projects) {
            lines.push(`- ${p.title}${p.deadline ? ` (마감 ${p.deadline})` : ""}`);
        }
    }

    return lines.join("\n");
}

export async function POST(req: Request) {
    const member = await getMember();
    if (!member) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null) as {
        messages?: ChatMessage[];
        today?: string;
        view?: string;
    } | null;
    const messages = body?.messages?.filter(m => m.role === "user" || m.role === "assistant") ?? [];
    if (messages.length === 0) return NextResponse.json({ error: "messages required" }, { status: 400 });

    const today = body?.today ?? new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
    const view = body?.view ?? "unknown";

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ai_disabled" }, { status: 503 });

    const context = await gatherContext(member.id, today);

    const systemPrompt = `당신은 "${member.name ?? "사용자"}" 의 Myverse AI 비서입니다.
역할: 오늘·이번주의 우선순위 정리, 부담 분석, 다음 행동 제안, 미완 업무 처리 가이드.

원칙:
- 한국어로 친근한 어조 (반말 X, ~요 어미).
- 1~3문단으로 짧게. 불릿 사용 OK.
- 모르는 정보를 만들어내지 않는다 — 데이터에 없으면 "확인이 필요해요" 라고 솔직히 말한다.
- 사용자가 등록을 요청하면 (예: "내일 3시 미팅") 시스템이 먼저 자연어 파서로 처리하므로, 채팅 단계에 도달했다는 것은 등록 의도가 아니거나 정보 부족이다. 무엇이 부족한지 짚어준다.
- 시간 = ${today} (KST), 현재 사용자가 보고 있는 화면 = ${view}.

사용자 컨텍스트:
${context}`;

    const anthropic = new Anthropic({ apiKey });
    let resp: Anthropic.Message;
    try {
        resp = await anthropic.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: [
                { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
            ],
            messages: messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "ai_error";
        return NextResponse.json({ error: "ai_error", detail: msg }, { status: 500 });
    }

    const reply = resp.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map(b => b.text)
        .join("\n")
        .trim();

    return NextResponse.json({
        reply,
        usage: {
            input_tokens: resp.usage.input_tokens,
            output_tokens: resp.usage.output_tokens,
        },
    });
}
