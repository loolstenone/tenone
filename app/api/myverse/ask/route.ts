// Ask Myverse — 자연어 질문 → 관련 흔적/일과/장소 검색 → Claude로 답변 합성
// POST /api/myverse/ask  body: { question: string }
//
// 단순 v1: 질문에서 한글 키워드 추출 → 메타 필드(caption, sub_tags, location, with_whom, activity, content_axis) 매칭
// 후속 vNext: pgvector embedding 기반 의미 검색

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberId } from "@/lib/myverse/auth";
import { embed } from "@/lib/myverse/embeddings";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface MomentRow {
    id: string;
    date: string;
    domain: string | null;
    sub_tags: string[] | null;
    media_type: string;
    media_url: string;
    thumbnail_url: string | null;
    caption: string | null;
    happened_at: string | null;
    with_whom: string | null;
    location: string | null;
    activity: string | null;
}

const STOPWORDS = new Set([
    "이", "그", "저", "것", "는", "은", "가", "이", "을", "를", "의", "에", "에서", "와", "과",
    "내가", "나는", "내", "나", "뭐", "뭘", "어디", "언제", "누구", "어떻게", "왜",
    "지난", "어제", "오늘", "이번", "작년", "올해", "최근",
    "있", "있어", "없", "없어", "했", "한", "할", "들",
    "?", "!", ".", ",",
]);

function extractKeywords(q: string): string[] {
    // 공백/특수문자로 분할 → 2글자 이상 + stopword 제외
    const tokens = q
        .replace(/[?!.,()/\\<>{}\[\]"'`~]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
        .map(t => t.trim())
        .filter(t => t.length >= 2 && !STOPWORDS.has(t));
    return Array.from(new Set(tokens));
}

async function searchMoments(memberId: string, keywords: string[]): Promise<MomentRow[]> {
    const admin = createAdminClient();
    if (keywords.length === 0) {
        // 키워드 없음 → 최근 30건
        const { data } = await admin
            .from("myverse_daily_moments")
            .select("id, date, domain, sub_tags, media_type, media_url, thumbnail_url, caption, happened_at, with_whom, location, activity")
            .eq("member_id", memberId)
            .order("date", { ascending: false })
            .limit(30);
        return (data ?? []) as MomentRow[];
    }

    // 각 키워드를 OR로 묶어 하나라도 매치되는 row를 가져옴
    const orParts: string[] = [];
    for (const kw of keywords) {
        const safe = kw.replace(/[%_,()]/g, "");
        if (!safe) continue;
        orParts.push(`caption.ilike.%${safe}%`);
        orParts.push(`location.ilike.%${safe}%`);
        orParts.push(`with_whom.ilike.%${safe}%`);
        orParts.push(`activity.ilike.%${safe}%`);
        orParts.push(`content_axis.ilike.%${safe}%`);
        // sub_tags TEXT[] — cs(contains) 연산자
        orParts.push(`sub_tags.cs.{${safe}}`);
    }

    // 도메인 키워드 매핑 — 한국어 → enum (운동→body, 친구·모임→relation 등)
    const DOMAIN_HINTS: Record<string, string> = {
        "운동": "body", "헬스": "body", "산책": "body", "달리기": "body", "식사": "body", "음식": "body", "수면": "body",
        "업무": "work", "일": "work", "회의": "work", "미팅": "work", "프로젝트": "work",
        "공부": "study", "강의": "study", "책": "study", "독서": "study",
        "여행": "travel", "여행지": "travel",
        "약속": "schedule", "일정": "schedule", "이벤트": "schedule",
        "친구": "relation", "가족": "relation", "모임": "relation", "사람": "relation",
        "이동": "move", "교통": "move",
    };
    const domainSet = new Set<string>();
    for (const kw of keywords) {
        const d = DOMAIN_HINTS[kw];
        if (d) domainSet.add(d);
    }
    for (const d of domainSet) {
        orParts.push(`domain.eq.${d}`);
    }

    const { data, error } = await admin
        .from("myverse_daily_moments")
        .select("id, date, domain, sub_tags, media_type, media_url, thumbnail_url, caption, happened_at, with_whom, location, activity")
        .eq("member_id", memberId)
        .or(orParts.join(","))
        .order("date", { ascending: false })
        .limit(30);

    if (error) {
        console.error("[ask] search error:", error.message);
        return [];
    }
    return (data ?? []) as MomentRow[];
}

function buildContext(moments: MomentRow[]): string {
    if (moments.length === 0) return "(관련 데이터 없음)";
    const lines = moments.slice(0, 20).map((m, i) => {
        const meta = [
            m.date,
            m.location,
            m.with_whom && `with ${m.with_whom}`,
            m.activity,
            m.domain,
            m.sub_tags && m.sub_tags.length > 0 && m.sub_tags.join(","),
        ].filter(Boolean).join(" · ");
        return `[#${i + 1} id=${m.id}] ${meta}${m.caption ? ` — "${m.caption}"` : ""}`;
    });
    return lines.join("\n");
}

const SYSTEM_PROMPT = `너는 사용자의 디지털 흔적을 함께 들춰보는 친구다. 한국어로 짧고 따뜻하게 답한다.

원칙:
- 사용자의 흔적 데이터(아래 컨텍스트)에서만 답을 끌어낸다. 추측·창작 금지.
- 데이터에 없으면 "그 시기엔 기록이 없어요" 라고 솔직히 말한다.
- 답에 사용한 흔적은 끝에 [#1, #3] 처럼 인용한다 (모든 인용은 한 번만 등장).
- 3-4 문장 이내. 길게 늘리지 말 것.
- "당신"이 아니라 사용자 입장(예: "그날 ...했었네요")에서 자연스럽게.`;

async function callClaude(question: string, context: string): Promise<{ answer: string; citations: number[] }> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return { answer: "(AI 키 미설정)", citations: [] };

    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 600,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: "user",
                    content: `질문: ${question}\n\n관련된 내 흔적:\n${context}`,
                },
            ],
        }),
    });

    if (!res.ok) {
        return { answer: `(AI 호출 실패: ${res.status})`, citations: [] };
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text ?? "(빈 응답)";
    const citations = Array.from(text.matchAll(/#(\d+)/g)).map(m => parseInt((m as RegExpMatchArray)[1], 10));
    return { answer: text, citations: Array.from(new Set(citations)) };
}

export async function POST(req: Request) {
    const memberId = await getMemberId();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const question = String(body?.question || "").trim();
    if (!question) return NextResponse.json({ error: "missing_question" }, { status: 400 });
    if (question.length > 500) return NextResponse.json({ error: "question_too_long" }, { status: 400 });

    const keywords = extractKeywords(question);
    let moments = await searchMoments(memberId, keywords);

    // pgvector hybrid — embedding 사용 가능하면 의미 검색 결과를 합성
    const queryVec = await embed(question);
    if (queryVec) {
        const admin2 = createAdminClient();
        const { data: semantic } = await admin2.rpc("myverse_search_moments_semantic", {
            p_member_id: memberId,
            p_query_embedding: queryVec as unknown as string,
            p_match_count: 20,
        });
        if (semantic && semantic.length > 0) {
            // 의미 검색 결과를 keyword 결과 앞쪽에 dedupe해서 합치기
            const seen = new Set(moments.map(m => m.id));
            const merged: MomentRow[] = [];
            for (const s of semantic) {
                if (!seen.has(s.id)) { merged.push(s as unknown as MomentRow); seen.add(s.id); }
            }
            moments = [...merged, ...moments].slice(0, 30);
        }
    }
    const context = buildContext(moments);
    const { answer, citations } = await callClaude(question, context);

    // 인용된 흔적만 cited 배열로 반환 (UI에서 썸네일로 노출)
    const cited = citations
        .map(idx => moments[idx - 1])
        .filter(Boolean)
        .map(m => ({
            id: m.id,
            date: m.date,
            domain: m.domain,
            media_type: m.media_type,
            media_url: m.media_url,
            thumbnail_url: m.thumbnail_url,
            caption: m.caption,
            location: m.location,
        }));

    return NextResponse.json({
        question,
        answer,
        keywords,
        cited,
        total_searched: moments.length,
    });
}
