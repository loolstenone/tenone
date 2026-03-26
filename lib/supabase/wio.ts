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

export async function updateTenant(tenantId: string, updates: Partial<WIOTenant>): Promise<boolean> {
  const snake = camelToSnake(updates as Record<string, unknown>);
  snake['updated_at'] = new Date().toISOString();
  const { error } = await supabase.from('wio_tenants').update(snake).eq('id', tenantId);
  if (error) { console.error('updateTenant:', error); return false; }
  return true;
}

// ══════════════════════════════════════
// 멤버
// ══════════════════════════════════════

export async function inviteMember(tenantId: string, email: string, role: string = 'member'): Promise<WIOMember | null> {
  // 이메일로 auth user 찾기
  const { data: members } = await supabase.from('members').select('auth_id').eq('email', email).single();
  if (!members?.auth_id) { console.error('inviteMember: user not found'); return null; }
  const { data, error } = await supabase.from('wio_members').insert({
    tenant_id: tenantId, user_id: members.auth_id, role, display_name: email.split('@')[0], is_active: true,
  }).select().single();
  if (error) { console.error('inviteMember:', error); return null; }
  return snakeToCamel(data) as unknown as WIOMember;
}

export async function updateMemberRole(memberId: string, role: string): Promise<boolean> {
  const { error } = await supabase.from('wio_members').update({ role }).eq('id', memberId);
  if (error) { console.error('updateMemberRole:', error); return false; }
  return true;
}

export async function removeMember(memberId: string): Promise<boolean> {
  const { error } = await supabase.from('wio_members').update({ is_active: false }).eq('id', memberId);
  if (error) { console.error('removeMember:', error); return false; }
  return true;
}

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

export async function fetchPost(postId: string): Promise<any | null> {
  const { data } = await supabase.from('wio_posts').select('*, author:wio_members!wio_posts_author_id_fkey(display_name, avatar_url)').eq('id', postId).single();
  if (!data) return null;
  // 조회수 증가
  supabase.from('wio_posts').update({ view_count: (data.view_count || 0) + 1 }).eq('id', postId).then(() => {});
  return snakeToCamel(data);
}

// 댓글
export async function fetchComments(postId: string): Promise<any[]> {
  const { data } = await supabase.from('wio_comments').select('*, author:wio_members!wio_comments_author_id_fkey(display_name, avatar_url)').eq('post_id', postId).eq('is_deleted', false).order('created_at');
  return (data || []).map(r => snakeToCamel(r));
}

export async function createComment(comment: { postId: string; tenantId: string; authorId: string; content: string; parentId?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_comments').insert(camelToSnake(comment as any));
  if (!error) {
    // comment_count 증가
    const { data: post } = await supabase.from('wio_posts').select('comment_count').eq('id', comment.postId).single();
    await supabase.from('wio_posts').update({ comment_count: (post?.comment_count || 0) + 1 }).eq('id', comment.postId);
  }
  return !error;
}

export async function deleteComment(commentId: string): Promise<boolean> {
  const { error } = await supabase.from('wio_comments').update({ is_deleted: true, content: '삭제된 댓글입니다' }).eq('id', commentId);
  return !error;
}

// 좋아요
export async function toggleLike(targetType: 'post' | 'comment', targetId: string, tenantId: string, userId: string): Promise<boolean> {
  const { data: existing } = await supabase.from('wio_likes').select('id').eq('target_type', targetType).eq('target_id', targetId).eq('user_id', userId).single();
  if (existing) {
    await supabase.from('wio_likes').delete().eq('id', existing.id);
    if (targetType === 'post') {
      const { data: post } = await supabase.from('wio_posts').select('like_count').eq('id', targetId).single();
      await supabase.from('wio_posts').update({ like_count: Math.max(0, (post?.like_count || 1) - 1) }).eq('id', targetId);
    }
    return false; // unliked
  } else {
    await supabase.from('wio_likes').insert({ target_type: targetType, target_id: targetId, tenant_id: tenantId, user_id: userId });
    if (targetType === 'post') {
      const { data: post } = await supabase.from('wio_posts').select('like_count').eq('id', targetId).single();
      await supabase.from('wio_posts').update({ like_count: (post?.like_count || 0) + 1 }).eq('id', targetId);
    }
    return true; // liked
  }
}

export async function checkLiked(targetType: 'post' | 'comment', targetId: string, userId: string): Promise<boolean> {
  const { data } = await supabase.from('wio_likes').select('id').eq('target_type', targetType).eq('target_id', targetId).eq('user_id', userId).single();
  return !!data;
}

// 북마크
export async function toggleBookmark(postId: string, tenantId: string, userId: string): Promise<boolean> {
  const { data: existing } = await supabase.from('wio_bookmarks').select('id').eq('post_id', postId).eq('user_id', userId).single();
  if (existing) {
    await supabase.from('wio_bookmarks').delete().eq('id', existing.id);
    return false;
  } else {
    await supabase.from('wio_bookmarks').insert({ post_id: postId, tenant_id: tenantId, user_id: userId });
    return true;
  }
}

export async function checkBookmarked(postId: string, userId: string): Promise<boolean> {
  const { data } = await supabase.from('wio_bookmarks').select('id').eq('post_id', postId).eq('user_id', userId).single();
  return !!data;
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

// ══════════════════════════════════════
// Sprint 3: 포인트
// ══════════════════════════════════════

export async function fetchMemberPoints(memberId: string): Promise<{ total: number; logs: any[] }> {
  const { data } = await supabase.from('wio_points').select('*').eq('member_id', memberId).order('created_at', { ascending: false });
  const logs = (data || []).map(r => snakeToCamel(r));
  const total = logs.reduce((s: number, l: any) => s + (l.points || 0), 0);
  return { total, logs };
}

export async function addPoints(tenantId: string, memberId: string, points: number, activity: string, refId?: string, refType?: string): Promise<boolean> {
  const { error } = await supabase.from('wio_points').insert({ tenant_id: tenantId, member_id: memberId, points, activity, reference_id: refId, reference_type: refType });
  return !error;
}

export function getGrade(totalPoints: number): string {
  if (totalPoints >= 10000) return 'Diamond';
  if (totalPoints >= 5000) return 'Platinum';
  if (totalPoints >= 2000) return 'Gold';
  if (totalPoints >= 500) return 'Silver';
  return 'Bronze';
}

// ══════════════════════════════════════
// Sprint 3: 기회 (Opportunity)
// ══════════════════════════════════════

export async function fetchOpportunities(tenantId: string, status?: string): Promise<any[]> {
  let query = supabase.from('wio_opportunities').select('*, assigned:wio_members!wio_opportunities_assigned_to_fkey(display_name)').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r));
}

export async function createOpportunity(opp: { tenantId: string; title: string; source?: string; url?: string; description?: string; estimatedValue?: number; deadline?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_opportunities').insert(camelToSnake(opp as any));
  return !error;
}

export async function updateOpportunityStatus(oppId: string, status: string): Promise<boolean> {
  const { error } = await supabase.from('wio_opportunities').update({ status, updated_at: new Date().toISOString() }).eq('id', oppId);
  return !error;
}

// 기회 → 프로젝트 전환
export async function convertOpportunityToProject(oppId: string, tenantId: string, pmId: string): Promise<string | null> {
  const opp = await supabase.from('wio_opportunities').select('*').eq('id', oppId).single();
  if (!opp.data) return null;
  const code = await generateProjectCode(tenantId, 'client');
  const project = await createProject({
    tenantId, code, title: opp.data.title, type: 'client' as any,
    description: opp.data.description, budget: opp.data.estimated_value || 0, pmId, status: 'draft' as any,
  });
  if (!project) return null;
  await supabase.from('wio_opportunities').update({ status: 'converted', converted_project_id: project.id }).eq('id', oppId);
  return project.id;
}

// ══════════════════════════════════════
// Sprint 3: 리드
// ══════════════════════════════════════

export async function fetchLeads(tenantId: string): Promise<any[]> {
  const { data } = await supabase.from('wio_leads').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  return (data || []).map(r => snakeToCamel(r));
}

export async function createLead(lead: { tenantId: string; name: string; company?: string; email?: string; phone?: string; source?: string; note?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_leads').insert(camelToSnake(lead as any));
  return !error;
}

// ══════════════════════════════════════
// Sprint 3: GPR
// ══════════════════════════════════════

export async function fetchGPRs(tenantId: string, options?: { level?: string; ownerId?: string; projectId?: string }): Promise<any[]> {
  let query = supabase.from('wio_gpr').select('*, owner:wio_members!wio_gpr_owner_id_fkey(display_name)').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (options?.level) query = query.eq('level', options.level);
  if (options?.ownerId) query = query.eq('owner_id', options.ownerId);
  if (options?.projectId) query = query.eq('project_id', options.projectId);
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r));
}

export async function createGPR(gpr: { tenantId: string; level: string; ownerId: string; projectId?: string; period: string; goal: string; parentGprId?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_gpr').insert(camelToSnake(gpr as any));
  return !error;
}

export async function updateGPR(gprId: string, updates: { plan?: string; result?: string; score?: number; status?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_gpr').update({ ...camelToSnake(updates as any), updated_at: new Date().toISOString() }).eq('id', gprId);
  return !error;
}

// ══════════════════════════════════════
// Sprint 4: 교육 (Learn)
// ══════════════════════════════════════

export async function fetchCourses(tenantId: string): Promise<any[]> {
  const { data } = await supabase.from('wio_courses').select('*').eq('tenant_id', tenantId).eq('is_published', true).order('created_at');
  return (data || []).map(r => snakeToCamel(r));
}

export async function fetchMyEnrollments(memberId: string): Promise<any[]> {
  const { data } = await supabase.from('wio_enrollments').select('*, course:wio_courses!wio_enrollments_course_id_fkey(title, category, duration_minutes, points_reward)').eq('member_id', memberId);
  return (data || []).map(r => snakeToCamel(r));
}

export async function enrollCourse(tenantId: string, courseId: string, memberId: string): Promise<boolean> {
  const { error } = await supabase.from('wio_enrollments').upsert({ tenant_id: tenantId, course_id: courseId, member_id: memberId, status: 'in_progress' }, { onConflict: 'course_id,member_id' });
  return !error;
}

export async function completeEnrollment(enrollmentId: string, quizScore: number): Promise<boolean> {
  const status = quizScore >= 80 ? 'completed' : 'quiz';
  const { error } = await supabase.from('wio_enrollments').update({ status, quiz_score: quizScore, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', enrollmentId);
  return !error;
}

// ══════════════════════════════════════
// Sprint 4: 콘텐츠 (Content)
// ══════════════════════════════════════

export async function fetchContents(tenantId: string, channel?: string): Promise<any[]> {
  let query = supabase.from('wio_contents').select('*, author:wio_members!wio_contents_author_id_fkey(display_name)').eq('tenant_id', tenantId).order('created_at', { ascending: false });
  if (channel) query = query.eq('channel', channel);
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r));
}

export async function createContent(content: { tenantId: string; title: string; body: string; channel?: string; authorId: string; tags?: string[] }): Promise<boolean> {
  const { error } = await supabase.from('wio_contents').insert(camelToSnake(content as any));
  return !error;
}

export async function publishContent(contentId: string): Promise<boolean> {
  const { error } = await supabase.from('wio_contents').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', contentId);
  return !error;
}

// ══════════════════════════════════════
// Sprint 4: 위키 (Wiki)
// ══════════════════════════════════════

export async function fetchDocuments(tenantId: string, category?: string): Promise<any[]> {
  let query = supabase.from('wio_documents').select('*, author:wio_members!wio_documents_author_id_fkey(display_name)').eq('tenant_id', tenantId).eq('is_archived', false).order('updated_at', { ascending: false });
  if (category) query = query.eq('category', category);
  const { data } = await query;
  return (data || []).map(r => snakeToCamel(r));
}

export async function createDocument(doc: { tenantId: string; title: string; body: string; category?: string; authorId: string; projectId?: string }): Promise<boolean> {
  const { error } = await supabase.from('wio_documents').insert(camelToSnake(doc as any));
  return !error;
}

export async function archiveDocument(docId: string): Promise<boolean> {
  const { error } = await supabase.from('wio_documents').update({ is_archived: true }).eq('id', docId);
  return !error;
}

// ══════════════════════════════════════
// Sprint 4: 프로젝트 완료 트리거 체인
// ══════════════════════════════════════

export async function triggerProjectCompletion(tenantId: string, projectId: string): Promise<{ success: boolean; actions: string[] }> {
  const actions: string[] = [];

  // 1. 프로젝트 상태 완료
  await updateProject(projectId, { status: 'completed' as any, completedAt: new Date().toISOString() } as any);
  actions.push('프로젝트 완료 처리');

  // 2. 크루 포인트 자동 부여
  const members = await fetchProjectMembers(projectId);
  for (const pm of members) {
    const pts = pm.role === 'pm' ? 500 : pm.role === 'lead' ? 300 : 200;
    await addPoints(tenantId, pm.memberId, pts, 'project_completion', projectId, 'project');
    actions.push(`${pm.member?.displayName || pm.memberId}에게 ${pts}P 부여`);
  }

  // 3. 위키 자동 아카이브
  const project = await fetchProject(projectId);
  if (project) {
    await createDocument({ tenantId, title: `[완료] ${project.title}`, body: `프로젝트 ${project.code} 완료 아카이브`, category: 'project_archive', authorId: members[0]?.memberId || '', projectId });
    actions.push('위키 아카이브 등록');
  }

  // 4. 알림 발송
  for (const pm of members) {
    await createNotification({ tenantId, memberId: pm.memberId, type: 'project_complete', title: `${project?.title} 프로젝트가 완료되었습니다`, link: `/wio/app/project/${projectId}` });
  }
  actions.push(`${members.length}명에게 알림 발송`);

  return { success: true, actions };
}
