/**
 * 경연 팀 상세 API
 * PUT /api/competitions/:id/teams/:teamId
 */
import { NextRequest, NextResponse } from 'next/server';
import * as competitionDb from '@/lib/supabase/competition';
import type { UpdateTeamInput } from '@/lib/supabase/competition';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; teamId: string }> }
) {
    const { teamId } = await params;

    try {
        const body = await request.json() as UpdateTeamInput;
        const team = await competitionDb.updateTeam(teamId, body);
        return NextResponse.json(team);
    } catch (error) {
        console.error('updateTeam error:', error);
        return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
    }
}
