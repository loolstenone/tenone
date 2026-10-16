/**
 * 공개 프로필 응답(get_public_profile · preview_my_public_profile) → 화면 데이터
 *
 * 공개할 항목은 DB 함수 profile_public_payload 한 곳에서만 고른다 (sql/profile-p1-core.sql).
 * 공개 화면·공유 링크 화면·본인 미리보기가 같은 결과를 보여 주도록, 화면은 받은 값만 그린다.
 */
import type { PublicProfileData } from '@/components/UniverseProfile';

/** DB 함수가 돌려주는 모양 */
export interface PublicProfileRow {
    id?: string;
    name?: string;
    handle?: string;
    email?: string | null;
    company?: string | null;
    bio?: string | null;
    avatar_url?: string | null;
    interests_industry?: string[] | null;
    interests_job?: string[] | null;
    profile_visibility?: 'public' | 'private';
    searchable?: boolean;
    created_at?: string;
    privacy_settings?: Record<string, boolean> | null;
    social_links?: Record<string, string> | null;
    via_share?: boolean;
    moved_to?: string;
}

export const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

export function toPublicProfileData(row: PublicProfileRow, fallbackHandle = ''): PublicProfileData {
    return {
        id: row.id ?? '',
        name: row.name ?? '',
        handle: row.handle || fallbackHandle,
        email: row.email || undefined,
        company: row.company || undefined,
        bio: row.bio || undefined,
        avatarUrl: row.avatar_url || undefined,
        interestsIndustry: row.interests_industry || [],
        interestsJob: row.interests_job || [],
        profileVisibility: row.profile_visibility === 'public' ? 'public' : 'private',
        createdAt: row.created_at ?? '',
        privacySettings: row.privacy_settings || undefined,
        socialLinks: row.social_links || undefined,
    };
}

/** 공개 프로필 주소 (공유 토큰이 있으면 붙인다) */
export function publicProfileUrl(origin: string, handle: string, shareToken?: string) {
    return `${origin}/@${handle}${shareToken ? `?s=${shareToken}` : ''}`;
}

/** DB 트리거 오류 문구를 그대로 보여 줄 수 있으면 보여 준다 (check_violation = 우리가 쓴 한국어 안내) */
export function friendlyDbError(err: { code?: string; message?: string } | null | undefined, fallback: string) {
    if (!err) return '';
    if (err.code === '23514' && err.message) return err.message;           // check_violation (트리거 안내)
    if (err.code === '23505') return '이미 사용 중인 값입니다.';
    return fallback;
}
