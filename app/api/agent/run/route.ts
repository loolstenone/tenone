/**
 * AI 에이전트 실행 API
 * POST /api/agent/run  { instruction: "..." }
 */
import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent';
import { isInternalRequest } from '@/lib/api-guard';

export async function POST(request: NextRequest) {
    // 관리자 인증
    // 내부 키 검증 — 미설정 키는 거부·길이 검증 (문자열 비교는 env 비면 'Bearer undefined'로 통과, 2026-10-11)
    if (!isInternalRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { instruction, autoPublish } = await request.json();

        if (!instruction) {
            return NextResponse.json({ error: 'instruction required' }, { status: 400 });
        }

        // autoPublish는 이 요청에만 적용 (process.env 변경은 인스턴스 전역에 남아 다음 요청까지 바꿨다)
        const task = await runAgent(instruction, undefined, autoPublish !== undefined ? { autoPublish: Boolean(autoPublish) } : undefined);

        return NextResponse.json({
            task: {
                id: task.id,
                phase: task.phase,
                topic: task.topic,
                site: task.site,
                research: task.research,
                content: task.content,
                route: task.route,
                publish: task.publish,
                error: task.error,
            },
        });
    } catch (error) {
        console.error('Agent run error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Agent failed' },
            { status: 500 }
        );
    }
}
