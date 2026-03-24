/**
 * 에이전트 확인 후 게시 API
 * POST /api/agent/publish  { taskId, content, route, asDraft }
 */
import { NextRequest, NextResponse } from 'next/server';
import { publishContent } from '@/lib/agent/publisher';
import type { GeneratedContent } from '@/lib/agent/writer';
import type { RouteResult } from '@/lib/agent/router';

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { content, route, asDraft } = await request.json() as {
            content: GeneratedContent;
            route: RouteResult;
            asDraft?: boolean;
        };

        if (!content || !route) {
            return NextResponse.json({ error: 'content and route required' }, { status: 400 });
        }

        const result = await publishContent(content, route, asDraft);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Agent publish error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Publish failed' },
            { status: 500 }
        );
    }
}
