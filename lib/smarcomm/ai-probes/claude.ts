// Claude AI Probe — 표준 AIProbe 인터페이스 구현
//
// 7카테고리 × N 질문을 Claude에 던지고 응답 캡처 + 브랜드 언급 검출.
// 출처: Anthropic Messages API (claude-sonnet-4 / claude-haiku-4-5)

import Anthropic from '@anthropic-ai/sdk';
import type { Question } from '../question-bank';
import {
    type ProbeAnswer,
    type PlatformResult,
    detectMention,
    summarizeAnswers,
    skippedPlatform,
} from './types';
import { type BrandFacts, extractFromAIResponse, compareFacts } from '../analyzers/fact-extractor';

// 비용 절감 — Haiku 사용 (Citability는 빠른 사실 추출만 필요)
const MODEL = 'claude-haiku-4-5-20251001';

export async function probeClaude(
    questions: Question[],
    brand: string,
    siteTruth: BrandFacts | null,
    apiKey?: string,
): Promise<PlatformResult> {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) return skippedPlatform('claude', 'ANTHROPIC_API_KEY 미설정');
    if (questions.length === 0) return skippedPlatform('claude', '질문 없음');

    const client = new Anthropic({ apiKey: key });
    const answers: ProbeAnswer[] = [];

    // 병렬 호출 — Anthropic API는 동시 요청 OK (rate limit 안에서)
    // 단, 너무 많이 동시에 보내면 429. 5개씩 묶어 처리.
    const BATCH = 5;
    for (let i = 0; i < questions.length; i += BATCH) {
        const batch = questions.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(q => askClaude(client, q, brand, siteTruth)));
        answers.push(...results);
    }

    return {
        platform: 'claude',
        skipped: false,
        answers,
        summary: summarizeAnswers(answers),
    };
}

async function askClaude(
    client: Anthropic,
    q: Question,
    brand: string,
    siteTruth: BrandFacts | null,
): Promise<ProbeAnswer> {
    const measuredAt = new Date().toISOString();
    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 600,
            messages: [{
                role: 'user',
                content: q.text,
            }],
        });
        const rawResponse = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text)
            .join('');

        const { mentioned, position } = detectMention(rawResponse, brand);

        // Phase 2.5 — 사실 추출 + 비교
        let accuracy: 'exact' | 'partial' | 'wrong' | 'absent' = mentioned ? 'partial' : 'absent';
        let extractedFacts: BrandFacts | undefined;
        let factComparison: { field: string; match: 'exact' | 'partial' | 'wrong' | 'missing'; siteValue?: string; aiValue?: string }[] | undefined;
        if (mentioned) {
            extractedFacts = extractFromAIResponse(rawResponse, brand);
            if (siteTruth) {
                const cmp = compareFacts(siteTruth, extractedFacts);
                accuracy = cmp.verdict;
                factComparison = cmp.details;
            }
        }

        return {
            platform: 'claude',
            category: q.category,
            query: q.text,
            rawResponse,
            detection: {
                mentioned,
                position,
                accuracy,
                extractedFacts,
                factComparison,
            },
            measuredAt,
        };
    } catch (err) {
        return {
            platform: 'claude',
            category: q.category,
            query: q.text,
            rawResponse: `[ERROR] ${(err as Error).message}`,
            detection: { mentioned: false, position: null, accuracy: 'absent' },
            measuredAt,
        };
    }
}
