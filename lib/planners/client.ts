// Planner's Planner AI — Supabase 클라이언트 헬퍼

import { createAdminClient } from '@/lib/supabase/admin';
import type { PlannerUser, PlannerIdentity, PlannerDaily, PlannerWeekly, PlannerProject } from './types';

export async function getPlannerUser(memberId: string): Promise<PlannerUser | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('planners_users')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();
    return data as PlannerUser | null;
}

export async function createPlannerUser(memberId: string, data: Partial<PlannerUser>): Promise<PlannerUser | null> {
    const supabase = createAdminClient();
    const { data: row } = await supabase
        .from('planners_users')
        .insert({ member_id: memberId, ...data })
        .select()
        .single();
    return row as PlannerUser | null;
}

export async function updatePlannerUser(memberId: string, patch: Partial<PlannerUser>): Promise<void> {
    const supabase = createAdminClient();
    await supabase
        .from('planners_users')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('member_id', memberId);
}

export async function getIdentity(memberId: string): Promise<PlannerIdentity | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('planners_identities')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();
    return data as PlannerIdentity | null;
}

export async function upsertIdentity(memberId: string, patch: Partial<PlannerIdentity>): Promise<void> {
    const supabase = createAdminClient();
    await supabase
        .from('planners_identities')
        .upsert(
            { member_id: memberId, ...patch, updated_at: new Date().toISOString() },
            { onConflict: 'member_id' }
        );
}

export async function getDaily(memberId: string, date: string): Promise<PlannerDaily | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('planners_daily')
        .select('*')
        .eq('member_id', memberId)
        .eq('date', date)
        .maybeSingle();
    return data as PlannerDaily | null;
}

export async function upsertDaily(memberId: string, date: string, patch: Partial<PlannerDaily>): Promise<PlannerDaily | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('planners_daily')
        .upsert(
            { member_id: memberId, date, ...patch, updated_at: new Date().toISOString() },
            { onConflict: 'member_id,date' }
        )
        .select()
        .single();
    return data as PlannerDaily | null;
}

export async function getWeekly(memberId: string, year: number, week: number): Promise<PlannerWeekly | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('planners_weekly')
        .select('*')
        .eq('member_id', memberId)
        .eq('year', year)
        .eq('week', week)
        .maybeSingle();
    return data as PlannerWeekly | null;
}

export async function upsertWeekly(
    memberId: string,
    year: number,
    week: number,
    weekStart: string,
    weekEnd: string,
    patch: Partial<PlannerWeekly>
): Promise<PlannerWeekly | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('planners_weekly')
        .upsert(
            {
                member_id: memberId,
                year,
                week,
                week_start: weekStart,
                week_end: weekEnd,
                ...patch,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'member_id,year,week' }
        )
        .select()
        .single();
    return data as PlannerWeekly | null;
}

export async function listProjects(memberId: string, status?: string): Promise<PlannerProject[]> {
    const supabase = createAdminClient();
    let q = supabase.from('planners_projects').select('*').eq('member_id', memberId).order('order_index');
    if (status) q = q.eq('status', status);
    const { data } = await q;
    return (data ?? []) as PlannerProject[];
}

export async function createProject(memberId: string, data: Partial<PlannerProject>): Promise<PlannerProject | null> {
    const supabase = createAdminClient();
    const { data: row } = await supabase
        .from('planners_projects')
        .insert({ member_id: memberId, ...data })
        .select()
        .single();
    return row as PlannerProject | null;
}
