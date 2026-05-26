// Mindle 5대 분석 모듈 SSOT — Phase 1-D
//
// 정직성 원칙: 실측 데이터 없으면 컴포넌트가 "🚧 Phase 2 도입 예정" 라벨 표시.
// 임의 mock 차트 그리지 않는다.

import { createAdminClient } from "@/lib/supabase/admin";

export type MetricType =
    | "mention_trend"
    | "related_keywords"
    | "sentiment"
    | "comparison"
    | "community";

export const METRIC_TYPES: MetricType[] = [
    "mention_trend",
    "related_keywords",
    "sentiment",
    "comparison",
    "community",
];

export const METRIC_LABEL: Record<MetricType, string> = {
    mention_trend: "언급량 추이",
    related_keywords: "연관어",
    sentiment: "감성",
    comparison: "비교 분석",
    community: "커뮤니티 반응",
};

// 각 메트릭 payload 스키마 (저장 측 SSOT)

export interface MentionTrendPayload {
    points: Array<{ date: string; count: number }>;
    window: "7d" | "30d" | "90d";
    total: number;
}

export interface RelatedKeywordsPayload {
    keywords: Array<{ word: string; weight: number; sentiment?: "pos" | "neg" | "neu" }>;
}

export interface SentimentPayload {
    positive: number;   // 0~1
    neutral: number;
    negative: number;
    sample_size: number;
}

export interface ComparisonPayload {
    items: Array<{ label: string; values: Array<{ date: string; count: number }> }>;
}

export interface CommunityPayload {
    snippets: Array<{
        platform: string;        // "Twitter" | "Reddit" | "Naver Cafe" 등
        text: string;
        url?: string;
        engagement?: number;
    }>;
}

export interface TrendMetric {
    id: string;
    trend_id: string;
    metric_type: MetricType;
    payload: MentionTrendPayload | RelatedKeywordsPayload | SentimentPayload | ComparisonPayload | CommunityPayload;
    computed_at: string;
    source: string;
    confidence: number | null;
}

/** 단일 trend의 모든 metric fetch (한 번에) */
export async function fetchTrendMetrics(trendId: string): Promise<Partial<Record<MetricType, TrendMetric>>> {
    const admin = createAdminClient();
    const { data, error } = await admin
        .from("mindle_trend_metrics")
        .select("id, trend_id, metric_type, payload, computed_at, source, confidence")
        .eq("trend_id", trendId);
    if (error) {
        console.error("[mindle/metrics] fetchTrendMetrics failed:", error.message);
        return {};
    }
    const map: Partial<Record<MetricType, TrendMetric>> = {};
    for (const m of (data ?? []) as TrendMetric[]) {
        map[m.metric_type] = m;
    }
    return map;
}
