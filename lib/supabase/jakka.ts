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
