// Myverse AI — Supabase 클라이언트 헬퍼

import { createAdminClient } from '@/lib/supabase/admin';
import type { MyverseUser, MyverseIdentity, MyverseDaily, MyverseWeekly, MyverseProject } from './types';

export async function getMyverseUser(memberId: string): Promise<MyverseUser | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('myverse_users')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();
    return data as MyverseUser | null;
}

export async function createMyverseUser(memberId: string, data: Partial<MyverseUser>): Promise<MyverseUser | null> {
    const supabase = createAdminClient();
    const { data: row } = await supabase
        .from('myverse_users')
        .insert({ member_id: memberId, ...data })
        .select()
        .single();
    return row as MyverseUser | null;
}

export async function updateMyverseUser(memberId: string, patch: Partial<MyverseUser>): Promise<void> {
    const supabase = createAdminClient();
    await supabase
        .from('myverse_users')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('member_id', memberId);
}

export async function getIdentity(memberId: string): Promise<MyverseIdentity | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('myverse_identities')
        .select('*')
        .eq('member_id', memberId)
        .maybeSingle();
    return data as MyverseIdentity | null;
}

export async function upsertIdentity(memberId: string, patch: Partial<MyverseIdentity>): Promise<void> {
    const supabase = createAdminClient();
    await supabase
        .from('myverse_identities')
        .upsert(
            { member_id: memberId, ...patch, updated_at: new Date().toISOString() },
            { onConflict: 'member_id' }
        );
}

export async function getDaily(memberId: string, date: string): Promise<MyverseDaily | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('myverse_daily')
        .select('*')
        .eq('member_id', memberId)
        .eq('date', date)
        .maybeSingle();
    return data as MyverseDaily | null;
}

export async function upsertDaily(memberId: string, date: string, patch: Partial<MyverseDaily>): Promise<MyverseDaily | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('myverse_daily')
        .upsert(
            { member_id: memberId, date, ...patch, updated_at: new Date().toISOString() },
            { onConflict: 'member_id,date' }
        )
        .select()
        .single();
    return data as MyverseDaily | null;
}

export async function getWeekly(memberId: string, year: number, week: number): Promise<MyverseWeekly | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('myverse_weekly')
        .select('*')
        .eq('member_id', memberId)
        .eq('year', year)
        .eq('week', week)
        .maybeSingle();
    return data as MyverseWeekly | null;
}

export async function upsertWeekly(
    memberId: string,
    year: number,
    week: number,
    weekStart: string,
    weekEnd: string,
    patch: Partial<MyverseWeekly>
): Promise<MyverseWeekly | null> {
    const supabase = createAdminClient();
    const { data } = await supabase
        .from('myverse_weekly')
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
    return data as MyverseWeekly | null;
}

export async function listProjects(memberId: string, status?: string): Promise<MyverseProject[]> {
    const supabase = createAdminClient();
    let q = supabase.from('myverse_projects').select('*').eq('member_id', memberId).order('order_index');
    if (status) q = q.eq('status', status);
    const { data } = await q;
    return (data ?? []) as MyverseProject[];
}

export async function createProject(memberId: string, data: Partial<MyverseProject>): Promise<MyverseProject | null> {
    const supabase = createAdminClient();
    const { data: row } = await supabase
        .from('myverse_projects')
        .insert({ member_id: memberId, ...data })
        .select()
        .single();
    return row as MyverseProject | null;
}
