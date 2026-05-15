// LLM Brand Personality Analyzer — V2.1 § 1.10 정직 원칙
//
// 기존 36 유형 임의 매핑(`brand-personality.ts`) 폐기 — 점수 임계값 분기로 "디지털 제왕" 같은
// 임의 라벨을 붙이는 건 정직하지 못함. 동일 점수 조합은 항상 동일 라벨 반환 → 진짜 분석 아님.
//
// 교체: Claude Haiku가 점수 + 핵심 진단 카드를 보고 동적으로 페르소나 분석.
// 비용: ~$0.001/scan (단일 호출, ~600 input + ~400 output tokens)

import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisItem } from './seo-analyzer';

const MODEL = 'claude-haiku-4-5-20251001';

export interface BrandPersonalityLlm {
    name: string;          // LLM이 명명한 페르소나 이름 (한국어)
    emoji: string;         // 어울리는 이모지 1개
    subtitle: string;      // 한 줄 요약 (≤40자)
    description: string;   // 페르소나 묘사 (한국어, 2~3 문장)
    strengths: string[];   // 구체적 강점 (3개 이내)
    weaknesses: string[];  // 구체적 약점 (3개 이내)
    recommendation: string; // 다음 행동 추천 (한 문장)
    source: 'llm';
}

const SYSTEM_PROMPT = `당신은 브랜드 마케팅 컨설턴트입니다. 진단 점수와 핵심 카드를 보고
이 브랜드의 디지털 페르소나를 동적으로 분석합니다.

반드시 다음 JSON으로만 응답 (코드 펜스 불필요):
{
  "name": "페르소나 이름 (한국어, ≤15자, 추상적이지 않게 진단 결과 기반)",
  "emoji": "어울리는 이모지 1개",
  "subtitle": "한 줄 요약 (≤40자)",
  "description": "페르소나 묘사 (한국어, 2~3 문장)",
  "strengths": ["구체적 강점 1", "강점 2", "강점 3"],
  "weaknesses": ["구체적 약점 1", "약점 2", "약점 3"],
  "recommendation": "이 브랜드가 다음으로 할 일 한 문장"
}

지침:
- 36 유형 임의 매핑 금지. 점수와 카드 데이터에서 진짜 특징 추출.
- name은 점수만 보고 만들지 말고, 카드 내용을 반영. 예: "콘텐츠 빈약한 기술 강자" 같이 양면 묘사.
- strengths/weaknesses는 진단 카드의 실제 결과를 인용 (구체적 항목명).
- recommendation은 가장 큰 점수 차이를 만들 한 가지 행동.`;

export async function analyzeBrandPersonalityLLM(
    scores: {
        index: number;
        findability: number;
        trust: number;
        citability: number;
    },
    topPassing: AnalysisItem[],
    topFailing: AnalysisItem[],
    apiKey?: string,
): Promise<BrandPersonalityLlm | null> {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) return null;

    const client = new Anthropic({ apiKey: key });

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 700,
            system: SYSTEM_PROMPT,
            messages: [{
                role: 'user',
                content: `점수:
- SmarComm Index: ${scores.index}
- Findability: ${scores.findability}
- Trust: ${scores.trust}
- Citability: ${scores.citability}

잘된 카드 (Top ${topPassing.length}):
${topPassing.map(i => `- ${i.name}: ${i.description}`).join('\n')}

부족한 카드 (Top ${topFailing.length}):
${topFailing.map(i => `- ${i.name} (${i.score}/${i.maxScore}): ${i.description}`).join('\n')}

이 브랜드의 디지털 페르소나를 동적으로 분석해 JSON으로 답하세요.`,
            }],
        });

        const text = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text).join('');

        const parsed = parseJsonRobust<{
            name?: unknown; emoji?: unknown; subtitle?: unknown; description?: unknown;
            strengths?: unknown; weaknesses?: unknown; recommendation?: unknown;
        }>(text);
        if (!parsed) return null;

        return {
            name: typeof parsed.name === 'string' ? parsed.name.slice(0, 30) : '디지털 진단 대상',
            emoji: typeof parsed.emoji === 'string' ? parsed.emoji.slice(0, 4) : '📊',
            subtitle: typeof parsed.subtitle === 'string' ? parsed.subtitle.slice(0, 80) : '',
            description: typeof parsed.description === 'string' ? parsed.description.slice(0, 400) : '',
            strengths: Array.isArray(parsed.strengths)
                ? parsed.strengths.filter((s: unknown): s is string => typeof s === 'string').slice(0, 5)
                : [],
            weaknesses: Array.isArray(parsed.weaknesses)
                ? parsed.weaknesses.filter((s: unknown): s is string => typeof s === 'string').slice(0, 5)
                : [],
            recommendation: typeof parsed.recommendation === 'string' ? parsed.recommendation.slice(0, 200) : '',
            source: 'llm',
        };
    } catch (err) {
        console.error('[brand-personality-llm] failed:', (err as Error).message);
        return null;
    }
}

function parseJsonRobust<T>(text: string): T | null {
    try { return JSON.parse(text) as T; } catch { /* continue */ }
    const fence = text.match(/```(?:json)?\s*([\s\S]+?)```/);
    if (fence) {
        try { return JSON.parse(fence[1].trim()) as T; } catch { /* continue */ }
    }
    const block = text.match(/\{[\s\S]+\}/);
    if (block) {
        try { return JSON.parse(block[0]) as T; } catch { /* fall through */ }
    }
    return null;
}
