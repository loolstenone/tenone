// SmarComm Insights SSOT — V2.0 § 3-B Smart-Data Hub
//
// 시계열 진단 데이터에서 인사이트 산출.
// 4지표 추이·카테고리별 노출 변화·5 플랫폼 비교·경쟁사 갭(Phase 5).

import type { BrandJourney } from './brand-journey';

export interface ScanTimePoint {
    short_id: string;
    created_at: string;
    smarcomm_index: number;
    findability_score: number;
    trust_score: number;
    citability_score: number;
    grade: string;
    // breakdown JSONB에서 brandJourney 추출
    brand_journey: BrandJourney | null;
}

export interface AxisTimeSeries {
    label: string;
    icon: string;
    points: Array<{ at: string; value: number }>;
    current: number;
    delta: number;       // 직전 대비
    deltaPct: number;    // % 변화
}

export interface InsightsSummary {
    /** 진단 N회 */
    scanCount: number;
    /** 최근/가장 오래된 진단 시각 */
    firstAt: string | null;
    lastAt: string | null;
    /** Index·4축 시계열 */
    indexSeries: AxisTimeSeries;
    findabilitySeries: AxisTimeSeries;
    trustSeries: AxisTimeSeries;
    citabilitySeries: AxisTimeSeries;
    /** AI Brand Journey 4 지표 시계열 (probe 데이터 있는 진단만) */
    awarenessSeries: AxisTimeSeries | null;
    depthSeries: AxisTimeSeries | null;
    journeyTrustSeries: AxisTimeSeries | null;
    sentimentSeries: AxisTimeSeries | null;
    /** 인사이트 텍스트 (자동 생성) */
    insights: string[];
}

function buildSeries(points: Array<{ at: string; value: number }>, label: string, icon: string): AxisTimeSeries {
    if (points.length === 0) {
        return { label, icon, points: [], current: 0, delta: 0, deltaPct: 0 };
    }
    const current = points[points.length - 1].value;
    const prev = points.length >= 2 ? points[points.length - 2].value : current;
    const delta = current - prev;
    const deltaPct = prev > 0 ? Math.round((delta / prev) * 100) : 0;
    return { label, icon, points, current, delta, deltaPct };
}

export function computeInsights(scans: ScanTimePoint[]): InsightsSummary {
    const sorted = [...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const n = sorted.length;

    const indexSeries = buildSeries(
        sorted.map(s => ({ at: s.created_at, value: s.smarcomm_index })),
        'SmarComm Index', '⭐'
    );
    const findabilitySeries = buildSeries(
        sorted.map(s => ({ at: s.created_at, value: s.findability_score })),
        'Findability', '🔍'
    );
    const trustSeries = buildSeries(
        sorted.map(s => ({ at: s.created_at, value: s.trust_score })),
        'Trust', '⭐'
    );
    const citabilitySeries = buildSeries(
        sorted.map(s => ({ at: s.created_at, value: s.citability_score })),
        'Citability', '🤖'
    );

    // AI Brand Journey 4지표 시계열 — brandJourney 있는 진단만
    const journeys = sorted.filter(s => s.brand_journey).map(s => ({ at: s.created_at, j: s.brand_journey! }));
    const awarenessSeries = journeys.length > 0 ? buildSeries(
        journeys.map(({ at, j }) => ({ at, value: j.axes.find(x => x.axis === 'awareness')?.asIs ?? 0 })),
        '인지 (Awareness)', '👁️'
    ) : null;
    const depthSeries = journeys.length > 0 ? buildSeries(
        journeys.map(({ at, j }) => ({ at, value: j.axes.find(x => x.axis === 'depth')?.asIs ?? 0 })),
        '이해 (Depth)', '🎯'
    ) : null;
    const journeyTrustSeries = journeys.length > 0 ? buildSeries(
        journeys.map(({ at, j }) => ({ at, value: j.axes.find(x => x.axis === 'trust')?.asIs ?? 0 })),
        '추천 (Trust)', '⭐'
    ) : null;
    const sentimentSeries = journeys.length > 0 ? buildSeries(
        journeys.map(({ at, j }) => ({ at, value: j.axes.find(x => x.axis === 'sentiment')?.asIs ?? 0 })),
        '평판 (Sentiment)', '💬'
    ) : null;

    // 자동 인사이트 텍스트
    const insights: string[] = [];
    if (n >= 2) {
        if (indexSeries.delta > 0) insights.push(`📈 SmarComm Index가 ${indexSeries.delta}점 상승했습니다 (${indexSeries.deltaPct >= 0 ? '+' : ''}${indexSeries.deltaPct}%).`);
        else if (indexSeries.delta < 0) insights.push(`📉 SmarComm Index가 ${Math.abs(indexSeries.delta)}점 하락했습니다 (${indexSeries.deltaPct}%). 원인 분석 필요.`);
        else insights.push(`➡️ SmarComm Index 변동 없음. 최근 ${n}회 진단 평균 ${Math.round((indexSeries.points.reduce((s, p) => s + p.value, 0)) / n)}점.`);

        const axes = [findabilitySeries, trustSeries, citabilitySeries];
        const biggest = axes.reduce((m, a) => Math.abs(a.delta) > Math.abs(m.delta) ? a : m);
        if (biggest.delta !== 0) {
            insights.push(`${biggest.delta > 0 ? '🚀' : '⚠'} ${biggest.label} 변화가 가장 큼: ${biggest.delta > 0 ? '+' : ''}${biggest.delta}점`);
        }
    } else if (n === 1) {
        insights.push(`첫 진단 결과만 있습니다. 트렌드 분석을 위해 정기 재진단이 필요합니다.`);
    } else {
        insights.push(`이 도메인에 대한 진단 이력이 없습니다.`);
    }
    if (citabilitySeries.current >= 70) {
        insights.push(`🎯 Citability ${citabilitySeries.current}점 — AI 검색 가시성 양호. 자산화로 영속화 권장.`);
    } else if (citabilitySeries.current < 40 && n > 0) {
        insights.push(`🤖 Citability ${citabilitySeries.current}점 — AI 추천에서 거의 보이지 않음. AIRM·자산화 우선.`);
    }

    return {
        scanCount: n,
        firstAt: n > 0 ? sorted[0].created_at : null,
        lastAt: n > 0 ? sorted[n - 1].created_at : null,
        indexSeries,
        findabilitySeries,
        trustSeries,
        citabilitySeries,
        awarenessSeries,
        depthSeries,
        journeyTrustSeries,
        sentimentSeries,
        insights,
    };
}

// ── AI Tracker — 두 진단 간 답변 변화 산출 ──
export interface AnswerSnapshot {
    platform: string;
    category: string;
    query: string;
    mentioned: boolean;
    position: number | null;
    accuracy: string;
    sentiment?: string | null;
    response_excerpt: string;
    measured_at: string;
}

export interface AnswerDiff {
    platform: string;
    query: string;
    before: AnswerSnapshot | null;
    after: AnswerSnapshot;
    diff_type: 'improved' | 'degraded' | 'unchanged' | 'sentiment_flip' | 'fact_corrected' | 'fact_introduced' | 'new_appearance' | 'disappeared';
    summary: string;
}

const SENTIMENT_RANK: Record<string, number> = { positive: 2, neutral: 1, negative: 0 };
const ACCURACY_RANK: Record<string, number> = { exact: 3, partial: 2, wrong: 0, absent: 1 };

export function diffAnswers(before: AnswerSnapshot[], after: AnswerSnapshot[]): AnswerDiff[] {
    const diffs: AnswerDiff[] = [];
    // 키: platform + query
    const key = (a: AnswerSnapshot) => `${a.platform}|${a.query}`;
    const beforeMap = new Map(before.map(a => [key(a), a]));

    for (const aft of after) {
        const k = key(aft);
        const bef = beforeMap.get(k) ?? null;
        if (!bef) {
            diffs.push({
                platform: aft.platform, query: aft.query,
                before: null, after: aft,
                diff_type: aft.mentioned ? 'new_appearance' : 'unchanged',
                summary: aft.mentioned ? '새 진단에서 처음 언급됨' : '여전히 미언급',
            });
            continue;
        }

        // 미언급 → 언급
        if (!bef.mentioned && aft.mentioned) {
            diffs.push({ platform: aft.platform, query: aft.query, before: bef, after: aft, diff_type: 'new_appearance', summary: '미언급 → 언급으로 전환' });
            continue;
        }
        // 언급 → 미언급
        if (bef.mentioned && !aft.mentioned) {
            diffs.push({ platform: aft.platform, query: aft.query, before: bef, after: aft, diff_type: 'disappeared', summary: '언급 → 미언급으로 사라짐' });
            continue;
        }
        // 둘 다 언급된 경우
        if (bef.mentioned && aft.mentioned) {
            // Sentiment flip
            const sb = bef.sentiment ?? 'neutral';
            const sa = aft.sentiment ?? 'neutral';
            if (SENTIMENT_RANK[sb] !== SENTIMENT_RANK[sa]) {
                const flip = SENTIMENT_RANK[sa] > SENTIMENT_RANK[sb];
                diffs.push({
                    platform: aft.platform, query: aft.query, before: bef, after: aft,
                    diff_type: 'sentiment_flip',
                    summary: `Sentiment ${sb} → ${sa} (${flip ? '개선' : '악화'})`,
                });
                continue;
            }
            // Accuracy 변화
            const ab = ACCURACY_RANK[bef.accuracy] ?? 1;
            const aa = ACCURACY_RANK[aft.accuracy] ?? 1;
            if (aa > ab) {
                diffs.push({ platform: aft.platform, query: aft.query, before: bef, after: aft, diff_type: 'fact_corrected', summary: `정확도 ${bef.accuracy} → ${aft.accuracy} (개선)` });
            } else if (aa < ab) {
                diffs.push({ platform: aft.platform, query: aft.query, before: bef, after: aft, diff_type: 'fact_introduced', summary: `정확도 ${bef.accuracy} → ${aft.accuracy} (악화)` });
            } else if ((bef.position ?? 99) !== (aft.position ?? 99)) {
                const better = (aft.position ?? 99) < (bef.position ?? 99);
                diffs.push({
                    platform: aft.platform, query: aft.query, before: bef, after: aft,
                    diff_type: better ? 'improved' : 'degraded',
                    summary: `순위 ${bef.position ?? '-'} → ${aft.position ?? '-'}`,
                });
            }
        }
    }

    return diffs;
}
