/**
 * AI 에이전트 — 사이트 분기 모듈
 * 콘텐츠 성격 분석 → 최적 사이트 판단
 */
import Anthropic from '@anthropic-ai/sdk';
import { ROUTE_PROMPT } from './prompts/system';
import type { SiteCode } from '@/types/board';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface RouteResult {
    site: SiteCode;
    board: string;
    reason: string;
}

/**
 * 콘텐츠를 어떤 사이트에 올릴지 판단
 * explicitSite가 지정되면 그대로 사용, 미지정 시 AI 판단
 */
export async function routeContent(
    title: string,
    summary: string,
    explicitSite?: SiteCode,
    explicitBoard?: string
): Promise<RouteResult> {
    // 사이트가 명시적으로 지정된 경우
    if (explicitSite) {
        return {
            site: explicitSite,
            board: explicitBoard || getDefaultBoard(explicitSite),
            reason: '운영자 지정',
        };
    }

    // AI 판단
    const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [
            {
                role: 'user',
                content: ROUTE_PROMPT(title, summary),
            },
        ],
    });

    const textBlock = response.content.find((b: { type: string }) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
        // 기본값: tenone
        return { site: 'tenone', board: 'insights', reason: 'fallback' };
    }

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        return { site: 'tenone', board: 'insights', reason: 'parse failed' };
    }

    return JSON.parse(jsonMatch[0]) as RouteResult;
}

/** 사이트별 기본 게시판 */
function getDefaultBoard(site: SiteCode): string {
    const defaults: Record<SiteCode, string> = {
        tenone: 'insights',
        madleague: 'news',
        madleap: 'activity',
        youinone: 'project',
        fwn: 'community',
        badak: 'industry',
        hero: 'talent',
        ogamja: 'content',
    };
    return defaults[site] || 'general';
}
