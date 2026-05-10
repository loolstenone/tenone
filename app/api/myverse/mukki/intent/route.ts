// 무끼 의도 파서 + 마이버스 서비스 반영.
// 대화 로그는 저장하지 않는다. 의도(일정·연락처·할일)만 추출해 해당 서비스에 반영.
//
// 1단계 — 한국어 정규식 기반 파서 (캘린더 우선).
//   "5월 20일 오후 2시 LG CNS 김철중 미팅" → calendar_entry
// 2단계(후속) — Claude API tool calling으로 확장.

import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

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

/**
 * 텍스트에서 시작 날짜를 추출. 발견 못 하면 null.
 * - "오늘" / "내일" / "모레"
 * - "M월 D일" / "M월 D"
 * - "YYYY-MM-DD" / "MM-DD" / "MM/DD"
 */
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

    // YYYY-MM-DD
    const isoMatch = text.match(/(\d{4})[-./](\d{1,2})[-./](\d{1,2})/);
    if (isoMatch) {
        const y = parseInt(isoMatch[1], 10);
        const m = parseInt(isoMatch[2], 10);
        const d = parseInt(isoMatch[3], 10);
        return { date: `${y}-${pad2(m)}-${pad2(d)}`, consumed: isoMatch[0] };
    }

    // M월 D일 (한국어)
    const koMatch = text.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일?/);
    if (koMatch) {
        const m = parseInt(koMatch[1], 10);
        const d = parseInt(koMatch[2], 10);
        // 연도는 오늘 기준 — 이미 지난 달이면 내년
        let y = today.y;
        if (m < today.m || (m === today.m && d < today.d)) y = today.y + 1;
        return { date: `${y}-${pad2(m)}-${pad2(d)}`, consumed: koMatch[0] };
    }

    // MM/DD or MM-DD
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

/**
 * 텍스트에서 시간 추출 ("오후 2시", "14시", "14:00", "오전 9시 30분").
 */
function parseTime(text: string): { time: string; consumed: string } | null {
    // HH:MM
    const hhmm = text.match(/(\d{1,2}):(\d{2})/);
    if (hhmm) {
        const h = parseInt(hhmm[1], 10);
        const m = parseInt(hhmm[2], 10);
        if (h >= 0 && h < 24 && m >= 0 && m < 60) {
            return { time: `${pad2(h)}:${pad2(m)}`, consumed: hhmm[0] };
        }
    }

    // 오전/오후 H시 [M분]
    const ampmKor = text.match(/(오전|오후)\s*(\d{1,2})\s*시(?:\s*(\d{1,2})\s*분)?/);
    if (ampmKor) {
        let h = parseInt(ampmKor[2], 10);
        const m = ampmKor[3] ? parseInt(ampmKor[3], 10) : 0;
        if (ampmKor[1] === "오후" && h < 12) h += 12;
        if (ampmKor[1] === "오전" && h === 12) h = 0;
        return { time: `${pad2(h)}:${pad2(m)}`, consumed: ampmKor[0] };
    }

    // H시 [M분] (12-24시간 모호 — 그대로 해석)
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
    if (!title) {
        // 날짜만 있고 제목 없음 — 일정 등록 안 함
        return null;
    }

    // with_whom — 마지막 한국 이름 패턴 (성+이름 2~3자)
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

// 향후 확장: tryTask, tryContact, tryNote, tryProject, tryCapsule

// ── 라우트 ────────────────────────────────────────────────────

export async function POST(req: Request) {
    const memberId = await getMember();
    if (!memberId) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as Body;
    const text = (body.text ?? "").trim();
    if (!text) return NextResponse.json({ error: "missing_text" }, { status: 400 });
    const mode = body.mode ?? "ask";

    // 1. 캘린더 의도 우선
    const cal = await tryCalendar(memberId, text);
    if (cal) {
        return NextResponse.json({ reply: cal.reply, actions: cal.actions ?? [] });
    }

    // 2. fallback — 모드별 안내 메시지
    const fallback: Record<string, string> = {
        ask: "지금은 일정만 자동 등록 가능해요. (예: '5월 20일 오후 2시 LG CNS 김철중 미팅')\n할 일·연락처·노트도 곧 추가됩니다.",
        diary: "오늘 흔적으로 정리해드리는 기능은 곧 추가됩니다.\n지금은 [흔적 → 추가] 화면에서 직접 기록해 주세요.",
        coach: "코치 브리핑은 매일 아침/저녁 정해진 시간에 자동 생성돼요. 직접 묻고 싶다면 묻기 모드를 사용해 주세요.",
    };
    return NextResponse.json({
        reply: fallback[mode] ?? fallback.ask,
        actions: [
            { label: "흔적 추가", href: "/myverse/app/traces?compose=1" },
        ],
    });
}
