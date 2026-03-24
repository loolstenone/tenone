/**
 * Townity Supabase CRUD 함수
 * posts, post_comments, events 테이블 접근
 */
import { createClient } from './client';

const supabase = createClient();

// ── Posts (공지/자유/QnA) ──

export async function fetchPosts(options?: {
    board?: string;
    limit?: number;
    offset?: number;
}) {
    let query = supabase.from('posts').select('*, author:members(name, avatar_initials)', { count: 'exact' });

    if (options?.board) query = query.eq('board', options.board);
    query = query.order('is_pinned', { ascending: false }).order('created_at', { ascending: false });

    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options?.limit || 20) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { posts: data || [], total: count || 0 };
}

export async function createPost(post: {
    board: string;
    title: string;
    content: string;
    author_id: string;
    visibility?: string;
    badge?: string;
    is_pinned?: boolean;
    notice_start?: string;
    notice_end?: string;
}) {
    const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function updatePost(id: string, updates: Record<string, unknown>) {
    updates.updated_at = new Date().toISOString();
    const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deletePost(id: string) {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
}

// ── Comments ──

export async function fetchComments(postId: string) {
    const { data, error } = await supabase
        .from('post_comments')
        .select('*, author:members(name, avatar_initials)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
}

export async function createComment(comment: {
    post_id: string;
    author_id: string;
    content: string;
}) {
    const { data, error } = await supabase
        .from('post_comments')
        .insert(comment)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Events (일정) ──

export async function fetchEvents(options?: {
    startAfter?: string;
    endBefore?: string;
    visibility?: string;
    limit?: number;
}) {
    let query = supabase.from('events').select('*, creator:members(name)');

    if (options?.startAfter) query = query.gte('start_at', options.startAfter);
    if (options?.endBefore) query = query.lte('start_at', options.endBefore);
    if (options?.visibility) query = query.eq('visibility', options.visibility);

    query = query.order('start_at', { ascending: true });
    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
}

export async function createEvent(event: {
    title: string;
    description?: string;
    start_at: string;
    end_at?: string;
    event_type?: string;
    location?: string;
    visibility?: string;
    created_by: string;
}) {
    const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteEvent(id: string) {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
}

// ── Projects (조회만 — 대시보드용) ──

export async function fetchMyProjects(memberId: string) {
    const { data, error } = await supabase
        .from('project_members')
        .select('*, project:projects(*)')
        .eq('member_id', memberId);
    if (error) throw error;
    return data || [];
}
