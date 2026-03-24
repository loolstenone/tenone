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
