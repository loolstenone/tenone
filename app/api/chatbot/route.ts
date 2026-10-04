import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireUser } from '@/lib/api-guard';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SITE_PROMPTS: Record<string, string> = {
    badak: '당신은 바닥(Badak) 네트워킹 플랫폼의 AI 챗봇입니다. 바닥은 같은 니즈를 가진 직장인들이 모임을 만들고 참여하는 커뮤니티입니다. 모임 개설, 참여 방법, 바닥장 신청 등에 대해 친절하게 안내해주세요.',
    default: '당신은 Ten:One Universe의 AI 챗봇입니다. Ten:One은 다양한 브랜드와 커뮤니티를 운영하는 플랫폼입니다. 친절하고 간결하게 답변해주세요.',
};

const MAX_MESSAGE_CHARS = 1000;
const MAX_HISTORY = 6;

type HistoryItem = { role: 'user' | 'assistant'; text: string };

/** 클라이언트가 보낸 대화 이력은 신뢰하지 않는다 — role·길이 검증 후 사용 */
function sanitizeHistory(raw: unknown): HistoryItem[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter((m): m is HistoryItem =>
            !!m && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string')
        .slice(-MAX_HISTORY)
        .map(m => ({ role: m.role, text: m.text.slice(0, MAX_MESSAGE_CHARS) }));
}

// 로그인 회원 전용 — 비로그인 호출로 AI 비용이 발생하지 않도록 (2026-10-05)
export async function POST(request: NextRequest) {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) {
        return NextResponse.json({ reply: '로그인 후 이용할 수 있습니다.' }, { status: 401 });
    }

    try {
        const { message, siteId, history } = await request.json();

        if (typeof message !== 'string' || !message.trim()) {
            return NextResponse.json({ reply: '메시지를 입력해주세요.' });
        }
        if (message.length > MAX_MESSAGE_CHARS) {
            return NextResponse.json({ reply: `메시지는 ${MAX_MESSAGE_CHARS}자 이내로 입력해주세요.` }, { status: 400 });
        }

        const systemPrompt = SITE_PROMPTS[typeof siteId === 'string' ? siteId : ''] ?? SITE_PROMPTS.default;

        // 이력은 user로 시작해야 함 (인사말 assistant 메시지 제거)
        const past = sanitizeHistory(history);
        while (past.length && past[0].role === 'assistant') past.shift();

        const response = await client.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 400,
            system: systemPrompt,
            messages: [
                ...past.map(m => ({ role: m.role, content: m.text })),
                { role: 'user' as const, content: message },
            ],
        });

        const reply = response.content[0].type === 'text' ? response.content[0].text : '죄송해요, 다시 시도해주세요.';
        return NextResponse.json({ reply });
    } catch (e) {
        console.error('[chatbot] error:', e);
        return NextResponse.json({ reply: '일시적 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
}
