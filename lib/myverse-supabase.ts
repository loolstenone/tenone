/**
 * Myverse Supabase 데이터 레이어
 * 각 탭에서 사용하는 CRUD 함수 모음
 */
import { createClient } from '@/lib/supabase/client';

// ── 공통: 현재 유저 ID 가져오기 ──
export async function getCurrentUserId(): Promise<string | null> {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
}

// ══════════════════════════════════
// ME (myverse_profiles)
// ══════════════════════════════════
export interface MyverseProfile {
    id: string;
    user_id: string;
    display_name: string | null;
    bio: string | null;
    interests: string[];
    skills: string[];
    values_text: string | null;
    strengths: string | null;
    weaknesses: string | null;
    mbti: string | null;
    one_char: string | null;
    mood: string | null;
    cover_image: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export async function fetchProfile(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
    return { profile: data as MyverseProfile | null, error };
}

export async function upsertProfile(userId: string, updates: Partial<MyverseProfile>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_profiles')
        .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .select()
        .single();
    return { profile: data as MyverseProfile | null, error };
}

// ══════════════════════════════════
// LOG (myverse_logs)
// ══════════════════════════════════
export interface MyverseLog {
    id: string;
    user_id: string;
    log_type: string;
    content: string | null;
    image_url: string | null;
    emotion: string | null;
    tags: string[];
    visibility: 'private' | 'shared' | 'public';
    metadata: Record<string, unknown>;
    created_at: string;
}

export async function fetchLogs(userId: string, limit = 20) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
    return { logs: (data || []) as MyverseLog[], error };
}

export async function createLog(userId: string, log: Partial<MyverseLog>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_logs')
        .insert({ user_id: userId, log_type: 'text', ...log })
        .select()
        .single();
    return { log: data as MyverseLog | null, error };
}

// ══════════════════════════════════
// DREAM (myverse_dreams)
// ══════════════════════════════════
export interface MyverseDream {
    id: string;
    user_id: string;
    dream_type: string;
    title: string;
    description: string | null;
    status: string;
    progress: number;
    parent_id: string | null;
    target_date: string | null;
    result: string | null;
    created_at: string;
    updated_at: string;
}

export async function fetchDreams(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_dreams')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { dreams: (data || []) as MyverseDream[], error };
}

export async function upsertDream(userId: string, dream: Partial<MyverseDream>) {
    const supabase = createClient();
    const payload = dream.id
        ? { ...dream, updated_at: new Date().toISOString() }
        : { user_id: userId, ...dream };
    const { data, error } = await supabase
        .from('myverse_dreams')
        .upsert(payload)
        .select()
        .single();
    return { dream: data as MyverseDream | null, error };
}

// ══════════════════════════════════
// PLAN / WORK (myverse_tasks)
// ══════════════════════════════════
export interface MyverseTask {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    due_date: string | null;
    scheduled_at: string | null;
    dream_id: string | null;
    project_id: string | null;
    orbi_project_id: string | null;
    completed_at: string | null;
    created_at: string;
}

export async function fetchTasks(userId: string, filters?: { dueDate?: string; status?: string; projectId?: string }) {
    const supabase = createClient();
    let query = supabase
        .from('myverse_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (filters?.dueDate) query = query.eq('due_date', filters.dueDate);
    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.projectId) query = query.eq('project_id', filters.projectId);

    const { data, error } = await query;
    return { tasks: (data || []) as MyverseTask[], error };
}

export async function updateTask(taskId: string, updates: Partial<MyverseTask>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
    return { task: data as MyverseTask | null, error };
}

export async function createTask(userId: string, task: Partial<MyverseTask>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_tasks')
        .insert({ user_id: userId, ...task })
        .select()
        .single();
    return { task: data as MyverseTask | null, error };
}

// ══════════════════════════════════
// WORK (myverse_projects)
// ══════════════════════════════════
export interface MyverseProject {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    status: string;
    dream_id: string | null;
    orbi_tenant_id: string | null;
    orbi_project_id: string | null;
    color: string;
    created_at: string;
    updated_at: string;
}

export async function fetchProjects(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { projects: (data || []) as MyverseProject[], error };
}

export async function createProject(userId: string, project: Partial<MyverseProject>) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_projects')
        .insert({ user_id: userId, ...project })
        .select()
        .single();
    return { project: data as MyverseProject | null, error };
}

// ══════════════════════════════════
// AI (myverse_ai_chats)
// ══════════════════════════════════
export interface MyverseAiChat {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

export async function fetchAiChats(userId: string, limit = 50) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_ai_chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);
    return { chats: (data || []) as MyverseAiChat[], error };
}

export async function saveAiChat(userId: string, role: 'user' | 'assistant', content: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('myverse_ai_chats')
        .insert({ user_id: userId, role, content })
        .select()
        .single();
    return { chat: data as MyverseAiChat | null, error };
}

// ══════════════════════════════════
// VERSE (집계용 — 여러 테이블에서 최근 활동 조회)
// ══════════════════════════════════
export interface VerseEvent {
    type: 'log' | 'dream' | 'task' | 'project' | 'ai';
    title: string;
    description?: string;
    created_at: string;
}

export async function fetchVerseTimeline(userId: string, limit = 30): Promise<VerseEvent[]> {
    const supabase = createClient();
    // 각 테이블에서 최근 항목을 가져와서 합산
    const [logsRes, dreamsRes, tasksRes, projectsRes] = await Promise.all([
        supabase.from('myverse_logs').select('content, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
        supabase.from('myverse_dreams').select('title, description, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
        supabase.from('myverse_tasks').select('title, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
        supabase.from('myverse_projects').select('title, status, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit),
    ]);

    const events: VerseEvent[] = [];
    (logsRes.data || []).forEach(l => events.push({ type: 'log', title: l.content || '기록', created_at: l.created_at }));
    (dreamsRes.data || []).forEach(d => events.push({ type: 'dream', title: d.title, description: d.description ?? undefined, created_at: d.created_at }));
    (tasksRes.data || []).forEach(t => events.push({ type: 'task', title: t.title, description: t.status, created_at: t.created_at }));
    (projectsRes.data || []).forEach(p => events.push({ type: 'project', title: p.title, description: p.status, created_at: p.created_at }));

    // 최신순 정렬
    events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return events.slice(0, limit);
}
