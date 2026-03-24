/**
 * BUMS Supabase CRUD 함수
 * bums_sites, bums_boards, bums_posts, bums_comments, bums_widgets 테이블 접근
 */
import { createClient } from './client';

const supabase = createClient();

// ── DB 레코드 → 프론트 타입 변환 유틸 ──

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        result[camelKey] = value;
    }
    return result;
}

function camelToSnake(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === 'id' || value === undefined) continue;
        const snakeKey = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
        result[snakeKey] = value;
    }
    return result;
}

// ── Sites ──

export async function fetchSites() {
    const { data, error } = await supabase
        .from('bums_sites')
        .select('*')
        .order('name');
    if (error) throw error;
    return (data || []).map(snakeToCamel);
}

export async function fetchSiteBySlug(slug: string) {
    const { data, error } = await supabase
        .from('bums_sites')
        .select('*')
        .eq('slug', slug)
        .single();
    if (error) return null;
    return snakeToCamel(data);
}

export async function upsertSite(site: Record<string, unknown>) {
    const row = camelToSnake(site);
    if (site.id) row.id = site.id;
    const { data, error } = await supabase
        .from('bums_sites')
        .upsert(row)
        .select()
        .single();
    if (error) throw error;
    return snakeToCamel(data);
}

// ── Boards ──

export async function fetchBoards(siteId?: string) {
    let query = supabase.from('bums_boards').select('*').order('sort_order');
    if (siteId) query = query.eq('site_id', siteId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(snakeToCamel);
}

export async function fetchBoardBySlug(siteId: string, slug: string) {
    const { data, error } = await supabase
        .from('bums_boards')
        .select('*')
        .eq('site_id', siteId)
        .eq('slug', slug)
        .single();
    if (error) return null;
    return snakeToCamel(data);
}

export async function upsertBoard(board: Record<string, unknown>) {
    const row = camelToSnake(board);
    if (board.id) row.id = board.id;
    const { data, error } = await supabase
        .from('bums_boards')
        .upsert(row)
        .select()
        .single();
    if (error) throw error;
    return snakeToCamel(data);
}

export async function deleteBoard(id: string) {
    const { error } = await supabase.from('bums_boards').delete().eq('id', id);
    if (error) throw error;
}

// ── Posts ──

export async function fetchPosts(options?: {
    siteId?: string;
    boardId?: string;
    status?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
}) {
    let query = supabase.from('bums_posts').select('*', { count: 'exact' });

    if (options?.siteId) query = query.eq('site_id', options.siteId);
    if (options?.boardId) query = query.eq('board_id', options.boardId);
    if (options?.status) query = query.eq('status', options.status);

    const orderCol = options?.orderBy || 'created_at';
    query = query.order(orderCol, { ascending: false });

    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options?.limit || 20) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { posts: (data || []).map(snakeToCamel), total: count || 0 };
}

export async function fetchPostById(id: string) {
    const { data, error } = await supabase
        .from('bums_posts')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return snakeToCamel(data);
}

export async function fetchPostBySlug(siteId: string, slug: string) {
    const { data, error } = await supabase
        .from('bums_posts')
        .select('*')
        .eq('site_id', siteId)
        .eq('slug', slug)
        .single();
    if (error) return null;
    return snakeToCamel(data);
}

export async function createPost(post: Record<string, unknown>) {
    const row = camelToSnake(post);
    // ID가 UUID 형식이 아니면 제거 (DB가 자동 생성)
    if (row.id && typeof row.id === 'string' && !row.id.match(/^[0-9a-f]{8}-/)) {
        delete row.id;
    }
    // author_id가 UUID 형식이 아니면 null로
    if (row.author_id && typeof row.author_id === 'string' && !row.author_id.match(/^[0-9a-f]{8}-/)) {
        row.author_id = null;
    }
    const { data, error } = await supabase
        .from('bums_posts')
        .insert(row)
        .select()
        .single();
    if (error) throw error;
    return snakeToCamel(data);
}

export async function updatePost(id: string, updates: Record<string, unknown>) {
    const row = camelToSnake(updates);
    row.updated_at = new Date().toISOString();
    const { data, error } = await supabase
        .from('bums_posts')
        .update(row)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return snakeToCamel(data);
}

export async function deletePost(id: string) {
    const { error } = await supabase.from('bums_posts').delete().eq('id', id);
    if (error) throw error;
}

export async function incrementViewCount(id: string) {
    const { error } = await supabase.rpc('increment_view_count', { post_id: id });
    if (error) {
        // fallback: 직접 업데이트
        const post = await fetchPostById(id);
        if (post) {
            await supabase.from('bums_posts').update({
                view_count: ((post.viewCount as number) || 0) + 1
            }).eq('id', id);
        }
    }
}

// ── Comments ──

export async function fetchComments(postId: string) {
    const { data, error } = await supabase
        .from('bums_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(snakeToCamel);
}

export async function createComment(comment: Record<string, unknown>) {
    const row = camelToSnake(comment);
    const { data, error } = await supabase
        .from('bums_comments')
        .insert(row)
        .select()
        .single();
    if (error) throw error;
    return snakeToCamel(data);
}

export async function deleteComment(id: string) {
    const { error } = await supabase.from('bums_comments').delete().eq('id', id);
    if (error) throw error;
}

// ── Widgets ──

export async function fetchWidgets(siteId?: string) {
    let query = supabase.from('bums_widgets').select('*').order('sort_order');
    if (siteId) query = query.eq('site_id', siteId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(snakeToCamel);
}

export async function upsertWidget(widget: Record<string, unknown>) {
    const row = camelToSnake(widget);
    if (widget.id) row.id = widget.id;
    const { data, error } = await supabase
        .from('bums_widgets')
        .upsert(row)
        .select()
        .single();
    if (error) throw error;
    return snakeToCamel(data);
}

export async function deleteWidget(id: string) {
    const { error } = await supabase.from('bums_widgets').delete().eq('id', id);
    if (error) throw error;
}

// ── Storage (이미지 업로드) ──

export async function uploadImage(file: File, path: string) {
    const { data, error } = await supabase.storage
        .from('bums-assets')
        .upload(path, file, {
            cacheControl: '3600',
            upsert: true,
        });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage
        .from('bums-assets')
        .getPublicUrl(data.path);
    return publicUrl;
}

// ── 퍼블릭 사이트용 Published 게시글 조회 ──

export async function fetchPublishedPosts(siteSlug: string, options?: {
    boardSlug?: string;
    limit?: number;
    offset?: number;
}) {
    // 먼저 site_id 조회
    const site = await fetchSiteBySlug(siteSlug);
    if (!site) return { posts: [], total: 0 };

    let query = supabase
        .from('bums_posts')
        .select('*', { count: 'exact' })
        .eq('site_id', site.id)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (options?.boardSlug) {
        const board = await fetchBoardBySlug(site.id as string, options.boardSlug);
        if (board) query = query.eq('board_id', board.id);
    }

    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options?.limit || 20) - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { posts: (data || []).map(snakeToCamel), total: count || 0 };
}
