/**
 * 게시판 설정 API
 * GET  /api/board/configs?site=tenone
 * POST /api/board/configs  (관리자 — 게시판 생성/수정)
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

export async function POST(request: NextRequest) {
    try {
        // Admin API Key 체크
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const config = await boardDb.upsertBoardConfig(body);
        return NextResponse.json(config, { status: 201 });
    } catch (error) {
        console.error('upsertBoardConfig error:', error);
        return NextResponse.json({ error: 'Failed to upsert config' }, { status: 500 });
    }
}
