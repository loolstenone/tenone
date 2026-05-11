// 무끼 의도 파서 + 마이버스 서비스 반영.
// 대화 로그는 저장하지 않는다. 의도(일정·할일·연락처·노트·순간·장소·루틴)만 추출해 해당 서비스에 반영.
//
// 1단계 — 한국어 정규식 기반 파서 (캘린더 우선). 빠른 경로.
//   "5월 20일 오후 2시 LG CNS 김철중 미팅" → calendar_entry
// 2단계 — Claude API tool calling (7개 도구). 1단계에서 처리 못 한 경우.
// rev: 2

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import Anthropic from "@anthropic-ai/sdk";

interface Body {
    mode?: "ask" | "diary" | "coach";
    text?: string;
}

async function getMember() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll(); },
                setAll() {},
            },
            auth: { storageKey: "tenone-auth" },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const admin = createAdminClient();
    const { data: m } = await admin
        .from("members")
        .select("id")
        .eq("auth_id", user.id)
        .maybeSingle();
    return (m as { id: string } | null)?.id ?? null;
}

// ── 한국어 날짜·시간 파서 ──────────────────────────────────────

function todayKST(): { y: number; m: number; d: number } {
    const s = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
    const [y, m, d] = s.split("-").map(Number);
    return { y, m, d };
}

function pad2(n: number): string { return n.toString().padStart(2, "0"); }

function parseDate(text: string): { date: string; consumed: string } | null {
    const today = todayKST();

    if (/오늘/.test(text)) {
        return { date: `${today.y}-${pad2(today.m)}-${pad2(today.d)}`, consumed: "오늘" };
    }
    if (/내일/.test(text)) {
        const dt = new Date(today.y, today.m - 1, today.d + 1);
        return { date: `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`, consumed: "내일" };
    }
    if (/모레/.test(text)) {
        const dt = new Date(today.y, today.m - 1, today.d + 2);
        return { date: `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`, consumed: "모레" };
    }

    const isoMatch = text.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
    if (isoMatch) {
        const y = parseInt(isoMatch[1], 10);
        const m = parseInt(isoMatch[2], 10);
        const d = parseInt(isoMatch[3], 10);
        return { date: `${y}-${pad2(m)}-${pad2(d)}`, consumed: isoMatch[0] };
    }

    const koMatch = text.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일?/);
    if (koMatch) {
        const m = parseInt(koMatch[1], 10);
        const d = parseInt(koMatch[2], 10);
        let y = today.y;
        if (m < today.m || (m === today.m && d < today.d)) y = today.y + 1;
        return { date: `${y}-${pad2(m)}-${pad2(d)}`, consumed: koMatch[0] };
    }

    const mdMatch = text.match(/(\d{1,2})[/.-](\d{1,2})/);
    if (mdMatch) {
        const m = parseInt(mdMatch[1], 10);
        const d = parseInt(mdMatch[2], 10);
        if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
            let y = today.y;
            if (m < today.m || (m === today.m && d < today.d)) y = today.y + 1;
            return { date: `${y}-${pad2(m)}-${pad2(d)}`, consumed: mdMatch[0] };
        }
    }

    return null;
}

function parseTime(text: string): { time: string; consumed: string } | null {
    const hhmm = text.match(/(\d{1,2}):(\d{2})/);
    if (hhmm) {
        const h = parseInt(hhmm[1], 10);
        const m = parseInt(hhmm[2], 10);
        if (h >= 0 && h < 24 && m >= 0 && m < 60) {
            return { time: `${pad2(h)}:${pad2(m)}`, consumed: hhmm[0] };
        }
    }

    const ampmKor = text.match(/(오전|오후)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
    if (ampmKor) {
        let h = parseInt(ampmKor[2], 10);
        const m = ampmKor[3] ? parseInt(ampmKor[3], 10) : 0;
        if (ampmKor[1] === "오후" && h < 12) h += 12;
        if (ampmKor[1] === "오전" && h === 12) h = 0;
        return { time: `${pad2(h)}:${pad2(m)}`, consumed: ampmKor[0] };
    }

    const korH = text.match(/(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
    if (korH) {
        const h = parseInt(korH[1], 10);
        const m = korH[2] ? parseInt(korH[2], 10) : 0;
        if (h >= 0 && h < 24 && m >= 0 && m < 60) {
            return { time: `${pad2(h)}:${pad2(m)}`, consumed: korH[0] };
        }
    }

    return null;
}

// ── 의도 라우터 ────────────────────────────────────────────────

interface IntentResult {
    handled: boolean;
    reply: string;
    actions?: { label: string; href?: string }[];
}

async function tryCalendar(memberId: string, text: string): Promise<IntentResult | null> {
    const dateP = parseDate(text);
    if (!dateP) return null;
    const remainAfterDate = text.replace(dateP.consumed, "").trim();
    const timeP = parseTime(remainAfterDate);
    let title = (timeP ? remainAfterDate.replace(timeP.consumed, "") : remainAfterDate)
        .replace(/[,，·.]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!title) return null;

    let with_whom: string | null = null;
    const nameMatch = title.match(/([가-힣]{2,4})(?=\s+[가-힣]+$|$)/);
    if (nameMatch) with_whom = nameMatch[1];

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("myverse_calendar_entries")
        .insert({
            member_id: memberId,
            kind: "meeting",
            title: title.slice(0, 200),
            start_date: dateP.date,
            start_time: timeP?.time ?? null,
            recurrence: "none",
            with_whom,
        })
        .select()
        .single();

    if (error || !data) {
        return {
            handled: true,
            reply: `일정 등록에 실패했어요: ${error?.message ?? "알 수 없는 오류"}`,
        };
    }

    const timeStr = timeP ? ` ${timeP.time.replace(":", "시 ")}분` : "";
    return {
        handled: true,
        reply: `📅 일정에 추가했어요\n\n${dateP.date}${timeStr}\n${title}${with_whom ? `\n\n👤 ${with_whom}` : ""}`,
        actions: [
            { label: "캘린더에서 보기", href: `/myverse/app/monthly?date=${dateP.date}` },
        ],
    };
}

// ── LLM 도구 정의 ─────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
    {
        name: "add_calendar_entry",
        description: "일정·약속·미팅을 캘린더에 추가한다. 날짜나 시간 표현이 있을 때 사용.",
        input_schema: {
            type: "object" as const,
            properties: {
                title:      { type: "string",  description: "일정 제목 (필수)" },
                start_date: { type: "string",  description: "날짜 YYYY-MM-DD (필수)" },
                start_time: { type: "string",  description: "시작 시간 HH:MM (선택)" },
                end_time:   { type: "string",  description: "종료 시간 HH:MM (선택)" },
                location:   { type: "string",  description: "장소 (선택)" },
                with_whom:  { type: "string",  description: "함께하는 사람 이름 (선택)" },
                kind:       { type: "string",  description: "유형: meeting|task|reminder|birthday|holiday (기본 meeting)", enum: ["meeting","task","reminder","birthday","holiday"] },
            },
            required: ["title", "start_date"],
        },
    },
    {
        name: "add_task",
        description: "할 일·해야 할 것을 추가한다. 오늘 날짜 기준으로 myverse_daily.tasks 배열에 저장.",
        input_schema: {
            type: "object" as const,
            properties: {
                text:     { type: "string", description: "할 일 내용 (필수)" },
                date:     { type: "string", description: "날짜 YYYY-MM-DD (생략 시 오늘)" },
                priority: { type: "string", description: "우선순위: high|normal|low", enum: ["high","normal","low"] },
                tag:      { type: "string", description: "태그 (선택)" },
            },
            required: ["text"],
        },
    },
    {
        name: "add_contact",
        description: "연락처를 추가한다. 이름과 전화번호·이메일 중 하나가 있을 때 사용.",
        input_schema: {
            type: "object" as const,
            properties: {
                name:         { type: "string", description: "이름 (필수)" },
                phone:        { type: "string", description: "전화번호 (선택)" },
                email:        { type: "string", description: "이메일 (선택)" },
                organization: { type: "string", description: "회사·소속 (선택)" },
                title:        { type: "string", description: "직책 (선택)" },
                relationship: { type: "string", description: "관계 (선택)" },
                note:         { type: "string", description: "메모 (선택)" },
            },
            required: ["name"],
        },
    },
    {
        name: "add_note",
        description: "노트·메모·아이디어를 기록한다. 구조화된 일정·할일·연락처가 아닌 자유 텍스트일 때.",
        input_schema: {
            type: "object" as const,
            properties: {
                content: { type: "string", description: "노트 본문 (필수)" },
                date:    { type: "string", description: "날짜 YYYY-MM-DD (생략 시 오늘)" },
                domain:  { type: "string", description: "도메인: work|study|personal|idea|etc", enum: ["work","study","personal","idea","etc"] },
            },
            required: ["content"],
        },
    },
    {
        name: "add_moment",
        description: "순간·경험·느낌을 기록한다. 텍스트 기반 일상 기록. 사진 없이 캡션이나 글로 남길 때.",
        input_schema: {
            type: "object" as const,
            properties: {
                caption:    { type: "string", description: "짧은 제목 또는 설명 (필수)" },
                body:       { type: "string", description: "상세 내용 (선택)" },
                date:       { type: "string", description: "날짜 YYYY-MM-DD (생략 시 오늘)" },
                location:   { type: "string", description: "장소 이름 (선택)" },
                with_whom:  { type: "string", description: "함께한 사람 (선택)" },
                activity:   { type: "string", description: "활동 종류 (선택)" },
                domain:     { type: "string", description: "도메인 (선택)", enum: ["work","study","daily","health","travel","social","creative","etc"] },
                visibility: { type: "string", description: "공개 범위", enum: ["private","friends","public"] },
            },
            required: ["caption"],
        },
    },
    {
        name: "add_place",
        description: "방문한 장소를 기록한다. 카페·식당·헬스장 등 어딘가를 갔다고 할 때.",
        input_schema: {
            type: "object" as const,
            properties: {
                place_name:   { type: "string", description: "장소 이름 (필수)" },
                date:         { type: "string", description: "날짜 YYYY-MM-DD (생략 시 오늘)" },
                visited_at:   { type: "string", description: "방문 시간 ISO8601 (선택)" },
                category:     { type: "string", description: "카테고리", enum: ["general","work","meal","exercise","leisure","transport","home","shopping","medical","social"] },
                duration_min: { type: "number", description: "체류 시간(분) (선택)" },
                address:      { type: "string", description: "주소 (선택)" },
                note:         { type: "string", description: "메모 (선택)" },
            },
            required: ["place_name"],
        },
    },
    {
        name: "add_routine",
        description: "일과·루틴 활동을 기록한다. 운동·공부·식사 등 시간을 보낸 활동.",
        input_schema: {
            type: "object" as const,
            properties: {
                activity:   { type: "string", description: "활동 내용 (필수)" },
                date:       { type: "string", description: "날짜 YYYY-MM-DD (생략 시 오늘)" },
                start_time: { type: "string", description: "시작 시간 HH:MM (선택)" },
                end_time:   { type: "string", description: "종료 시간 HH:MM (선택)" },
                category:   { type: "string", description: "카테고리", enum: ["general","work","exercise","meal","study","leisure","rest","social","faith","health","transport"] },
                note:       { type: "string", description: "메모 (선택)" },
                level:      { type: "number", description: "강도 1-5 (선택)" },
            },
            required: ["activity"],
        },
    },
];

// ── LLM 도구 실행기 ───────────────────────────────────────────

type ToolInput = Record<string, unknown>;

async function executeTool(
    memberId: string,
    toolName: string,
    input: ToolInput,
): Promise<IntentResult> {
    const admin = createAdminClient();
    const { y, m, d } = todayKST();
    const todayStr = `${y}-${pad2(m)}-${pad2(d)}`;

    switch (toolName) {
        case "add_calendar_entry": {
            const { title, start_date, start_time, end_time, location, with_whom, kind } = input as {
                title: string; start_date: string; start_time?: string; end_time?: string;
                location?: string; with_whom?: string; kind?: string;
            };
            const { data, error } = await admin
                .from("myverse_calendar_entries")
                .insert({
                    member_id: memberId,
                    kind: kind ?? "meeting",
                    title: title.slice(0, 200),
                    start_date,
                    start_time: start_time ?? null,
                    end_time: end_time ?? null,
                    location: location ?? null,
                    with_whom: with_whom ?? null,
                    recurrence: "none",
                })
                .select()
                .single();
            if (error || !data) return { handled: true, reply: `일정 등록 실패: ${error?.message ?? "오류"}` };
            const timeStr = start_time ? ` ${start_time.replace(":", "시 ")}분` : "";
            return {
                handled: true,
                reply: `📅 일정 추가했어요\n\n${start_date}${timeStr}\n${title}${with_whom ? `\n👤 ${with_whom}` : ""}${location ? `\n📍 ${location}` : ""}`,
                actions: [{ label: "캘린더에서 보기", href: `/myverse/app/monthly?date=${start_date}` }],
            };
        }

        case "add_task": {
            const { text, date, priority, tag } = input as {
                text: string; date?: string; priority?: string; tag?: string;
            };
            const targetDate = date ?? todayStr;
            // myverse_daily.tasks는 JSONB 배열 — upsert 후 tasks 배열에 push
            const { data: existing } = await admin
                .from("myverse_daily")
                .select("tasks")
                .eq("member_id", memberId)
                .eq("date", targetDate)
                .maybeSingle();
            const tasks: unknown[] = Array.isArray((existing as { tasks?: unknown[] } | null)?.tasks)
                ? (existing as { tasks: unknown[] }).tasks
                : [];
            const newTask = {
                id: crypto.randomUUID(),
                text,
                status: "todo",
                priority: priority ?? "normal",
                tag: tag ?? null,
                created_at: new Date().toISOString(),
            };
            tasks.push(newTask);
            const { error } = await admin
                .from("myverse_daily")
                .upsert(
                    { member_id: memberId, date: targetDate, tasks, updated_at: new Date().toISOString() },
                    { onConflict: "member_id,date" }
                );
            if (error) return { handled: true, reply: `할 일 등록 실패: ${error.message}` };
            return {
                handled: true,
                reply: `✅ 할 일 추가했어요\n\n${text}${tag ? ` [${tag}]` : ""}`,
                actions: [{ label: "오늘 할 일 보기", href: `/myverse/app/today` }],
            };
        }

        case "add_contact": {
            const { name, phone, email, organization, title, relationship, note } = input as {
                name: string; phone?: string; email?: string; organization?: string;
                title?: string; relationship?: string; note?: string;
            };
            const { data, error } = await admin
                .from("myverse_contacts")
                .insert({
                    member_id: memberId,
                    name,
                    phone: phone ?? null,
                    email: email ?? null,
                    organization: organization ?? null,
                    title: title ?? null,
                    relationship: relationship ?? null,
                    note: note ?? null,
                    labels: [],
                })
                .select()
                .single();
            if (error || !data) return { handled: true, reply: `연락처 등록 실패: ${error?.message ?? "오류"}` };
            return {
                handled: true,
                reply: `👤 연락처 추가했어요\n\n${name}${organization ? ` · ${organization}` : ""}${title ? ` (${title})` : ""}${phone ? `\n📞 ${phone}` : ""}${email ? `\n✉️ ${email}` : ""}`,
                actions: [{ label: "연락처 보기", href: `/myverse/app/with` }],
            };
        }

        case "add_note": {
            const { content, date, domain } = input as {
                content: string; date?: string; domain?: string;
            };
            const targetDate = date ?? todayStr;
            // 노트는 myverse_daily_moments에 media_type='text'로 저장
            const { data, error } = await admin
                .from("myverse_daily_moments")
                .insert({
                    member_id: memberId,
                    date: targetDate,
                    media_type: "text",
                    body: content,
                    domain: domain ?? "personal",
                    visibility: "private",
                })
                .select()
                .single();
            if (error || !data) return { handled: true, reply: `노트 저장 실패: ${error?.message ?? "오류"}` };
            return {
                handled: true,
                reply: `📝 노트 저장했어요\n\n${content.length > 100 ? content.slice(0, 100) + "…" : content}`,
                actions: [{ label: "흔적에서 보기", href: `/myverse/app/traces` }],
            };
        }

        case "add_moment": {
            const { caption, body, date, location, with_whom, activity, domain, visibility } = input as {
                caption: string; body?: string; date?: string; location?: string;
                with_whom?: string; activity?: string; domain?: string; visibility?: string;
            };
            const targetDate = date ?? todayStr;
            const { data, error } = await admin
                .from("myverse_daily_moments")
                .insert({
                    member_id: memberId,
                    date: targetDate,
                    media_type: "text",
                    caption: caption.slice(0, 300),
                    body: body ?? null,
                    location: location ?? null,
                    with_whom: with_whom ?? null,
                    activity: activity ?? null,
                    domain: domain ?? "daily",
                    visibility: visibility ?? "private",
                })
                .select()
                .single();
            if (error || !data) return { handled: true, reply: `순간 기록 실패: ${error?.message ?? "오류"}` };
            return {
                handled: true,
                reply: `✨ 순간 기록했어요\n\n${caption}${with_whom ? `\n👤 ${with_whom}와 함께` : ""}${location ? `\n📍 ${location}` : ""}`,
                actions: [{ label: "흔적에서 보기", href: `/myverse/app/traces` }],
            };
        }

        case "add_place": {
            const { place_name, date, visited_at, category, duration_min, address, note } = input as {
                place_name: string; date?: string; visited_at?: string; category?: string;
                duration_min?: number; address?: string; note?: string;
            };
            const targetDate = date ?? todayStr;
            const { data, error } = await admin
                .from("myverse_daily_places")
                .insert({
                    member_id: memberId,
                    date: targetDate,
                    place_name,
                    visited_at: visited_at ?? null,
                    category: category ?? "general",
                    duration_min: duration_min ?? null,
                    address: address ?? null,
                    note: note ?? null,
                })
                .select()
                .single();
            if (error || !data) return { handled: true, reply: `장소 기록 실패: ${error?.message ?? "오류"}` };
            const durStr = duration_min ? ` (${duration_min}분)` : "";
            return {
                handled: true,
                reply: `📍 장소 기록했어요\n\n${place_name}${durStr}${address ? `\n${address}` : ""}${note ? `\n💬 ${note}` : ""}`,
                actions: [{ label: "오늘 흔적 보기", href: `/myverse/app/traces` }],
            };
        }

        case "add_routine": {
            const { activity, date, start_time, end_time, category, note, level } = input as {
                activity: string; date?: string; start_time?: string; end_time?: string;
                category?: string; note?: string; level?: number;
            };
            const targetDate = date ?? todayStr;
            const lvl = typeof level === "number" && level >= 1 && level <= 5 ? level : null;
            const { data, error } = await admin
                .from("myverse_daily_routines")
                .insert({
                    member_id: memberId,
                    date: targetDate,
                    activity,
                    start_time: start_time ?? null,
                    end_time: end_time ?? null,
                    category: category ?? "general",
                    note: note ?? null,
                    level: lvl,
                })
                .select()
                .single();
            if (error || !data) return { handled: true, reply: `루틴 기록 실패: ${error?.message ?? "오류"}` };
            const timeRange = (start_time && end_time) ? ` ${start_time}–${end_time}` : start_time ? ` ${start_time}~` : "";
            return {
                handled: true,
                reply: `🔁 루틴 기록했어요\n\n${activity}${timeRange}${note ? `\n💬 ${note}` : ""}`,
                actions: [{ label: "오늘 루틴 보기", href: `/myverse/app/today` }],
            };
        }

        default:
            return { handled: false, reply: "알 수 없는 도구입니다." };
    }
}

// ── LLM fallback ──────────────────────────────────────────────

async function tryWithLLM(memberId: string, text: string, mode: string): Promise<IntentResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return {
            handled: false,
            reply: "지금은 일정만 자동 등록 가능해요. (예: '5월 20일 오후 2시 LG CNS 김철중 미팅')",
        };
    }

    const anthropic = new Anthropic({ apiKey });
    const { y, m, d } = todayKST();
    const todayStr = `${y}-${pad2(m)}-${pad2(d)}`;

    let response;
    try {
        response = await anthropic.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 1024,
            system: [
                `당신은 마이버스(개인 라이프 OS) 어시스턴트입니다.`,
                `오늘 날짜: ${todayStr} (한국 시간 기준)`,
                `모드: ${mode}`,
                `사용자의 한국어 입력에서 의도를 파악해 적절한 도구를 호출하세요.`,
                `도구 호출이 필요 없는 단순 질문이면 도구 없이 짧은 한국어로만 답하세요.`,
                `날짜 미지정 시 오늘(${todayStr})을 사용하세요.`,
            ].join(" "),
            messages: [{ role: "user", content: text }],
            tools: TOOLS,
        });
    } catch (e) {
        console.error("[mukki/intent] LLM error:", e);
        return {
            handled: false,
            reply: "잠시 오류가 발생했어요. 다시 시도해 주세요.",
        };
    }

    // tool_use 블록이 있으면 실행
    const toolUseBlocks = response.content.filter(
        (c): c is Anthropic.ToolUseBlock => c.type === "tool_use"
    );

    if (toolUseBlocks.length > 0) {
        // 첫 번째 도구 실행 (무끼는 단일 의도 처리)
        const block = toolUseBlocks[0];
        return await executeTool(memberId, block.name, block.input as ToolInput);
    }

    // 텍스트 응답만 있으면 그대로 반환
    const textBlock = response.content.find(
        (c): c is Anthropic.TextBlock => c.type === "text"
    );
    if (textBlock?.text) {
        return { handled: true, reply: textBlock.text };
    }

    return { handled: false, reply: "의도를 파악하지 못했어요. 좀 더 구체적으로 입력해 주시겠어요?" };
}

// ── 라우트 ────────────────────────────────────────────────────

export async function POST(req: Request) {
    const memberId = await getMember();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Body;
    const text = (body.text ?? "").trim();
    if (!text) return NextResponse.json({ error: "missing_text" }, { status: 400 });
    const mode = body.mode ?? "ask";

    // 1. 캘린더 의도 — 정규식 빠른 경로
    const cal = await tryCalendar(memberId, text);
    if (cal) {
        return NextResponse.json({ reply: cal.reply, actions: cal.actions ?? [] });
    }

    // 2. LLM tool calling fallback (7가지 도구)
    const llm = await tryWithLLM(memberId, text, mode);
    return NextResponse.json({
        reply: llm.reply,
        actions: (llm as IntentResult).actions ?? [],
    });
}
