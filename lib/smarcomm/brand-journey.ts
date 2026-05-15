// AI Brand Journey — V2.0 § 3-A SSOT-6
//
// 4지표 (인지·이해·추천·평판) + 6 측정 차원 산출 SSOT.
// 입력: AIProbeReport (5 AI 플랫폼 실측)
// 출력: BrandJourney — As-Is 점수 + To-Be 목표 + 6 차원 detail + 권장 액션 매핑

import type { AIProbeReport, ProbeAnswer } from './ai-probes/types';

// ── 4 지표 정의 ──
export type JourneyAxis = 'awareness' | 'depth' | 'trust' | 'sentiment';

export interface AxisScore {
    axis: JourneyAxis;
    label: string;          // 한글 라벨
    icon: string;
    asIs: number;           // 0~100
    toBe: number;           // 0~100 (기본 목표값)
    rawValue: string;       // "5/100회" 등 사람이 읽기 좋은 형식
    targetValue: string;    // "30/100회"
    actionHint: string;     // 권장 액션 (§ 3-C/§ 3-D 참조)
    recommendedModule: 'airm' | 'assets' | 'creative' | 'strategy';
}

// ── 6 측정 차원 정의 ──
export type DimensionKey =
    | 'entity_presence'
    | 'attribute_association'
    | 'knowledge_recency'
    | 'recommendation_ranking'
    | 'reasoning'
    | 'comparative_analysis';

export interface DimensionDetail {
    key: DimensionKey;
    label: string;
    score: number | null;   // 0~100 or null(N/A)
    summary: string;        // 한 줄 요약
    samples?: string[];     // 실측 단편 (UI 노출용)
    isNA?: boolean;
    naReason?: string;
}

export interface BrandJourney {
    /** As-Is/To-Be 4 지표 */
    axes: AxisScore[];
    /** 6 측정 차원 detail */
    dimensions: DimensionDetail[];
    /** 종합 점수 (4 지표 평균 — 마케터 뷰 단일 숫자) */
    overallScore: number;
    /** 측정 신뢰도 — 활성 플랫폼 수 / 5 */
    confidence: number;
    /** LLM 분류 적용된 응답 수 — § 1.10 정직 원칙. analyzedByLlm < mentioned 면 sentiment·reasoning·attributes 결과 신뢰도 부족 */
    analyzedByLlm: number;
    /** sentiment·reasoning·attributes 측정에 사용된 분류기 출처 */
    sentimentSource: 'llm' | 'na';
}

// ── 목표값 SSOT (CLAUDE.md § 3-A SSOT-6) — V2.1 § 1.10 정직 ──
// **기본값** (defaults) — SmarComm 자체 SSOT 결정. 절대 진리 아님.
// 출처: 마케팅 컨설팅 업계 통상 벤치마크 + 본 시스템 권장 수준.
// Phase 5에서 `smarcomm_industry_benchmarks` 업종 평균 + 70%ile 기준 동적 산출 예정.
// 사용자 커스터마이즈는 Phase 5 워크스페이스 설정에서 가능 예정.
const TARGET_AWARENESS = 30;     // 100질문 중 30회 언급 — 업종 상위 30% 수준 (기본값)
const TARGET_DEPTH = 90;         // 핵심 사실 일치율 90% — Schema 완비 + 권위 매체 정착 수준 (기본값)
const TARGET_TRUST = 70;         // TOP 3 진입 평균 — 1위=100·2위=80·3위=60 (기본값)
const TARGET_SENTIMENT = 85;     // 긍정 답변 85% — 권위 매체 학습 시 도달 (기본값)
const TARGETS_SOURCE = 'SmarComm 자체 SSOT 기본값 · Phase 5 업종 백분위 동적 산출 예정';

// ── position을 0~100 점수로 변환 ──
function positionToScore(position: number | null): number {
    if (position === null) return 0;
    if (position === 1) return 100;
    if (position === 2) return 80;
    if (position === 3) return 60;
    if (position === 4) return 40;
    if (position === 5) return 20;
    return 10; // 6+
}

// ── 5점 sentiment 가중 ──
function sentimentToScore(s: 'positive' | 'neutral' | 'negative' | undefined): number {
    if (s === 'positive') return 100;
    if (s === 'neutral') return 50;
    if (s === 'negative') return 0;
    return 50; // 측정 안 됨 = 중립 가정
}

// ── factComparison 정확도 가중 평균 ──
function factAccuracyScore(a: ProbeAnswer): number {
    const matches = a.detection.factComparison;
    if (!matches || matches.length === 0) {
        // accuracy verdict로 fallback
        const v = a.detection.accuracy;
        if (v === 'exact') return 100;
        if (v === 'partial') return 50;
        if (v === 'wrong') return 0;
        return 0;
    }
    let sum = 0;
    for (const m of matches) {
        if (m.match === 'exact') sum += 100;
        else if (m.match === 'partial') sum += 50;
        else if (m.match === 'wrong') sum += 0;
        else if (m.match === 'missing') sum += 25;
    }
    return Math.round(sum / matches.length);
}

// ── 메인 계산 ──
export function computeBrandJourney(report: AIProbeReport): BrandJourney {
    const activePlatforms = Object.values(report.platforms).filter(p => !p.skipped);
    const allAnswers: ProbeAnswer[] = activePlatforms.flatMap(p => p.answers);
    const mentionedAnswers = allAnswers.filter(a => a.detection.mentioned);
    const totalQ = allAnswers.length;
    const mentionedQ = mentionedAnswers.length;

    // ── 1. 인지 (Awareness) — 100질문 중 N회 언급 ──
    const awarenessAsIs = totalQ > 0 ? Math.round((mentionedQ / totalQ) * 100) : 0;
    const awarenessRaw = totalQ > 0 ? `${mentionedQ}/${totalQ}회` : '측정 불가';

    // ── 2. 이해 (Depth) — 사실 일치율 ──
    const depthAsIs = mentionedAnswers.length > 0
        ? Math.round(mentionedAnswers.reduce((s, a) => s + factAccuracyScore(a), 0) / mentionedAnswers.length)
        : 0;

    // ── 3. 추천 (Trust) — 평균 position 점수 ──
    const trustAsIs = mentionedAnswers.length > 0
        ? Math.round(mentionedAnswers.reduce((s, a) => s + positionToScore(a.detection.position), 0) / mentionedAnswers.length)
        : 0;
    const top3Count = mentionedAnswers.filter(a => a.detection.position !== null && a.detection.position <= 3 && a.detection.position >= 1).length;
    const trustRaw = mentionedQ > 0 ? `TOP 3 진입 ${top3Count}/${mentionedQ}회` : '미언급';

    // ── 4. 평판 (Sentiment) — LLM 실측만 산입 (§ 1.10 정직 원칙) ──
    const llmAnalyzed = mentionedAnswers.filter(a => a.detection.analysisSource === 'llm');
    const sentimentAsIs = llmAnalyzed.length > 0
        ? Math.round(llmAnalyzed.reduce((s, a) => s + sentimentToScore(a.detection.sentiment), 0) / llmAnalyzed.length)
        : 0;
    const positiveCount = llmAnalyzed.filter(a => a.detection.sentiment === 'positive').length;
    const sentimentRaw = llmAnalyzed.length > 0
        ? `긍정 ${positiveCount}/${llmAnalyzed.length}회 (${Math.round((positiveCount / llmAnalyzed.length) * 100)}%) — LLM 실측`
        : mentionedQ > 0
            ? '측정 불가 (API 키 필요)'
            : '미언급';

    const axes: AxisScore[] = [
        {
            axis: 'awareness',
            label: '인지 (Awareness)',
            icon: '👁️',
            asIs: awarenessAsIs,
            toBe: TARGET_AWARENESS,
            rawValue: awarenessRaw,
            targetValue: `${TARGET_AWARENESS}/100회`,
            actionHint: awarenessAsIs >= TARGET_AWARENESS
                ? '목표 달성 — 자산화로 영속화'
                : '자산화 + 고권위 매체 노출 강화',
            recommendedModule: awarenessAsIs >= TARGET_AWARENESS ? 'assets' : 'assets',
        },
        {
            axis: 'depth',
            label: '이해 (Depth)',
            icon: '🎯',
            asIs: depthAsIs,
            toBe: TARGET_DEPTH,
            rawValue: `핵심 사실 일치율 ${depthAsIs}%`,
            targetValue: `${TARGET_DEPTH}%`,
            actionHint: depthAsIs >= TARGET_DEPTH
                ? '목표 달성 — Schema 갱신만 유지'
                : 'Entity Branding (JSON-LD · FAQ · llms.txt) 보강',
            recommendedModule: 'assets',
        },
        {
            axis: 'trust',
            label: '추천 (Trust)',
            icon: '⭐',
            asIs: trustAsIs,
            toBe: TARGET_TRUST,
            rawValue: trustRaw,
            targetValue: `TOP 3 70% 이상`,
            actionHint: trustAsIs >= TARGET_TRUST
                ? '목표 달성 — 경쟁사 비교 콘텐츠 추가'
                : '고권위 소스 주입 + 경쟁 비교 콘텐츠',
            recommendedModule: 'strategy',
        },
        {
            axis: 'sentiment',
            label: '평판 (Sentiment)',
            icon: '💬',
            asIs: sentimentAsIs,
            toBe: TARGET_SENTIMENT,
            rawValue: sentimentRaw,
            targetValue: `긍정 ${TARGET_SENTIMENT}%`,
            actionHint: sentimentAsIs >= TARGET_SENTIMENT
                ? '목표 달성 — 모니터링 유지'
                : 'AIRM (오정보 교정 · 부정 답변 대응)',
            recommendedModule: 'airm',
        },
    ];

    // ── 6 측정 차원 ──
    const dimensions = computeDimensions(report, allAnswers, mentionedAnswers);

    // 종합 점수 — 4지표 평균 (LLM 미실측 시 sentiment 제외, § 1.10 정직 원칙)
    const sentimentSource: 'llm' | 'na' = llmAnalyzed.length > 0 ? 'llm' : 'na';
    const scoredAxes = sentimentSource === 'llm'
        ? axes
        : axes.filter(a => a.axis !== 'sentiment');
    const overallScore = scoredAxes.length > 0
        ? Math.round(scoredAxes.reduce((s, a) => s + a.asIs, 0) / scoredAxes.length)
        : 0;
    const confidence = activePlatforms.length / 5;

    return { axes, dimensions, overallScore, confidence, analyzedByLlm: llmAnalyzed.length, sentimentSource };
}

function computeDimensions(
    report: AIProbeReport,
    allAnswers: ProbeAnswer[],
    mentionedAnswers: ProbeAnswer[],
): DimensionDetail[] {
    const llmAnalyzed = mentionedAnswers.filter(a => a.detection.analysisSource === 'llm');

    // 1. Entity Presence — brand_direct 카테고리 mentionRate
    const brandDirect = allAnswers.filter(a => a.category === 'brand_direct');
    const brandDirectMentioned = brandDirect.filter(a => a.detection.mentioned).length;
    const entityScore = brandDirect.length > 0 ? Math.round((brandDirectMentioned / brandDirect.length) * 100) : 0;

    // 2. Attribute Association — LLM 실측 응답만 산입 (§ 1.10 정직 원칙)
    const allAttributes = llmAnalyzed.flatMap(a => a.detection.attributes ?? []);
    const uniqueAttrs = Array.from(new Set(allAttributes));
    const attrScore = llmAnalyzed.length > 0
        ? Math.min(100, Math.round((uniqueAttrs.length / Math.max(1, llmAnalyzed.length * 0.5)) * 100))
        : null;

    // 3. Knowledge Recency — Phase 5 외부 도구 필요 (현재 N/A)
    const recencyDim: DimensionDetail = {
        key: 'knowledge_recency',
        label: '지식 최신성',
        score: null,
        summary: 'Phase 5 외부 도구 연동 후 측정',
        isNA: true,
        naReason: '최신 사실 인식률 측정에는 검증된 최근 6개월 사실 목록이 필요. Phase 5에서 자동 사실 수집 모듈 연동 예정.',
    };

    // 4. Recommendation Ranking — 평균 position
    const positions = mentionedAnswers
        .map(a => a.detection.position)
        .filter((p): p is number => typeof p === 'number');
    const avgPos = positions.length > 0
        ? positions.reduce((s, p) => s + p, 0) / positions.length
        : null;
    const rankingScore = avgPos !== null
        ? Math.round(positions.reduce((s, p) => s + positionToScore(p), 0) / positions.length)
        : 0;

    // 5. Reasoning — LLM 실측 응답만 산입
    const allReasoning = llmAnalyzed.flatMap(a => a.detection.reasoning ?? []);
    const reasoningScore = llmAnalyzed.length > 0
        ? Math.min(100, Math.round((allReasoning.length / llmAnalyzed.length) * 50))
        : null;

    // 6. Comparative Analysis — competitor 카테고리 mentionRate + sentiment(LLM 실측만)
    const competitor = allAnswers.filter(a => a.category === 'competitor');
    const competitorMentioned = competitor.filter(a => a.detection.mentioned);
    const competitorLlm = competitorMentioned.filter(a => a.detection.analysisSource === 'llm');
    const competitorPositive = competitorLlm.filter(a => a.detection.sentiment === 'positive').length;
    const comparativeScore = competitor.length > 0
        ? Math.round(((competitorMentioned.length / competitor.length) * 60) + ((competitorLlm.length > 0 ? competitorPositive / competitorLlm.length : 0) * 40))
        : 0;

    return [
        {
            key: 'entity_presence',
            label: '개체 인지도 (Entity Presence)',
            score: entityScore,
            summary: brandDirect.length > 0
                ? `"우리 브랜드는 어떤 회사야?" 직접 질문에서 ${brandDirectMentioned}/${brandDirect.length}회 언급`
                : '직접 질문 카테고리 미측정',
        },
        {
            key: 'attribute_association',
            label: '속성 결합도 (Attribute Association)',
            score: attrScore,
            summary: attrScore === null
                ? 'LLM 분류기 미실행 (ANTHROPIC_API_KEY 필요)'
                : uniqueAttrs.length > 0
                    ? `LLM이 ${uniqueAttrs.length}개 형용사 추출 (mentioned ${llmAnalyzed.length}건 중)`
                    : '동반 형용사 검출 없음 — LLM이 brand 컨텍스트에서 명시적 속성 발견 못함',
            samples: uniqueAttrs.slice(0, 5),
            isNA: attrScore === null,
            naReason: attrScore === null ? '§ 1.10 정직 원칙 — LLM 분류기 없이는 N/A' : undefined,
        },
        recencyDim,
        {
            key: 'recommendation_ranking',
            label: '추천 순위 (Recommendation Ranking)',
            score: rankingScore,
            summary: avgPos !== null
                ? `평균 ${avgPos.toFixed(1)}위 (${positions.length}회 리스트 등장)`
                : '추천 리스트에 미등장',
        },
        {
            key: 'reasoning',
            label: '추천 근거 (Reasoning)',
            score: reasoningScore,
            summary: reasoningScore === null
                ? 'LLM 분류기 미실행 (ANTHROPIC_API_KEY 필요)'
                : allReasoning.length > 0
                    ? `LLM이 ${allReasoning.length}건 근거 추출 (mentioned ${llmAnalyzed.length}건 중)`
                    : 'AI가 추천 이유를 명시하지 않음',
            samples: allReasoning.slice(0, 3),
            isNA: reasoningScore === null,
            naReason: reasoningScore === null ? '§ 1.10 정직 원칙 — LLM 분류기 없이는 N/A' : undefined,
        },
        {
            key: 'comparative_analysis',
            label: '비교 우위 (Comparative Analysis)',
            score: comparativeScore,
            summary: competitor.length > 0
                ? `경쟁사 비교 ${competitorMentioned.length}/${competitor.length}회 등장 (긍정 ${competitorPositive}회)`
                : '경쟁사 비교 카테고리 미측정',
        },
    ];
}
