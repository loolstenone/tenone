// Mindle AI Agent — Phase 2 골격
//
// 역할: 운영자 시간을 0에 수렴시키는 자율 메트릭 생성기
//
// 정직성 원칙:
//   - 외부 데이터(소셜·커뮤니티 크롤) 없으면 'comparison'·'community'는 null 반환
//     → UI가 "🚧 Phase 2 데이터 소스 도입 예정" 라벨 자동 노출
//   - sentiment·related_keywords는 LLM이 trend full_content 기반 추출
//     (자체 사실에서 직접 — 외부 소셜 데이터 없이도 신뢰도 보존)
//   - mention_trend는 같은 카테고리의 시계열 분포로 추정 (Whole See published_at 기반)
//
// 호출처: supabase/functions/mindle-metrics-compute Edge Function (시간당 cron)

import type {
    MentionTrendPayload,
    RelatedKeywordsPayload,
    SentimentPayload,
    ComparisonPayload,
    CommunityPayload,
    MetricType,
} from "@/lib/mindle/metrics";

export interface TrendInput {
    id: string;
    title: string;
    summary: string;
    full_content: string | null;
    category: string;
    tags: string[];
    published_at: string | null;
}

export interface MetricResult<T = unknown> {
    metric_type: MetricType;
    payload: T;
    source: string;             // 'llm:claude-haiku' | 'sql:category-timeseries' | 'manual' | null
    confidence: number | null;  // 0~100
}

// ─── 1. mention_trend — 같은 카테고리 카드 시계열 분포 ────────────
// 외부 소셜 데이터 없이도 정직하게 산출 가능 (출처: mindle_trends published_at)
export interface CategorySeriesInput {
    trendId: string;
    category: string;
    series: Array<{ date: string; count: number }>; // 같은 카테고리 일별 카드 수
}

export function computeMentionTrend(input: CategorySeriesInput): MetricResult<MentionTrendPayload> {
    const total = input.series.reduce((acc, p) => acc + p.count, 0);
    return {
        metric_type: "mention_trend",
        payload: {
            points: input.series,
            window: input.series.length >= 30 ? "30d" : input.series.length >= 14 ? "30d" : "7d",
            total,
        },
        source: "sql:category-timeseries",
        confidence: 70, // 카테고리 시계열은 직접 측정 — 단, 개별 카드의 "주제" 시계열은 아님
    };
}

// ─── 2. related_keywords — LLM 추출 (title + summary + full_content) ────────
export async function computeRelatedKeywords(
    trend: TrendInput,
    anthropic: { messages: { create: (args: unknown) => Promise<{ content: Array<{ type: string; text?: string }> }> } }
): Promise<MetricResult<RelatedKeywordsPayload> | null> {
    if (!trend.full_content && !trend.summary) return null;

    const prompt = `다음 트렌드 카드에서 핵심 연관어 8~15개를 추출하세요.
제목: ${trend.title}
요약: ${trend.summary}
본문: ${(trend.full_content ?? "").slice(0, 1500)}

각 연관어에 가중치(1~10)와 감성(pos/neu/neg) 부여. JSON만 응답:
{"keywords":[{"word":"...","weight":1~10,"sentiment":"pos|neu|neg"}, ...]}`;

    try {
        const res = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 600,
            messages: [{ role: "user", content: prompt }],
        });
        const text = res.content[0]?.type === "text" ? res.content[0].text ?? "" : "";
        const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned) as RelatedKeywordsPayload;
        if (!parsed.keywords || parsed.keywords.length === 0) return null;
        return {
            metric_type: "related_keywords",
            payload: parsed,
            source: "llm:claude-haiku",
            confidence: 75,
        };
    } catch {
        return null;
    }
}

// ─── 3. sentiment — LLM 분류 (긍/중립/부정 비율) ────────────────
export async function computeSentiment(
    trend: TrendInput,
    anthropic: { messages: { create: (args: unknown) => Promise<{ content: Array<{ type: string; text?: string }> }> } }
): Promise<MetricResult<SentimentPayload> | null> {
    if (!trend.full_content) return null;

    const prompt = `다음 트렌드 카드 본문을 문장 단위로 분해해 긍정/중립/부정 비율을 추정하세요.
본문: ${trend.full_content.slice(0, 2000)}

JSON만 응답:
{"positive":0~1,"neutral":0~1,"negative":0~1,"sample_size":본문 문장 수}`;

    try {
        const res = await anthropic.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 200,
            messages: [{ role: "user", content: prompt }],
        });
        const text = res.content[0]?.type === "text" ? res.content[0].text ?? "" : "";
        const parsed = JSON.parse(text.replace(/```json\n?|```\n?/g, "").trim()) as SentimentPayload;
        const sum = parsed.positive + parsed.neutral + parsed.negative;
        if (sum < 0.5) return null; // LLM 응답 이상
        return {
            metric_type: "sentiment",
            payload: parsed,
            source: "llm:claude-haiku",
            confidence: 60, // 자체 본문 기반 — 외부 사용자 의견 아니라 신뢰도 보수적
        };
    } catch {
        return null;
    }
}

// ─── 4. comparison — 외부 데이터 필요 (Phase 2 보류) ────────────
export function computeComparison(): MetricResult<ComparisonPayload> | null {
    // 키워드 2~3개 시계열 비교는 외부 검색량 데이터(Naver DataLab·Google Trends 등) 필요.
    // 자체 데이터로 만들면 정직성 위반 → null 반환 → UI가 "Phase 2 데이터 소스 도입 예정"
    return null;
}

// ─── 5. community — 외부 소셜 크롤 필요 (Phase 2 보류) ────────────
export function computeCommunity(): MetricResult<CommunityPayload> | null {
    // 커뮤니티 반응은 Twitter/Reddit/네이버 카페 크롤 필요.
    // 자체 데이터로 만들면 정직성 위반 → null 반환
    return null;
}

/** 5종 메트릭 일괄 계산 — Phase 2 가능한 것만 (related_keywords·sentiment·mention_trend) */
export async function computeAllMetrics(
    trend: TrendInput,
    seriesInput: CategorySeriesInput | null,
    anthropic: Parameters<typeof computeSentiment>[1]
): Promise<MetricResult[]> {
    const results: MetricResult[] = [];

    if (seriesInput) results.push(computeMentionTrend(seriesInput));

    const kw = await computeRelatedKeywords(trend, anthropic);
    if (kw) results.push(kw);

    const sent = await computeSentiment(trend, anthropic);
    if (sent) results.push(sent);

    // comparison · community는 외부 데이터 부재로 보류 (정직성)

    return results;
}
