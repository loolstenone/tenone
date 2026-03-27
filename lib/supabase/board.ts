/**
 * Ten:One™ 통합 게시판 Supabase CRUD
 * posts, comments, attachments, likes, bookmarks, board_configs
 */
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import type {
    Post, Comment, Attachment, BoardConfig,
    PostListParams, PostListResponse,
    CreatePostInput, UpdatePostInput, CreateCommentInput,
    SiteCode,
} from '@/types/board';

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── 유틸 ──

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
        if (value === undefined) continue;
        const snakeKey = key.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
        result[snakeKey] = value;
    }
    return result;
}

function toPost(row: Record<string, unknown>): Post {
    return snakeToCamel(row) as unknown as Post;
}

function toComment(row: Record<string, unknown>): Comment {
    const c = snakeToCamel(row) as unknown as Comment;
    // guestPassword는 응답에서 제거
    delete (c as unknown as Record<string, unknown>).guestPassword;
    return c;
}

// ── Board Configs ──

export async function fetchBoardConfigs(site?: SiteCode, slug?: string): Promise<BoardConfig[]> {
    let query = supabase.from('board_configs').select('*').order('sort_order');
    if (site) query = query.eq('site', site);
    if (slug) query = query.eq('slug', slug);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(r => {
        const c = snakeToCamel(r) as unknown as BoardConfig;
        return c;
    });
}

export async function fetchBoardConfig(site: SiteCode, slug: string): Promise<BoardConfig | null> {
    const { data, error } = await supabase
        .from('board_configs')
        .select('*')
        .eq('site', site)
        .eq('slug', slug)
        .single();
    if (error) return null;
    return snakeToCamel(data) as unknown as BoardConfig;
}

export async function upsertBoardConfig(config: Partial<BoardConfig> & { site: SiteCode; slug: string }) {
    const row = camelToSnake(config as unknown as Record<string, unknown>);
    row.updated_at = new Date().toISOString();
    const { data, error } = await supabase
        .from('board_configs')
        .upsert(row, { onConflict: 'site,slug' })
        .select()
        .single();
    if (error) throw error;
    return snakeToCamel(data) as unknown as BoardConfig;
}

export async function deleteBoardConfig(id: string) {
    const { error } = await supabase.from('board_configs').delete().eq('id', id);
    if (error) throw error;
}

// ── Posts ──

export async function fetchPosts(params: PostListParams): Promise<PostListResponse> {
    const {
        site, board, category, tag, status,
        search, sort = 'latest', period = 'all',
        page = 1, limit = 12,
    } = params;

    let query = supabase
        .from('posts')
        .select('id, site, board, title, excerpt, category, status, author_type, represent_image, tags, is_pinned, is_secret, view_count, like_count, comment_count, bookmark_count, created_at', { count: 'exact' })
        .eq('site', site);

    if (board) query = query.eq('board', board);
    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);
    else query = query.eq('status', 'published');
    if (tag) query = query.contains('tags', JSON.stringify([tag]));

    // 검색 (제목 + 본문)
    if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // 기간 필터
    if (period !== 'all') {
        const now = new Date();
        let from: Date;
        switch (period) {
            case 'today': from = new Date(now.setHours(0, 0, 0, 0)); break;
            case 'week': from = new Date(now.setDate(now.getDate() - 7)); break;
            case 'month': from = new Date(now.setMonth(now.getMonth() - 1)); break;
            case 'year': from = new Date(now.setFullYear(now.getFullYear() - 1)); break;
            default: from = new Date(now.setDate(now.getDate() - 7)); break;
        }
        query = query.gte('created_at', from.toISOString());
    }

    // 정렬 (공지 우선)
    query = query.order('is_pinned', { ascending: false });
    switch (sort) {
        case 'latest': query = query.order('created_at', { ascending: false }); break;
        case 'popular': query = query.order('like_count', { ascending: false }); break;
        case 'comments': query = query.order('comment_count', { ascending: false }); break;
        case 'views': query = query.order('view_count', { ascending: false }); break;
    }

    // 페이지네이션
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count || 0;
    return {
        posts: (data || []).map(toPost),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function fetchPostById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
    if (error) return null;
    return toPost(data);
}

export async function fetchPostWithDetails(id: string, userId?: string): Promise<Post | null> {
    const post = await fetchPostById(id);
    if (!post) return null;

    // 대표 이미지 자동 채움: 비어있으면 본문 첫 이미지 추출 후 DB 업데이트 (아임웹 스타일)
    if (!post.representImage && post.content) {
        const extracted = extractFirstImage(post.content);
        if (extracted) {
            post.representImage = extracted;
            // DB에도 저장 (다음 리스트 조회 시 바로 사용)
            supabase.from('posts').update({ represent_image: extracted }).eq('id', id).then(() => {});
        }
    }

    // 첨부파일 조인
    const { data: attachments } = await supabase
        .from('attachments')
        .select('*')
        .eq('post_id', id);
    post.attachments = (attachments || []).map(a => snakeToCamel(a) as unknown as Attachment);

    // 좋아요/북마크 상태 (로그인 유저)
    if (userId) {
        const { data: like } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('target_type', 'post')
            .eq('target_id', id)
            .maybeSingle();
        post.isLiked = !!like;

        const { data: bookmark } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', userId)
            .eq('post_id', id)
            .maybeSingle();
        post.isBookmarked = !!bookmark;
    }

    return post;
}

export async function createPost(input: CreatePostInput, authorId?: string): Promise<Post> {
    const row: Record<string, unknown> = {
        site: input.site,
        board: input.board,
        title: input.title,
        content: input.content,
        excerpt: input.excerpt || extractExcerpt(input.content),
        category: input.category || '',
        tags: input.tags || [],
        represent_image: input.representImage || extractFirstImage(input.content) || '',
        status: input.status || 'published',
        is_pinned: input.isPinned || false,
        is_secret: input.isSecret || false,
    };

    if (authorId) {
        row.author_type = 'member';
        row.author_id = authorId;
    } else if (input.guestNickname) {
        row.author_type = 'guest';
        row.guest_nickname = input.guestNickname;
        row.guest_password = input.guestPassword; // API route에서 해시 처리
        row.guest_email = input.guestEmail || null;
    }

    const { data, error } = await supabase
        .from('posts')
        .insert(row)
        .select()
        .single();
    if (error) throw error;
    return toPost(data);
}

export async function updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    const row: Record<string, unknown> = {};
    if (input.title !== undefined) row.title = input.title;
    if (input.content !== undefined) {
        row.content = input.content;
        row.excerpt = input.excerpt || extractExcerpt(input.content);
    }
    if (input.category !== undefined) row.category = input.category;
    if (input.tags !== undefined) row.tags = input.tags;
    if (input.representImage !== undefined) row.represent_image = input.representImage;
    if (input.status !== undefined) row.status = input.status;
    if (input.isPinned !== undefined) row.is_pinned = input.isPinned;
    if (input.isSecret !== undefined) row.is_secret = input.isSecret;
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('posts')
        .update(row)
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return toPost(data);
}

export async function deletePost(id: string, hard = false) {
    if (hard) {
        const { error } = await supabase.from('posts').delete().eq('id', id);
        if (error) throw error;
    } else {
        // 소프트 삭제
        const { error } = await supabase
            .from('posts')
            .update({ status: 'deleted', deleted_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }
}

export async function incrementViewCount(id: string) {
    await supabase.rpc('increment_post_view', { p_id: id });
}

// ── Comments ──

export async function fetchComments(postId: string, userId?: string): Promise<Comment[]> {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .eq('status', 'active')
        .order('created_at', { ascending: true });
    if (error) throw error;

    const comments = (data || []).map(toComment);

    // 좋아요 상태
    if (userId && comments.length > 0) {
        const commentIds = comments.map(c => c.id);
        const { data: likes } = await supabase
            .from('likes')
            .select('target_id')
            .eq('user_id', userId)
            .eq('target_type', 'comment')
            .in('target_id', commentIds);
        const likedIds = new Set((likes || []).map(l => l.target_id));
        comments.forEach(c => { c.isLiked = likedIds.has(c.id); });
    }

    // 대댓글 트리 구성
    const rootComments: Comment[] = [];
    const childMap = new Map<string, Comment[]>();

    for (const c of comments) {
        if (c.parentId) {
            if (!childMap.has(c.parentId)) childMap.set(c.parentId, []);
            childMap.get(c.parentId)!.push(c);
        } else {
            rootComments.push(c);
        }
    }
    for (const root of rootComments) {
        root.replies = childMap.get(root.id) || [];
    }

    return rootComments;
}

export async function createComment(input: CreateCommentInput, authorId?: string): Promise<Comment> {
    const row: Record<string, unknown> = {
        post_id: input.postId,
        parent_id: input.parentId || null,
        content: input.content,
    };

    if (authorId) {
        row.author_type = 'member';
        row.author_id = authorId;
    } else {
        row.author_type = 'guest';
        row.guest_nickname = input.guestNickname;
        row.guest_password = input.guestPassword;
    }

    const { data, error } = await supabase
        .from('comments')
        .insert(row)
        .select()
        .single();
    if (error) throw error;
    return toComment(data);
}

export async function deleteComment(id: string) {
    const { error } = await supabase
        .from('comments')
        .update({ status: 'deleted' })
        .eq('id', id);
    if (error) throw error;
}

// ── Likes ──

export async function toggleLike(userId: string, targetType: 'post' | 'comment', targetId: string): Promise<boolean> {
    // 이미 좋아요 했는지 확인
    const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', userId)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .maybeSingle();

    if (existing) {
        // 좋아요 취소
        await supabase.from('likes').delete().eq('id', existing.id);
        return false;
    } else {
        // 좋아요 추가
        await supabase.from('likes').insert({
            user_id: userId,
            target_type: targetType,
            target_id: targetId,
        });
        return true;
    }
}

// ── Bookmarks ──

export async function toggleBookmark(userId: string, postId: string): Promise<boolean> {
    const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .maybeSingle();

    if (existing) {
        await supabase.from('bookmarks').delete().eq('id', existing.id);
        return false;
    } else {
        await supabase.from('bookmarks').insert({ user_id: userId, post_id: postId });
        return true;
    }
}

export async function fetchBookmarks(userId: string, page = 1, limit = 12): Promise<PostListResponse> {
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase
        .from('bookmarks')
        .select('post_id, posts(*)', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;

    const total = count || 0;
    const posts = (data || [])
        .map(row => row.posts)
        .filter(Boolean)
        .map(p => toPost(p as unknown as Record<string, unknown>));

    return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Attachments ──

export async function uploadAttachment(postId: string, file: File): Promise<Attachment> {
    const now = new Date();
    const path = `board/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${Date.now()}_${file.name}`;

    const { data: uploaded, error: uploadError } = await supabase.storage
        .from('board-assets')
        .upload(path, file, { cacheControl: '3600', upsert: false });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('board-assets')
        .getPublicUrl(uploaded.path);

    const { data, error } = await supabase
        .from('attachments')
        .insert({
            post_id: postId,
            filename: file.name,
            filepath: publicUrl,
            filesize: file.size,
            mimetype: file.type,
        })
        .select()
        .single();
    if (error) throw error;
    return snakeToCamel(data) as unknown as Attachment;
}

export async function incrementDownloadCount(id: string) {
    const { data } = await supabase.from('attachments').select('download_count').eq('id', id).single();
    if (data) {
        await supabase.from('attachments').update({
            download_count: (data.download_count || 0) + 1,
        }).eq('id', id);
    }
}

// ── Tags ──

export async function fetchPopularTags(site: SiteCode, limit = 20): Promise<{ tag: string; count: number }[]> {
    // tags 컬럼에서 집계 — RPC 또는 클라이언트 집계
    const { data, error } = await supabase
        .from('posts')
        .select('tags')
        .eq('site', site)
        .eq('status', 'published');
    if (error) throw error;

    const tagCount = new Map<string, number>();
    for (const row of data || []) {
        const tags = (row.tags as string[]) || [];
        for (const t of tags) {
            tagCount.set(t, (tagCount.get(t) || 0) + 1);
        }
    }

    return Array.from(tagCount.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

// ── 유틸 ──

function extractExcerpt(html: string, maxLength = 200): string {
    const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

/** 본문 HTML에서 첫 번째 이미지 URL 추출 (아임웹 스타일 자동 대표이미지) */
function extractFirstImage(html: string): string {
    // <img src="..."> 패턴 — base64 data URI는 리스트 응답에 너무 무거우므로 제외
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        if (!match[1].startsWith('data:')) return match[1];
    }
    // markdown ![alt](url) 패턴
    const mdMatch = html.match(/!\[[^\]]*\]\(([^)]+)\)/);
    if (mdMatch?.[1] && !mdMatch[1].startsWith('data:')) return mdMatch[1];
    // base64 이미지는 리스트 응답에 포함하면 너무 무거우므로 제외
    return '';
}

// ── Storage (이미지 업로드) ──

const BUCKET = 'board-assets';

export async function uploadImage(file: File, path?: string): Promise<string> {
    const ext = file.name.split('.').pop() || 'png';
    const filePath = path || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
    });
    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
}

export async function uploadBase64Image(base64: string, filename?: string): Promise<string> {
    const match = base64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) throw new Error('Invalid base64 image');

    const ext = match[1];
    const data = match[2];
    const buffer = Buffer.from(data, 'base64');
    const filePath = filename || `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(filePath, buffer, {
        contentType: `image/${ext}`,
        cacheControl: '3600',
        upsert: false,
    });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return urlData.publicUrl;
}
