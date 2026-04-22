/**
 * Project Supabase CRUD 함수
 * projects, jobs, project_members, timesheets 테이블
 */
import { createClient } from './client';

const supabase = createClient();

// ── Projects ──

export async function fetchProjects(options?: {
    status?: string;
    type?: string;
    search?: string;
    limit?: number;
}) {
    let query = supabase.from('projects').select('*, pm:members!projects_pm_id_fkey(name)', { count: 'exact' });

    if (options?.status && options.status !== 'all') query = query.eq('status', options.status);
    if (options?.type && options.type !== 'all') query = query.eq('type', options.type);
    if (options?.search) query = query.ilike('name', `%${options.search}%`);

    query = query.order('created_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);

    const { data, error, count } = await query;
    if (error) throw error;
    return { projects: data || [], total: count || 0 };
}

export async function fetchProjectByCode(code: string) {
    const { data, error } = await supabase
        .from('projects')
        .select('*, pm:members!projects_pm_id_fkey(name)')
        .eq('code', code)
        .single();
    if (error) return null;
    return data;
}

export async function createProject(project: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateProject(id: string, updates: Record<string, unknown>) {
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Jobs ──

export async function fetchJobs(projectId: string) {
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('project_id', projectId)
        .order('seq');
    if (error) throw error;
    return data || [];
}

export async function fetchAllJobs(limit = 100) {
    const { data, error } = await supabase
        .from('jobs')
        .select('*, project:projects(name, code, status)')
        .order('seq')
        .limit(limit);
    if (error) throw error;
    return (data || []) as Record<string, unknown>[];
}

export async function createJob(job: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateJob(id: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Project Members ──

export async function fetchProjectMembers(projectId: string) {
    const { data, error } = await supabase
        .from('project_members')
        .select('*, member:members(name, avatar_initials, email)')
        .eq('project_id', projectId);
    if (error) throw error;
    return data || [];
}

export async function addProjectMember(pm: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('project_members')
        .insert(pm)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Timesheets ──

export async function fetchTimesheets(options: {
    memberId?: string;
    projectId?: string;
    weekStart?: string;
}) {
    let query = supabase.from('wio_timesheets').select('*, project:projects(name, code), job:jobs(name)');

    if (options.memberId) query = query.eq('member_id', options.memberId);
    if (options.projectId) query = query.eq('project_id', options.projectId);
    if (options.weekStart) {
        const weekEnd = new Date(options.weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        query = query.gte('work_date', options.weekStart).lte('work_date', weekEnd.toISOString().split('T')[0]);
    }

    query = query.order('work_date', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function upsertTimesheet(ts: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('wio_timesheets')
        .upsert(ts, { onConflict: 'member_id,job_id,work_date' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Member Active Jobs (타임시트용) ──

export async function fetchMemberActiveJobs(memberId: string) {
    const { data: pm } = await supabase
        .from('project_members')
        .select('project_id')
        .eq('member_id', memberId);

    const projectIds = ((pm || []) as Record<string, unknown>[]).map(m => m.project_id as string);
    if (!projectIds.length) return { projects: [], jobs: [] };

    const [projRes, jobsRes] = await Promise.all([
        supabase.from('projects')
            .select('id, code, name, status, start_date, end_date')
            .in('id', projectIds)
            .order('code'),
        supabase.from('jobs')
            .select('id, project_id, code, name, type, detail, estimated_hours')
            .in('project_id', projectIds)
            .order('seq'),
    ]);

    return {
        projects: (projRes.data || []) as Record<string, unknown>[],
        jobs: (jobsRes.data || []) as Record<string, unknown>[],
    };
}

export async function fetchAllTimesheetsForMember(memberId: string) {
    const { data, error } = await supabase
        .from('wio_timesheets')
        .select('job_id, work_date, hours')
        .eq('member_id', memberId)
        .order('work_date', { ascending: true });
    if (error) throw error;
    return (data || []) as { job_id: string; work_date: string; hours: number }[];
}

// 특정 Job의 actual_hours를 timesheets 합계로 재계산하여 jobs 테이블에 반영
export async function recalcActualHours(jobId: string): Promise<void> {
    const { data } = await supabase
        .from('wio_timesheets')
        .select('hours')
        .eq('job_id', jobId);
    const total = (data || []).reduce((s: number, r: { hours: number }) => s + (r.hours || 0), 0);
    await supabase.from('jobs').update({ actual_hours: total }).eq('id', jobId);
}

// ── 통계 ──

export async function getProjectStats() {
    const { data, error } = await supabase.from('projects').select('status, billing, revenue, profit');
    if (error) throw error;

    const stats = {
        total: data?.length || 0,
        inProgress: 0,
        completed: 0,
        totalBilling: 0,
        totalRevenue: 0,
        totalProfit: 0,
    };

    data?.forEach((p: Record<string, unknown>) => {
        if (p.status === 'in-progress') stats.inProgress++;
        if (p.status === 'completed') stats.completed++;
        stats.totalBilling += Number(p.billing) || 0;
        stats.totalRevenue += Number(p.revenue) || 0;
        stats.totalProfit += Number(p.profit) || 0;
    });

    return stats;
}
