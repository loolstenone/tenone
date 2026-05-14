// AIProbe 표준 인터페이스 — CLAUDE.md § 3-A SSOT-2
//
// 5 AI 플랫폼이 모두 같은 구조로 결과를 반환.
// 어떤 AI든 한 곳에서 비교 가능 + DB 저장 정합성.

import type { Question, QuestionCategory } from '../question-bank';
import type { BrandFacts } from '../analyzers/fact-extractor';

export type AIPlatform = 'claude' | 'chatgpt' | 'perplexity' | 'naver-cue' | 'google-aio';

export const AI_PLATFORM_META: Record<AIPlatform, { label: string; provider: string; envVar: string }> = {
    'claude':      { label: 'Claude',         provider: 'Anthropic',  envVar: 'ANTHROPIC_API_KEY' },
    'chatgpt':     { label: 'ChatGPT',        provider: 'OpenAI',     envVar: 'OPENAI_API_KEY' },
    'perplexity':  { label: 'Perplexity',     provider: 'Perplexity', envVar: 'PERPLEXITY_API_KEY' },
    'naver-cue':   { label: '네이버 Cue',     provider: 'Naver',      envVar: '(헤드리스, 키 불필요)' },
    'google-aio':  { label: 'Google AI Overview', provider: 'Google', envVar: 'SERPAPI_API_KEY' },
};

export type ProbeAccuracy = 'exact' | 'partial' | 'wrong' | 'absent';

export interface ProbeAnswer {
    /** 단일 질문 1회 실행 결과 */
    platform: AIPlatform;
    category: QuestionCategory;
    query: string;
    /** AI 응답 원본 텍스트 (감사 보존용) */
    rawResponse: string;
    /** 인용 출처 (Perplexity 등 일부만) */
    citations?: Array<{ url: string; title?: string }>;
    detection: {
        /** 브랜드 언급 여부 */
        mentioned: boolean;
        /** 추천 순위 (1부터, 미언급이면 null) */
        position: number | null;
        /** 사실 정확도 — exact/partial/wrong/absent */
        accuracy: ProbeAccuracy;
        /** AI가 말한 핵심 사실 (가격·기능·강점 등) — structured */
        extractedFacts?: BrandFacts;
        /** 자사 사이트 사실 vs AI 답변 비교 결과 (Phase 2.5) */
        factComparison?: {
            field: string;
            match: 'exact' | 'partial' | 'wrong' | 'missing';
            siteValue?: string;
            aiValue?: string;
        }[];
    };
    measuredAt: string;     // ISO
    /** API 호출 비용 추적 (선택) */
    costUsd?: number;
}

/** 한 플랫폼의 전체 실행 결과 (여러 질문) */
export interface PlatformResult {
    platform: AIPlatform;
    /** 키 미설정/오류로 측정 불가 */
    skipped: boolean;
    skipReason?: string;
    /** 카테고리별 응답들 */
    answers: ProbeAnswer[];
    /** 요약 메트릭 */
    summary: {
        totalQueries: number;
        mentionCount: number;          // 언급된 질문 수
        mentionRate: number;           // 0~1
        avgPosition: number | null;    // 평균 추천 순위 (언급된 것만)
        exactAccuracyRate: number;     // 사실 정확도 비율
    };
}

/** 5 AI 통합 결과 */
export interface AIProbeReport {
    brand: string;
    questions: Question[];
    platforms: Record<AIPlatform, PlatformResult>;
    /** Citability 점수 (0~100) 산입용 */
    citabilityScore: number;
    /** 카테고리별 노출률 (AI Visibility Map용) */
    byCategory: Array<{
        category: QuestionCategory;
        mentionRate: number;            // 5 플랫폼 × N 질문 중 언급 비율
        platformsMentioned: AIPlatform[];
    }>;
}

/** 프로브 함수 표준 시그니처 */
export type ProbeFn = (
    questions: Question[],
    brand: string,
    siteTruth: BrandFacts | null,
    apiKey?: string,
) => Promise<PlatformResult>;

/** 스킵 결과 헬퍼 */
export function skippedPlatform(platform: AIPlatform, reason: string): PlatformResult {
    return {
        platform,
        skipped: true,
        skipReason: reason,
        answers: [],
        summary: {
            totalQueries: 0,
            mentionCount: 0,
            mentionRate: 0,
            avgPosition: null,
            exactAccuracyRate: 0,
        },
    };
}

/** 응답 텍스트에서 브랜드 언급 + 순위 검출 */
export function detectMention(
    rawResponse: string,
    brand: string,
): { mentioned: boolean; position: number | null } {
    const text = rawResponse.toLowerCase();
    const brandLower = brand.toLowerCase();
    if (!text.includes(brandLower)) return { mentioned: false, position: null };

    // 추천 순위 검출 — 줄별로 분석, 첫 번째 언급된 줄 위치
    const lines = rawResponse.split(/\n/).filter(l => l.trim());
    let position: number | null = null;
    let listIdx = 0;
    for (const line of lines) {
        // 리스트 패턴: "1.", "1)", "- ", "* ", "①", "▸", "•"
        const isListItem = /^(\s*[\d①②③④⑤⑥⑦⑧⑨⑩]+[\.\)]|\s*[-*•▸●○])/.test(line);
        if (isListItem) listIdx++;
        if (line.toLowerCase().includes(brandLower)) {
            position = isListItem ? listIdx : 99;  // 본문 언급은 99 (순위 외)
            break;
        }
    }

    return { mentioned: true, position };
}

/** PlatformResult로부터 summary 계산 */
export function summarizeAnswers(answers: ProbeAnswer[]): PlatformResult['summary'] {
    const total = answers.length;
    const mentioned = answers.filter(a => a.detection.mentioned);
    const positions = mentioned.map(a => a.detection.position).filter((p): p is number => typeof p === 'number');
    const exactCount = answers.filter(a => a.detection.accuracy === 'exact').length;

    return {
        totalQueries: total,
        mentionCount: mentioned.length,
        mentionRate: total > 0 ? mentioned.length / total : 0,
        avgPosition: positions.length > 0 ? positions.reduce((s, p) => s + p, 0) / positions.length : null,
        exactAccuracyRate: total > 0 ? exactCount / total : 0,
    };
}
