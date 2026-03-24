/**
 * AI 에이전트 — 콘텐츠 생성 모듈
 * 리서치 결과 → 텐원 스타일 콘텐츠
 */
import Anthropic from '@anthropic-ai/sdk';
import { TENONE_SYSTEM_PROMPT, WRITE_PROMPT } from './prompts/system';
import type { ResearchResult } from './researcher';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface GeneratedContent {
    title: string;
    content: string;     // HTML
    excerpt: string;
    category: string;
    tags: string[];
}

export async function generateContent(
    site: string,
    researchResult: ResearchResult,
    model?: string
): Promise<GeneratedContent> {
    const response = await anthropic.messages.create({
        model: model || process.env.AGENT_DEFAULT_MODEL || 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: TENONE_SYSTEM_PROMPT,
        messages: [
            {
                role: 'user',
                content: WRITE_PROMPT(site, JSON.stringify(researchResult, null, 2)),
            },
        ],
    });

    const textBlock = response.content.find((b: { type: string }) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
        throw new Error('No text response from writer');
    }

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse content JSON');
    }

    const result = JSON.parse(jsonMatch[0]) as GeneratedContent;

    // 토큰 사용량 로깅
    console.log(`[Agent Writer] tokens: input=${response.usage.input_tokens} output=${response.usage.output_tokens}`);

    return result;
}
