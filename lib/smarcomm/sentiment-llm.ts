// LLM AI Response Analyzer — V2.1 § 3-A SSOT-7 정직성 회복 (확장판)
//
// Claude Haiku 4.5로 AI 응답을 의미적으로 분석한다. 한 호출에 통합:
//   1. sentiment (positive/neutral/negative)
//   2. reasoning (추천 근거 단편들)
//   3. attributes (브랜드 동반 형용사)
//   4. factComparisons (사이트 사실 vs AI 응답 비교) — 휴리스틱 compareFacts 폐기
//
// CLAUDE.md § 1.10 정직 원칙 — 휴리스틱 폐기, 의미 분류는 LLM만.
//
// 입력: rawResponse + brand + siteTruth (사이트 측 사실 — Schema/HTML 추출, 정직)
// 출력: { sentiment, confidence, reasoning, attributes, factComparisons } 또는 null (API 키 없음)
//
// 비용: Claude Haiku 4.5
//   - input ~800 tokens / 응답: $0.25/M = $0.0002
//   - output ~300 tokens / 응답: $1.25/M = $0.0004
//   - 응답당 ~$0.0006
//   - 13 질문 × 5 플랫폼 = ~$0.04/scan (sentiment-only 대비 약 2배)

import Anthropic from '@anthropic-ai/sdk';
import type { Sentiment } from './ai-probes/types';
import type { BrandFacts } from './analyzers/fact-extractor';

const MODEL = 'claude-haiku-4-5-20251001';

export type FactField = 'price' | 'features' | 'strengths' | 'founded' | 'location' | 'spec' | 'category' | 'other';
export type FactMatch = 'exact' | 'partial' | 'wrong' | 'missing';

export interface LlmFactComparison {
    field: FactField;
    siteValue: string;
    aiValue: string;
    match: FactMatch;
    reason: string;       // LLM 판정 근거 (한국어)
}

export interface LlmAnalysis {
    sentiment: Sentiment;
    confidence: number;
    reasoning: string[];
    attributes: string[];
    factComparisons: LlmFactComparison[];
    source: 'llm';
}

const SYSTEM_PROMPT = `당신은 브랜드 평판·사실 검증 전문가입니다.
AI 응답을 의미적으로 분석해 한국어로 JSON 답변을 만듭니다.

분석 4가지:
1. sentiment: 브랜드 언급 컨텍스트의 톤
2. reasoning: AI가 든 추천/평가 이유 단편
3. attributes: 브랜드와 동반 언급된 형용사·특성
4. factComparisons: 사이트 측 사실(SITE_FACTS)이 AI 응답에 어떻게 반영되는지 비교

반드시 다음 JSON으로만 응답 (코드 펜스 불필요):
{
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": 0.0~1.0,
  "reasoning": ["근거1", "근거2", ...최대 5개, 각 ≤80자],
  "attributes": ["형용사1", ...최대 5개],
  "factComparisons": [
    {
      "field": "price"|"features"|"strengths"|"founded"|"location"|"spec"|"category"|"other",
      "siteValue": "사이트 측 값 (그대로)",
      "aiValue": "AI가 응답에서 언급한 값 (없으면 미언급)",
      "match": "exact"|"partial"|"wrong"|"missing",
      "reason": "왜 그 판정인지 한 줄"
    }
  ]
}

판정 기준:
- exact: AI가 사이트 사실과 의미적으로 같게 말함 (예: 49000원 ↔ "약 5만원" → exact)
- partial: 같은 방향이지만 부분 일치 (예: 49000원 ↔ "한 달 약 4만원대" → partial)
- wrong: AI가 다르게 말함 (예: 49000원 ↔ "월 10만원" → wrong)
- missing: AI 응답에 해당 사실이 나오지 않음

브랜드가 응답에 미언급 → factComparisons는 모두 missing 처리.
SITE_FACTS의 모든 필드에 대해 항목 생성.`;

export async function classifySentimentLLM(
    rawResponse: string,
    brand: string,
    siteTruth: BrandFacts | null = null,
    apiKey?: string,
): Promise<LlmAnalysis | null> {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    if (!rawResponse || rawResponse.length < 20) return null;

    // brand 미언급이면 skip — 비용 절약 (factComparisons는 모두 missing이 자명)
    if (!rawResponse.toLowerCase().includes(brand.toLowerCase())) return null;

    const client = new Anthropic({ apiKey: key });

    // siteTruth → JSON 단순화 (LLM에게 전달)
    const siteFactsSummary = formatSiteFacts(siteTruth);

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 700,
            system: SYSTEM_PROMPT,
            messages: [{
                role: 'user',
                content: `BRAND: "${brand}"

SITE_FACTS:
${siteFactsSummary}

AI_RESPONSE:
${rawResponse.slice(0, 2500)}

위 AI_RESPONSE를 분석해 JSON 응답하세요. SITE_FACTS의 각 필드에 대해 factComparisons 항목을 생성하세요.`,
            }],
        });

        const text = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text)
            .join('');

        const parsed = parseJsonRobust(text);
        if (!parsed) return null;

        return {
            sentiment: normalizeSentiment(parsed.sentiment),
            confidence: clamp01(typeof parsed.confidence === 'number' ? parsed.confidence : 0.5),
            reasoning: Array.isArray(parsed.reasoning)
                ? parsed.reasoning.filter((r: unknown): r is string => typeof r === 'string').slice(0, 5)
                : [],
            attributes: Array.isArray(parsed.attributes)
                ? parsed.attributes.filter((a: unknown): a is string => typeof a === 'string').slice(0, 5)
                : [],
            factComparisons: Array.isArray(parsed.factComparisons)
                ? parsed.factComparisons
                    .filter((c: unknown): c is Record<string, unknown> => typeof c === 'object' && c !== null)
                    .map(normalizeFactComparison)
                    .filter((c): c is LlmFactComparison => c !== null)
                    .slice(0, 12)
                : [],
            source: 'llm',
        };
    } catch (err) {
        console.error('[sentiment-llm] classify failed:', (err as Error).message);
        return null;
    }
}

// ── siteTruth → LLM 프롬프트 표현 ──
function formatSiteFacts(facts: BrandFacts | null): string {
    if (!facts) return '(사이트 사실 추출 실패 — factComparisons는 빈 배열로)';
    const lines: string[] = [];
    if (facts.price) {
        const p = facts.price;
        const symbol = p.currency === 'KRW' ? '원' : p.currency === 'USD' ? '$' : '€';
        const period = p.period === 'month' ? '/월' : p.period === 'year' ? '/년' : '';
        lines.push(`- price: ${p.value.toLocaleString('ko-KR')}${symbol}${period}`);
    }
    if (facts.founded) lines.push(`- founded: ${facts.founded}년`);
    if (facts.category) lines.push(`- category: ${facts.category}`);
    if (facts.features && facts.features.length > 0) lines.push(`- features: ${facts.features.slice(0, 5).join(', ')}`);
    if (facts.strengths && facts.strengths.length > 0) lines.push(`- strengths: ${facts.strengths.slice(0, 5).join(', ')}`);
    return lines.length > 0 ? lines.join('\n') : '(추출 가능한 사실 없음 — factComparisons는 빈 배열로)';
}

// ── factComparison 정규화 ──
const VALID_FIELDS: FactField[] = ['price', 'features', 'strengths', 'founded', 'location', 'spec', 'category', 'other'];
const VALID_MATCH: FactMatch[] = ['exact', 'partial', 'wrong', 'missing'];

function normalizeFactComparison(c: Record<string, unknown>): LlmFactComparison | null {
    const field = typeof c.field === 'string' && VALID_FIELDS.includes(c.field as FactField)
        ? c.field as FactField
        : 'other';
    const match = typeof c.match === 'string' && VALID_MATCH.includes(c.match as FactMatch)
        ? c.match as FactMatch
        : null;
    if (!match) return null;
    return {
        field,
        siteValue: typeof c.siteValue === 'string' ? c.siteValue.slice(0, 200) : '',
        aiValue: typeof c.aiValue === 'string' ? c.aiValue.slice(0, 200) : '',
        match,
        reason: typeof c.reason === 'string' ? c.reason.slice(0, 200) : '',
    };
}

// ── JSON 견고 파싱 ──
function parseJsonRobust(text: string): Record<string, unknown> | null {
    try { return JSON.parse(text); } catch { /* continue */ }
    const fence = text.match(/```(?:json)?\s*([\s\S]+?)```/);
    if (fence) {
        try { return JSON.parse(fence[1].trim()); } catch { /* continue */ }
    }
    const block = text.match(/\{[\s\S]+\}/);
    if (block) {
        try { return JSON.parse(block[0]); } catch { /* fall through */ }
    }
    return null;
}

function normalizeSentiment(v: unknown): Sentiment {
    if (v === 'positive' || v === 'negative' || v === 'neutral') return v;
    return 'neutral';
}

function clamp01(v: number): number {
    return Math.max(0, Math.min(1, v));
}
