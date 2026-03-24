/**
 * AI 에이전트 — 리서치 모듈
 * Anthropic API + web_search 도구로 최신 트렌드 검색
 */
import Anthropic from '@anthropic-ai/sdk';
import { RESEARCH_PROMPT } from './prompts/system';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ResearchFinding {
    title: string;
    summary: string;
    source: string;
    relevance: string;
}

export interface ResearchResult {
    topic: string;
    findings: ResearchFinding[];
    recommended_angle: string;
    keywords: string[];
}

export async function research(topic: string): Promise<ResearchResult> {
    const response = await anthropic.messages.create({
        model: process.env.AGENT_DEFAULT_MODEL || 'claude-sonnet-4-6',
        max_tokens: 4096,
        tools: [
            {
                type: 'web_search_20250305' as unknown as 'computer_20250124',
                name: 'web_search',
            } as unknown as Anthropic.Messages.Tool,
        ],
        messages: [
            {
                role: 'user',
                content: RESEARCH_PROMPT(topic),
            },
        ],
    });

    // 응답에서 텍스트 블록 추출
    const textBlock = response.content.find((b: { type: string }) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from research');
    }

    // JSON 파싱
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse research JSON');
    }

    return JSON.parse(jsonMatch[0]) as ResearchResult;
}
