/**
 * AI 에이전트 실행 API
 * POST /api/agent/run  { instruction: "..." }
 */
import { NextRequest, NextResponse } from 'next/server';
import { runAgent } from '@/lib/agent';

export async function POST(request: NextRequest) {
    // 관리자 인증
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { instruction, autoPublish } = await request.json();

        if (!instruction) {
            return NextResponse.json({ error: 'instruction required' }, { status: 400 });
        }

        // autoPublish 오버라이드
        if (autoPublish !== undefined) {
            process.env.AGENT_AUTO_PUBLISH = String(autoPublish);
        }

        const task = await runAgent(instruction);

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
