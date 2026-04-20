/**
 * Jakka Supabase 쿼리 함수
 * 크리에이터 프로필, 작업(포트폴리오), 팔로우, 좋아요
 */
import { createClient } from './client';

const supabase = createClient();

// ── 타입 ──────────────────────────────────────────────────────

export interface EducationItem {
    school: string;
    major: string;
    degree: string;
    from_year: string;
    to_year: string | null;
    is_current: boolean;
}

export interface CareerItem {
    company: string;
    role: string;
    from_year: string;
    to_year: string | null;
    is_current: boolean;
    description?: string;
}

export interface JakkaCreator {
    id: string;
    user_id: string;
    email: string;
    handle: string;
    display_name: string;
    status: string;
    field: string | null;
    year_level: string | null;
    school: string | null;
    statement: string | null;
    bio: string | null;
    tags: string[];
    links: { label: string; url: string }[];
    education: EducationItem[];
    career: CareerItem[];
    featured_work_id: string | null;
    followers_count: number;
    following_count: number;
    works_count: number;
    bookmarks_count: number;
    is_public: boolean;
    created_at: string;
    updated_at: string;
    featured_work?: JakkaWork | null;
}

export interface JakkaWork {
    id: string;
    creator_id: string;
    user_id: string;
    title: string;
    category: string;
    description: string | null;
    images: string[];
    tags: string[];
    is_featured: boolean;
    year: string;
    likes_count: number;
    created_at: string;
    updated_at: string;
}

// ── 크리에이터 ────────────────────────────────────────────────

/** 내 크리에이터 프로필 조회. 없으면 null. */
export async function getMyCreatorProfile(userId: string): Promise<JakkaCreator | null> {
    try {
        const { data, error } = await supabase
            .from('jakka_creators')
            .select('*, featured_work:jakka_works!featured_work_id(*)')
            .eq('user_id', userId)
            .single();
        if (error || !data) return null;
        return data as JakkaCreator;
    } catch { return null; }
}

/** handle로 크리에이터 조회 */
export async function getCreatorByHandle(handle: string): Promise<JakkaCreator | null> {
    try {
        const normalized = handle.startsWith('@') ? handle : `@${handle}`;
        const { data, error } = await supabase
            .from('jakka_creators')
            .select('*, featured_work:jakka_works!featured_work_id(*)')
            .eq('handle', normalized)
            .single();
        if (error || !data) return null;
        return data as JakkaCreator;
    } catch { return null; }
}

/** 모든 크리에이터 목록 (홈 피드용) */
export async function getCreators(limit = 20, offset = 0): Promise<JakkaCreator[]> {
    try {
        const { data } = await supabase
            .from('jakka_creators')
            .select('*, featured_work:jakka_works!featured_work_id(*)')
            .eq('is_public', true)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        return (data as JakkaCreator[]) ?? [];
    } catch { return []; }
}

/** 크리에이터 프로필 생성 */
export async function createCreatorProfile(params: {
    userId: string;
    email: string;
    handle: string;
    displayName: string;
}): Promise<JakkaCreator | null> {
    const { data, error } = await supabase
        .from('jakka_creators')
        .insert({
            user_id: params.userId,
            email: params.email,
            handle: params.handle,
            display_name: params.displayName,
        })
        .select()
        .single();
    if (error) { console.error('createCreatorProfile:', error); return null; }
    return data as JakkaCreator;
}

/** 크리에이터 프로필 업데이트 */
export async function updateCreatorProfile(
    userId: string,
    updates: Partial<Pick<JakkaCreator, 'display_name' | 'handle' | 'status' | 'field' | 'year_level' | 'school' | 'statement' | 'bio' | 'tags' | 'links' | 'education' | 'career' | 'featured_work_id'>>
): Promise<JakkaCreator | null> {
    const { data, error } = await supabase
        .from('jakka_creators')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();
    if (error) { console.error('updateCreatorProfile:', error); return null; }
    return data as JakkaCreator;
}

// ── 작업 ──────────────────────────────────────────────────────

/** 특정 크리에이터의 작업 목록 */
export async function getWorksByCreator(creatorId: string): Promise<JakkaWork[]> {
    try {
        const { data } = await supabase
            .from('jakka_works')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false });
        return (data as JakkaWork[]) ?? [];
    } catch { return []; }
}

/** 최근 작업 목록 (홈 피드용) */
export async function getRecentWorks(limit = 20): Promise<(JakkaWork & { creator: JakkaCreator })[]> {
    try {
        const { data } = await supabase
            .from('jakka_works')
            .select('*, creator:jakka_creators(*)')
            .order('created_at', { ascending: false })
            .limit(limit);
        return (data as (JakkaWork & { creator: JakkaCreator })[]) ?? [];
    } catch { return []; }
}

/** 작업 업로드 */
export async function createWork(params: {
    creatorId: string;
    userId: string;
    title: string;
    category: string;
    description?: string;
    images: string[];
    tags: string[];
    isFeatured: boolean;
}): Promise<JakkaWork | null> {
    const { data, error } = await supabase
        .from('jakka_works')
        .insert({
            creator_id: params.creatorId,
            user_id: params.userId,
            title: params.title,
            category: params.category,
            description: params.description || null,
            images: params.images,
            tags: params.tags,
            is_featured: params.isFeatured,
            year: new Date().getFullYear().toString(),
        })
        .select()
        .single();
    if (error) { console.error('createWork:', error); return null; }
    return data as JakkaWork;
}

/** 작업 삭제 */
export async function deleteWork(workId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('jakka_works')
        .delete()
        .eq('id', workId)
        .eq('user_id', userId);
    return !error;
}

// ── 이미지 업로드 ─────────────────────────────────────────────

/** 작업 이미지를 Storage에 업로드. 공개 URL 반환. */
export async function uploadWorkImage(userId: string, file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
        .from('jakka-works')
        .upload(path, file, { upsert: false });
    if (error) { console.error('uploadWorkImage:', error); return null; }
    const { data } = supabase.storage.from('jakka-works').getPublicUrl(path);
    return data.publicUrl;
}

// ── 스토리 포스트 (브런치형 글) ────────────────────────────────

export interface JakkaPost {
    id: string;
    creator_id: string;
    user_id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    body: string;
    cover_image: string | null;
    category: string | null;
    tags: string[];
    read_minutes: number;
    is_published: boolean;
    views_count: number;
    likes_count: number;
    created_at: string;
    updated_at: string;
    creator?: JakkaCreator;
}

/** 특정 크리에이터의 스토리 목록 */
export async function getPostsByCreator(creatorId: string, includeUnpublished = false): Promise<JakkaPost[]> {
    try {
        let q = supabase
            .from('jakka_posts')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false });
        if (!includeUnpublished) q = q.eq('is_published', true);
        const { data } = await q;
        return (data as JakkaPost[]) ?? [];
    } catch { return []; }
}

/** 크리에이터의 포스트 카테고리 목록 (중복 제거) */
export async function getPostCategories(creatorId: string): Promise<string[]> {
    try {
        const { data } = await supabase
            .from('jakka_posts')
            .select('category')
            .eq('creator_id', creatorId)
            .eq('is_published', true)
            .not('category', 'is', null);
        const set = new Set<string>();
        (data ?? []).forEach((r: { category: string | null }) => r.category && set.add(r.category));
        return Array.from(set);
    } catch { return []; }
}

/** 최근 스토리 (발견의장 피드용) */
export async function getRecentPosts(limit = 20): Promise<JakkaPost[]> {
    try {
        const { data } = await supabase
            .from('jakka_posts')
            .select('*, creator:jakka_creators(*)')
            .eq('is_published', true)
            .order('created_at', { ascending: false })
            .limit(limit);
        return (data as JakkaPost[]) ?? [];
    } catch { return []; }
}

/** slug로 스토리 조회 (creator_id + slug UNIQUE) */
export async function getPostBySlug(creatorId: string, slug: string): Promise<JakkaPost | null> {
    try {
        const { data } = await supabase
            .from('jakka_posts')
            .select('*, creator:jakka_creators(*)')
            .eq('creator_id', creatorId)
            .eq('slug', slug)
            .single();
        return data as JakkaPost | null;
    } catch { return null; }
}

/** 스토리 생성 */
export async function createPost(params: {
    creatorId: string;
    userId: string;
    slug: string;
    title: string;
    subtitle?: string;
    body: string;
    coverImage?: string;
    category?: string;
    tags?: string[];
    isPublished?: boolean;
}): Promise<JakkaPost | null> {
    const readMinutes = Math.max(1, Math.round(params.body.length / 500));
    const { data, error } = await supabase
        .from('jakka_posts')
        .insert({
            creator_id: params.creatorId,
            user_id: params.userId,
            slug: params.slug,
            title: params.title,
            subtitle: params.subtitle || null,
            body: params.body,
            cover_image: params.coverImage || null,
            category: params.category || null,
            tags: params.tags ?? [],
            read_minutes: readMinutes,
            is_published: params.isPublished ?? true,
        })
        .select()
        .single();
    if (error) { console.error('createPost:', error); return null; }
    return data as JakkaPost;
}

/** 스토리 수정 */
export async function updatePost(
    postId: string,
    userId: string,
    updates: Partial<Pick<JakkaPost, 'title' | 'subtitle' | 'body' | 'cover_image' | 'category' | 'tags' | 'is_published' | 'slug'>>
): Promise<JakkaPost | null> {
    const patch: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
    if (updates.body !== undefined) {
        patch.read_minutes = Math.max(1, Math.round(updates.body.length / 500));
    }
    const { data, error } = await supabase
        .from('jakka_posts')
        .update(patch)
        .eq('id', postId)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) { console.error('updatePost:', error); return null; }
    return data as JakkaPost;
}

/** 스토리 삭제 */
export async function deletePost(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('jakka_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);
    return !error;
}

/** 스토리 좋아요 여부 */
export async function isPostLiked(userId: string, postId: string): Promise<boolean> {
    try {
        const { data } = await supabase
            .from('jakka_post_likes')
            .select('user_id')
            .eq('user_id', userId)
            .eq('post_id', postId)
            .single();
        return !!data;
    } catch { return false; }
}

/** 스토리 좋아요 토글 */
export async function togglePostLike(userId: string, postId: string): Promise<boolean> {
    try {
        const already = await isPostLiked(userId, postId);
        if (already) {
            await supabase.from('jakka_post_likes').delete()
                .eq('user_id', userId).eq('post_id', postId);
            return false;
        } else {
            await supabase.from('jakka_post_likes').insert({ user_id: userId, post_id: postId });
            return true;
        }
    } catch { return false; }
}

/** slug 자동 생성 (한글 포함 title → URL safe) */
export function generateSlug(title: string): string {
    const base = title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-가-힣]/g, '')
        .slice(0, 60);
    return base || `post-${Date.now()}`;
}

// ── 쇼케이스 ──────────────────────────────────────────────────

export interface JakkaShowcase {
    id: string;
    organizer_id: string;
    user_id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    description: string;
    cover_image: string | null;
    category: string | null;
    location: string | null;
    start_date: string;
    end_date: string;
    status: 'pending' | 'approved' | 'rejected' | 'ended';
    publish_mode: 'immediate' | 'scheduled';
    approval_count: number;
    interests_count: number;
    handle: string | null;
    admin_user_id: string | null;
    rejected_at: string | null;
    approved_at: string | null;
    created_at: string;
    updated_at: string;
    organizer?: JakkaCreator;
}

export interface JakkaShowcaseApproval {
    id: string;
    showcase_id: string;
    approver_email: string;
    approver_id: string | null;
    token: string;
    status: 'pending' | 'approved' | 'rejected';
    responded_at: string | null;
    comment: string | null;
    created_at: string;
}

/** 공개된 쇼케이스 목록 */
export async function getApprovedShowcases(limit = 20): Promise<JakkaShowcase[]> {
    try {
        const { data } = await supabase
            .from('jakka_showcases')
            .select('*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*)')
            .in('status', ['approved', 'ended'])
            .order('start_date', { ascending: false })
            .limit(limit);
        return (data as JakkaShowcase[]) ?? [];
    } catch { return []; }
}

/** slug로 쇼케이스 조회 */
export async function getShowcaseBySlug(slug: string): Promise<JakkaShowcase | null> {
    try {
        const { data } = await supabase
            .from('jakka_showcases')
            .select('*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*)')
            .eq('slug', slug)
            .single();
        return data as JakkaShowcase | null;
    } catch { return null; }
}

/** 내가 신청한 쇼케이스 */
export async function getMyShowcases(userId: string): Promise<JakkaShowcase[]> {
    try {
        const { data } = await supabase
            .from('jakka_showcases')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return (data as JakkaShowcase[]) ?? [];
    } catch { return []; }
}

/** 쇼케이스 신청 + 3인 승인 요청 생성 */
export async function createShowcase(params: {
    organizerId: string;
    userId: string;
    slug: string;
    title: string;
    subtitle?: string;
    description: string;
    coverImage?: string;
    category?: string;
    location?: string;
    startDate: string;
    endDate: string;
    approverEmails: [string, string, string];
    publishMode?: 'immediate' | 'scheduled';
}): Promise<{ showcase: JakkaShowcase; approvals: JakkaShowcaseApproval[] } | null> {
    const { data: showcase, error } = await supabase
        .from('jakka_showcases')
        .insert({
            organizer_id: params.organizerId,
            user_id: params.userId,
            slug: params.slug,
            title: params.title,
            subtitle: params.subtitle || null,
            description: params.description,
            cover_image: params.coverImage || null,
            category: params.category || null,
            location: params.location || null,
            start_date: params.startDate,
            end_date: params.endDate,
            publish_mode: params.publishMode ?? 'immediate',
        })
        .select()
        .single();
    if (error || !showcase) { console.error('createShowcase:', error); return null; }

    const approvalRows = params.approverEmails.map((email) => ({
        showcase_id: showcase.id,
        approver_email: email.toLowerCase().trim(),
        token: `${showcase.id.slice(0, 8)}-${Math.random().toString(36).slice(2, 14)}`,
    }));
    const { data: approvals, error: apprErr } = await supabase
        .from('jakka_showcase_approvals')
        .insert(approvalRows)
        .select();
    if (apprErr) { console.error('createShowcase approvals:', apprErr); return null; }

    return { showcase: showcase as JakkaShowcase, approvals: (approvals ?? []) as JakkaShowcaseApproval[] };
}

/** 토큰으로 승인 요청 조회 */
export async function getApprovalByToken(token: string): Promise<(JakkaShowcaseApproval & { showcase: JakkaShowcase }) | null> {
    try {
        const { data } = await supabase
            .from('jakka_showcase_approvals')
            .select('*, showcase:jakka_showcases(*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*))')
            .eq('token', token)
            .single();
        return data as (JakkaShowcaseApproval & { showcase: JakkaShowcase }) | null;
    } catch { return null; }
}

/** 승인/거부 응답 */
export async function respondToShowcaseApproval(
    token: string,
    userId: string,
    decision: 'approved' | 'rejected',
    comment?: string,
): Promise<boolean> {
    const { error } = await supabase
        .from('jakka_showcase_approvals')
        .update({
            status: decision,
            approver_id: userId,
            responded_at: new Date().toISOString(),
            comment: comment || null,
        })
        .eq('token', token)
        .eq('status', 'pending');
    if (error) { console.error('respondToShowcaseApproval:', error); return false; }
    return true;
}

/** 쇼케이스의 승인 상태 목록 */
export async function getShowcaseApprovals(showcaseId: string): Promise<JakkaShowcaseApproval[]> {
    try {
        const { data } = await supabase
            .from('jakka_showcase_approvals')
            .select('*')
            .eq('showcase_id', showcaseId)
            .order('created_at', { ascending: true });
        return (data as JakkaShowcaseApproval[]) ?? [];
    } catch { return []; }
}

// ── 팔로우 ────────────────────────────────────────────────────

/** 팔로우 여부 확인 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
    try {
        const { data } = await supabase
            .from('jakka_follows')
            .select('follower_id')
            .eq('follower_id', followerId)
            .eq('following_id', followingId)
            .single();
        return !!data;
    } catch { return false; }
}

/** 팔로우 토글 */
export async function toggleFollow(
    followerCreatorId: string,
    followingCreatorId: string
): Promise<boolean> {
    try {
        const already = await isFollowing(followerCreatorId, followingCreatorId);
        if (already) {
            await supabase.from('jakka_follows').delete()
                .eq('follower_id', followerCreatorId)
                .eq('following_id', followingCreatorId);
            return false;
        } else {
            await supabase.from('jakka_follows').insert({
                follower_id: followerCreatorId,
                following_id: followingCreatorId,
            });
            return true;
        }
    } catch { return false; }
}

/** 크리에이터를 팔로우하는 사람들 목록 */
export async function getCreatorFollowers(creatorId: string): Promise<JakkaCreator[]> {
    try {
        const { data } = await supabase
            .from('jakka_follows')
            .select('follower_id, jakka_creators!follower_id(*)')
            .eq('following_id', creatorId)
            .order('created_at', { ascending: false });
        return (data ?? []).map((r: { jakka_creators: JakkaCreator }) => r.jakka_creators).filter(Boolean);
    } catch { return []; }
}

/** 크리에이터가 팔로우하는 사람들 목록 */
export async function getCreatorFollowing(creatorId: string): Promise<JakkaCreator[]> {
    try {
        const { data } = await supabase
            .from('jakka_follows')
            .select('following_id, jakka_creators!following_id(*)')
            .eq('follower_id', creatorId)
            .order('created_at', { ascending: false });
        return (data ?? []).map((r: { jakka_creators: JakkaCreator }) => r.jakka_creators).filter(Boolean);
    } catch { return []; }
}

/** 사용자가 좋아요 누른 작품 목록 */
export async function getLikedWorks(userId: string): Promise<JakkaWork[]> {
    try {
        const { data } = await supabase
            .from('jakka_likes')
            .select('work_id, jakka_works(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return (data ?? []).map((r: { jakka_works: JakkaWork }) => r.jakka_works).filter(Boolean);
    } catch { return []; }
}

/** 내가 팔로잉하는 사람들의 작품 피드 */
export async function getFollowingFeed(creatorId: string): Promise<JakkaWork[]> {
    try {
        const { data: follows } = await supabase
            .from('jakka_follows')
            .select('following_id')
            .eq('follower_id', creatorId);
        const ids = (follows ?? []).map((f: { following_id: string }) => f.following_id);
        if (ids.length === 0) return [];
        const { data } = await supabase
            .from('jakka_works')
            .select('*, jakka_creators!creator_id(display_name, handle)')
            .in('creator_id', ids)
            .order('created_at', { ascending: false })
            .limit(60);
        return (data ?? []) as JakkaWork[];
    } catch { return []; }
}

/** 나를 팔로우하는 사람들의 작품 피드 */
export async function getFollowersFeed(creatorId: string): Promise<JakkaWork[]> {
    try {
        const { data: follows } = await supabase
            .from('jakka_follows')
            .select('follower_id')
            .eq('following_id', creatorId);
        const ids = (follows ?? []).map((f: { follower_id: string }) => f.follower_id);
        if (ids.length === 0) return [];
        const { data } = await supabase
            .from('jakka_works')
            .select('*, jakka_creators!creator_id(display_name, handle)')
            .in('creator_id', ids)
            .order('created_at', { ascending: false })
            .limit(60);
        return (data ?? []) as JakkaWork[];
    } catch { return []; }
}

// ── 좋아요 ────────────────────────────────────────────────────

/** 좋아요 여부 확인 */
export async function isLiked(userId: string, workId: string): Promise<boolean> {
    try {
        const { data } = await supabase
            .from('jakka_likes')
            .select('user_id')
            .eq('user_id', userId)
            .eq('work_id', workId)
            .single();
        return !!data;
    } catch { return false; }
}

/** 좋아요 토글 */
export async function toggleLike(userId: string, workId: string): Promise<boolean> {
    try {
        const already = await isLiked(userId, workId);
        if (already) {
            await supabase.from('jakka_likes').delete()
                .eq('user_id', userId).eq('work_id', workId);
            return false;
        } else {
            await supabase.from('jakka_likes').insert({ user_id: userId, work_id: workId });
            return true;
        }
    } catch { return false; }
}

// ── 북마크 ────────────────────────────────────────────────────

/** 북마크 여부 확인 */
export async function isBookmarked(userId: string, creatorId: string): Promise<boolean> {
    try {
        const { data } = await supabase
            .from('jakka_bookmarks')
            .select('user_id')
            .eq('user_id', userId)
            .eq('creator_id', creatorId)
            .single();
        return !!data;
    } catch { return false; }
}

/** 북마크 토글 */
export async function toggleBookmark(userId: string, creatorId: string): Promise<boolean> {
    try {
        const already = await isBookmarked(userId, creatorId);
        if (already) {
            await supabase.from('jakka_bookmarks').delete()
                .eq('user_id', userId).eq('creator_id', creatorId);
            return false;
        } else {
            await supabase.from('jakka_bookmarks').insert({ user_id: userId, creator_id: creatorId });
            return true;
        }
    } catch { return false; }
}

/** 내가 북마크한 크리에이터 목록 */
export async function getBookmarkedCreators(userId: string): Promise<JakkaCreator[]> {
    try {
        const { data } = await supabase
            .from('jakka_bookmarks')
            .select('creator_id, jakka_creators(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        return (data ?? []).map((row: { jakka_creators: JakkaCreator }) => row.jakka_creators).filter(Boolean);
    } catch { return []; }
}

// ── 공고 ──────────────────────────────────────────────────────

export interface JakkaNotice {
    id: string;
    type: '채용' | '공모전' | '프로젝트' | '공고' | '파트너' | '외주' | '인턴';
    company: string;
    role: string;
    tags: string[];
    deadline: string;
    href: string | null;
    image_url: string | null;
    is_active: boolean;
    is_pinned: boolean;
    sort_order: number;
    contact_email: string | null;
    created_at: string;
    updated_at: string;
}

/** 활성 공고 목록 (홈 피드용) */
export async function getActiveNotices(): Promise<JakkaNotice[]> {
    try {
        const { data } = await supabase
            .from('jakka_notices')
            .select('*')
            .eq('is_active', true)
            .order('is_pinned', { ascending: false })
            .order('sort_order', { ascending: true });
        return (data as JakkaNotice[]) ?? [];
    } catch { return []; }
}

/** 전체 공고 목록 (인트라용) */
export async function getAllNotices(): Promise<JakkaNotice[]> {
    try {
        const { data } = await supabase
            .from('jakka_notices')
            .select('*')
            .order('sort_order', { ascending: true });
        return (data as JakkaNotice[]) ?? [];
    } catch { return []; }
}

/** 공고 저장 (upsert) */
export async function upsertNotice(notice: Partial<JakkaNotice> & { id?: string }): Promise<JakkaNotice | null> {
    const { id, ...rest } = notice;
    if (id) {
        const { data, error } = await supabase
            .from('jakka_notices')
            .update({ ...rest, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error) return null;
        return data as JakkaNotice;
    } else {
        const { data, error } = await supabase
            .from('jakka_notices')
            .insert(rest)
            .select()
            .single();
        if (error) return null;
        return data as JakkaNotice;
    }
}

/** 공고 삭제 */
export async function deleteNotice(id: string): Promise<boolean> {
    const { error } = await supabase.from('jakka_notices').delete().eq('id', id);
    return !error;
}

// ── 쇼케이스 참여 작가 / 작품 / 관심 ────────────────────────────

export interface JakkaShowcaseArtist {
    id: string;
    showcase_id: string;
    creator_id: string;
    role: 'organizer' | 'participant' | 'admin' | 'member';
    invite_status?: string;
    created_at: string;
    creator?: JakkaCreator;
}

export interface JakkaShowcaseWork {
    id: string;
    showcase_id: string;
    work_id: string;
    creator_id: string;
    display_order: number;
    created_at: string;
    work?: JakkaWork;
}

/** 쇼케이스 참여 작가 목록 */
export async function getShowcaseArtists(showcaseId: string): Promise<JakkaShowcaseArtist[]> {
    try {
        const { data } = await supabase
            .from('jakka_showcase_artists')
            .select('*, creator:jakka_creators(*)')
            .eq('showcase_id', showcaseId)
            .order('created_at', { ascending: true });
        return (data as JakkaShowcaseArtist[]) ?? [];
    } catch { return []; }
}

/** 쇼케이스 전시 작품 목록 */
export async function getShowcaseWorks(showcaseId: string): Promise<JakkaShowcaseWork[]> {
    try {
        const { data } = await supabase
            .from('jakka_showcase_works')
            .select('*, work:jakka_works(*)')
            .eq('showcase_id', showcaseId)
            .order('display_order', { ascending: true });
        return (data as JakkaShowcaseWork[]) ?? [];
    } catch { return []; }
}

/** 쇼케이스에 참여 작가 등록 */
export async function addShowcaseArtists(showcaseId: string, artists: { creatorId: string; role: 'organizer' | 'participant' }[]): Promise<boolean> {
    const rows = artists.map((a) => ({ showcase_id: showcaseId, creator_id: a.creatorId, role: a.role }));
    const { error } = await supabase.from('jakka_showcase_artists').upsert(rows, { onConflict: 'showcase_id,creator_id' });
    return !error;
}

/** 쇼케이스에 작품 추가 */
export async function addShowcaseWork(showcaseId: string, workId: string, creatorId: string): Promise<boolean> {
    const { error } = await supabase.from('jakka_showcase_works')
        .insert({ showcase_id: showcaseId, work_id: workId, creator_id: creatorId });
    return !error;
}

/** 쇼케이스에서 작품 제거 */
export async function removeShowcaseWork(showcaseId: string, workId: string): Promise<boolean> {
    const { error } = await supabase.from('jakka_showcase_works')
        .delete().eq('showcase_id', showcaseId).eq('work_id', workId);
    return !error;
}

/** 관심있어요 여부 */
export async function isInterestedInShowcase(userId: string, showcaseId: string): Promise<boolean> {
    try {
        const { data } = await supabase.from('jakka_showcase_interests')
            .select('user_id').eq('user_id', userId).eq('showcase_id', showcaseId).single();
        return !!data;
    } catch { return false; }
}

/** 관심있어요 토글 */
export async function toggleShowcaseInterest(userId: string, showcaseId: string): Promise<boolean> {
    try {
        const already = await isInterestedInShowcase(userId, showcaseId);
        if (already) {
            await supabase.from('jakka_showcase_interests').delete().eq('user_id', userId).eq('showcase_id', showcaseId);
            return false;
        } else {
            await supabase.from('jakka_showcase_interests').insert({ user_id: userId, showcase_id: showcaseId });
            return true;
        }
    } catch { return false; }
}

// ── 쇼케이스 핸들 / 관리자 / 멤버 초대 ──────────────────────────

/** handle 또는 slug로 쇼케이스 조회 */
export async function getShowcaseByIdentifier(identifier: string): Promise<JakkaShowcase | null> {
    try {
        const isHandle = identifier.startsWith('@');
        const { data } = await supabase
            .from('jakka_showcases')
            .select('*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*)')
            .eq(isHandle ? 'handle' : 'slug', isHandle ? identifier : identifier)
            .single();
        return data as JakkaShowcase | null;
    } catch { return null; }
}

/** 쇼케이스 핸들 설정 (관리자 전용) */
export async function setShowcaseHandle(showcaseId: string, userId: string, handle: string): Promise<{ ok: boolean; error?: string }> {
    const normalized = handle.startsWith('@') ? handle : `@${handle}`;
    const { error } = await supabase
        .from('jakka_showcases')
        .update({ handle: normalized })
        .eq('id', showcaseId)
        .eq('admin_user_id', userId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

/** 핸들 중복 확인 */
export async function isShowcaseHandleAvailable(handle: string): Promise<boolean> {
    try {
        const normalized = handle.startsWith('@') ? handle : `@${handle}`;
        const { data } = await supabase.from('jakka_showcases').select('id').eq('handle', normalized);
        return !data?.length;
    } catch { return true; }
}

/** handle로 멤버 초대 (관리자 전용) */
export async function inviteMemberByHandle(showcaseId: string, handle: string): Promise<{ ok: boolean; error?: string }> {
    const creator = await getCreatorByHandle(handle);
    if (!creator) return { ok: false, error: '존재하지 않는 핸들입니다.' };
    const { error } = await supabase.from('jakka_showcase_artists')
        .upsert({ showcase_id: showcaseId, creator_id: creator.id, role: 'member', invite_status: 'accepted' },
            { onConflict: 'showcase_id,creator_id' });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
}

/** 멤버 제거 (관리자 전용) */
export async function removeMember(showcaseId: string, creatorId: string): Promise<boolean> {
    const { error } = await supabase.from('jakka_showcase_artists')
        .delete().eq('showcase_id', showcaseId).eq('creator_id', creatorId);
    return !error;
}

// ── 방명록 ────────────────────────────────────────────────────

export interface JakkaGuestbookEntry {
    id: string;
    showcase_id: string;
    user_id: string;
    author_name: string;
    author_handle: string | null;
    author_avatar: string | null;
    message: string;
    created_at: string;
}

export async function getGuestbook(showcaseId: string, limit = 50): Promise<JakkaGuestbookEntry[]> {
    try {
        const { data } = await supabase.from('jakka_showcase_guestbook')
            .select('*').eq('showcase_id', showcaseId)
            .order('created_at', { ascending: false }).limit(limit);
        return (data as JakkaGuestbookEntry[]) ?? [];
    } catch { return []; }
}

export async function addGuestbookEntry(params: {
    showcaseId: string; userId: string;
    authorName: string; authorHandle?: string; authorAvatar?: string; message: string;
}): Promise<boolean> {
    const { error } = await supabase.from('jakka_showcase_guestbook').insert({
        showcase_id: params.showcaseId, user_id: params.userId,
        author_name: params.authorName, author_handle: params.authorHandle ?? null,
        author_avatar: params.authorAvatar ?? null, message: params.message,
    });
    return !error;
}

export async function deleteGuestbookEntry(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase.from('jakka_showcase_guestbook')
        .delete().eq('id', id).eq('user_id', userId);
    return !error;
}

// ── 쇼케이스 내 작품 좋아요/댓글 ─────────────────────────────

export interface JakkaShowcaseWorkComment {
    id: string;
    showcase_id: string;
    work_id: string;
    user_id: string;
    author_name: string;
    author_handle: string | null;
    author_avatar: string | null;
    comment: string;
    created_at: string;
}

export async function getShowcaseWorkComments(showcaseId: string, workId: string): Promise<JakkaShowcaseWorkComment[]> {
    try {
        const { data } = await supabase.from('jakka_showcase_work_comments')
            .select('*').eq('showcase_id', showcaseId).eq('work_id', workId)
            .order('created_at', { ascending: true });
        return (data as JakkaShowcaseWorkComment[]) ?? [];
    } catch { return []; }
}

export async function addShowcaseWorkComment(params: {
    showcaseId: string; workId: string; userId: string;
    authorName: string; authorHandle?: string; authorAvatar?: string; comment: string;
}): Promise<boolean> {
    const { error } = await supabase.from('jakka_showcase_work_comments').insert({
        showcase_id: params.showcaseId, work_id: params.workId, user_id: params.userId,
        author_name: params.authorName, author_handle: params.authorHandle ?? null,
        author_avatar: params.authorAvatar ?? null, comment: params.comment,
    });
    return !error;
}

export async function deleteShowcaseWorkComment(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase.from('jakka_showcase_work_comments')
        .delete().eq('id', id).eq('user_id', userId);
    return !error;
}

export async function isShowcaseWorkLiked(showcaseId: string, workId: string, userId: string): Promise<boolean> {
    try {
        const { data } = await supabase.from('jakka_showcase_work_likes')
            .select('user_id').eq('showcase_id', showcaseId).eq('work_id', workId).eq('user_id', userId).single();
        return !!data;
    } catch { return false; }
}

export async function toggleShowcaseWorkLike(showcaseId: string, workId: string, userId: string): Promise<boolean> {
    const already = await isShowcaseWorkLiked(showcaseId, workId, userId);
    if (already) {
        await supabase.from('jakka_showcase_work_likes').delete()
            .eq('showcase_id', showcaseId).eq('work_id', workId).eq('user_id', userId);
        return false;
    }
    await supabase.from('jakka_showcase_work_likes').insert({ showcase_id: showcaseId, work_id: workId, user_id: userId });
    return true;
}

/** 쇼케이스 내 모든 작품의 좋아요/댓글 수 취합 */
export async function getShowcaseActivitySummary(showcaseId: string): Promise<{
    totalLikes: number; totalComments: number; totalGuestbook: number;
}> {
    try {
        const [likes, comments, guestbook] = await Promise.all([
            supabase.from('jakka_showcase_work_likes').select('*', { count: 'exact', head: true }).eq('showcase_id', showcaseId),
            supabase.from('jakka_showcase_work_comments').select('*', { count: 'exact', head: true }).eq('showcase_id', showcaseId),
            supabase.from('jakka_showcase_guestbook').select('*', { count: 'exact', head: true }).eq('showcase_id', showcaseId),
        ]);
        return { totalLikes: likes.count ?? 0, totalComments: comments.count ?? 0, totalGuestbook: guestbook.count ?? 0 };
    } catch { return { totalLikes: 0, totalComments: 0, totalGuestbook: 0 }; }
}

// ── 쇼케이스 명예의 전당 ──────────────────────────────────────

export interface JakkaShowcaseHallEntry {
    showcase: JakkaShowcase;
    totalLikes: number;
    totalComments: number;
    totalGuestbook: number;
    totalInterests: number;
    engagementScore: number;
}

/** Hot: 이번 달 인게이지먼트 상위 (interests_count 기준 + 최근 작품 활동) */
export async function getHotShowcases(limit = 20): Promise<JakkaShowcase[]> {
    try {
        const { data } = await supabase
            .from('jakka_showcases')
            .select('*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*)')
            .eq('status', 'approved')
            .order('interests_count', { ascending: false })
            .limit(limit);
        return (data as JakkaShowcase[]) ?? [];
    } catch { return []; }
}

/** New: 최근 7일 내 생성된 쇼케이스 */
export async function getNewShowcases(limit = 20): Promise<JakkaShowcase[]> {
    try {
        const since = new Date(Date.now() - 7 * 86400000).toISOString();
        const { data } = await supabase
            .from('jakka_showcases')
            .select('*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*)')
            .eq('status', 'approved')
            .gte('created_at', since)
            .order('created_at', { ascending: false })
            .limit(limit);
        return (data as JakkaShowcase[]) ?? [];
    } catch { return []; }
}

/** 임박: 공식 전시 시작 7일 이내 */
export async function getUpcomingShowcases(limit = 20): Promise<JakkaShowcase[]> {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const in7days = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        const { data } = await supabase
            .from('jakka_showcases')
            .select('*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*)')
            .eq('status', 'approved')
            .gte('start_date', today)
            .lte('start_date', in7days)
            .order('start_date', { ascending: true })
            .limit(limit);
        return (data as JakkaShowcase[]) ?? [];
    } catch { return []; }
}

/** 명예의 전당: 오프라인 종료된 쇼케이스 (계속 온라인 공개) */
export async function getEndedShowcases(limit = 20): Promise<JakkaShowcase[]> {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await supabase
            .from('jakka_showcases')
            .select('*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*)')
            .in('status', ['approved', 'ended'])
            .lt('end_date', today)
            .order('interests_count', { ascending: false })
            .limit(limit);
        return (data as JakkaShowcase[]) ?? [];
    } catch { return []; }
}

/** 종료된 쇼케이스 중 인게이지먼트 상위 목록. year/month 지정 시 해당 월에 종료된 것만. */
export async function getHallOfFameShowcases(limit = 10, year?: number, month?: number): Promise<JakkaShowcaseHallEntry[]> {
    try {
        const today = new Date().toISOString().slice(0, 10);
        let q = supabase
            .from('jakka_showcases')
            .select('*, organizer:jakka_creators!jakka_showcases_organizer_id_fkey(*)')
            .in('status', ['approved', 'ended'])
            .lt('end_date', today);

        if (year !== undefined && month !== undefined) {
            const from = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
            q = q.gte('end_date', from).lte('end_date', to);
        }

        const { data: showcases } = await q.order('created_at', { ascending: false }).limit(50);

        if (!showcases?.length) return [];

        const entries = await Promise.all((showcases as JakkaShowcase[]).map(async (sc) => {
            const [likes, comments, guestbook] = await Promise.all([
                supabase.from('jakka_showcase_work_likes').select('*', { count: 'exact', head: true }).eq('showcase_id', sc.id),
                supabase.from('jakka_showcase_work_comments').select('*', { count: 'exact', head: true }).eq('showcase_id', sc.id),
                supabase.from('jakka_showcase_guestbook').select('*', { count: 'exact', head: true }).eq('showcase_id', sc.id),
            ]);
            const totalLikes = likes.count ?? 0;
            const totalComments = comments.count ?? 0;
            const totalGuestbook = guestbook.count ?? 0;
            const totalInterests = sc.interests_count ?? 0;
            // 가중치: 좋아요 1점, 댓글 2점, 방명록 3점, 관심 1.5점
            const engagementScore = totalLikes * 1 + totalComments * 2 + totalGuestbook * 3 + totalInterests * 1.5;
            return { showcase: sc, totalLikes, totalComments, totalGuestbook, totalInterests, engagementScore };
        }));

        return entries
            .sort((a, b) => b.engagementScore - a.engagementScore)
            .slice(0, limit);
    } catch { return []; }
}

// ── 알림 ──────────────────────────────────────────────────────

export type JakkaNotificationType = 'follow' | 'new_work' | 'dm' | 'sale';

export interface JakkaNotification {
    id: string;
    user_id: string;
    type: JakkaNotificationType;
    actor_id: string | null;
    actor_name: string | null;
    actor_handle: string | null;
    actor_avatar: string | null;
    reference_id: string | null;
    reference_title: string | null;
    reference_thumb: string | null;
    is_read: boolean;
    created_at: string;
}

/** 내 알림 목록 */
export async function getNotifications(userId: string, limit = 30): Promise<JakkaNotification[]> {
    try {
        const { data } = await supabase
            .from('jakka_notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
        return (data as JakkaNotification[]) ?? [];
    } catch { return []; }
}

/** 안 읽은 알림 수 */
export async function getUnreadCount(userId: string): Promise<number> {
    try {
        const { count } = await supabase
            .from('jakka_notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);
        return count ?? 0;
    } catch { return 0; }
}

/** 알림 하나 읽음 처리 */
export async function markAsRead(notifId: string): Promise<void> {
    await supabase.from('jakka_notifications').update({ is_read: true }).eq('id', notifId);
}

/** 전체 알림 읽음 처리 */
export async function markAllRead(userId: string): Promise<void> {
    await supabase
        .from('jakka_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
}

// ── 핸들 유효성 ───────────────────────────────────────────────

/** 핸들 중복 확인 */
export async function isHandleAvailable(handle: string, excludeUserId?: string): Promise<boolean> {
    try {
        const normalized = handle.startsWith('@') ? handle : `@${handle}`;
        let q = supabase.from('jakka_creators').select('id').eq('handle', normalized);
        if (excludeUserId) q = q.neq('user_id', excludeUserId);
        const { data } = await q;
        return !data?.length;
    } catch { return true; }
}

/** 이메일에서 기본 핸들 생성 (@앞부분 + 숫자) */
export function generateHandle(email: string): string {
    const base = email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase();
    return `@${base}`;
}

// ─── 마켓 (jakka_products) ───────────────────────────────────────────────────

export type ProductCategory = '원화' | '프린트' | '굿즈' | '피규어' | '포스터' | '사진' | 'NFT' | '기타';
export type ProductStatus = 'active' | 'sold_out' | 'hidden';

export interface JakkaProduct {
    id: string;
    creator_id: string;
    creator?: JakkaCreator;
    title: string;
    description: string | null;
    category: ProductCategory;
    price: number;
    currency: 'KRW' | 'ETH';
    thumb_url: string | null;
    images: string[];
    is_limited: boolean;
    stock: number | null;
    sold_count: number;
    status: ProductStatus;
    created_at: string;
    updated_at: string;
}

export interface GetProductsOptions {
    category?: ProductCategory | '전체';
    search?: string;
    limit?: number;
    offset?: number;
}

export async function getProducts(opts: GetProductsOptions = {}): Promise<(JakkaProduct & { creator: JakkaCreator })[]> {
    const { category, search, limit = 40, offset = 0 } = opts;
    try {
        let q = supabase
            .from('jakka_products')
            .select('*, creator:jakka_creators(*)')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (category && category !== '전체') q = q.eq('category', category);
        if (search) q = q.or(`title.ilike.%${search}%`);

        const { data } = await q;
        return (data ?? []) as (JakkaProduct & { creator: JakkaCreator })[];
    } catch { return []; }
}

export async function getProductById(id: string): Promise<(JakkaProduct & { creator: JakkaCreator }) | null> {
    try {
        const { data } = await supabase
            .from('jakka_products')
            .select('*, creator:jakka_creators(*)')
            .eq('id', id)
            .single();
        return data as (JakkaProduct & { creator: JakkaCreator }) | null;
    } catch { return null; }
}

export async function getProductsByCreator(creatorId: string, includeHidden = false): Promise<JakkaProduct[]> {
    try {
        let q = supabase
            .from('jakka_products')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false });
        if (!includeHidden) q = q.neq('status', 'hidden');
        const { data } = await q;
        return (data ?? []) as JakkaProduct[];
    } catch { return []; }
}

export async function createProduct(params: {
    creatorId: string;
    title: string;
    description?: string;
    category: ProductCategory;
    price: number;
    currency?: 'KRW' | 'ETH';
    thumbUrl?: string;
    images?: string[];
    isLimited?: boolean;
    stock?: number;
}): Promise<JakkaProduct | null> {
    try {
        const { data } = await supabase
            .from('jakka_products')
            .insert({
                creator_id: params.creatorId,
                title: params.title,
                description: params.description ?? null,
                category: params.category,
                price: params.price,
                currency: params.currency ?? 'KRW',
                thumb_url: params.thumbUrl ?? null,
                images: params.images ?? [],
                is_limited: params.isLimited ?? false,
                stock: params.stock ?? null,
            })
            .select()
            .single();
        return data as JakkaProduct | null;
    } catch { return null; }
}

export async function updateProduct(
    productId: string,
    updates: Partial<Pick<JakkaProduct, 'title' | 'description' | 'category' | 'price' | 'thumb_url' | 'images' | 'is_limited' | 'stock' | 'status'>>
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('jakka_products')
            .update(updates)
            .eq('id', productId);
        return !error;
    } catch { return false; }
}

export async function deleteProduct(productId: string): Promise<boolean> {
    try {
        const { error } = await supabase.from('jakka_products').delete().eq('id', productId);
        return !error;
    } catch { return false; }
}
