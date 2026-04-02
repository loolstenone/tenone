/**
 * ERP Supabase CRUD 함수
 * approvals, timesheets (projects.ts에도 있음), point_logs
 *
 * tenant_id 격리: 모든 테이블에 tenant_id TEXT DEFAULT 'tenone' 추가됨 (Phase 0-A, 2026-04-03)
 * 현재는 TenOne 전용이므로 필터 생략. 외부 고객 추가 시 DEFAULT_TENANT 기반 필터 활성화.
 */
import { createClient } from './client';

const supabase = createClient();

/** 현재 테넌트 ID — 외부 고객 추가 시 동적으로 변경 */
export const DEFAULT_TENANT = 'tenone';

// ── Approvals (결재) ──

export async function fetchApprovals(options?: {
    status?: string;
    requesterId?: string;
    limit?: number;
}) {
    let query = supabase.from('approvals').select('*, drafter:members!approvals_drafter_id_fkey(name)', { count: 'exact' });

    if (options?.status && options.status !== 'all') query = query.eq('status', options.status);
    if (options?.requesterId) query = query.eq('drafter_id', options.requesterId);

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

export async function updateExpenseByApproval(approvalId: string, status: string) {
    // approvals.reference_id → expenses.id 연결: 결재 승인/반려 시 경비 상태 동기화
    const { data: approval } = await supabase.from('approvals').select('reference_id, reference_type').eq('id', approvalId).single();
    if (approval?.reference_type === 'expense' && approval?.reference_id) {
        const expenseStatus = status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : status;
        await supabase.from('expenses').update({ status: expenseStatus, updated_at: new Date().toISOString() }).eq('id', approval.reference_id);
    }
}

// ── GPR Goals ──

import type { GprGoal, GoalLevel, GoalStatus, EvaluationRating } from '@/types/gpr';

export function rowToGprGoal(r: Record<string, unknown>): GprGoal {
    return {
        id: r.id as string,
        staffId: (r.member_id as string) || '',
        level: ((r.level as string) || (r.category as string) || 'GPR-I') as GoalLevel,
        title: (r.title as string) || '',
        description: (r.description as string) || '',
        kpi: (r.metric as string) || (r.kpi as string) || '',
        weight: (r.weight as number) || 10,
        status: ((r.status as string) || 'Draft') as GoalStatus,
        progress: (r.progress as number) || 0,
        dueDate: (r.due_date as string)?.split('T')[0] || undefined,
        agreedBy: (r.agreed_by as string) || undefined,
        agreedAt: (r.agreed_at as string)?.split('T')[0] || undefined,
        selfRating: (r.self_rating as EvaluationRating) || undefined,
        selfComment: (r.self_comment as string) || undefined,
        selfEvaluatedAt: (r.self_evaluated_at as string)?.split('T')[0] || undefined,
        supervisorRating: (r.supervisor_rating as EvaluationRating) || undefined,
        supervisorComment: (r.supervisor_comment as string) || undefined,
        supervisorId: (r.supervisor_id as string) || undefined,
        evaluatedAt: (r.evaluated_at as string)?.split('T')[0] || undefined,
        period: (r.quarter as string) || (r.period as string) || '',
        createdAt: ((r.created_at as string) || '').split('T')[0],
        updatedAt: ((r.updated_at as string) || '').split('T')[0],
    };
}

export async function fetchGprGoalsTyped(params?: { memberId?: string; quarter?: string }): Promise<GprGoal[]> {
    let query = supabase.from('gpr_goals').select('*').order('created_at', { ascending: false });
    if (params?.memberId) query = query.eq('member_id', params.memberId);
    if (params?.quarter) query = query.eq('quarter', params.quarter);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(r => rowToGprGoal(r as Record<string, unknown>));
}

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

export async function fetchPayrollWithMembers(yearMonth?: string) {
    let query = supabase
        .from('payroll')
        .select('*, member:members(name, position, department)')
        .order('year_month', { ascending: false });
    if (yearMonth) query = query.eq('year_month', yearMonth);
    const { data, error } = await query;
    if (error) throw error;
    // Deduplicate: keep latest per member
    const seen = new Set<string>();
    const result: Record<string, unknown>[] = [];
    for (const row of (data || [])) {
        const r = row as Record<string, unknown>;
        const mid = r.member_id as string;
        if (!seen.has(mid)) { seen.add(mid); result.push(r); }
    }
    return result;
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

import type { StaffMember, StaffRole, StaffStatus, Division } from '@/types/staff';
import type { SystemAccess } from '@/types/auth';

export function rowToStaffMember(r: Record<string, unknown>): StaffMember {
    const name = (r.name as string) || '';
    const initials = name.length >= 2 ? name.slice(0, 2) : name;
    return {
        id: r.id as string,
        employeeId: (r.employee_id as string) || '',
        name,
        email: (r.email as string) || '',
        role: ((r.role as string) || 'Viewer') as StaffRole,
        accessLevel: ((r.system_access as string[]) || []) as SystemAccess[],
        division: ((r.division as string) || 'Support') as Division,
        department: (r.department as string) || '',
        position: (r.position as string) || '',
        brandAssociation: (r.brand_association as string[]) || [],
        startDate: ((r.start_date as string) || (r.created_at as string) || '').split('T')[0],
        status: ((r.status as string) || 'Active') as StaffStatus,
        phone: (r.phone as string) || undefined,
        avatarInitials: (r.avatar_initials as string) || initials,
        emergencyContact: (r.emergency_contact as string) || undefined,
        bio: (r.bio as string) || undefined,
        goals: (r.goals as string) || undefined,
        values: (r.values as string) || undefined,
        createdAt: ((r.created_at as string) || '').split('T')[0],
        updatedAt: ((r.updated_at as string) || '').split('T')[0],
    };
}

export async function fetchStaffMembers(): Promise<StaffMember[]> {
    const { data, error } = await supabase.from('members').select('*').eq('account_type', 'staff').order('name');
    if (error) throw error;
    return (data || []).map(r => rowToStaffMember(r as Record<string, unknown>));
}

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

// ── Approval Templates (결재라인 설정) ──

export async function fetchApprovalTemplates(brandId = 'tenone') {
    const { data, error } = await supabase
        .from('approval_templates')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function createApprovalTemplate(input: {
    name: string; type: string; factor: string; steps: { role: string }[]; brandId?: string;
}) {
    const { data, error } = await supabase
        .from('approval_templates')
        .insert({
            brand_id: input.brandId || 'tenone',
            name: input.name,
            type: input.type,
            factor: input.factor,
            steps: input.steps,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteApprovalTemplate(id: string) {
    const { error } = await supabase.from('approval_templates').delete().eq('id', id);
    if (error) throw error;
}

export async function toggleApprovalTemplate(id: string, active: boolean) {
    const { data, error } = await supabase
        .from('approval_templates')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Invoices (청구서) ──

export async function fetchInvoices(params?: { status?: string; limit?: number }) {
    let query = supabase.from('invoices').select('*').order('issue_date', { ascending: false });
    if (params?.status && params.status !== 'all') query = query.eq('status', params.status);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function createInvoice(input: Record<string, unknown>) {
    const { data, error } = await supabase.from('invoices').insert(input).select().single();
    if (error) throw error;
    return data;
}

export async function updateInvoiceStatus(id: string, status: string) {
    const { data, error } = await supabase
        .from('invoices')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Corporate Cards (법인카드) ──

export async function fetchCardUsage(params?: { memberId?: string; limit?: number }) {
    let query = supabase.from('card_usage').select('*').order('used_at', { ascending: false });
    if (params?.memberId) query = query.eq('member_id', params.memberId);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// ── Payments (지급관리) ──

export async function fetchPayments(params?: { status?: string; limit?: number }) {
    let query = supabase.from('payments').select('*').order('due_date', { ascending: true });
    if (params?.status && params.status !== 'all') query = query.eq('status', params.status);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function updatePaymentStatus(id: string, status: string) {
    const { data, error } = await supabase
        .from('payments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Incentives / Rewards ──

export async function fetchIncentives(params?: { memberId?: string; limit?: number }) {
    let query = supabase.from('incentives').select('*').order('period', { ascending: false });
    if (params?.memberId) query = query.eq('member_id', params.memberId);
    if (params?.limit) query = query.limit(params.limit);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

// ── Standard Rates (직급별 표준단가) ──

export async function fetchStandardRates(brandId = 'tenone') {
    const { data, error } = await supabase.from('standard_rates').select('*')
        .eq('brand_id', brandId)
        .order('hourly_rate', { ascending: false });
    if (error) throw error;
    return (data || []) as Record<string, unknown>[];
}

export async function upsertStandardRate(position: string, hourlyRate: number, brandId = 'tenone') {
    const { data, error } = await supabase
        .from('standard_rates')
        .upsert({
            position, hourly_rate: hourlyRate, brand_id: brandId,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'position,brand_id' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Monthly Forecasts (월별 추정/실적) ──

export async function fetchMonthlyForecasts(params: { year: number; month?: number; brandId?: string }) {
    let query = supabase.from('monthly_forecasts').select('*')
        .eq('brand_id', params.brandId || 'tenone')
        .eq('year', params.year)
        .order('month')
        .order('item');
    if (params.month) query = query.eq('month', params.month);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Record<string, unknown>[];
}

export async function upsertMonthlyForecast(input: Record<string, unknown>) {
    const { data, error } = await supabase
        .from('monthly_forecasts')
        .upsert({ ...input, updated_at: new Date().toISOString() }, { onConflict: 'year,month,item,brand_id' })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── GPR Staff Data (평가/인센티브 관리 페이지용) ──
// staff members + 해당 분기 gpr_goals + 최근 payroll을 한 번에 조회

function getCurrentQuarter() {
    const now = new Date();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    return `${now.getFullYear()}Q${q}`;
}

export async function fetchStaffGprData(quarter?: string) {
    const qtr = quarter || getCurrentQuarter();

    const [membersRes, goalsRes, payrollRes] = await Promise.all([
        supabase
            .from('members')
            .select('id, name, department, position, account_type')
            .in('account_type', ['staff', 'partner', 'crew', 'junior_partner'])
            .order('name'),
        supabase
            .from('gpr_goals')
            .select('member_id, self_rating, supervisor_rating, status, self_evaluated_at, evaluated_at, agreed_at')
            .eq('quarter', qtr),
        supabase
            .from('payroll')
            .select('member_id, base_salary, year_month')
            .order('year_month', { ascending: false })
            .limit(200),
    ]);

    const members = (membersRes.data || []) as Record<string, unknown>[];
    const goals = (goalsRes.data || []) as Record<string, unknown>[];
    const payroll = (payrollRes.data || []) as Record<string, unknown>[];

    // 멤버별로 goals + payroll 매핑
    return members.map(m => {
        const mGoals = goals.filter(g => g.member_id === m.id);
        // 최근 payroll 1건
        const latestPay = payroll.find(p => p.member_id === m.id);
        return { ...m, goals: mGoals, latestPay: latestPay || null };
    });
}

// ── Partner Pool ──

export async function fetchPartners(params: { brandId?: string; type?: string; search?: string; skill?: string } = {}) {
    const { brandId = 'tenone', type, search, skill } = params;
    let query = supabase.from('partners').select('*').eq('brand_id', brandId).order('rating', { ascending: false });
    if (type && type !== 'all') query = query.eq('type', type);
    if (skill && skill !== 'all') query = query.contains('skills', [skill]);
    if (search) {
        const s = search.replace(/[\\%_(),."']/g, '').trim().slice(0, 200);
        if (s) query = query.or(`name.ilike.%${s}%,speciality.ilike.%${s}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Record<string, unknown>[];
}

export async function createPartner(input: Record<string, unknown>) {
    // tenant_id 조회 (nullable — 없어도 insert 가능)
    let tenantId = input.tenant_id;
    if (!tenantId) {
        try {
            const { data: brand } = await supabase.from('brands').select('id').eq('slug', 'tenone').single();
            tenantId = brand?.id ?? null;
        } catch {
            tenantId = null;
        }
    }
    const payload: Record<string, unknown> = {
        ...input,
        brand_id: input.brand_id || 'tenone',
        updated_at: new Date().toISOString(),
    };
    if (tenantId) payload.tenant_id = tenantId;
    const { data, error } = await supabase.from('partners')
        .insert(payload)
        .select().single();
    if (error) throw error;
    return data as Record<string, unknown>;
}
