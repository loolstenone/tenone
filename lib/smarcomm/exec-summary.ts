// Executive Summary 자동 생성 — Claude Haiku로 3줄 요약
//
// 입력: 분석 결과 (점수·이슈·강점)
// 출력: 3문장 — 잘된것·문제·다음 행동
//
// 마케터가 30초만에 의사결정 가능하도록.

import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult } from './seo-analyzer';
import type { IndexBreakdown } from './index-calculator';

export interface ExecSummary {
    winning: string;          // 한 문장 — 잘된 것
    problem: string;          // 한 문장 — 가장 큰 문제
    nextAction: string;       // 한 문장 — 다음 한 가지 행동
    generatedAt: string;
}

const MODEL = 'claude-haiku-4-5-20251001';

export async function generateExecSummary(
    result: AnalysisResult,
    breakdown: IndexBreakdown,
    apiKey?: string,
): Promise<ExecSummary | null> {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) return null;

    // 최상위 강점·약점 자동 추출
    const allItems = [...result.techSeo, ...result.contentSeo, ...result.geoReadiness];
    const passing = allItems.filter(i => i.maxScore > 0 && i.score / i.maxScore >= 0.9).slice(0, 3);
    const failing = allItems.filter(i => i.maxScore > 0 && i.score / i.maxScore < 0.4).slice(0, 3);

    const prompt = `당신은 마케팅 컨설턴트입니다. SEO/AI 검색 진단 결과를 마케터에게 30초만에 전달할 수 있는 3문장 요약을 작성하세요.

진단 결과:
- SmarComm Index: ${breakdown.index} (Grade ${breakdown.grade})
- Findability: ${breakdown.findability} / Trust: ${breakdown.trust} / Citability: ${breakdown.citability}

잘된 것 (점수 높음):
${passing.map(i => `- ${i.name}: ${i.description}`).join('\n')}

문제 (점수 낮음):
${failing.map(i => `- ${i.name}: ${i.description}`).join('\n')}

다음 형식 JSON으로만 응답하세요 (다른 설명 X):
{
  "winning": "한 문장 — 잘된 점, 마케팅 의사결정에 도움되는 사실 위주, 30자 내외",
  "problem": "한 문장 — 가장 큰 문제, 매출/노출에 미치는 영향 명시, 40자 내외",
  "nextAction": "한 문장 — 가장 큰 임팩트의 다음 1가지 행동, 구체적·실행 가능, 40자 내외"
}`;

    try {
        const client = new Anthropic({ apiKey: key });
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 400,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text)
            .join('');

        // JSON 추출
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return null;
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.winning || !parsed.problem || !parsed.nextAction) return null;

        return {
            winning: String(parsed.winning),
            problem: String(parsed.problem),
            nextAction: String(parsed.nextAction),
            generatedAt: new Date().toISOString(),
        };
    } catch (err) {
        console.error('[exec-summary] generation failed:', err);
        return null;
    }
}

// Action Plan — Impact × Effort 매트릭스
export interface ActionItem {
    title: string;
    category: string;            // '기술 SEO' | '콘텐츠 SEO' | 'GEO' | 'Trust' | '구조화'
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    quadrant: 'quick-win' | 'major' | 'fill-in' | 'avoid';   // Impact×Effort 2×2
    role: 'marketer' | 'dev' | 'writer' | 'designer';
    estimatedPoints: number;     // 적용 시 예상 점수 변화
    action: string;
    description: string;
}

const ACTION_RULES: Array<{
    matchName: string;
    impact: ActionItem['impact'];
    effort: ActionItem['effort'];
    role: ActionItem['role'];
    estimatedPoints: number;
}> = [
    { matchName: 'llms.txt', impact: 'high', effort: 'low', role: 'dev', estimatedPoints: 5 },
    { matchName: 'Canonical URL', impact: 'high', effort: 'low', role: 'dev', estimatedPoints: 5 },
    { matchName: 'AI 봇 Access', impact: 'high', effort: 'low', role: 'dev', estimatedPoints: 10 },
    { matchName: '구조화 데이터', impact: 'high', effort: 'medium', role: 'dev', estimatedPoints: 8 },
    { matchName: 'FAQ', impact: 'high', effort: 'medium', role: 'writer', estimatedPoints: 12 },
    { matchName: '크롤링 접근성', impact: 'high', effort: 'low', role: 'dev', estimatedPoints: 5 },
    { matchName: '메타 디스크립션', impact: 'medium', effort: 'low', role: 'marketer', estimatedPoints: 4 },
    { matchName: '타이틀 태그', impact: 'high', effort: 'low', role: 'marketer', estimatedPoints: 6 },
    { matchName: 'OG 태그', impact: 'medium', effort: 'low', role: 'designer', estimatedPoints: 4 },
    { matchName: '이미지 ALT', impact: 'medium', effort: 'medium', role: 'designer', estimatedPoints: 5 },
    { matchName: '콘텐츠 볼륨', impact: 'high', effort: 'high', role: 'writer', estimatedPoints: 8 },
    { matchName: '보안 헤더', impact: 'medium', effort: 'medium', role: 'dev', estimatedPoints: 4 },
    { matchName: '페이지 로딩', impact: 'high', effort: 'high', role: 'dev', estimatedPoints: 8 },
    { matchName: '모바일 최적화', impact: 'high', effort: 'low', role: 'dev', estimatedPoints: 5 },
    { matchName: 'HTTPS', impact: 'high', effort: 'medium', role: 'dev', estimatedPoints: 5 },
    { matchName: '인덱싱', impact: 'high', effort: 'low', role: 'dev', estimatedPoints: 5 },
    { matchName: '사이트 링크', impact: 'medium', effort: 'medium', role: 'writer', estimatedPoints: 3 },
    { matchName: '언어 설정', impact: 'low', effort: 'low', role: 'dev', estimatedPoints: 2 },
];

function determineQuadrant(impact: ActionItem['impact'], effort: ActionItem['effort']): ActionItem['quadrant'] {
    const isHighImpact = impact === 'high';
    const isLowEffort = effort === 'low';
    if (isHighImpact && isLowEffort) return 'quick-win';
    if (isHighImpact && !isLowEffort) return 'major';
    if (!isHighImpact && isLowEffort) return 'fill-in';
    return 'avoid';
}

/**
 * @deprecated V2.1 § 1.10 정직 원칙 — 18 ACTION_RULES 휴리스틱 매핑은 정직하지 못함.
 * 신규 코드는 `buildActionPlanLLM` 사용 (Claude Haiku로 fail 카드 + 사이트 정보 기반 추천).
 */
export function buildActionPlan(result: AnalysisResult): ActionItem[] {
    const allItems = [...result.techSeo, ...result.contentSeo, ...result.geoReadiness];
    const fails = allItems.filter(i => i.maxScore > 0 && (i.status === 'fail' || i.status === 'warning'));

    const actions: ActionItem[] = [];
    for (const item of fails) {
        // 이름 매칭
        const rule = ACTION_RULES.find(r => item.name.includes(r.matchName)) ?? {
            impact: 'medium' as const,
            effort: 'medium' as const,
            role: 'marketer' as const,
            estimatedPoints: 3,
        };

        const category = result.techSeo.includes(item)
            ? '기술 SEO'
            : result.contentSeo.includes(item)
                ? '콘텐츠 SEO'
                : 'GEO';

        actions.push({
            title: item.name,
            category,
            impact: rule.impact,
            effort: rule.effort,
            quadrant: determineQuadrant(rule.impact, rule.effort),
            role: rule.role,
            estimatedPoints: rule.estimatedPoints,
            action: item.action,
            description: item.description,
        });
    }

    // 정렬 — quick-win 먼저, 그 다음 major, fill-in, avoid
    const QUADRANT_ORDER: Record<ActionItem['quadrant'], number> = { 'quick-win': 0, 'major': 1, 'fill-in': 2, 'avoid': 3 };
    actions.sort((a, b) => {
        const qd = QUADRANT_ORDER[a.quadrant] - QUADRANT_ORDER[b.quadrant];
        if (qd !== 0) return qd;
        return b.estimatedPoints - a.estimatedPoints;
    });

    return actions;
}

// ─────────────────────────────────────────────────────────────
// V2.1 § 1.10 정직 원칙 — LLM 기반 Action Plan
//
// 휴리스틱 18 ACTION_RULES 폐기. Claude Haiku에게 fail 카드 + 사이트 컨텍스트를 주고
// impact·effort·role·estimatedPoints·action 추천 요청.
//
// 비용: ~$0.005/scan (단일 호출, ~1200 input + ~600 output tokens)
// API 키 없으면 null — UI에서 "Phase 5 권장 / LLM 미가용" 안내
// ─────────────────────────────────────────────────────────────

const ACTION_PLAN_SYSTEM_PROMPT = `당신은 마케팅 컨설턴트입니다. SEO/AI 검색 진단의 fail/warning 카드를 보고
각 카드에 대한 Impact·Effort·담당 역할·예상 점수 변화·구체적 액션을 추천합니다.

반드시 다음 JSON 형식으로만 응답 (코드 펜스 불필요):
{
  "actions": [
    {
      "title": "카드 이름 그대로",
      "category": "기술 SEO" | "콘텐츠 SEO" | "GEO" | "Trust" | "구조화",
      "impact": "high" | "medium" | "low",
      "effort": "low" | "medium" | "high",
      "role": "marketer" | "dev" | "writer" | "designer",
      "estimatedPoints": 1~15,
      "action": "구체적 한 줄 액션",
      "description": "왜 이게 중요한지 한 줄",
      "reason": "Impact·Effort 판단 근거 한 줄"
    }
  ]
}

지침:
- impact: 검색·AI 노출에 미치는 영향 (high = 점수 +5점 이상 잠재)
- effort: 마케터·개발자가 적용하는 부담 (low = 1시간 내, high = 며칠)
- role: 카드 성격에 맞는 담당 (코드 변경 = dev, 문구 = writer, 시각 = designer, 전략 = marketer)
- estimatedPoints: SmarComm Index 점수 변화 추정 (보수적으로)
- 우선순위는 quick-win(high impact + low effort) → major → fill-in → avoid 순으로`;

interface LlmActionResponse {
    actions?: unknown[];
}

export async function buildActionPlanLLM(
    result: AnalysisResult,
    breakdown: IndexBreakdown,
    apiKey?: string,
): Promise<(ActionItem & { reason: string; source: 'llm' })[] | null> {
    const key = apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!key) return null;

    const allItems = [...result.techSeo, ...result.contentSeo, ...result.geoReadiness];
    const fails = allItems.filter(i => i.maxScore > 0 && (i.status === 'fail' || i.status === 'warning'));
    if (fails.length === 0) return [];

    const client = new Anthropic({ apiKey: key });
    const cardsList = fails.map((f, i) => {
        const ratio = f.maxScore > 0 ? Math.round((f.score / f.maxScore) * 100) : 0;
        return `${i + 1}. [${f.name}] ${f.status.toUpperCase()} (${f.score}/${f.maxScore}점, ${ratio}%)
   - 진단: ${f.description}
   - 권장: ${f.action}`;
    }).join('\n\n');

    try {
        const response = await client.messages.create({
            model: MODEL,
            max_tokens: 2000,
            system: ACTION_PLAN_SYSTEM_PROMPT,
            messages: [{
                role: 'user',
                content: `SmarComm Index: ${breakdown.index} (Grade ${breakdown.grade})
Findability ${breakdown.findability} · Trust ${breakdown.trust} · Citability ${breakdown.citability}

다음 ${fails.length}개 fail/warning 카드에 대해 Action Plan을 JSON으로 답하세요.

${cardsList}`,
            }],
        });

        const text = response.content
            .filter((b): b is Anthropic.TextBlock => b.type === 'text')
            .map(b => b.text).join('');
        const parsed = parseJsonRobust<LlmActionResponse>(text);
        if (!parsed || !Array.isArray(parsed.actions)) return null;

        const validImpact: ActionItem['impact'][] = ['high', 'medium', 'low'];
        const validEffort: ActionItem['effort'][] = ['low', 'medium', 'high'];
        const validRole: ActionItem['role'][] = ['marketer', 'dev', 'writer', 'designer'];

        const actions = parsed.actions
            .map(a => {
                if (typeof a !== 'object' || a === null) return null;
                const o = a as Record<string, unknown>;
                const impact = (typeof o.impact === 'string' && validImpact.includes(o.impact as ActionItem['impact'])
                    ? o.impact : 'medium') as ActionItem['impact'];
                const effort = (typeof o.effort === 'string' && validEffort.includes(o.effort as ActionItem['effort'])
                    ? o.effort : 'medium') as ActionItem['effort'];
                const role = (typeof o.role === 'string' && validRole.includes(o.role as ActionItem['role'])
                    ? o.role : 'marketer') as ActionItem['role'];
                const title = typeof o.title === 'string' ? o.title : '';
                if (!title) return null;
                return {
                    title,
                    category: typeof o.category === 'string' ? o.category : '기타',
                    impact,
                    effort,
                    quadrant: determineQuadrant(impact, effort),
                    role,
                    estimatedPoints: typeof o.estimatedPoints === 'number' ? Math.max(0, Math.min(15, Math.round(o.estimatedPoints))) : 3,
                    action: typeof o.action === 'string' ? o.action.slice(0, 200) : '',
                    description: typeof o.description === 'string' ? o.description.slice(0, 200) : '',
                    reason: typeof o.reason === 'string' ? o.reason.slice(0, 200) : '',
                    source: 'llm' as const,
                };
            })
            .filter((a): a is NonNullable<typeof a> => a !== null);

        // 정렬
        const QUADRANT_ORDER: Record<ActionItem['quadrant'], number> = { 'quick-win': 0, 'major': 1, 'fill-in': 2, 'avoid': 3 };
        actions.sort((a, b) => {
            const qd = QUADRANT_ORDER[a.quadrant] - QUADRANT_ORDER[b.quadrant];
            if (qd !== 0) return qd;
            return b.estimatedPoints - a.estimatedPoints;
        });

        return actions;
    } catch (err) {
        console.error('[buildActionPlanLLM] failed:', (err as Error).message);
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
