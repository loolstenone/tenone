/**
 * Ten:One™ 통합 게시판 — 서버 전용 (app/api/board/* 에서만 사용)
 *
 * 저장소: ums_posts · ums_comments · ums_boards (+ likes · bookmarks · attachments)
 * 읽기는 posts / board_configs 뷰, 쓰기는 실제 테이블.
 * 권한 확인(로그인·게시판 쓰기 권한·작성자 본인)은 API 라우트 책임 — 여기서는 서비스 롤로 기록만 한다.
 * 작성자 표시는 members에서 조인 (이름·사진을 게시판 테이블에 복사하지 않음 — 데이터 계약 1조)
 */
import { createAdminClient } from './admin';
import type {
    Post, Comment, Attachment, BoardConfig,
    PostListParams, PostListResponse,
    CreatePostInput, UpdatePostInput, CreateCommentInput,
    SiteCode, PostStatus,
} from '@/types/board';

const supabase = createAdminClient();

// ── 유틸 ──

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        result[camelKey] = value;
    }
    return result;
}

function toPost(row: Record<string, unknown>): Post {
    const p = snakeToCamel(row) as unknown as Post;
    // 뷰의 guest_nickname = ums_posts.author_name (회원 아닌 작성자 표기용 — 에이전트·이전 데이터)
    p.authorType = p.authorId ? 'member' : 'admin';
    if (!p.authorId && p.guestNickname) p.authorName = p.guestNickname;
    p.guestNickname = null;
    p.likeCount = p.likeCount ?? 0;
    p.bookmarkCount = p.bookmarkCount ?? 0;
    p.tags = p.tags ?? [];
    return p;
}

/** DB 상태 enum(bums_post_status) ↔ 화면 상태 */
function toDbStatus(s?: PostStatus): string | undefined {
    if (!s) return undefined;
    if (s === 'hidden') return 'private';
    if (s === 'deleted') return 'archived';
    return s;
}

async function attachAuthors<T extends { authorId: string | null; authorName?: string; authorAvatar?: string }>(items: T[]): Promise<T[]> {
    const ids = Array.from(new Set(items.map(i => i.authorId).filter((v): v is string => !!v)));
    if (ids.length === 0) return items;
    const { data } = await supabase.from('members').select('id, name, avatar_url').in('id', ids);
    const byId = new Map((data ?? []).map((m: { id: string; name: string; avatar_url: string | null }) => [m.id, m]));
    return items.map(i => {
        const m = i.authorId ? byId.get(i.authorId) : undefined;
        return m ? { ...i, authorName: m.name, authorAvatar: m.avatar_url ?? undefined } : i;
    });
}

// ── Board Configs ──

export interface BoardRule {
    id: string;
    siteId: string;
    writePermission: string;
    commentPermission: string;
    allowComments: boolean;
}

/** 게시판 쓰기 규칙 (site slug + board slug) */
export async function fetchBoardRule(site: string, board: string): Promise<BoardRule | null> {
    const { data } = await supabase
        .from('ums_boards')
        .select('id, site_id, write_permission, comment_permission, allow_comments, ums_sites!inner(slug)')
        .eq('slug', board)
        .eq('ums_sites.slug', site)
        .maybeSingle();
    if (!data) return null;
    return {
        id: data.id,
        siteId: data.site_id,
        writePermission: data.write_permission,
        commentPermission: data.comment_permission,
        allowComments: data.allow_comments !== false,
    };
}

/** 회원 쓰기 가능 등급 — 그 외(intra·staff·admin)는 직원만 */
export function memberCanWrite(permission: string): boolean {
    return permission === 'all' || permission === 'member';
}

export async function fetchBoardConfigs(site?: SiteCode, slug?: string): Promise<BoardConfig[]> {
    let query = supabase.from('board_configs').select('*').order('sort_order');
    if (site) query = query.eq('site', site);
    if (slug) query = query.eq('slug', slug);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r: Record<string, unknown>) => snakeToCamel(r) as unknown as BoardConfig);
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

// ── Posts ──

export async function fetchPosts(params: PostListParams): Promise<PostListResponse> {
    const {
        site, board, category, tag, status,
        search, sort = 'latest', period = 'all',
        page = 1, limit = 12, author_id,
    } = params;

    let query = supabase
        .from('posts')
        .select('id, site, board, title, excerpt, category, status, author_id, guest_nickname, represent_image, tags, is_pinned, view_count, like_count, comment_count, bookmark_count, created_at', { count: 'exact' })
        .eq('site', site);

    if (board) query = query.eq('board', board);
    if (category) query = query.eq('category', category);
    if (author_id) query = query.eq('author_id', author_id);
    query = query.eq('status', toDbStatus(status) ?? 'published');
    if (tag) query = query.contains('tags', [tag]);

    // 검색 (제목 + 본문)
    if (search) {
        const s = search.replace(/[\\%_(),."']/g, '').trim().slice(0, 200);
        if (s) query = query.or(`title.ilike.%${s}%,content.ilike.%${s}%`);
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

    // 정렬 (공지 우선) — 좋아요 수는 목록에 집계하지 않으므로 인기순 = 조회수
    query = query.order('is_pinned', { ascending: false });
    switch (sort) {
        case 'latest': query = query.order('created_at', { ascending: false }); break;
        case 'popular': query = query.order('view_count', { ascending: false }); break;
        case 'comments': query = query.order('comment_count', { ascending: false }); break;
        case 'views': query = query.order('view_count', { ascending: false }); break;
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count || 0;
    return {
        posts: await attachAuthors((data || []).map(toPost)),
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
        .maybeSingle();
    if (error || !data) return null;
    const [post] = await attachAuthors([toPost(data)]);
    return post;
}

export async function fetchPostWithDetails(id: string, memberId?: string): Promise<Post | null> {
    const post = await fetchPostById(id);
    if (!post) return null;

    // 대표 이미지 자동 채움: 비어있으면 본문 첫 이미지 추출 후 DB 업데이트 (아임웹 스타일)
    if (!post.representImage && post.content) {
        const extracted = extractFirstImage(post.content);
        if (extracted) {
            post.representImage = extracted;
            supabase.from('ums_posts').update({ image: extracted }).eq('id', id).then(() => {});
        }
    }

    const [{ data: attachments }, { count: likeCount }, { count: bookmarkCount }] = await Promise.all([
        supabase.from('attachments').select('*').eq('post_id', id),
        supabase.from('likes').select('id', { count: 'exact', head: true }).eq('target_type', 'post').eq('target_id', id),
        supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('post_id', id),
    ]);
    post.attachments = (attachments || []).map((a: Record<string, unknown>) => snakeToCamel(a) as unknown as Attachment);
    post.likeCount = likeCount ?? 0;
    post.bookmarkCount = bookmarkCount ?? 0;

    if (memberId) {
        const [{ data: like }, { data: bookmark }] = await Promise.all([
            supabase.from('likes').select('id').eq('user_id', memberId).eq('target_type', 'post').eq('target_id', id).maybeSingle(),
            supabase.from('bookmarks').select('id').eq('user_id', memberId).eq('post_id', id).maybeSingle(),
        ]);
        post.isLiked = !!like;
        post.isBookmarked = !!bookmark;
    }

    return post;
}

/** 게시글 작성 — 호출 전에 게시판 쓰기 권한 확인 필수 (API 라우트) */
export async function createPost(
    input: CreatePostInput,
    rule: BoardRule,
    author: { memberId: string | null; displayName?: string },
): Promise<Post> {
    const status = toDbStatus(input.status) ?? 'published';
    const row: Record<string, unknown> = {
        board_id: rule.id,
        site_id: rule.siteId,
        title: input.title,
        body: input.content,
        summary: input.excerpt || extractExcerpt(input.content),
        category_id: input.category || null,
        tags: input.tags || [],
        image: input.representImage || extractFirstImage(input.content) || null,
        status,
        is_pinned: input.isPinned || false,
        is_secret: input.isSecret || false,
        author_id: author.memberId,
        // 회원 글은 이름을 복사하지 않는다 (members 조인). 비회원 작성자(에이전트 등)만 표기명 저장
        author_name: author.memberId ? null : (author.displayName ?? null),
        published_at: status === 'published' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase.from('ums_posts').insert(row).select('id').single();
    if (error) throw error;
    const post = await fetchPostById(data.id);
    if (!post) throw new Error('작성한 글을 찾을 수 없습니다.');
    return post;
}

/** 게시글 수정 — 호출 전에 작성자 본인·직원 확인 필수 */
export async function updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    const row: Record<string, unknown> = {};
    if (input.title !== undefined) row.title = input.title;
    if (input.content !== undefined) {
        row.body = input.content;
        row.summary = input.excerpt || extractExcerpt(input.content);
    }
    if (input.category !== undefined) row.category_id = input.category || null;
    if (input.tags !== undefined) row.tags = input.tags;
    if (input.representImage !== undefined) row.image = input.representImage || null;
    if (input.status !== undefined) {
        row.status = toDbStatus(input.status);
        if (input.status === 'published') row.published_at = new Date().toISOString();
    }
    if (input.isPinned !== undefined) row.is_pinned = input.isPinned;
    if (input.isSecret !== undefined) row.is_secret = input.isSecret;
    row.updated_at = new Date().toISOString();

    const { error } = await supabase.from('ums_posts').update(row).eq('id', id);
    if (error) throw error;
    const post = await fetchPostById(id);
    if (!post) throw new Error('글을 찾을 수 없습니다.');
    return post;
}

/** 삭제 — 기본은 보관(archived) 처리, hard=true면 영구 삭제 (직원만) */
export async function deletePost(id: string, hard = false) {
    if (hard) {
        const { error } = await supabase.from('ums_posts').delete().eq('id', id);
        if (error) throw error;
        return;
    }
    const { error } = await supabase
        .from('ums_posts')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) throw error;
}

export async function incrementViewCount(id: string) {
    await supabase.rpc('increment_post_view', { p_id: id });
}

// ── Comments (ums_comments) ──

function toComment(row: Record<string, unknown>, likeCount = 0): Comment {
    return {
        id: row.id as string,
        postId: row.post_id as string,
        parentId: (row.parent_id as string | null) ?? null,
        content: row.body as string,
        authorType: 'member',
        authorId: (row.author_id as string | null) ?? null,
        guestNickname: null,
        likeCount,
        status: row.status === 'published' ? 'active' : (row.status as Comment['status']),
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
    };
}

export async function fetchComments(postId: string, memberId?: string): Promise<Comment[]> {
    const { data, error } = await supabase
        .from('ums_comments')
        .select('id, post_id, parent_id, author_id, body, status, created_at, updated_at')
        .eq('post_id', postId)
        .eq('status', 'published')
        .order('created_at', { ascending: true });
    if (error) throw error;

    const rows = data || [];
    const ids = rows.map((r: { id: string }) => r.id);
    const likeCounts = new Map<string, number>();
    const likedIds = new Set<string>();
    if (ids.length > 0) {
        const { data: likes } = await supabase
            .from('likes')
            .select('target_id, user_id')
            .eq('target_type', 'comment')
            .in('target_id', ids);
        for (const l of likes || []) {
            likeCounts.set(l.target_id, (likeCounts.get(l.target_id) || 0) + 1);
            if (memberId && l.user_id === memberId) likedIds.add(l.target_id);
        }
    }

    const comments = await attachAuthors(rows.map((r: Record<string, unknown>) => {
        const c = toComment(r, likeCounts.get(r.id as string) || 0);
        c.isLiked = likedIds.has(c.id);
        return c;
    }));

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
    return rootComments.map(root => ({ ...root, replies: childMap.get(root.id) || [] }));
}

/** 댓글 작성 — 호출 전에 로그인·댓글 권한 확인 필수 */
export async function createComment(input: CreateCommentInput, memberId: string): Promise<Comment> {
    const { data, error } = await supabase
        .from('ums_comments')
        .insert({
            post_id: input.postId,
            parent_id: input.parentId || null,
            body: input.content,
            author_id: memberId,
        })
        .select('id, post_id, parent_id, author_id, body, status, created_at, updated_at')
        .single();
    if (error) throw error;
    const [c] = await attachAuthors([toComment(data)]);
    return c;
}

export async function fetchCommentAuthor(id: string): Promise<string | null | undefined> {
    const { data } = await supabase.from('ums_comments').select('author_id').eq('id', id).maybeSingle();
    return data ? (data.author_id as string | null) : undefined;
}

export async function deleteComment(id: string) {
    const { error } = await supabase
        .from('ums_comments')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) throw error;
}

// ── Likes (user_id = members.id) ──

export async function toggleLike(memberId: string, targetType: 'post' | 'comment', targetId: string): Promise<{ liked: boolean; count: number }> {
    const { data: existing } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', memberId)
        .eq('target_type', targetType)
        .eq('target_id', targetId)
        .maybeSingle();

    if (existing) {
        await supabase.from('likes').delete().eq('id', existing.id);
    } else {
        await supabase.from('likes').insert({ user_id: memberId, target_type: targetType, target_id: targetId });
    }
    const { count } = await supabase
        .from('likes')
        .select('id', { count: 'exact', head: true })
        .eq('target_type', targetType)
        .eq('target_id', targetId);
    return { liked: !existing, count: count ?? 0 };
}

// ── Bookmarks (user_id = members.id) ──

export async function toggleBookmark(memberId: string, postId: string): Promise<{ bookmarked: boolean; count: number }> {
    const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', memberId)
        .eq('post_id', postId)
        .maybeSingle();

    if (existing) {
        await supabase.from('bookmarks').delete().eq('id', existing.id);
    } else {
        await supabase.from('bookmarks').insert({ user_id: memberId, post_id: postId });
    }
    const { count } = await supabase
        .from('bookmarks')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', postId);
    return { bookmarked: !existing, count: count ?? 0 };
}

export async function fetchBookmarks(memberId: string, page = 1, limit = 12): Promise<PostListResponse> {
    const offset = (page - 1) * limit;
    const { data, error, count } = await supabase
        .from('bookmarks')
        .select('post_id', { count: 'exact' })
        .eq('user_id', memberId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) throw error;

    const total = count || 0;
    const ids = (data || []).map((r: { post_id: string }) => r.post_id);
    let posts: Post[] = [];
    if (ids.length > 0) {
        const { data: rows } = await supabase.from('posts').select('*').in('id', ids).eq('status', 'published');
        const byId = new Map((rows || []).map((r: Record<string, unknown>) => [r.id as string, toPost(r)]));
        posts = await attachAuthors(ids.map((id: string) => byId.get(id)).filter((p: Post | undefined): p is Post => !!p));
    }
    return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
}

// ── Attachments ──

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

// ── Related Posts ──

export async function fetchRelatedPosts(
    postId: string,
    site: SiteCode,
    board: string,
    category?: string,
    limit = 3
): Promise<Post[]> {
    let query = supabase
        .from('posts')
        .select('id, site, board, title, excerpt, category, represent_image, author_id, guest_nickname, tags, view_count, like_count, comment_count, created_at')
        .eq('site', site)
        .eq('board', board)
        .eq('status', 'published')
        .neq('id', postId)
        .limit(limit);

    if (category) {
        query = query.eq('category', category);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) return [];
    return attachAuthors((data || []).map(toPost));
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
