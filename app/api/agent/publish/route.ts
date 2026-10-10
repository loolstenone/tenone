/**
 * 에이전트 확인 후 게시 API
 * POST /api/agent/publish  { taskId, content, route, asDraft }
 */
import { NextRequest, NextResponse } from 'next/server';
import { publishContent } from '@/lib/agent/publisher';
import type { GeneratedContent } from '@/lib/agent/writer';
import type { RouteResult } from '@/lib/agent/router';
import { isInternalRequest } from '@/lib/api-guard';

export async function POST(request: NextRequest) {
    // 내부 키 검증 — 미설정 키는 거부·길이 검증 (문자열 비교는 env 비면 'Bearer undefined'로 통과, 2026-10-11)
    if (!isInternalRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
