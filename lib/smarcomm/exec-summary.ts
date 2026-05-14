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
