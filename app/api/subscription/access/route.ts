/**
 * 구독 접근 권한 확인 API
 * GET /api/subscription/access?userId=xxx&service=wio&feature=ai_agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { hasAccess } from '@/lib/supabase/wio';

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');
    const service = request.nextUrl.searchParams.get('service');
    const feature = request.nextUrl.searchParams.get('feature') || undefined;

    if (!userId || !service) {
        return NextResponse.json({ error: 'userId and service required' }, { status: 400 });
    }

    try {
        const result = await hasAccess(userId, service, feature);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Access check failed' }, { status: 500 });
    }
}
