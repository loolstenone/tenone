/**
 * 운영 상태 — 유니버스 자동화가 "실제로" 돌고 있나 (서버 전용, 2026-10-10)
 *   Intelligence 3화면 중 하나(운영 상태)의 SSOT. 대시보드 경보도 이 결과를 쓴다
 *   판정은 각 작업의 **결과물**로 한다: pg_cron "succeeded"는 요청을 보냈다는 뜻일 뿐이고,
 *   행이 들어온 시각만 보면 "실행은 되는데 실패"(AI 크레딧 고갈 등)를 놓친다 — 2026-10-10 하루에 4건이 몇 달씩 조용히 멈춰 있었다
 *   새 자동화(cron·Edge Function·동기화)를 만들면 여기에 한 항목 추가한다 (CLAUDE.md 부록 G)
 */
import { createAdminClient } from "@/lib/supabase/admin";

export type OpsStatus = "ok" | "warn" | "fail" | "idle";

export interface OpsItem {
    key: string;
    label: string;
    group: "분석" | "Whole See (Mindle)" | "발송" | "코어";
    schedule: string;
    status: OpsStatus;
    last_success: string | null;
    detail: string;
    href?: string;
}

const hoursSince = (iso: string | null) => (iso ? (Date.now() - new Date(iso).getTime()) / 3600000 : Infinity);
const ago = (iso: string | null) => {
    if (!iso) return "기록 없음";
    const h = hoursSince(iso);
    return h < 1 ? "1시간 안" : h < 48 ? `${Math.floor(h)}시간 전` : `${Math.floor(h / 24)}일 전`;
};
/** 오류 문구를 원인 단위로 묶는다 (기사 제목은 떼고) */
function reasonOf(errors: string[]): string | null {
    if (!errors.length) return null;
    if (errors.some(e => /credit balance is too low/i.test(e))) return "Anthropic API 크레딧 부족";
    return errors[0].replace(/^.*?:\s*(?=\d{3}\s)/, "").slice(0, 120);
}

async function latest(table: string, col: string, filter?: (q: any) => any): Promise<string | null> { // eslint-disable-line @typescript-eslint/no-explicit-any
    let q = createAdminClient().from(table).select(col).not(col, "is", null).order(col, { ascending: false }).limit(1);
    if (filter) q = filter(q);
    const { data } = await q;
    return ((data?.[0] as unknown as Record<string, string> | undefined)?.[col]) ?? null;
}

async function count(table: string, filter: (q: any) => any): Promise<number> { // eslint-disable-line @typescript-eslint/no-explicit-any
    const { count: n } = await filter(createAdminClient().from(table).select("*", { count: "exact", head: true }));
    return n ?? 0;
}

export async function computeOpsHealth(): Promise<{ items: OpsItem[]; summary: Record<OpsStatus, number>; checked_at: string }> {
    const admin = createAdminClient();
    const since7d = new Date(Date.now() - 7 * 86400000).toISOString();

    const [ga4Sync, ga4Latest, collected, lastCard, lastRuns, lastBrief, gmailCrawl, issues, signups7d, joins7d, lastJoin, gmailAccounts] = await Promise.all([
        latest("analytics_snapshots", "synced_at"),
        latest("analytics_snapshots", "date"),
        latest("collected_data", "collected_at"),
        latest("mindle_trends", "created_at"),
        admin.from("agent_messages").select("created_at, payload").eq("payload->>type", "trend_crawl").order("created_at", { ascending: false }).limit(3),
        latest("agent_messages", "created_at", q => q.eq("message_type", "vrief").not("payload->briefing", "is", null)),
        latest("mindle_sources", "last_crawled_at", q => q.eq("source_type", "newsletter")),
        count("newsletter_issues", q => q),
        count("members", q => q.gte("created_at", since7d)),
        count("member_brand_joins", q => q.gte("joined_at", since7d)),
        latest("member_brand_joins", "joined_at"),
        admin.from("gmail_oauth_tokens").select("email, last_success_at, last_error, needs_reconnect").eq("is_active", true),
    ]);
    // Gmail: 수신 크론이 계정별 성공·실패를 남긴다 (app/api/cron/newsletter-crawl) — 끊김은 원인까지 표시
    const gmails = (gmailAccounts.data ?? []) as { email: string; last_success_at: string | null; last_error: string | null; needs_reconnect: boolean }[];
    const gmailLast = [gmailCrawl, ...gmails.map(g => g.last_success_at)].filter(Boolean).sort().pop() ?? null;
    const gmailBroken = gmails.filter(g => g.needs_reconnect || g.last_error);

    const runs = (lastRuns.data ?? []) as { created_at: string; payload: { crawl?: { errors?: string[] }; process?: { processed?: number; errors?: string[] } } }[];
    const procErrors = runs.flatMap(r => r.payload.process?.errors ?? []);
    const crawlErrors = runs[0]?.payload.crawl?.errors ?? [];
    const yesterday = new Date(Date.now() + 9 * 3600000 - 86400000).toISOString().slice(0, 10);

    const items: OpsItem[] = [
        {
            key: "ga4_sync", label: "GA4 동기화", group: "분석", schedule: "매일 03:00", last_success: ga4Sync, href: "/intra/analytics/sync",
            status: hoursSince(ga4Sync) > 30 ? "fail" : ga4Latest && ga4Latest < new Date(Date.now() + 9 * 3600000 - 2 * 86400000).toISOString().slice(0, 10) ? "warn" : "ok",
            detail: hoursSince(ga4Sync) > 30 ? "30시간 넘게 동기화 없음 — 수동 동기화로 오류 확인" : `최신 데이터 ${ga4Latest ?? "-"}${ga4Latest && ga4Latest < yesterday ? " (어제 데이터 대기)" : ""}`,
        },
        {
            key: "rss_collect", label: "기사 수집 (RSS)", group: "Whole See (Mindle)", schedule: "매시간", last_success: collected, href: "/intra/intel/wholesee/crawling",
            status: hoursSince(collected) > 3 ? "fail" : crawlErrors.length ? "warn" : "ok",
            detail: crawlErrors.length ? `수집 실패 소스 ${crawlErrors.length}개 — ${crawlErrors.map(e => e.split(":")[0]).slice(0, 4).join(" · ")}` : "정상",
        },
        {
            key: "ai_classify", label: "AI 분류 · 트렌드 카드", group: "Whole See (Mindle)", schedule: "매시간", last_success: lastCard, href: "/intra/intel/wholesee/crawling",
            status: hoursSince(lastCard) <= 48 ? "ok" : reasonOf(procErrors) ? "fail" : "warn",
            detail: hoursSince(lastCard) <= 48 ? "정상" : `${reasonOf(procErrors) ?? "카드 생성 없음"} — Mindle 재논의 때 재가동 여부 결정 (소비처 없으면 끄기)`,
        },
        {
            key: "daily_brief", label: "데일리 브리핑", group: "분석", schedule: "매일 10:01", last_success: lastBrief, href: "/intra/agent",
            status: hoursSince(lastBrief) <= 26 ? "ok" : "fail",
            detail: hoursSince(lastBrief) <= 26 ? "정상" : `마지막 ${ago(lastBrief)}${reasonOf(procErrors) ? ` — ${reasonOf(procErrors)} (같은 API 키)` : ""}`,
        },
        {
            key: "gmail_newsletter", label: "뉴스레터 수신 (Gmail)", group: "Whole See (Mindle)", schedule: "매일 05:00", last_success: gmailLast, href: "/intra/intel/wholesee/newsletter",
            status: gmails.length === 0 ? "idle" : gmailBroken.length ? "fail" : hoursSince(gmailLast) <= 48 ? "ok" : "fail",
            detail: gmails.length === 0 ? "연결된 Gmail 계정 없음 — 뉴스레터 화면에서 연결"
                : gmailBroken.length ? gmailBroken.map(g => `${g.email}: ${g.needs_reconnect ? "연결 끊김 — 다시 연결 필요" : g.last_error}`).join(" · ")
                : hoursSince(gmailLast) <= 48 ? "정상" : `마지막 수신 ${ago(gmailLast)} — 크론 실행 여부 확인`,
        },
        {
            key: "newsletter_dispatch", label: "뉴스레터 발송", group: "발송", schedule: "10분마다 예약 확인", last_success: null,
            status: "idle",
            detail: issues === 0 ? "발송 이력 0건 — 예약된 호가 없어 확인만 반복 중 (발송을 시작할 때까지 정상)" : `발행 호 ${issues}건`,
        },
        {
            key: "signup", label: "가입 흐름", group: "코어", schedule: "상시", last_success: lastJoin, href: "/intra/ums/members/list",
            status: "idle",
            detail: `최근 7일 계정 가입 ${signups7d} · 브랜드 가입 ${joins7d} — 오픈 후 방문은 있는데 0이면 가입 장애 의심 (Turnstile·Auth)`,
        },
    ];

    const summary = { ok: 0, warn: 0, fail: 0, idle: 0 } as Record<OpsStatus, number>;
    items.forEach(i => { summary[i.status]++; });
    return { items, summary, checked_at: new Date().toISOString() };
}
