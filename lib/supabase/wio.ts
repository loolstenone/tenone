/**
 * WIO 솔루션 Supabase CRUD
 * 멀티테넌트: 모든 쿼리에 tenant_id 필터
 */
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import type {
  WIOTenant, WIOMember, WIOProject, WIOJob, WIOTimesheet, WIOProjectMember,
  ProjectStatus, JobStatus,
} from '@/types/wio';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── 유틸 ──
function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  return result;
}
function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key.replace(/[A-Z]/g, c => '_' + c.toLowerCase())] = value;
  }
  return result;
}

// ══════════════════════════════════════
// 테넌트
// ══════════════════════════════════════

export async function fetchMyTenants(): Promise<WIOTenant[]> {
  const { data } = await supabase.from('wio_tenants').select('*').eq('is_active', true);
  return (data || []).map(r => snakeToCamel(r) as unknown as WIOTenant);
}

export async function fetchTenant(tenantId: string): Promise<WIOTenant | null> {
  const { data } = await supabase.from('wio_tenants').select('*').eq('id', tenantId).single();
  return data ? snakeToCamel(data) as unknown as WIOTenant : null;
}

export async function fetchTenantBySlug(slug: string): Promise<WIOTenant | null> {
  const { data } = await supabase.from('wio_tenants').select('*').eq('slug', slug).single();
  return data ? snakeToCamel(data) as unknown as WIOTenant : null;
}

export async function createTenant(tenant: Partial<WIOTenant>): Promise<WIOTenant | null> {
  const snake = camelToSnake(tenant as Record<string, unknown>);
  const { data, error } = await supabase.from('wio_tenants').insert(snake).select().single();
  if (error) { console.error('createTenant:', error); return null; }
  return snakeToCamel(data) as unknown as WIOTenant;
}

// ══════════════════════════════════════
// 멤버
// ══════════════════════════════════════

export async function fetchTenantMembers(tenantId: string): Promise<WIOMember[]> {
  const { data } = await supabase.from('wio_members').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('joined_at');
  return (data || []).map(r => snakeToCamel(r) as unknown as WIOMember);
}

export async function fetchMyMembership(tenantId: string): Promise<WIOMember | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('wio_members').select('*').eq('tenant_id', tenantId).eq('user_id', user.id).single();
  return data ? snakeToCamel(data) as unknown as WIOMember : null;
}

export async function addMember(tenantId: string, userId: string, displayName: string, role: string = 'member'): Promise<WIOMember | null> {
  const { data, error } = await supabase.from('wio_members')
    .insert({ tenant_id: tenantId, user_id: userId, display_name: displayName, role })
    .select().single();
  if (error) { console.error('addMember:', error); return null; }
  return snakeToCamel(data) as unknown as WIOMember;
}

// ══════════════════════════════════════
// 프로젝트
// ══════════════════════════════════════

export async function fetchProjects(tenantId: string, status?: ProjectStatus): Promise<WIOProject[]> {
  let query = supabase.from('wio_projects').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r) as unknown as WIOProject);
}

export async function fetchProject(projectId: string): Promise<WIOProject | null> {
  const { data } = await supabase.from('wio_projects').select('*').eq('id', projectId).single();
  return data ? snakeToCamel(data) as unknown as WIOProject : null;
}

export async function createProject(project: Partial<WIOProject>): Promise<WIOProject | null> {
  const snake = camelToSnake(project as Record<string, unknown>);
  snake.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('wio_projects').insert(snake).select().single();
  if (error) { console.error('createProject:', error); return null; }
  return snakeToCamel(data) as unknown as WIOProject;
}

export async function updateProject(projectId: string, updates: Partial<WIOProject>): Promise<boolean> {
  const snake = camelToSnake(updates as Record<string, unknown>);
  snake.updated_at = new Date().toISOString();
  const { error } = await supabase.from('wio_projects').update(snake).eq('id', projectId);
  return !error;
}

// ── 프로젝트 코드 자동 생성 ──
export async function generateProjectCode(tenantId: string, type: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = type === 'client' ? 'CL' : type === 'internal' ? 'IN' : type === 'community' ? 'CM' : 'PR';
  const { count } = await supabase.from('wio_projects').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId);
  const num = String((count || 0) + 1).padStart(3, '0');
  return `PRJ-${year}-${prefix}-${num}`;
}

// ══════════════════════════════════════
// Job
// ══════════════════════════════════════

export async function fetchJobs(projectId: string): Promise<WIOJob[]> {
  const { data } = await supabase.from('wio_jobs').select('*, assignee:wio_members!wio_jobs_assignee_id_fkey(*)').eq('project_id', projectId).order('created_at');
  return (data || []).map(r => {
    const job = snakeToCamel(r) as unknown as WIOJob;
    if (r.assignee) job.assignee = snakeToCamel(r.assignee as Record<string, unknown>) as unknown as WIOMember;
    return job;
  });
}

export async function createJob(job: Partial<WIOJob>): Promise<WIOJob | null> {
  const snake = camelToSnake(job as Record<string, unknown>);
  const { data, error } = await supabase.from('wio_jobs').insert(snake).select().single();
  if (error) { console.error('createJob:', error); return null; }
  return snakeToCamel(data) as unknown as WIOJob;
}

export async function updateJob(jobId: string, updates: Partial<WIOJob>): Promise<boolean> {
  const snake = camelToSnake(updates as Record<string, unknown>);
  snake.updated_at = new Date().toISOString();
  const { error } = await supabase.from('wio_jobs').update(snake).eq('id', jobId);
  return !error;
}

export async function deleteJob(jobId: string): Promise<boolean> {
  const { error } = await supabase.from('wio_jobs').delete().eq('id', jobId);
  return !error;
}

// ══════════════════════════════════════
// 타임시트
// ══════════════════════════════════════

export async function fetchTimesheets(tenantId: string, options: { memberId?: string; jobId?: string; weekStart?: string; weekEnd?: string } = {}): Promise<WIOTimesheet[]> {
  let query = supabase.from('wio_timesheets').select('*').eq('tenant_id', tenantId).order('work_date', { ascending: false });
  if (options.memberId) query = query.eq('member_id', options.memberId);
  if (options.jobId) query = query.eq('job_id', options.jobId);
  if (options.weekStart) query = query.gte('work_date', options.weekStart);
  if (options.weekEnd) query = query.lte('work_date', options.weekEnd);
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r) as unknown as WIOTimesheet);
}

export async function upsertTimesheet(entry: Partial<WIOTimesheet>): Promise<boolean> {
  const snake = camelToSnake(entry as Record<string, unknown>);
  const { error } = await supabase.from('wio_timesheets').upsert(snake, { onConflict: 'member_id,job_id,work_date' });
  return !error;
}

// ══════════════════════════════════════
// 프로젝트 멤버 (크루)
// ══════════════════════════════════════

export async function fetchProjectMembers(projectId: string): Promise<WIOProjectMember[]> {
  const { data } = await supabase.from('wio_project_members').select('*, member:wio_members!wio_project_members_member_id_fkey(*)').eq('project_id', projectId);
  return (data || []).map(r => {
    const pm = snakeToCamel(r) as unknown as WIOProjectMember;
    if (r.member) pm.member = snakeToCamel(r.member as Record<string, unknown>) as unknown as WIOMember;
    return pm;
  });
}

export async function addProjectMember(tenantId: string, projectId: string, memberId: string, role: string = 'member', hourlyRate: number = 0): Promise<boolean> {
  const { error } = await supabase.from('wio_project_members').insert({ tenant_id: tenantId, project_id: projectId, member_id: memberId, role, hourly_rate: hourlyRate });
  return !error;
}

export async function removeProjectMember(projectId: string, memberId: string): Promise<boolean> {
  const { error } = await supabase.from('wio_project_members').delete().eq('project_id', projectId).eq('member_id', memberId);
  return !error;
}

// ══════════════════════════════════════
// 프로젝트 손익 계산
// ══════════════════════════════════════

export async function calculateProjectPnL(projectId: string): Promise<{ revenue: number; internalCost: number; externalCost: number; profit: number }> {
  const project = await fetchProject(projectId);
  if (!project) return { revenue: 0, internalCost: 0, externalCost: 0, profit: 0 };

  // 내부 비용: 크루 타임시트 × 시급
  const { data: timesheets } = await supabase
    .from('wio_timesheets')
    .select('hours, wio_jobs!inner(hourly_rate)')
    .eq('wio_jobs.project_id', projectId);

  const internalCost = (timesheets || []).reduce((sum, t) => {
    const rate = (t as any).wio_jobs?.hourly_rate || 0;
    return sum + (t.hours * rate);
  }, 0);

  return {
    revenue: project.revenue,
    internalCost,
    externalCost: 0,
    profit: project.revenue - internalCost,
  };
}

// ══════════════════════════════════════
// Sprint 2: 게시판
// ══════════════════════════════════════

export async function fetchPosts(tenantId: string, board?: string): Promise<any[]> {
  let query = supabase.from('wio_posts').select('*, author:wio_members!wio_posts_author_id_fkey(display_name, avatar_url)').eq('tenant_id', tenantId).order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
  if (board) query = query.eq('board', board);
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r));
}

export async function createPost(post: { tenantId: string; board: string; title: string; content: string; authorId: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_posts').insert(camelToSnake(post as any));
  return !error;
}

// ══════════════════════════════════════
// Sprint 2: 할일
// ══════════════════════════════════════

export async function fetchTodos(memberId: string): Promise<any[]> {
  const { data } = await supabase.from('wio_todos').select('*').eq('member_id', memberId).order('is_done').order('created_at', { ascending: false });
  return (data || []).map(r => snakeToCamel(r));
}

export async function createTodo(todo: { tenantId: string; memberId: string; title: string; dueDate?: string; projectId?: string; priority?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_todos').insert(camelToSnake(todo as any));
  return !error;
}

export async function toggleTodo(todoId: string, isDone: boolean): Promise<boolean> {
  const { error } = await supabase.from('wio_todos').update({ is_done: isDone }).eq('id', todoId);
  return !error;
}

// ══════════════════════════════════════
// Sprint 2: 알림
// ══════════════════════════════════════

export async function fetchNotifications(memberId: string, limit = 20): Promise<any[]> {
  const { data } = await supabase.from('wio_notifications').select('*').eq('member_id', memberId).order('created_at', { ascending: false }).limit(limit);
  return (data || []).map(r => snakeToCamel(r));
}

export async function markNotificationRead(notifId: string): Promise<boolean> {
  const { error } = await supabase.from('wio_notifications').update({ is_read: true }).eq('id', notifId);
  return !error;
}

export async function createNotification(notif: { tenantId: string; memberId: string; type: string; title: string; body?: string; link?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_notifications').insert(camelToSnake(notif as any));
  return !error;
}

// ══════════════════════════════════════
// Sprint 2: 전자결재
// ══════════════════════════════════════

export async function fetchApprovals(tenantId: string, status?: string): Promise<any[]> {
  let query = supabase.from('wio_approvals').select('*, requester:wio_members!wio_approvals_requester_id_fkey(display_name)').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r));
}

export async function createApproval(approval: { tenantId: string; type: string; title: string; content?: string; requesterId: string; approverId?: string; projectId?: string; amount?: number }): Promise<boolean> {
  const { error } = await supabase.from('wio_approvals').insert(camelToSnake(approval as any));
  return !error;
}

export async function updateApprovalStatus(approvalId: string, status: 'approved' | 'rejected'): Promise<boolean> {
  const { error } = await supabase.from('wio_approvals').update({ status, approved_at: new Date().toISOString() }).eq('id', approvalId);
  return !error;
}

// ══════════════════════════════════════
// Sprint 2: 경비
// ══════════════════════════════════════

export async function fetchExpenses(tenantId: string): Promise<any[]> {
  const { data } = await supabase.from('wio_expenses').select('*, member:wio_members!wio_expenses_member_id_fkey(display_name)').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  return (data || []).map(r => snakeToCamel(r));
}

export async function createExpense(expense: { tenantId: string; memberId: string; projectId?: string; category: string; description: string; amount: number }): Promise<boolean> {
  const { error } = await supabase.from('wio_expenses').insert(camelToSnake(expense as any));
  return !error;
}

// ══════════════════════════════════════
// Sprint 2: 정산
// ══════════════════════════════════════

export async function fetchSettlements(projectId: string): Promise<any[]> {
  const { data } = await supabase.from('wio_settlements').select('*, member:wio_members!wio_settlements_member_id_fkey(display_name)').eq('project_id', projectId).order('created_at');
  return (data || []).map(r => snakeToCamel(r));
}

export async function createSettlement(settlement: { tenantId: string; projectId: string; memberId?: string; type: string; amount: number; note?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_settlements').insert(camelToSnake(settlement as any));
  return !error;
}

// ══════════════════════════════════════
// Sprint 2: 일정
// ══════════════════════════════════════

export async function fetchEvents(tenantId: string, month?: string): Promise<any[]> {
  let query = supabase.from('wio_events').select('*').eq('tenant_id', tenantId).order('start_at');
  if (month) {
    query = query.gte('start_at', `${month}-01`).lte('start_at', `${month}-31`);
  }
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r));
}

export async function createEvent(event: { tenantId: string; title: string; startAt: string; endAt?: string; allDay?: boolean; projectId?: string; createdBy: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_events').insert(camelToSnake(event as any));
  return !error;
}

// ══════════════════════════════════════
// Sprint 2: 프로젝트 채팅 자동 생성
// ══════════════════════════════════════

export async function createProjectChatThread(tenantId: string, projectId: string, projectTitle: string): Promise<string | null> {
  const { data, error } = await supabase.from('wio_chat_threads').insert({ tenant_id: tenantId, name: projectTitle, type: 'project', project_id: projectId }).select('id').single();
  if (error) return null;
  return data.id;
}

export async function fetchChatMessages(threadId: string, limit = 50): Promise<any[]> {
  const { data } = await supabase.from('wio_chat_messages').select('*, sender:wio_members!wio_chat_messages_sender_id_fkey(display_name, avatar_url)').eq('thread_id', threadId).order('created_at', { ascending: false }).limit(limit);
  return (data || []).reverse().map(r => snakeToCamel(r));
}

export async function sendChatMessage(threadId: string, senderId: string, content: string): Promise<boolean> {
  const { error } = await supabase.from('wio_chat_messages').insert({ thread_id: threadId, sender_id: senderId, content });
  return !error;
}
