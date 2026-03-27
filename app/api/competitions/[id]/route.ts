/**
 * 경연 상세 API
 * GET /api/competitions/:id
 * PUT /api/competitions/:id
 */
import { NextRequest, NextResponse } from 'next/server';
import * as competitionDb from '@/lib/supabase/competition';
import type { UpdateCompetitionInput } from '@/lib/supabase/competition';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const competition = await competitionDb.fetchCompetitionById(id);
        if (!competition) {
            return NextResponse.json({ error: 'Competition not found' }, { status: 404 });
        }
        return NextResponse.json(competition);
    } catch (error) {
        console.error('fetchCompetition error:', error);
        return NextResponse.json({ error: 'Failed to fetch competition' }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json() as UpdateCompetitionInput;
        const competition = await competitionDb.updateCompetition(id, body);
        return NextResponse.json(competition);
    } catch (error) {
        console.error('updateCompetition error:', error);
        return NextResponse.json({ error: 'Failed to update competition' }, { status: 500 });
    }
}
