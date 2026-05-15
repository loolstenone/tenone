// LLM Insights — V2.1 § 1.10 정직 원칙
//
// 기존 [insights.ts](insights.ts) `computeInsights`의 자동 인사이트 텍스트는 단순 임계값 분기 ("📈 N점 상승")
// → 진짜 분석 아님. LLM이 시계열 데이터를 보고 "왜 변동? 무엇이 효과적?" 동적 분석.
//
// 비용: ~$0.002/scan (단일 호출, ~800 input + ~400 output tokens)

import Anthropic from '@anthropic-ai/sdk';
import type { ScanTimePoint } from './insights';

const MODEL = 'claude-haiku-4-5-20251001';

export interface LlmInsight {
    headline: string;       // 한 줄 요약 (≤60자)
    explanation: string;    // 변동 원인 추정 (한국어, 2~3 문장)
    nextAction: string;     // 다음 행동 (한 문장)
    source: 'llm';
}

const SYSTEM_PROMPT = `당신은 SmarComm Index 시계열 분석 전문가입니다.
도메인의 최근 진단 점수 변화를 보고 "왜 변동했는지" 동적으로 분석합니다.

반드시 다음 JSON으로만 응답 (코드 펜스 불필요):
{
  "headline": "한 줄 요약 (≤60자, 변동 방향과 핵심 원인 포함)",
  "explanation": "변동 원인 추정 (한국어, 2~3 문장, 구체적 점수 수치 + 어떤 축이 변동했는지)",
  "nextAction": "이 트렌드에서 다음으로 할 일 한 문장"
}

지침:
- 단순 "Index 상승/하락" 같은 임계값 분기 금지. Findability·Trust·Citability 어느 축이 가장 큰 변동인지 명시.
- 변동 없음일 때도 "정체 원인 추정" + "어떤 액션으로 돌파"를 제시.
- 진단 횟수가 1회면 "비교 불가, 정기 재진단 필요" 설명.`;

export async function analyzeInsightsLLM(
    scans: ScanTimePoint[],
    apiKey?: string,
): Promise<LlmInsight | null> {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) return null;
    if (scans.length === 0) return null;

    const sorted = [...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const n = sorted.length;
    const latest = sorted[n - 1];
    const oldest = sorted[0];

    const timeline = sorted.slice(-10).map((s, i) => {
        const date = new Date(s.created_at).toLocaleDateString('ko-KR');
        return `${i + 1}. [${date}] Index ${s.smarcomm_index} (F${s.findability_score} T${s.trust_score} C${s.citability_score}) Grade ${s.grade}`;
    }).join('\n');

    const client = new Anthropic({ apiKey: key });

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 500,
            system: SYSTEM_PROMPT,
            messages: [{
                role: 'user',
                content: `진단 ${n}회 시계열:
${timeline}

요약:
- 첫 진단: ${new Date(oldest.created_at).toLocaleDateString('ko-KR')} → Index ${oldest.smarcomm_index}
- 최신 진단: ${new Date(latest.created_at).toLocaleDateString('ko-KR')} → Index ${latest.smarcomm_index}
- Δ Index: ${latest.smarcomm_index - oldest.smarcomm_index}점
- Δ Findability: ${latest.findability_score - oldest.findability_score}점
- Δ Trust: ${latest.trust_score - oldest.trust_score}점
- Δ Citability: ${latest.citability_score - oldest.citability_score}점

이 시계열의 인사이트를 JSON으로 답하세요.`,
            }],
        });

        const text = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text).join('');

        const parsed = parseJsonRobust<{
            headline?: unknown; explanation?: unknown; nextAction?: unknown;
        }>(text);
        if (!parsed) return null;

        return {
            headline: typeof parsed.headline === 'string' ? parsed.headline.slice(0, 120) : '',
            explanation: typeof parsed.explanation === 'string' ? parsed.explanation.slice(0, 400) : '',
            nextAction: typeof parsed.nextAction === 'string' ? parsed.nextAction.slice(0, 200) : '',
            source: 'llm',
        };
    } catch (err) {
        console.error('[insights-llm] failed:', (err as Error).message);
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
