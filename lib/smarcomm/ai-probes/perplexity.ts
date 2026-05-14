// Perplexity AI Probe — Perplexity Sonar API (citations 포함)
//
// 표준: https://docs.perplexity.ai/api-reference/chat-completions
// 응답에 citations 배열 포함 — 인용 정확도 측정용

import type { Question } from '../question-bank';
import {
    type ProbeAnswer,
    type PlatformResult,
    detectMention,
    summarizeAnswers,
    skippedPlatform,
} from './types';

const PPLX_API_URL = 'https://api.perplexity.ai/chat/completions';
const MODEL = 'sonar';   // 가장 저렴한 검색 통합 모델

import type { BrandFacts as _BF } from '../analyzers/fact-extractor';

export async function probePerplexity(
    questions: Question[],
    brand: string,
    _siteTruth: _BF | null,    // Phase 2.5 — Perplexity는 citation URL 자체로 정확도 판정하므로 fact 비교 보류
    apiKey?: string,
): Promise<PlatformResult> {
    const key = apiKey || process.env.PERPLEXITY_API_KEY;
    if (!key) return skippedPlatform('perplexity', 'PERPLEXITY_API_KEY 미설정 — 키 추가 시 즉시 활성');
    if (questions.length === 0) return skippedPlatform('perplexity', '질문 없음');

    const answers: ProbeAnswer[] = [];
    const BATCH = 3;  // Perplexity rate limit 보수적
    for (let i = 0; i < questions.length; i += BATCH) {
        const batch = questions.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(q => askPerplexity(key, q, brand)));
        answers.push(...results);
    }

    return {
        platform: 'perplexity',
        skipped: false,
        answers,
        summary: summarizeAnswers(answers),
    };
}

async function askPerplexity(apiKey: string, q: Question, brand: string): Promise<ProbeAnswer> {
    const measuredAt = new Date().toISOString();
    try {
        const res = await fetch(PPLX_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 600,
                messages: [{ role: 'user', content: q.text }],
            }),
            signal: AbortSignal.timeout(25000),
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${errText.slice(0, 100)}`);
        }
        const data = await res.json();
        const rawResponse: string = data.choices?.[0]?.message?.content ?? '';
        const citationUrls: string[] = Array.isArray(data.citations) ? data.citations : [];
        const citations = citationUrls.map((url: string) => ({ url }));

        const { mentioned, position } = detectMention(rawResponse, brand);
        // 인용 출처 URL에 브랜드 도메인이 있으면 가중치 ↑
        const brandLower = brand.toLowerCase();
        const citedInSources = citations.some(c => c.url.toLowerCase().includes(brandLower));

        return {
            platform: 'perplexity',
            category: q.category,
            query: q.text,
            rawResponse,
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
            platform: 'perplexity',
            category: q.category,
            query: q.text,
            rawResponse: `[ERROR] ${(err as Error).message}`,
            detection: { mentioned: false, position: null, accuracy: 'absent' },
            measuredAt,
        };
    }
}
