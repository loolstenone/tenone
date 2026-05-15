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
import { type BrandFacts } from '../analyzers/fact-extractor';
import { classifySentimentLLM } from '../sentiment-llm';

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

        // V2.1 § 3-A SSOT-7 — sentiment·reasoning·attributes·factComparison 일괄 LLM 실측
        // § 1.10 정직 원칙: API 키 없으면 모두 N/A. 휴리스틱 fact-extractor 폐기.
        let accuracy: 'exact' | 'partial' | 'wrong' | 'absent' = mentioned ? 'partial' : 'absent';
        const extractedFacts: BrandFacts | undefined = undefined;  // 휴리스틱 폐기 — siteTruth는 LLM 입력으로만 사용
        let factComparison: { field: string; match: 'exact' | 'partial' | 'wrong' | 'missing'; siteValue?: string; aiValue?: string; reason?: string }[] | undefined;
        let sentiment: 'positive' | 'neutral' | 'negative' | undefined;
        let sentimentConfidence: number | undefined;
        let reasoning: string[] | undefined;
        let attributes: string[] | undefined;
        let analysisSource: 'llm' | undefined;

        if (mentioned) {
            const llm = await classifySentimentLLM(rawResponse, brand, siteTruth);
            if (llm) {
                sentiment = llm.sentiment;
                sentimentConfidence = llm.confidence;
                if (llm.reasoning.length > 0) reasoning = llm.reasoning;
                if (llm.attributes.length > 0) attributes = llm.attributes;
                analysisSource = 'llm';

                // factComparison — LLM 출력 사용 (휴리스틱 compareFacts 폐기)
                if (llm.factComparisons.length > 0) {
                    factComparison = llm.factComparisons.map(c => ({
                        field: c.field,
                        match: c.match,
                        siteValue: c.siteValue,
                        aiValue: c.aiValue,
                        reason: c.reason,
                    }));
                    // accuracy verdict 산출 (LLM factComparisons로부터)
                    const matches = llm.factComparisons.map(c => c.match);
                    const total = matches.length;
                    if (total === 0) {
                        accuracy = mentioned ? 'partial' : 'absent';
                    } else {
                        const exact = matches.filter(m => m === 'exact').length;
                        const wrong = matches.filter(m => m === 'wrong').length;
                        const missing = matches.filter(m => m === 'missing').length;
                        if (exact === total) accuracy = 'exact';
                        else if (wrong > 0) accuracy = 'wrong';
                        else if (missing === total) accuracy = 'absent';
                        else accuracy = 'partial';
                    }
                }
            }
            // llm === null이면 모든 의미 분석 필드 undefined 유지 → UI에서 N/A
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
                sentiment,
                sentimentConfidence,
                reasoning,
                attributes,
                analysisSource,
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
