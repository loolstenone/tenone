/**
 * Data Pipeline Health API
 * GET /api/intra/pipeline-health
 *
 * 유니버스 전체 데이터 파이프라인의 유입 상태를 일괄 집계:
 *   - 각 테이블의 total·최근(24h/7d)·last_activity
 *   - staleness (최근 활동 없음 N시간/일) 판정
 *
 * Registry: PIPELINE_REGISTRY (이 파일 내) — 새 파이프라인 추가 시 entry 한 줄.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function adminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
}

export interface PipelineEntry {
    key: string;
    label: string;
    category: "intake" | "analysis" | "activity" | "revenue" | "cs";
    table: string;
    time_column: string;           // last_crawled_at, created_at, collected_at, etc
    expected_interval_hours: number;  // 예상 주기 — 이 시간 지나도 활동 없으면 stale
    critical?: boolean;
    filter?: { col: string; val: string };
}

export const PIPELINE_REGISTRY: PipelineEntry[] = [
    // Intake (수집)
    { key: "rss_crawl",         label: "RSS 크롤",          category: "intake",  table: "mindle_sources", time_column: "last_crawled_at", expected_interval_hours: 26, filter: { col: "source_type", val: "rss" } },
    { key: "web_crawl",         label: "웹 크롤",           category: "intake",  table: "mindle_sources", time_column: "last_crawled_at", expected_interval_hours: 26, filter: { col: "source_type", val: "web" } },
    { key: "newsletter_intake", label: "뉴스레터 수집",     category: "intake",  table: "mindle_sources", time_column: "last_crawled_at", expected_interval_hours: 48, filter: { col: "source_type", val: "newsletter" } },
    { key: "collected_data",    label: "수집 데이터 저장",  category: "intake",  table: "collected_data", time_column: "collected_at",   expected_interval_hours: 48, critical: true },
    { key: "opportunity_crawl", label: "수주 기회 크롤",    category: "intake",  table: "wio_opportunities", time_column: "created_at", expected_interval_hours: 48, critical: true },

    // Analysis (분석)
    { key: "mindle_trends",     label: "트렌드 카드 생성",  category: "analysis", table: "mindle_trends",    time_column: "created_at",    expected_interval_hours: 48, critical: true },
    { key: "analytics_sync",    label: "GA4 Analytics",    category: "analysis", table: "analytics_snapshots", time_column: "synced_at", expected_interval_hours: 30 },

    // Activity (활동)
    { key: "agent_messages",    label: "에이전트 메시지",   category: "activity", table: "agent_messages",   time_column: "created_at",    expected_interval_hours: 24 },
    { key: "member_signup",     label: "회원 가입",         category: "activity", table: "members",          time_column: "created_at",    expected_interval_hours: 168 /* 7일 */ },

    // Revenue
    { key: "revenue",           label: "매출 기록",          category: "revenue",  table: "revenue",          time_column: "recorded_at",   expected_interval_hours: 720 /* 30일 */ },
    { key: "wio_subscriptions", label: "WIO 구독",           category: "revenue",  table: "wio_subscriptions", time_column: "started_at",   expected_interval_hours: 720, filter: { col: "status", val: "active" } },

    // CS
    { key: "contact_submissions", label: "문의 접수",       category: "cs",       table: "contact_submissions", time_column: "created_at", expected_interval_hours: 720 },
    { key: "jakka_qna",           label: "Jakka 작품 Q&A",  category: "cs",       table: "jakka_product_qna",   time_column: "created_at", expected_interval_hours: 720 },
    { key: "badak_feedback",      label: "Badak 피드백",    category: "cs",       table: "badak_feedbacks",     time_column: "created_at", expected_interval_hours: 720 },
];

export async function GET() {
    // 환경변수 체크
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({
            error: "env missing",
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        }, { status: 503 });
    }
    const sb = adminClient();
    const now = Date.now();

    const results = await Promise.all(PIPELINE_REGISTRY.map(async (p) => {
        try {
            // total count
            let countQ = sb.from(p.table).select("*", { count: "exact", head: true });
            if (p.filter) countQ = countQ.eq(p.filter.col, p.filter.val);
            const { count: total } = await countQ;

            // last activity — dynamic column select via *
            let lastQ = sb.from(p.table).select("*").order(p.time_column, { ascending: false, nullsFirst: false }).limit(1);
            if (p.filter) lastQ = lastQ.eq(p.filter.col, p.filter.val);
            const { data: lastRow, error: lastErr } = await lastQ;
            if (lastErr) throw new Error(`${p.table}.${p.time_column}: ${lastErr.message}`);
            const lastRaw = (lastRow?.[0] as Record<string, unknown> | undefined)?.[p.time_column] as string | undefined;
            const lastActivity = lastRaw ? new Date(lastRaw).toISOString() : null;

            // recent counts
            const since24h = new Date(now - 24 * 3600 * 1000).toISOString();
            const since7d = new Date(now - 7 * 24 * 3600 * 1000).toISOString();

            let q24 = sb.from(p.table).select("*", { count: "exact", head: true }).gte(p.time_column, since24h);
            if (p.filter) q24 = q24.eq(p.filter.col, p.filter.val);
            const { count: last24h } = await q24;

            let q7 = sb.from(p.table).select("*", { count: "exact", head: true }).gte(p.time_column, since7d);
            if (p.filter) q7 = q7.eq(p.filter.col, p.filter.val);
            const { count: last7d } = await q7;

            // staleness
            const ageHours = lastActivity ? (now - new Date(lastActivity).getTime()) / 3600_000 : Infinity;
            const isStale = ageHours > p.expected_interval_hours;
            const status: "healthy" | "stale" | "empty" = !lastActivity ? "empty" : isStale ? "stale" : "healthy";

            return {
                ...p,
                total: total ?? 0,
                last24h: last24h ?? 0,
                last7d: last7d ?? 0,
                last_activity: lastActivity,
                age_hours: ageHours === Infinity ? null : Math.round(ageHours * 10) / 10,
                status,
            };
        } catch (e) {
            return { ...p, total: 0, last24h: 0, last7d: 0, last_activity: null, age_hours: null, status: "error" as const, error: e instanceof Error ? e.message : String(e) };
        }
    }));

    const summary = {
        total: results.length,
        healthy: results.filter(r => r.status === "healthy").length,
        stale: results.filter(r => r.status === "stale").length,
        empty: results.filter(r => r.status === "empty").length,
        error: results.filter(r => r.status === "error").length,
        critical_issues: results.filter(r => r.critical && r.status !== "healthy").length,
    };

    return NextResponse.json({ summary, pipelines: results, checked_at: new Date().toISOString() });
}
