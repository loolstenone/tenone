/**
 * 경연 API
 * GET  /api/competitions?brandId=xxx
 * POST /api/competitions
 */
import { NextRequest, NextResponse } from 'next/server';
import * as competitionDb from '@/lib/supabase/competition';
import type { CreateCompetitionInput } from '@/lib/supabase/competition';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId') || undefined;

    try {
        const result = await competitionDb.fetchCompetitions(brandId);
        return NextResponse.json(result);
    } catch (error) {
        console.error('fetchCompetitions error:', error);
        return NextResponse.json({ error: 'Failed to fetch competitions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CreateCompetitionInput;

        if (!body.brandId || !body.title || !body.description) {
            return NextResponse.json(
                { error: 'brandId, title, description are required' },
                { status: 400 }
            );
        }

        const competition = await competitionDb.createCompetition(body);
        return NextResponse.json(competition, { status: 201 });
    } catch (error) {
        console.error('createCompetition error:', error);
        return NextResponse.json({ error: 'Failed to create competition' }, { status: 500 });
    }
}
