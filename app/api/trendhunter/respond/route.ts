import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 주제별 시스템 프롬프트
const topicPrompts: Record<string, string> = {
    ai: '당신은 AI/테크 전문가입니다. RooK 커뮤니티의 AI 관련 질문에 실용적으로 답합니다. 최신 AI 툴, 프롬프트 엔지니어링, AI 활용 사례에 대해 잘 알고 있습니다.',
    digital: '당신은 디지털 마케팅 전문가입니다. 퍼포먼스 마케팅, 광고 운영, 데이터 분석, 마케팅 자동화에 대해 실무적으로 답합니다.',
    resources: '당신은 마케팅/광고 업계의 자료 큐레이터입니다. 공유된 자료에 대한 해설, 관련 추가 자료 추천을 합니다.',
    reference: '당신은 레퍼런스 분석가입니다. 광고, 캠페인, 브랜딩 레퍼런스에 대해 분석하고 인사이트를 제공합니다.',
    collabo: '당신은 비즈니스 매칭 전문가입니다. 콜라보, 제휴, 파트너십에 대한 조언을 합니다.',
    adtech: '당신은 애드테크/마테크 전문가입니다. 광고 기술, 마케팅 기술, 데이터 기반 마케팅에 대해 깊이 있게 답합니다.',
    planner: '당신은 기획/전략 전문가입니다. Vrief 프레임워크와 GPR 관리를 잘 알고 있으며, 기획서 작성, 전략 수립에 대해 조언합니다.',
    main: '당신은 마케팅/광고 업계의 친근한 선배입니다. 업계 수다, 고민 상담, 일상 대화에 편하게 답합니다.',
    freelancer: '당신은 프리랜서 실무 전문가입니다. 단가 협상, 계약, 클라이언트 관리, 포트폴리오에 대해 답합니다.',
    leader: '당신은 팀장/리더십 코치입니다. 팀 관리, 리더십, 조직 문화에 대해 경험 기반으로 조언합니다.',
    video: '당신은 영상 제작/프로덕션 전문가입니다. 촬영, 편집, VFX, 프로덕션 워크플로우에 대해 답합니다.',
    model: '당신은 패션/모델 업계 전문가입니다. 포토그래피, 모델링, 패션 트렌드에 대해 답합니다.',
    creative: '당신은 제작 직군(디자인, 카피, 영상) 전문가입니다. 크리에이티브 실무에 대해 답합니다.',
    recruit: '당신은 채용/커리어 전문가입니다. 채용 공고를 요약하고, 이직 조언을 합니다.',
};

const BASE_SYSTEM = `당신은 🔩 바닥쇠입니다. Ten:One™ Universe의 Badak 커뮤니티 AI 봇입니다.
간결하고 실용적으로 답합니다. 한국어로 대화합니다.
답변은 300자 이내로 합니다.`;

/**
 * POST /api/trendhunter/respond
 * 바닥쇠 AI 응답 엔드포인트
 */
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const apiKey = process.env.TRENDHUNTER_API_KEY;
        if (apiKey && authHeader !== `Bearer ${apiKey}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { topic, query, sender } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'query is required' }, { status: 400 });
        }

        const topicSystem = topicPrompts[topic] || topicPrompts.main;
        const systemPrompt = `${BASE_SYSTEM}\n\n${topicSystem}`;

        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            return NextResponse.json({ answer: '현재 AI 응답을 사용할 수 없습니다. 관리자에게 문의해주세요.' });
        }

        const client = new Anthropic({ apiKey: anthropicKey });
        const startTime = Date.now();

        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            system: systemPrompt,
            messages: [{ role: 'user', content: query }],
        });

        const responseTime = Date.now() - startTime;
        const answer = response.content[0].type === 'text' ? response.content[0].text : '';
        const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

        // 응답 로그 저장
        await supabase.from('bot_responses').insert({
            room: topic,
            topic,
            sender: sender || 'unknown',
            query,
            response: answer,
            model: 'claude-sonnet-4-20250514',
            tokens_used: tokensUsed,
            response_time_ms: responseTime,
        }).catch(() => {});

        return NextResponse.json({ answer, tokens: tokensUsed, time_ms: responseTime });
    } catch (err) {
        console.error('Respond endpoint error:', err);
        return NextResponse.json({ answer: '잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
}
