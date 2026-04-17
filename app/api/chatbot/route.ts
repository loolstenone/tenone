import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SITE_PROMPTS: Record<string, string> = {
    badak: '당신은 바닥(Badak) 네트워킹 플랫폼의 챗봇입니다. 바닥은 같은 니즈를 가진 직장인들이 모임을 만들고 참여하는 커뮤니티입니다. 모임 개설, 참여 방법, 바닥장 신청 등에 대해 친절하게 안내해주세요.',
    default: '당신은 Ten:One Universe의 챗봇입니다. Ten:One은 다양한 브랜드와 커뮤니티를 운영하는 플랫폼입니다. 친절하고 간결하게 답변해주세요.',
};

export async function POST(request: NextRequest) {
    try {
        const { message, siteId, history = [] } = await request.json();

        if (!message?.trim()) {
            return NextResponse.json({ reply: '메시지를 입력해주세요.' });
        }

        const systemPrompt = SITE_PROMPTS[siteId] ?? SITE_PROMPTS.default;

        const messages = [
            ...history.slice(-6).map((m: { role: string; text: string }) => ({
                role: m.role as 'user' | 'assistant',
                content: m.text,
            })),
            { role: 'user' as const, content: message },
        ];

        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 400,
            system: systemPrompt,
            messages,
        });

        const reply = response.content[0].type === 'text' ? response.content[0].text : '죄송해요, 다시 시도해주세요.';
        return NextResponse.json({ reply });
    } catch {
        return NextResponse.json({ reply: '일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
}
