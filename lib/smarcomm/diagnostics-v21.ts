// SmarComm Diagnostics V2.1 — § 3-A SSOT-7
//
// V2.1 진단 sub-engine 중 외부 API 없이 기존 probe 응답에서 추출 가능한 3가지:
//   1. AI SOV 매트릭스 (카테고리 × 플랫폼)
//   2. 인용 출처 맵핑 (Source Mapping)
//   3. 할루시네이션 분리 (가격·위치·스펙·연도·기타)
//
// 입력: AIProbeReport (이미 측정된 probe 응답)
// 출력: V2.1 sub-engine "Discovery" 의 GEO 부분 detail

import type { AIProbeReport, ProbeAnswer, AIPlatform } from './ai-probes/types';
import type { QuestionCategory } from './question-bank';
import { classifySourcesLLM, type SourceCategoryLlm, type TrustLevel } from './source-classifier-llm';

// ─────────────────────────────────────────────────────────────
// 1. AI SOV (Share of Voice) — 카테고리 × 플랫폼 매트릭스
// ─────────────────────────────────────────────────────────────

export interface SovCell {
    category: QuestionCategory;
    platform: AIPlatform;
    mentioned: number;
    total: number;
    sovPct: number;     // mentioned / total × 100
}

export interface SovMatrix {
    cells: SovCell[];
    byCategory: Array<{ category: QuestionCategory; avgSov: number; platformsCovered: number }>;
    byPlatform: Array<{ platform: AIPlatform; avgSov: number; categoriesCovered: number }>;
    /** 전체 평균 SOV (0~100) */
    overallSov: number;
}

export function computeAiSov(report: AIProbeReport): SovMatrix {
    const cells: SovCell[] = [];
    const activePlatforms = (Object.values(report.platforms) as Array<typeof report.platforms[AIPlatform]>).filter(p => !p.skipped);

    // 모든 (category, platform) 조합 매트릭스
    const categories = Array.from(new Set(report.questions.map(q => q.category)));
    for (const platform of activePlatforms) {
        for (const category of categories) {
            const inCell = platform.answers.filter(a => a.category === category);
            const mentioned = inCell.filter(a => a.detection.mentioned).length;
            cells.push({
                category,
                platform: platform.platform,
                mentioned,
                total: inCell.length,
                sovPct: inCell.length > 0 ? Math.round((mentioned / inCell.length) * 100) : 0,
            });
        }
    }

    const byCategory = categories.map(category => {
        const inCat = cells.filter(c => c.category === category);
        const covered = inCat.filter(c => c.total > 0);
        const avgSov = covered.length > 0 ? Math.round(covered.reduce((s, c) => s + c.sovPct, 0) / covered.length) : 0;
        return { category, avgSov, platformsCovered: covered.length };
    }).sort((a, b) => b.avgSov - a.avgSov);

    const byPlatform = activePlatforms.map(p => {
        const inPlat = cells.filter(c => c.platform === p.platform);
        const covered = inPlat.filter(c => c.total > 0);
        const avgSov = covered.length > 0 ? Math.round(covered.reduce((s, c) => s + c.sovPct, 0) / covered.length) : 0;
        return { platform: p.platform, avgSov, categoriesCovered: covered.length };
    }).sort((a, b) => b.avgSov - a.avgSov);

    const allCells = cells.filter(c => c.total > 0);
    const overallSov = allCells.length > 0
        ? Math.round(allCells.reduce((s, c) => s + c.sovPct, 0) / allCells.length)
        : 0;

    return { cells, byCategory, byPlatform, overallSov };
}

// ─────────────────────────────────────────────────────────────
// 2. 인용 출처 맵핑 (Source Mapping)
// ─────────────────────────────────────────────────────────────

// V2.1 — LLM 분류 카테고리 (source-classifier-llm.ts와 일치)
export type SourceCategory = SourceCategoryLlm;

export interface CitedSource {
    domain: string;
    url: string;             // 대표 URL 1개
    category: SourceCategory;
    trust: TrustLevel;       // V2.1 — LLM이 평가한 신뢰도
    classifierReason: string; // V2.1 — LLM 분류 근거
    mentionCount: number;
    platforms: AIPlatform[];
    queries: string[];       // 어느 질의에서 인용됐는지 (최대 3개)
}

export interface SourceMap {
    sources: CitedSource[];
    byCategory: Record<SourceCategory, number>;
    /** 인용된 고유 도메인 수 */
    uniqueDomains: number;
    /** 분류 출처 — 'llm' 또는 'na' (API 키 없을 때) */
    classifierSource: 'llm' | 'na';
}

const URL_REGEX = /https?:\/\/([\w.-]+)(?:\/[^\s\]"')]+)?/g;

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url.split('/')[0]?.replace(/^www\./, '') ?? url;
    }
}

// V2.1 — LLM 분류 (휴리스틱 폐기). API 키 없으면 'unknown'으로 표시.
export async function extractCitedSources(answers: ProbeAnswer[]): Promise<SourceMap> {
    const accumulated = new Map<string, { url: string; domain: string; mentionCount: number; platforms: AIPlatform[]; queries: string[] }>();

    for (const a of answers) {
        // 1) citations 필드 (Perplexity 등)
        if (a.citations) {
            for (const cit of a.citations) {
                accumulate(accumulated, cit.url, a.platform, a.query);
            }
        }
        // 2) rawResponse에서 URL 추출
        const matches = a.rawResponse.matchAll(URL_REGEX);
        for (const m of matches) {
            accumulate(accumulated, m[0], a.platform, a.query);
        }
    }

    const uniqueArr = Array.from(accumulated.values());

    // V2.1 — LLM 분류 호출
    const classifications = await classifySourcesLLM(uniqueArr.map(u => ({ url: u.url, domain: u.domain })));
    const classifierSource: 'llm' | 'na' = classifications !== null ? 'llm' : 'na';
    const classMap = new Map<string, { category: SourceCategory; trust: TrustLevel; reason: string }>();
    if (classifications) {
        for (const c of classifications) {
            classMap.set(c.domain, { category: c.category, trust: c.trust, reason: c.reason });
        }
    }

    const sources: CitedSource[] = uniqueArr.map(u => {
        const cls = classMap.get(u.domain);
        return {
            domain: u.domain,
            url: u.url,
            category: cls?.category ?? 'unknown',
            trust: cls?.trust ?? 'low',
            classifierReason: cls?.reason ?? (classifierSource === 'na' ? 'LLM 분류기 미실행 (API 키 필요)' : '분류 누락'),
            mentionCount: u.mentionCount,
            platforms: u.platforms,
            queries: u.queries,
        };
    }).sort((a, b) => b.mentionCount - a.mentionCount);

    const byCategory: Record<SourceCategory, number> = {
        news: 0, wiki: 0, official: 0, blog: 0, social: 0, forum: 0, review: 0, academic: 0, directory: 0, unknown: 0,
    };
    for (const s of sources) {
        byCategory[s.category] += s.mentionCount;
    }

    return {
        sources,
        byCategory,
        uniqueDomains: sources.length,
        classifierSource,
    };
}

function accumulate(
    map: Map<string, { url: string; domain: string; mentionCount: number; platforms: AIPlatform[]; queries: string[] }>,
    url: string,
    platform: AIPlatform,
    query: string,
) {
    const domain = extractDomain(url);
    if (!domain || domain.length < 4) return;
    if (!map.has(domain)) {
        map.set(domain, { url, domain, mentionCount: 0, platforms: [], queries: [] });
    }
    const s = map.get(domain)!;
    s.mentionCount++;
    if (!s.platforms.includes(platform)) s.platforms.push(platform);
    if (s.queries.length < 3 && !s.queries.includes(query)) s.queries.push(query);
}

// ─────────────────────────────────────────────────────────────
// 3. 할루시네이션 진단 (분리) — 카테고리별 사실 오류 분류
// ─────────────────────────────────────────────────────────────

export type HallucinationCategory = 'price' | 'location' | 'spec' | 'founded' | 'features' | 'strengths' | 'category' | 'other';

export interface HallucinationFinding {
    platform: AIPlatform;
    query: string;
    category: HallucinationCategory;
    severity: 'critical' | 'high' | 'medium';
    siteValue: string;
    aiValue: string;
    /** V2.1 — LLM 판정 근거 (한국어, factComparison.reason에서 전달) */
    reason: string;
    measuredAt: string;
}

export interface HallucinationReport {
    findings: HallucinationFinding[];
    byCategory: Record<HallucinationCategory, number>;
    bySeverity: { critical: number; high: number; medium: number };
    /** 오류 발생률 — wrong/missing 응답 / 전체 mentioned */
    errorRate: number;
}

// fact-extractor의 field name → 분류 매핑
const FIELD_CATEGORY_MAP: Record<string, HallucinationCategory> = {
    price: 'price',
    founded: 'founded',
    location: 'location',
    spec: 'spec',
    features: 'features',
    strengths: 'strengths',
    category: 'category',
};

function categorizeField(field: string): HallucinationCategory {
    return FIELD_CATEGORY_MAP[field] ?? 'other';
}

// 카테고리별 심각도 — 가격·위치는 critical, 기능은 high, 강점은 medium
const CATEGORY_SEVERITY: Record<HallucinationCategory, 'critical' | 'high' | 'medium'> = {
    price:     'critical',
    location:  'critical',
    spec:      'high',
    founded:   'high',
    features:  'high',
    strengths: 'medium',
    category:  'medium',
    other:     'medium',
};

export function extractHallucinations(answers: ProbeAnswer[]): HallucinationReport {
    const findings: HallucinationFinding[] = [];

    for (const a of answers) {
        if (!a.detection.mentioned || !a.detection.factComparison) continue;
        for (const cmp of a.detection.factComparison) {
            if (cmp.match !== 'wrong') continue;  // wrong만 — partial/missing은 다른 범주
            const category = categorizeField(cmp.field);
            findings.push({
                platform: a.platform,
                query: a.query,
                category,
                severity: CATEGORY_SEVERITY[category],
                siteValue: cmp.siteValue ?? '(없음)',
                aiValue: cmp.aiValue ?? '(미언급)',
                reason: cmp.reason ?? '',
                measuredAt: a.measuredAt,
            });
        }
    }

    const byCategory: Record<HallucinationCategory, number> = {
        price: 0, location: 0, spec: 0, founded: 0, features: 0, strengths: 0, category: 0, other: 0,
    };
    const bySeverity = { critical: 0, high: 0, medium: 0 };
    for (const f of findings) {
        byCategory[f.category]++;
        bySeverity[f.severity]++;
    }

    const mentionedCount = answers.filter(a => a.detection.mentioned).length;
    const errorRate = mentionedCount > 0 ? Math.round((findings.length / mentionedCount) * 100) : 0;

    return { findings, byCategory, bySeverity, errorRate };
}

// ─────────────────────────────────────────────────────────────
// 통합 — Discovery sub-engine 전체 detail
// ─────────────────────────────────────────────────────────────

export interface DiscoveryDetail {
    sov: SovMatrix;
    sources: SourceMap;
    hallucinations: HallucinationReport;
}

export async function computeDiscoveryDetail(report: AIProbeReport): Promise<DiscoveryDetail> {
    const activePlatforms = (Object.values(report.platforms) as Array<typeof report.platforms[AIPlatform]>).filter(p => !p.skipped);
    const allAnswers = activePlatforms.flatMap(p => p.answers);
    const [sources] = await Promise.all([
        extractCitedSources(allAnswers),
    ]);
    return {
        sov: computeAiSov(report),
        sources,
        hallucinations: extractHallucinations(allAnswers),
    };
}
