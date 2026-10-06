/**
 * 게시판 설정 API
 * GET  /api/board/configs?site=tenone
 * 게시판 생성·수정은 인트라(ums_boards, 직원 전용)에서
 */
import { NextRequest, NextResponse } from 'next/server';
import * as boardDb from '@/lib/supabase/board';
import type { SiteCode } from '@/types/board';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const site = searchParams.get('site') as SiteCode | null;
    const board = searchParams.get('board');

    try {
        const configs = await boardDb.fetchBoardConfigs(site || undefined, board || undefined);
        return NextResponse.json({ configs });
    } catch (error) {
        console.error('fetchBoardConfigs error:', error);
        return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 });
    }
}
