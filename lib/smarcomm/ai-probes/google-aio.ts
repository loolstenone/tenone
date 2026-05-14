// Google AI Overview Probe — SerpAPI 통합
//
// Google 검색 결과의 ai_overview 필드 캡처.
// SerpAPI 무료 플랜은 월 100건 — 비용 한계 있음.
//
// 출처: https://serpapi.com/google-ai-overview

import type { Question } from '../question-bank';
import {
    type ProbeAnswer,
    type PlatformResult,
    detectMention,
    summarizeAnswers,
    skippedPlatform,
} from './types';

const SERP_API_URL = 'https://serpapi.com/search';

import type { BrandFacts as _BF } from '../analyzers/fact-extractor';

export async function probeGoogleAIO(
    questions: Question[],
    brand: string,
    _siteTruth: _BF | null,
    apiKey?: string,
): Promise<PlatformResult> {
    const key = apiKey || process.env.SERPAPI_API_KEY;
    if (!key) return skippedPlatform('google-aio', 'SERPAPI_API_KEY 미설정 — 키 추가 시 즉시 활성');
    if (questions.length === 0) return skippedPlatform('google-aio', '질문 없음');

    const answers: ProbeAnswer[] = [];
    // SerpAPI는 비용이 비싸 — 순차 호출 + 카테고리당 1개만
    const sampled = sampleQuestions(questions, 5);
    for (const q of sampled) {
        const a = await querySerpAPI(key, q, brand);
        answers.push(a);
    }

    return {
        platform: 'google-aio',
        skipped: false,
        answers,
        summary: summarizeAnswers(answers),
    };
}

function sampleQuestions(questions: Question[], maxPerScan: number): Question[] {
    // 카테고리별 1개씩만 — 비용 절감
    const seen = new Set<string>();
    const sampled: Question[] = [];
    for (const q of questions) {
        if (sampled.length >= maxPerScan) break;
        if (!seen.has(q.category)) {
            seen.add(q.category);
            sampled.push(q);
        }
    }
    return sampled;
}

async function querySerpAPI(apiKey: string, q: Question, brand: string): Promise<ProbeAnswer> {
    const measuredAt = new Date().toISOString();
    try {
        const params = new URLSearchParams({
            engine: 'google',
            q: q.text,
            api_key: apiKey,
            hl: 'ko',
            gl: 'kr',
        });
        const res = await fetch(`${SERP_API_URL}?${params.toString()}`, {
            signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        // ai_overview 필드 → text + sources
        const aiOverview = data.ai_overview;
        const rawResponse: string = aiOverview?.text_blocks
            ? aiOverview.text_blocks.map((b: { snippet?: string }) => b.snippet || '').join('\n')
            : (data.answer_box?.snippet || data.knowledge_graph?.description || '');

        const refs = aiOverview?.references || [];
        const citations = refs.map((r: { link?: string; title?: string }) => ({
            url: r.link || '',
            title: r.title,
        })).filter((c: { url: string }) => c.url);

        const { mentioned, position } = detectMention(rawResponse, brand);
        const brandLower = brand.toLowerCase();
        const citedInSources = citations.some((c: { url: string }) => c.url.toLowerCase().includes(brandLower));

        return {
            platform: 'google-aio',
            category: q.category,
            query: q.text,
            rawResponse: rawResponse || '(AI Overview 없음 — 일반 검색 결과만)',
            citations,
            detection: {
                mentioned: mentioned || citedInSources,
                position,
                accuracy: citedInSources ? 'exact' : mentioned ? 'partial' : 'absent',
            },
            measuredAt,
        };
    } catch (err) {
        return {
            platform: 'google-aio',
            category: q.category,
            query: q.text,
            rawResponse: `[ERROR] ${(err as Error).message}`,
            detection: { mentioned: false, position: null, accuracy: 'absent' },
            measuredAt,
        };
    }
}
