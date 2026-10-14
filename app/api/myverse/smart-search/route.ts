// 플래너'스 AI 2단계 ③ — 일상어로 찾기 (자연어 의미 검색) (2026-10-14)
// POST { query } → { answer, range, keywords, results: [{ type, date, title, snippet, href }] }
//   "작년 가을쯤 팀장님이랑 얘기했던 신규 프로젝트 아이디어 찾아줘"
//   1) Claude: 질문 → 기간(from~to) + 찾을 말(동의어 포함) + 사람
//   2) 그 기간의 내 기록을 찾을 말로 거른다 — 할 일·메모·하루 결과·저녁 회고(myverse_daily) · 일정(캘린더) · 프로젝트·프로젝트 노트
//   3) Claude: 후보 중 질문에 맞는 것을 골라 한 줄 답
// 임베딩(OpenAI 키 없음) 대신 질문 이해를 AI에 맡기는 방식 — 추가 인프라 없음
// 유료 회원 전용 (lib/myverse/ai-access.ts) · 내 기록만 (member_id)

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAiAccess, isAiDenied, logAiUsage } from "@/lib/myverse/ai-access";

const MODEL = "claude-haiku-4-5-20251001";
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 730;

const PLAN_TOOL: Anthropic.Tool = {
    name: "search_plan",
    description: "검색 질문을 기간과 찾을 말로 바꾼다.",
    input_schema: {
        type: "object",
        properties: {
            from: { type: "string", description: "YYYY-MM-DD. 기간 말이 없으면 오늘에서 1년 전" },
            to: { type: "string", description: "YYYY-MM-DD. 기간 말이 없으면 오늘" },
            keywords: { type: "array", items: { type: "string" }, description: "기록에 실제로 적혀 있을 법한 낱말 3~10개. 띄어쓰기 없는 한 단어씩, 조사 빼고, 동의어 꼭 포함. 예: 신규, 새, 프로젝트, 아이디어, 기획안, 구상" },
            people: { type: "array", items: { type: "string" }, description: "사람·호칭 (팀장, 김 대리 등). 없으면 빈 배열" },
        },
        required: ["from", "to", "keywords"],
    },
};

const PICK_TOOL: Anthropic.Tool = {
    name: "pick",
    description: "후보 중 질문에 맞는 기록을 고른다.",
    input_schema: {
        type: "object",
        properties: {
            ids: { type: "array", items: { type: "string" }, description: "맞는 후보 id, 관련 높은 순, 최대 8개" },
            answer: { type: "string", description: "찾은 내용을 한두 문장으로 (존댓말). 맞는 게 없으면 솔직하게" },
        },
        required: ["ids", "answer"],
    },
};

interface Cand { id: string; type: string; date: string; title: string; snippet: string; href: string; hay: string }

const kstToday = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
const addDays = (d: string, n: number) => { const x = new Date(`${d}T00:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const clip = (s: string, n = 140) => (s.length > n ? `${s.slice(0, n)}…` : s);

/** 노트(Cornell JSON 등)에서 사람이 읽는 글만 */
function textOf(v: unknown): string {
    if (!v) return "";
    if (typeof v === "string") {
        const t = v.trim();
        if (t.startsWith("{") || t.startsWith("[")) { try { return textOf(JSON.parse(t)); } catch { return t; } }
        return t;
    }
    if (Array.isArray(v)) return v.map(textOf).filter(Boolean).join(" ");
    if (typeof v === "object") return Object.values(v as Record<string, unknown>).map(textOf).filter(Boolean).join(" ");
    return "";
}

export async function POST(req: Request) {
    const aiAccess = await requireAiAccess(req);
    if (isAiDenied(aiAccess)) return aiAccess;
    if (aiAccess.kind !== "member") return NextResponse.json({ error: "member_only" }, { status: 400 });
    const memberId = aiAccess.memberId;
    const body = await req.json().catch(() => ({})) as { query?: string };
    const query = (body.query ?? "").trim().slice(0, 300);
    if (query.length < 2) return NextResponse.json({ error: "query required" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
    const anthropic = new Anthropic({ apiKey });
    const today = kstToday();
    await logAiUsage(aiAccess, "smart_search");

    // 1) 질문 → 기간·찾을 말
    let plan: { from?: string; to?: string; keywords?: string[]; people?: string[] } = {};
    try {
        const r = await anthropic.messages.create({
            model: MODEL, max_tokens: 400,
            system: `오늘은 ${today}(한국)입니다. 사용자가 자기 플래너 기록을 일상어로 찾습니다. 질문을 기간과 찾을 말로 바꾸세요.
계절은 그해 전체 기간으로: 봄 03-01~05-31, 여름 06-01~08-31, 가을 09-01~11-30, 겨울 12-01~다음 해 02-28. "작년"=${Number(today.slice(0, 4)) - 1}년, "재작년"=${Number(today.slice(0, 4)) - 2}년. 월만 말하면 그달 1일~말일.`,
            tools: [PLAN_TOOL], tool_choice: { type: "tool", name: PLAN_TOOL.name },
            messages: [{ role: "user", content: query }],
        });
        const b = r.content.find((x) => x.type === "tool_use");
        if (b?.type === "tool_use") plan = b.input as typeof plan;
    } catch (e) {
        console.error("[smart-search] plan 실패", e);
        return NextResponse.json({ error: "ai_error" }, { status: 500 });
    }
    let to = plan.to && DATE_RE.test(plan.to) ? plan.to : today;
    let from = plan.from && DATE_RE.test(plan.from) ? plan.from : addDays(to, -365);
    if (from > to) [from, to] = [to, from];
    // "쯤·즈음·무렵·경·정도" → 앞뒤 한 달 넉넉히 (기억은 대개 어긋난다)
    if (/쯤|즈음|무렵|정도|경에|언젠가|그때/.test(query)) { from = addDays(from, -31); to = addDays(to, 31) > today ? today : addDays(to, 31); }
    if (from < addDays(to, -MAX_RANGE_DAYS)) from = addDays(to, -MAX_RANGE_DAYS);
    // 여러 낱말 묶음은 낱말로 나눈다 ("신규 프로젝트" → 신규·프로젝트) · 호칭의 "님" 제거
    const words = [...new Set([...(plan.keywords ?? []), ...(plan.people ?? [])].flatMap((w) => String(w).split(/\s+/)).map((w) => w.trim().toLowerCase().replace(/님$/, "")).filter((w) => w.length >= 1))].slice(0, 16);
    if (words.length === 0) return NextResponse.json({ answer: "무엇을 찾는지 조금 더 구체적으로 적어 주세요.", range: { from, to }, keywords: [], results: [] });

    // 2) 기간 안의 내 기록 → 후보
    const admin = createAdminClient();
    const [{ data: days }, { data: events }, { data: projects }] = await Promise.all([
        admin.from("myverse_daily").select("date, tasks, notes, notes_secondary, daily_result, reflection").eq("member_id", memberId).gte("date", from).lte("date", to).limit(800),
        admin.from("myverse_calendar_entries").select("id, start_date, title, description, with_whom, location").eq("member_id", memberId).gte("start_date", from).lte("start_date", to).limit(800),
        admin.from("myverse_projects").select("id, title, start_date, created_at").eq("member_id", memberId).limit(300),
    ]);
    const projIds = (projects ?? []).map((p) => p.id as string);
    const { data: pnotes } = projIds.length
        ? await admin.from("myverse_project_notes").select("id, project_id, title, content, created_at").in("project_id", projIds).gte("created_at", `${from}T00:00:00+09:00`).lte("created_at", `${to}T23:59:59+09:00`).limit(500)
        : { data: [] as { id: string; project_id: string; title: string; content: string; created_at: string }[] };

    const cands: Cand[] = [];
    for (const d of (days ?? []) as { date: string; tasks: { id: string; text: string; status: string }[] | null; notes: string | null; notes_secondary: string | null; daily_result: string | null; reflection: { questions?: { q: string; a: string }[] } | null }[]) {
        const href = `/planners/app/daily?date=${d.date}`;
        for (const t of d.tasks ?? []) if (t?.text) cands.push({ id: `t:${d.date}:${t.id}`, type: "할 일", date: d.date, title: t.text, snippet: t.status === "done" ? "끝냄" : "", href, hay: t.text });
        const memo = [textOf(d.notes), textOf(d.notes_secondary)].filter(Boolean).join(" ");
        if (memo) cands.push({ id: `n:${d.date}`, type: "메모", date: d.date, title: clip(memo, 40), snippet: clip(memo), href, hay: memo });
        if (d.daily_result) cands.push({ id: `r:${d.date}`, type: "하루 결과", date: d.date, title: clip(d.daily_result, 40), snippet: clip(d.daily_result), href, hay: d.daily_result });
        const refl = (d.reflection?.questions ?? []).filter((q) => q.a?.trim()).map((q) => `${q.q} ${q.a}`).join(" ");
        if (refl) cands.push({ id: `f:${d.date}`, type: "저녁 회고", date: d.date, title: clip(refl, 40), snippet: clip(refl), href, hay: refl });
    }
    for (const e of (events ?? []) as { id: string; start_date: string; title: string; description: string | null; with_whom: unknown; location: string | null }[]) {
        const extra = [e.description, textOf(e.with_whom), e.location].filter(Boolean).join(" ");
        cands.push({ id: `e:${e.id}`, type: "일정", date: e.start_date, title: e.title, snippet: clip(extra), href: `/planners/app/daily?date=${e.start_date}`, hay: `${e.title} ${extra}` });
    }
    const projTitle = new Map((projects ?? []).map((p) => [p.id as string, p.title as string]));
    for (const n of (pnotes ?? []) as { id: string; project_id: string; title: string; content: string; created_at: string }[]) {
        const body2 = textOf(n.content);
        cands.push({ id: `p:${n.id}`, type: "프로젝트 노트", date: n.created_at.slice(0, 10), title: `${projTitle.get(n.project_id) ?? "프로젝트"} · ${n.title ?? ""}`, snippet: clip(body2), href: `/planners/app/projects/${n.project_id}`, hay: `${n.title ?? ""} ${body2}` });
    }
    for (const p of (projects ?? []) as { id: string; title: string; start_date: string | null; created_at: string }[]) {
        const d = p.start_date ?? p.created_at.slice(0, 10);
        if (d >= from && d <= to) cands.push({ id: `j:${p.id}`, type: "프로젝트", date: d, title: p.title, snippet: "", href: `/planners/app/projects/${p.id}`, hay: p.title });
    }

    const scored = cands
        .map((c) => { const h = c.hay.toLowerCase(); return { c, score: words.reduce((a, w) => a + (h.includes(w) ? 1 : 0), 0) }; })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || (a.c.date < b.c.date ? 1 : -1))
        .slice(0, 40);
    const strip = ({ hay: _h, ...rest }: Cand) => { void _h; return rest; };
    if (scored.length === 0) {
        return NextResponse.json({ answer: `${from} ~ ${to} 사이 기록에서 찾지 못했어요. 기간이나 다른 말로 다시 물어봐 주세요.`, range: { from, to }, keywords: words, results: [] });
    }

    // 3) 후보 중 맞는 것 고르기
    let ids: string[] = scored.slice(0, 8).map((x) => x.c.id);
    let answer = "";
    try {
        const list = scored.map((x) => `[${x.c.id}] ${x.c.date} ${x.c.type} | ${x.c.title}${x.c.snippet ? ` | ${x.c.snippet}` : ""}`).join("\n");
        const r = await anthropic.messages.create({
            model: MODEL, max_tokens: 500,
            system: "사용자의 질문에 맞는 기록을 후보 중에서 고르고, 찾은 내용을 한두 문장으로 알려 줍니다. 후보에 없는 내용을 지어내지 않습니다. 부드러운 존댓말.",
            tools: [PICK_TOOL], tool_choice: { type: "tool", name: PICK_TOOL.name },
            messages: [{ role: "user", content: `질문: ${query}\n\n후보\n${list}` }],
        });
        const b = r.content.find((x) => x.type === "tool_use");
        if (b?.type === "tool_use") {
            const out = b.input as { ids?: string[]; answer?: string };
            const valid = (out.ids ?? []).filter((i) => scored.some((x) => x.c.id === i));
            if (valid.length) ids = valid.slice(0, 8);
            answer = String(out.answer ?? "").slice(0, 300);
        }
    } catch (e) {
        console.error("[smart-search] pick 실패 — 점수 순으로", e);
    }
    const byId = new Map(scored.map((x) => [x.c.id, x.c]));
    return NextResponse.json({ answer, range: { from, to }, keywords: words, results: ids.map((i) => strip(byId.get(i)!)) });
}
