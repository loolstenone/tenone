/**
 * WIO Competition 모듈 Supabase CRUD
 * competitions, competition_teams
 */
import { createClient as createBrowserClient } from '@supabase/supabase-js';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── 유틸 ──

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        result[camelKey] = value;
    }
    return result;
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined) continue;
        const snakeKey = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
        result[snakeKey] = value;
    }
    return result;
}

// ── Types ──

export interface Competition {
    id: string;
    brandId: string;
    title: string;
    description: string;
    status: 'upcoming' | 'open' | 'judging' | 'completed';
    teamSize: string;
    deadline: string;
    judgeDate: string;
    teamsRegistered: number;
    maxTeams: number;
    prizes: string[];
    categories: string[];
    createdAt: string;
    updatedAt: string;
}

export interface CompetitionTeam {
    id: string;
    competitionId: string;
    name: string;
    members: string[];
    score: number | null;
    rank: number | null;
    status: 'registered' | 'active' | 'disqualified' | 'winner';
    createdAt: string;
    updatedAt: string;
}

export interface CreateCompetitionInput {
    brandId: string;
    title: string;
    description: string;
    status?: string;
    teamSize?: string;
    deadline?: string;
    judgeDate?: string;
    maxTeams?: number;
    prizes?: string[];
    categories?: string[];
}

export interface UpdateCompetitionInput {
    title?: string;
    description?: string;
    status?: string;
    teamSize?: string;
    deadline?: string;
    judgeDate?: string;
    maxTeams?: number;
    prizes?: string[];
    categories?: string[];
}

export interface RegisterTeamInput {
    competitionId: string;
    name: string;
    members?: string[];
}

export interface UpdateTeamInput {
    name?: string;
    members?: string[];
    score?: number | null;
    rank?: number | null;
    status?: string;
}

function toCompetition(row: Record<string, unknown>): Competition {
    return snakeToCamel(row) as unknown as Competition;
}

function toTeam(row: Record<string, unknown>): CompetitionTeam {
    return snakeToCamel(row) as unknown as CompetitionTeam;
}

// ── Competitions ──

export async function fetchCompetitions(brandId?: string): Promise<Competition[]> {
    let query = supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false });

    if (brandId) query = query.eq('brand_id', brandId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(toCompetition);
}

export async function fetchCompetitionById(id: string): Promise<(Competition & { teams: CompetitionTeam[] }) | null> {
    const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;

    const competition = toCompetition(data);

    // 팀 목록 조인
    const { data: teamsData } = await supabase
        .from('competition_teams')
        .select('*')
        .eq('competition_id', id)
        .order('rank', { ascending: true, nullsFirst: false });

    const teams = (teamsData || []).map(toTeam);

    return { ...competition, teams };
}

export async function createCompetition(input: CreateCompetitionInput): Promise<Competition> {
    const row: Record<string, unknown> = {
        brand_id: input.brandId,
        title: input.title,
        description: input.description,
        status: input.status || 'upcoming',
        team_size: input.teamSize || '',
        deadline: input.deadline || null,
        judge_date: input.judgeDate || null,
        max_teams: input.maxTeams || 0,
        teams_registered: 0,
        prizes: input.prizes || [],
        categories: input.categories || [],
    };

    const { data, error } = await supabase
        .from('competitions')
        .insert(row)
        .select()
        .single();
    if (error) throw error;
    return toCompetition(data);
}

export async function updateCompetition(id: string, input: UpdateCompetitionInput): Promise<Competition> {
    const row = camelToSnake(input as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('competitions')
        .update(row)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return toCompetition(data);
}

// ── Teams ──

export async function fetchTeams(competitionId: string): Promise<CompetitionTeam[]> {
    const { data, error } = await supabase
        .from('competition_teams')
        .select('*')
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(toTeam);
}

export async function registerTeam(input: RegisterTeamInput): Promise<CompetitionTeam> {
    const row: Record<string, unknown> = {
        competition_id: input.competitionId,
        name: input.name,
        members: input.members || [],
        status: 'registered',
    };

    const { data, error } = await supabase
        .from('competition_teams')
        .insert(row)
        .select()
        .single();
    if (error) throw error;

    // teams_registered 카운트 증가
    await supabase.rpc('increment_teams_registered', { p_competition_id: input.competitionId }).catch(() => {
        // RPC 없으면 수동 업데이트
        supabase
            .from('competitions')
            .select('teams_registered')
            .eq('id', input.competitionId)
            .single()
            .then(({ data: comp }) => {
                if (comp) {
                    supabase
                        .from('competitions')
                        .update({ teams_registered: (comp.teams_registered || 0) + 1 })
                        .eq('id', input.competitionId)
                        .then(() => {});
                }
            });
    });

    return toTeam(data);
}

export async function updateTeam(id: string, input: UpdateTeamInput): Promise<CompetitionTeam> {
    const row = camelToSnake(input as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('competition_teams')
        .update(row)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return toTeam(data);
}
