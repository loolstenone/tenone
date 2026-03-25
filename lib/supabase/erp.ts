/**
 * ERP Supabase CRUD 함수
 * approvals, timesheets (projects.ts에도 있음), point_logs
 */
import { createClient } from './client';

const supabase = createClient();

// ── Approvals (결재) ──

export async function fetchApprovals(options?: {
    status?: string;
    requesterId?: string;
    limit?: number;
}) {
    let query = supabase.from('approvals').select('*, requester:members!approvals_requester_id_fkey(name)', { count: 'exact' });

    if (options?.status && options.status !== 'all') query = query.eq('status', options.status);
    if (options?.requesterId) query = query.eq('requester_id', options.requesterId);

    query = query.order('created_at', { ascending: false });
    if (options?.limit) query = query.limit(options.limit);

    const { data, error, count } = await query;
    if (error) throw error;
    return { approvals: data || [], total: count || 0 };
}

export async function createApproval(approval: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('approvals')
        .insert(approval)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updateApprovalStatus(id: string, status: string, memo?: string) {
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (memo) updates.memo = memo;
    const { data, error } = await supabase
        .from('approvals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Point Logs ──

export async function fetchPointLogs(memberId: string, limit?: number) {
    let query = supabase.from('point_logs').select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function addPointLog(log: {
    member_id: string;
    points: number;
    reason: string;
    source_type?: string;
    source_id?: string;
}) {
    const { data, error } = await supabase
        .from('point_logs')
        .insert(log)
        .select()
        .single();
    if (error) throw error;

    // members.total_points 업데이트
    const { data: member } = await supabase
        .from('members')
        .select('total_points')
        .eq('id', log.member_id)
        .single();
    if (member) {
        await supabase.from('members').update({
            total_points: (member.total_points || 0) + log.points,
        }).eq('id', log.member_id);
    }

    return data;
}

// ── Notifications ──

export async function fetchNotifications(memberId: string, limit?: number) {
    let query = supabase.from('notifications').select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function markNotificationRead(id: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    if (error) throw error;
}

export async function createNotification(notif: {
    member_id: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
}) {
    const { data, error } = await supabase
        .from('notifications')
        .insert(notif)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Expenses (경비) ──

export async function fetchExpenses(params?: { memberId?: string; projectId?: string; status?: string; limit?: number }) {
    let query = supabase.from('expenses').select('*').order('expense_date', { ascending: false });
    if (params?.memberId) query = query.eq('member_id', params.memberId);
    if (params?.projectId) query = query.eq('project_id', params.projectId);
    if (params?.status) query = query.eq('status', params.status);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function createExpense(input: Record<string, unknown>) {
    const { data, error } = await supabase.from('expenses').insert(input).select().single();
    if (error) throw error;
    return data;
}

export async function updateExpense(id: string, input: Record<string, unknown>) {
    const { data, error } = await supabase.from('expenses').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

// ── GPR Goals ──

export async function fetchGprGoals(params?: { memberId?: string; quarter?: string }) {
    let query = supabase.from('gpr_goals').select('*').order('created_at', { ascending: false });
    if (params?.memberId) query = query.eq('member_id', params.memberId);
    if (params?.quarter) query = query.eq('quarter', params.quarter);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function createGprGoal(input: Record<string, unknown>) {
    const { data, error } = await supabase.from('gpr_goals').insert(input).select().single();
    if (error) throw error;
    return data;
}

export async function updateGprGoal(id: string, input: Record<string, unknown>) {
    const { data, error } = await supabase.from('gpr_goals').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (error) throw error;
    return data;
}

// ── Attendance (근태) ──

export async function fetchAttendance(params: { memberId: string; from?: string; to?: string }) {
    let query = supabase.from('attendance').select('*').eq('member_id', params.memberId).order('date', { ascending: false });
    if (params.from) query = query.gte('date', params.from);
    if (params.to) query = query.lte('date', params.to);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function upsertAttendance(input: { member_id: string; date: string; check_in?: string; check_out?: string; type?: string; note?: string }) {
    const { data, error } = await supabase.from('attendance').upsert(input, { onConflict: 'member_id,date' }).select().single();
    if (error) throw error;
    return data;
}

// ── Payroll (급여) ──

export async function fetchPayroll(params?: { memberId?: string; yearMonth?: string }) {
    let query = supabase.from('payroll').select('*').order('year_month', { ascending: false });
    if (params?.memberId) query = query.eq('member_id', params.memberId);
    if (params?.yearMonth) query = query.eq('year_month', params.yearMonth);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function upsertPayroll(input: Record<string, unknown>) {
    const { data, error } = await supabase.from('payroll').upsert(input, { onConflict: 'member_id,year_month' }).select().single();
    if (error) throw error;
    return data;
}

// ── Biz Plans (사업계획) ──

export async function fetchBizPlans(params?: { quarter?: string; division?: string }) {
    let query = supabase.from('biz_plans').select('*').order('quarter', { ascending: false });
    if (params?.quarter) query = query.eq('quarter', params.quarter);
    if (params?.division) query = query.eq('division', params.division);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function upsertBizPlan(input: Record<string, unknown>) {
    const { data, error } = await supabase.from('biz_plans').upsert(input, { onConflict: 'quarter,division' }).select().single();
    if (error) throw error;
    return data;
}

// ── Staff / People (직원/외부회원) ──

export async function fetchStaff() {
    const { data, error } = await supabase.from('members').select('*').eq('account_type', 'staff').order('name');
    if (error) throw error;
    return data || [];
}

export async function fetchPeople(params?: { type?: string; limit?: number }) {
    let query = supabase.from('members').select('*').neq('account_type', 'staff').order('created_at', { ascending: false });
    if (params?.type) query = query.eq('account_type', params.type);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function fetchMember(id: string) {
    const { data, error } = await supabase.from('members').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
}

export async function updateMember(id: string, input: Record<string, unknown>) {
    const { data, error } = await supabase.from('members').update(input).eq('id', id).select().single();
    if (error) throw error;
    return data;
}
