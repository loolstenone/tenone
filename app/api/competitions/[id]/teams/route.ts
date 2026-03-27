/**
 * 경연 팀 API
 * GET  /api/competitions/:id/teams
 * POST /api/competitions/:id/teams
 */
import { NextRequest, NextResponse } from 'next/server';
import * as competitionDb from '@/lib/supabase/competition';
import type { RegisterTeamInput } from '@/lib/supabase/competition';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const teams = await competitionDb.fetchTeams(id);
        return NextResponse.json(teams);
    } catch (error) {
        console.error('fetchTeams error:', error);
        return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json() as Omit<RegisterTeamInput, 'competitionId'>;

        if (!body.name) {
            return NextResponse.json(
                { error: 'name is required' },
                { status: 400 }
            );
        }

        const team = await competitionDb.registerTeam({
            competitionId: id,
            name: body.name,
            members: body.members,
        });
        return NextResponse.json(team, { status: 201 });
    } catch (error) {
        console.error('registerTeam error:', error);
        return NextResponse.json({ error: 'Failed to register team' }, { status: 500 });
    }
}
