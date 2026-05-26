// Mindle 트렌드 데이터 모듈
// - 신규: createAdminClient로 mindle_trends DB fetch (Phase 0)
// - 레거시 mock(featured/trends/categories)은 trends/[id] fallback용으로만 유지

import { createAdminClient } from "@/lib/supabase/admin";

/** mindle_trends 컬럼 SSOT */
export interface MindleTrend {
    id: string;
    title: string;
    summary: string;
    full_content: string | null;
    category: string;
    tags: string[];
    source_urls: string[];
    source_names: string[];
    relevance_score: number;
    agent_name: string;
    status: "draft" | "published" | "archived";
    is_featured: boolean;
    view_count: number;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    // Phase 1-B 약신호 코너용 (NULL 가능)
    signal_score: number | null;
    mention_growth_pct: number | null;
    percentile_rank: number | null;
}

/** UI 카테고리 SSOT — DB 카테고리(영문 snake_case) ↔ 화면 라벨 매핑 */
export const CATEGORY_LABEL: Record<string, string> = {
    tech: "테크",
    trend_market: "트렌드/시장",
    business_corporate: "비즈니스",
    marketing_branding: "마케팅",
    creator_trend: "크리에이터",
    talent_career: "커리어",
    industry_vertical: "산업",
    creative_reference: "크리에이티브",
    community_signal: "커뮤니티",
    empathy_emotion: "공감/감정",
    marketing: "마케팅",
    growth_network: "네트워크",
    general: "일반",
    ai: "AI",
    startup: "스타트업",
    ad: "광고",
    design: "디자인",
};

export function categoryLabel(key: string): string {
    return CATEGORY_LABEL[key] ?? key;
}

/** 메인 페이지·검색용 published 트렌드 fetch */
export async function fetchPublishedTrends(opts?: {
    category?: string;       // 단일 카테고리 필터 (영문 키)
    limit?: number;          // 기본 20
    offset?: number;
    featuredOnly?: boolean;
    query?: string;          // 제목·요약 ilike 검색
}): Promise<MindleTrend[]> {
    const admin = createAdminClient();
    let q = admin
        .from("mindle_trends")
        .select("id, title, summary, full_content, category, tags, source_urls, source_names, relevance_score, agent_name, status, is_featured, view_count, published_at, created_at, updated_at, signal_score, mention_growth_pct, percentile_rank")
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (opts?.category && opts.category !== "all") {
        q = q.eq("category", opts.category);
    }
    if (opts?.featuredOnly) {
        q = q.eq("is_featured", true);
    }
    if (opts?.query && opts.query.trim()) {
        const pattern = `%${opts.query.trim()}%`;
        q = q.or(`title.ilike.${pattern},summary.ilike.${pattern}`);
    }

    const limit = opts?.limit ?? 20;
    const offset = opts?.offset ?? 0;
    q = q.range(offset, offset + limit - 1);

    const { data, error } = await q;
    if (error) {
        console.error("[mindle] fetchPublishedTrends failed:", error.message);
        return [];
    }
    return (data ?? []) as MindleTrend[];
}

/** 총 published 카운트 (페이지네이션·통계용) */
export async function countPublishedTrends(opts?: {
    category?: string;
    query?: string;
}): Promise<number> {
    const admin = createAdminClient();
    let q = admin
        .from("mindle_trends")
        .select("id", { count: "exact", head: true })
        .eq("status", "published");

    if (opts?.category && opts.category !== "all") {
        q = q.eq("category", opts.category);
    }
    if (opts?.query && opts.query.trim()) {
        const pattern = `%${opts.query.trim()}%`;
        q = q.or(`title.ilike.${pattern},summary.ilike.${pattern}`);
    }

    const { count, error } = await q;
    if (error) {
        console.error("[mindle] countPublishedTrends failed:", error.message);
        return 0;
    }
    return count ?? 0;
}

/** 카테고리별 published 카운트 (피드 카테고리 칩 렌더용) */
export async function getCategoryCounts(): Promise<Array<{ category: string; count: number }>> {
    const admin = createAdminClient();
    // Postgres group-by 직접 못 쓰므로 RPC 없이 전 카드 가져와 클라이언트 집계.
    // 532건 정도면 단일 fetch 무리 없음.
    const { data, error } = await admin
        .from("mindle_trends")
        .select("category")
        .eq("status", "published");
    if (error || !data) return [];
    const counts: Record<string, number> = {};
    for (const row of data as Array<{ category: string }>) {
        counts[row.category] = (counts[row.category] ?? 0) + 1;
    }
    return Object.entries(counts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
}

/** 단건 fetch + view_count atomic 증가 */
export async function fetchTrendById(id: string): Promise<MindleTrend | null> {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("mindle_trends")
        .select("id, title, summary, full_content, category, tags, source_urls, source_names, relevance_score, agent_name, status, is_featured, view_count, published_at, created_at, updated_at, signal_score, mention_growth_pct, percentile_rank")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();
    if (error || !data) {
        if (error) console.error("[mindle] fetchTrendById failed:", error.message);
        return null;
    }
    // view_count는 fire-and-forget UPDATE — 실패해도 본 fetch 영향 없음.
    // race condition은 무시 (read-heavy 워크로드).
    admin
        .from("mindle_trends")
        .update({ view_count: (data.view_count ?? 0) + 1 })
        .eq("id", id)
        .then(() => {}, () => {});
    return data as MindleTrend;
}

/** 트렌드 카드 상태 뱃지 — relevance_score 기반 */
export function getTrendStatus(score: number): "trending" | "rising" | "signal" {
    if (score >= 0.85) return "trending";
    if (score >= 0.7) return "rising";
    return "signal";
}

/** 약신호 코너 fetch — signal_score 상위 N건 */
export async function fetchWeakSignals(opts?: { limit?: number; minScore?: number }): Promise<MindleTrend[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("mindle_trends")
        .select("id, title, summary, full_content, category, tags, source_urls, source_names, relevance_score, agent_name, status, is_featured, view_count, published_at, created_at, updated_at, signal_score, mention_growth_pct, percentile_rank")
        .eq("status", "published")
        .gte("signal_score", opts?.minScore ?? 0.85)
        .order("signal_score", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(opts?.limit ?? 6);
    if (error) {
        console.error("[mindle] fetchWeakSignals failed:", error.message);
        return [];
    }
    return (data ?? []) as MindleTrend[];
}

// ─── 레거시 mock (trends/[id] fallback·작업 중 안전망) ─────────────────────
// Phase 1 완료 시 삭제 예정. 현재는 fetchTrendById가 null일 때 fallback 가능.

export interface TrendArticle {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    status: 'trending' | 'rising' | 'signal' | 'fading';
    date: string;
    readTime: string;
    views: number;
    author?: string;
    content?: string;
}

export const statusBadge: Record<string, { label: string; color: string }> = {
    trending: { label: "급상승", color: "bg-[#F5C518] text-black" },
    rising: { label: "상승중", color: "bg-orange-500/20 text-orange-400" },
    signal: { label: "시그널", color: "bg-blue-500/20 text-blue-400" },
    fading: { label: "소강", color: "bg-neutral-700 text-neutral-400" },
};

export const categories = ["전체", "AI / 테크", "마케팅", "소비자", "비즈니스", "콘텐츠", "라이프스타일"];
