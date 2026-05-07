// Myverse AI — 능동 AI 브리핑 프롬프트 + 컨텍스트 조립

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { getISOWeek } from "./types";
import { dispatchBriefingNotifications } from "./notifications";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;

export type BriefingType = "morning" | "midday" | "evening";

/**
 * 현재 시각(KST)으로부터 적합한 브리핑 타입 추론
 * - 04:00~11:59 morning (시작)
 * - 12:00~17:59 midday (중간 점검)
 * - 18:00~03:59 evening (마무리)
 */
export function inferBriefingType(now: Date = new Date()): BriefingType {
    // KST = UTC+9
    const kstHour = (now.getUTCHours() + 9) % 24;
    if (kstHour >= 4 && kstHour < 12) return "morning";
    if (kstHour >= 12 && kstHour < 18) return "midday";
    return "evening";
}

interface BriefingContext {
    memberId: string;
    date: string;
    memberName?: string;
    userRole?: string | null;
    identity?: {
        vision?: string | null;
        mission?: string | null;
        key_results?: Array<{ category: string; text: string }>;
    };
    daily?: {
        today_tasks?: Array<{ text: string; status: string }>;
        yesterday_carried?: Array<{ text: string }>;
        yesterday_result?: string | null;
    };
    weekly?: {
        year: number;
        week: number;
        vrief_what?: string | null;
        vrief_why?: string | null;
        vrief_how?: string | null;
        gpr_goal?: string | null;
        gpr_plan?: string | null;
    };
    monthly?: {
        theme?: string | null;
        focus_areas?: string[];
    };
    projects?: Array<{
        title: string;
        progress: number;
        end_date?: string | null;
    }>;
    tone: "professional" | "friendly" | "brief";
    mode: "weekly" | "all_in_one";
}

/**
 * 오늘 브리핑에 필요한 컨텍스트를 DB에서 수집
 */
export async function gatherContext(memberId: string, date: string): Promise<BriefingContext> {
    const admin = createAdminClient();

    const yesterday = new Date(date + "T00:00:00Z");
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    const { year, week } = getISOWeek(new Date(date + "T00:00:00Z"));
    const month = parseInt(date.slice(5, 7), 10);
    const yearNum = parseInt(date.slice(0, 4), 10);

    const [member, plannerUser, identity, todayDaily, yestDaily, weekly, monthly, projects] = await Promise.all([
        admin.from("members").select("name").eq("id", memberId).maybeSingle(),
        admin.from("myverse_users").select("mode, ai_tone, user_role").eq("member_id", memberId).maybeSingle(),
        admin.from("myverse_identities").select("vision_statement, mission_statement, key_results").eq("member_id", memberId).maybeSingle(),
        admin.from("myverse_daily").select("tasks").eq("member_id", memberId).eq("date", date).maybeSingle(),
        admin.from("myverse_daily").select("tasks, daily_result").eq("member_id", memberId).eq("date", yesterdayStr).maybeSingle(),
        admin.from("myverse_weekly").select("vrief_what, vrief_why, vrief_how, gpr_goal, gpr_plan").eq("member_id", memberId).eq("year", year).eq("week", week).maybeSingle(),
        admin.from("myverse_monthly").select("theme, focus_areas").eq("member_id", memberId).eq("year", yearNum).eq("month", month).maybeSingle(),
        admin.from("myverse_projects").select("title, end_date, myverse_project_gprs(progress)").eq("member_id", memberId).eq("status", "active"),
    ]);

    const todayTasks = (todayDaily.data?.tasks as Array<{ text: string; status: string }> | undefined) ?? [];
    const yestTasks = (yestDaily.data?.tasks as Array<{ text: string; status: string }> | undefined) ?? [];
    const carried = yestTasks.filter((t) => t.status === "carried" || t.status === "todo");

    return {
        memberId,
        date,
        memberName: member.data?.name ?? undefined,
        identity: identity.data
            ? {
                  vision: identity.data.vision_statement,
                  mission: identity.data.mission_statement,
                  key_results: (identity.data.key_results as Array<{ category: string; text: string }> | undefined) ?? [],
              }
            : undefined,
        daily: {
            today_tasks: todayTasks,
            yesterday_carried: carried,
            yesterday_result: yestDaily.data?.daily_result ?? null,
        },
        weekly: weekly.data
            ? { year, week, ...weekly.data }
            : { year, week },
        monthly: monthly.data
            ? { theme: monthly.data.theme, focus_areas: monthly.data.focus_areas ?? [] }
            : undefined,
        projects:
            (projects.data ?? []).map((p: { title: string; end_date: string | null; myverse_project_gprs: Array<{ progress: number }> | { progress: number } | null }) => ({
                title: p.title,
                end_date: p.end_date,
                progress: Array.isArray(p.myverse_project_gprs)
                    ? p.myverse_project_gprs[0]?.progress ?? 0
                    : p.myverse_project_gprs?.progress ?? 0,
            })) ?? [],
        tone: (plannerUser.data?.ai_tone as "professional" | "friendly" | "brief") ?? "friendly",
        mode: (plannerUser.data?.mode as "weekly" | "all_in_one") ?? "weekly",
        userRole: plannerUser.data?.user_role ?? null,
    };
}

/**
 * 브리핑 시스템 프롬프트
 */
const ROLE_CONTEXT_KO: Record<string, string> = {
    office_worker: "직장인 — 업무 보고·회의·마감·프로젝트 중심으로 언급하세요.",
    student:       "대학생 — 수업·과제·시험·시간표 중심으로 언급하세요.",
    researcher:    "연구원/교수 — 논문·실험·강의·문헌 진행 중심으로 언급하세요.",
    designer:      "디자이너 — 클라이언트·브리프·피드백·마감 중심으로 언급하세요.",
    developer:     "개발자 — 스프린트·이슈·PR·배포 일정 중심으로 언급하세요.",
    creator:       "크리에이터 — 콘텐츠 업로드 일정·아이디어·제작 진도 중심으로 언급하세요.",
    sales:         "영업 — 고객 미팅·파이프라인·팔로업·목표 대비 실적 중심으로 언급하세요.",
    planner:       "기획자 — 전략·마일스톤·의사결정·브리프 중심으로 언급하세요.",
    athlete:       "운동/피트니스 — 오늘 루틴·회복 상태·주간 볼륨 중심으로 언급하세요.",
    entrepreneur:  "창업가/프리랜서 — OKR·네트워킹·린 실험·수익 목표 중심으로 언급하세요.",
};

function systemPrompt(type: BriefingType, tone: string, userRole?: string | null): string {
    const toneGuide = {
        professional: "전문적이고 간결한 어투. 경어 사용. 군더더기 없이.",
        friendly: "따뜻하고 친근한 어투. 격려와 응원을 섞어서.",
        brief: "초간결. 요점만. 꾸밈어 최소화.",
    }[tone] ?? "따뜻하고 친근한 어투.";

    const role = type === "morning"
        ? "당신은 Myverse AI의 아침 비서입니다. 사용자가 오늘을 의식적으로 시작하도록 돕습니다."
        : type === "midday"
        ? "당신은 Myverse AI의 중간 점검 비서입니다. 오전을 돌아보고 남은 시간의 우선순위를 다잡도록 돕습니다."
        : "당신은 Myverse AI의 저녁 정리 비서입니다. 사용자가 오늘을 의미 있게 마무리하고 내일을 준비하도록 돕습니다.";

    const roleGuide = userRole && ROLE_CONTEXT_KO[userRole]
        ? `- 사용자 역할: ${ROLE_CONTEXT_KO[userRole]}`
        : "";

    return `${role}

핵심 원칙:
- "우리는 모두 기획자다. 적어도 자기 인생에서 만큼은." 이 철학 위에서 말합니다.
- 사용자의 Personal Identity(Vision·Mission·Key Results)를 모든 조언의 기준점으로 삼습니다.
- 지시하지 않고 **질문과 비춤**으로 사용자의 도모를 살려냅니다.
- 이모지는 섹션 구분에 최소로만 (📌 🎯 🚀 ✅ 📝 같은 구조 표시). 감정 이모지 금지.
- 한국어. ${toneGuide}
- 300~500자. 불필요한 반복·사족 금지.${roleGuide ? `\n${roleGuide}` : ""}

${type === "morning"
    ? `아침 브리핑 구조:
1. 인사 (1줄)
2. 오늘 챙길 것 (이월 태스크 포함)
3. 이번 주 Vrief 한 문장 요약 + 오늘과의 연결
4. 활성 프로젝트 간결 상태
5. 마무리 질문 한 줄 (오늘의 도모는 무엇인가)`
    : type === "midday"
    ? `중간 점검 구조:
1. 오전 진행 상황 짧게 비춤 (완료·미시작 태스크 균형)
2. 남은 오후의 우선순위 1~2개 (Identity·Vrief 정렬)
3. 에너지 관리 한 줄 (휴식·전환 신호)
4. 오후를 시작하는 질문 한 줄`
    : `저녁 정리 구조:
1. 오늘 요약 (완료·이월·신규 건수)
2. Identity 정렬도 한 줄 평가
3. 내일 준비 (이월된 것 + 내일 첫 일정)
4. 오늘 기록할 '한 줄 결과' 제안 (사용자에게 쓰도록 유도)`}`;
}

/**
 * 컨텍스트를 텍스트로 직렬화
 */
function contextToText(ctx: BriefingContext): string {
    const parts: string[] = [];

    parts.push(`[날짜] ${ctx.date}`);
    if (ctx.memberName) parts.push(`[사용자] ${ctx.memberName}`);

    if (ctx.identity?.vision || ctx.identity?.mission) {
        parts.push(`\n[Personal Identity]`);
        if (ctx.identity.vision) parts.push(`Vision: ${ctx.identity.vision}`);
        if (ctx.identity.mission) parts.push(`Mission: ${ctx.identity.mission}`);
        if (ctx.identity.key_results && ctx.identity.key_results.length > 0) {
            parts.push(`Key Results:`);
            ctx.identity.key_results.forEach((kr) => parts.push(`  - [${kr.category}] ${kr.text}`));
        }
    }

    if (ctx.monthly?.theme || (ctx.monthly?.focus_areas && ctx.monthly.focus_areas.length > 0)) {
        parts.push(`\n[이달]`);
        if (ctx.monthly.theme) parts.push(`테마: ${ctx.monthly.theme}`);
        if (ctx.monthly.focus_areas && ctx.monthly.focus_areas.length > 0) {
            parts.push(`집중: ${ctx.monthly.focus_areas.join(", ")}`);
        }
    }

    if (ctx.weekly) {
        parts.push(`\n[이번 주 W${ctx.weekly.week}]`);
        if (ctx.weekly.vrief_what) parts.push(`What: ${ctx.weekly.vrief_what}`);
        if (ctx.weekly.vrief_why) parts.push(`Why: ${ctx.weekly.vrief_why}`);
        if (ctx.weekly.vrief_how) parts.push(`How: ${ctx.weekly.vrief_how}`);
        if (ctx.weekly.gpr_goal) parts.push(`Goal: ${ctx.weekly.gpr_goal}`);
        if (ctx.weekly.gpr_plan) parts.push(`Plan: ${ctx.weekly.gpr_plan}`);
    }

    if (ctx.daily) {
        parts.push(`\n[Today]`);
        if (ctx.daily.today_tasks && ctx.daily.today_tasks.length > 0) {
            parts.push(`오늘 태스크:`);
            ctx.daily.today_tasks.forEach((t) => parts.push(`  - [${t.status}] ${t.text}`));
        } else {
            parts.push(`오늘 태스크: 없음`);
        }
        if (ctx.daily.yesterday_carried && ctx.daily.yesterday_carried.length > 0) {
            parts.push(`어제 이월:`);
            ctx.daily.yesterday_carried.forEach((t) => parts.push(`  - ${t.text}`));
        }
        if (ctx.daily.yesterday_result) parts.push(`어제 결과: ${ctx.daily.yesterday_result}`);
    }

    if (ctx.projects && ctx.projects.length > 0) {
        parts.push(`\n[활성 프로젝트]`);
        ctx.projects.forEach((p) => {
            const endStr = p.end_date ? ` (마감 ${p.end_date})` : "";
            parts.push(`  - ${p.title}: ${p.progress}%${endStr}`);
        });
    }

    return parts.join("\n");
}

/**
 * AI 브리핑 생성 + DB 저장
 */
export async function generateBriefing(
    memberId: string,
    date: string,
    type: BriefingType
): Promise<{ content: string; briefingId: string } | null> {
    if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("ANTHROPIC_API_KEY not configured");
    }

    const admin = createAdminClient();

    // 이미 오늘 그 타입 브리핑이 있으면 그걸 반환
    const { data: existing } = await admin
        .from("myverse_ai_briefings")
        .select("*")
        .eq("member_id", memberId)
        .eq("briefing_type", type)
        .eq("briefing_date", date)
        .maybeSingle();
    if (existing) {
        return { content: existing.content, briefingId: existing.id };
    }

    const ctx = await gatherContext(memberId, date);
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const msg = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt(type, ctx.tone, ctx.userRole),
        messages: [
            {
                role: "user",
                content: `다음 컨텍스트를 바탕으로 ${type === "morning" ? "아침 브리핑" : type === "midday" ? "중간 점검" : "저녁 정리"}을 작성해 주세요.\n\n${contextToText(ctx)}`,
            },
        ],
    });

    const content = msg.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("\n");

    const { data: saved, error } = await admin
        .from("myverse_ai_briefings")
        .insert({
            member_id: memberId,
            briefing_type: type,
            briefing_date: date,
            content,
            context_snapshot: ctx,
        })
        .select()
        .single();

    if (error || !saved) return null;

    // 사용량 카운트 (upsert로 단순화) — midday 는 morning 컬럼에 합산
    try {
        const usageColumn = type === "evening" ? "evening_count" : "morning_count";
        await admin.from("myverse_ai_usage").upsert({
            member_id: memberId,
            usage_date: date,
            [usageColumn]: 1,
        }, { onConflict: "member_id,usage_date" });
    } catch (_) { /* non-critical */ }

    // 알림 발송 (이메일 + 푸시) — 백그라운드로, 실패해도 브리핑은 성공 반환
    dispatchBriefingNotifications({
        memberId,
        briefingDate: date,
        type,
        content,
    }).catch((e) => console.error("briefing dispatch failed", e));

    return { content, briefingId: saved.id };
}
