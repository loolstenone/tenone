/**
 * 10:01 프로토콜 — Vrief (브리핑) API
 * POST /api/agent/vrief  { type: "am" | "pm" }
 *
 * AM 10:01: 각 에이전트 현황 → 1001 취합 → 텐원에게 방향
 * PM 10:01: 각 에이전트 성과 → 1001 취합 → 텐원에게 결과
 */
import { NextRequest, NextResponse } from 'next/server';
import { invokeAgent } from '@/lib/agent/claude';
import { createClient } from '@/lib/supabase/server';
import { postAgentMessage } from '@/lib/supabase/chat';

const AM_PROMPT = `당신은 열시일분(10:01) 에이전트입니다. 아침 브리핑을 수행합니다.

지금은 AM 10:01입니다. Universe의 상황을 종합하여 텐원(대표)에게 보고하세요.

다음 형식으로 브리핑합니다:

## 📋 AM 10:01 브리핑

### 오늘의 상황
- 각 브랜드/에이전트 현황 요약

### 주요 이슈
- 긴급 또는 중요 사항

### 오늘의 방향 제안
- 텐원이 오늘 집중해야 할 1-2가지

### 에이전트 상태
| 에이전트 | 상태 | 요약 |
|---------|------|------|

간결하게, 핵심만 보고하세요.`;

const PM_PROMPT = `당신은 열시일분(10:01) 에이전트입니다. 저녁 성과 보고를 수행합니다.

지금은 PM 10:01입니다. 오늘 하루 Universe의 성과를 정리하여 텐원(대표)에게 보고하세요.

다음 형식으로 보고합니다:

## 📊 PM 10:01 성과 보고

### 오늘의 성과
- 완료된 작업, 달성한 지표

### GPR 결과
- Goal/Process/Result 기준 평가

### 내일 할 일
- 이어서 진행할 사항

### 에이전트 활동 로그
| 에이전트 | 활동 | 결과 |
|---------|------|------|

간결하게, 핵심만 보고하세요.`;

export async function POST(request: NextRequest) {
    // 인증: ADMIN_API_KEY 또는 내부 cron 호출
    const authHeader = request.headers.get('authorization');
    const cronSecret = request.headers.get('x-cron-secret');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}` && cronSecret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const type = (body as { type?: string }).type || 'am';
        const prompt = type === 'pm' ? PM_PROMPT : AM_PROMPT;

        // 1001 에이전트로 브리핑 실행
        const result = await invokeAgent({
            agentName: '1001',
            userMessage: prompt,
            correlationId: `vrief-${type}-${new Date().toISOString().slice(0, 10)}`,
        });

        // 결과를 agent_messages에 별도 기록 (vrief 타입)
        const supabase = await createClient();
        await supabase.from('agent_messages').insert({
            agent_name: '1001',
            message_type: 'vrief',
            content: result.response,
            correlation_id: `vrief-${type}-${new Date().toISOString().slice(0, 10)}`,
            confidence: result.confidence,
            metadata: { type, timestamp: new Date().toISOString() },
        });

        // #브리핑 채널에 자동 게시
        await postAgentMessage({
            channelName: '브리핑',
            agentName: '열시일분',
            content: `## ${type === 'am' ? 'AM' : 'PM'} 10:01 ${type === 'am' ? '브리핑' : '성과 보고'}\n\n${result.response}`,
        });

        return NextResponse.json({
            type,
            response: result.response,
            confidence: result.confidence,
            messageId: result.messageId,
        });
    } catch (error) {
        console.error('Vrief error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Vrief failed' },
            { status: 500 }
        );
    }
}
