// ChatGPT AI Probe — OpenAI API
//
// 표준 인터페이스. 키 없으면 자동 skip.
// 모델: gpt-4o-mini (비용·속도 균형). 정확도가 핵심이라면 gpt-4o.

import type { Question } from '../question-bank';
import {
    type ProbeAnswer,
    type PlatformResult,
    detectMention,
    summarizeAnswers,
    skippedPlatform,
} from './types';
import { type BrandFacts, extractFromAIResponse, compareFacts } from '../analyzers/fact-extractor';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

export async function probeChatGPT(
    questions: Question[],
    brand: string,
    siteTruth: BrandFacts | null,
    apiKey?: string,
): Promise<PlatformResult> {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) return skippedPlatform('chatgpt', 'OPENAI_API_KEY 미설정 — 키 추가 시 즉시 활성');
    if (questions.length === 0) return skippedPlatform('chatgpt', '질문 없음');

    const answers: ProbeAnswer[] = [];
    const BATCH = 5;
    for (let i = 0; i < questions.length; i += BATCH) {
        const batch = questions.slice(i, i + BATCH);
        const results = await Promise.all(batch.map(q => askChatGPT(key, q, brand, siteTruth)));
        answers.push(...results);
    }

    return {
        platform: 'chatgpt',
        skipped: false,
        answers,
        summary: summarizeAnswers(answers),
    };
}

async function askChatGPT(apiKey: string, q: Question, brand: string, siteTruth: BrandFacts | null): Promise<ProbeAnswer> {
    const measuredAt = new Date().toISOString();
    try {
        const res = await fetch(OPENAI_API_URL, {
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
            signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${errText.slice(0, 100)}`);
        }
        const data = await res.json();
        const rawResponse: string = data.choices?.[0]?.message?.content ?? '';
        const { mentioned, position } = detectMention(rawResponse, brand);

        let accuracy: 'exact' | 'partial' | 'wrong' | 'absent' = mentioned ? 'partial' : 'absent';
        let extractedFacts: BrandFacts | undefined;
        let factComparison: ProbeAnswer['detection']['factComparison'];
        if (mentioned) {
            extractedFacts = extractFromAIResponse(rawResponse, brand);
            if (siteTruth) {
                const cmp = compareFacts(siteTruth, extractedFacts);
                accuracy = cmp.verdict;
                factComparison = cmp.details;
            }
        }

        return {
            platform: 'chatgpt',
            category: q.category,
            query: q.text,
            rawResponse,
            detection: { mentioned, position, accuracy, extractedFacts, factComparison },
            measuredAt,
        };
    } catch (err) {
        return {
            platform: 'chatgpt',
            category: q.category,
            query: q.text,
            rawResponse: `[ERROR] ${(err as Error).message}`,
            detection: { mentioned: false, position: null, accuracy: 'absent' },
            measuredAt,
        };
    }
}
