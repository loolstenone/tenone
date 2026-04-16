/**
 * Universe Profile 양방향 동기화 모듈
 *
 * 아키텍처:
 *   members 테이블 = 공통 필드의 단일 진실 소스 (이름, 이메일, 연락처, 소속, bio)
 *   서비스별 테이블 = 서비스 고유 데이터 (MADLeague 기수, Badak 직무 등)
 *   members.affiliations[] = 이용 중인 서비스 목록
 *
 * 동기화 흐름:
 *   유니버스 프로필에서 공통 필드 수정 → members 테이블 UPDATE → auth-context 갱신
 *   각 사이트 마이페이지에서 공통 필드 수정 → members 테이블 UPDATE → 유니버스 프로필 반영
 *   각 사이트 마이페이지에서 서비스 고유 필드 수정 → 서비스별 테이블 UPDATE
 *   유니버스 프로필에서 서비스 고유 필드 읽기 → 서비스별 테이블 SELECT
 */

import { createClient } from './client';

const supabase = createClient();

/* ── 공통 필드 (members 테이블) ── */

export interface UniverseProfileCommon {
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    bio: string | null;
    avatar_url: string | null;
    avatar_initials: string;
    affiliations: string[];
    origin_site: string;
    created_at: string;
    role: string;
    account_type: string;
}

/** 공통 프로필 조회 (members 테이블) */
export async function getUniverseProfile(email: string): Promise<UniverseProfileCommon | null> {
    const { data, error } = await supabase
        .from('members')
        .select('name, email, phone, company, bio, avatar_url, avatar_initials, affiliations, origin_site, created_at, role, account_type')
        .eq('email', email)
        .single();
    if (error || !data) return null;
    return data as UniverseProfileCommon;
}

/** 공통 필드 업데이트 — 어느 사이트에서 호출하든 members 테이블 반영 */
export async function updateUniverseProfile(email: string, updates: Partial<Pick<UniverseProfileCommon, 'name' | 'phone' | 'company' | 'bio' | 'avatar_url' | 'avatar_initials'>>) {
    const { data, error } = await supabase
        .from('members')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('email', email)
        .select()
        .single();
    if (error) throw error;
    return data;
}

/* ── 서비스별 프로필 데이터 ── */

export interface ServiceProfileData {
    siteId: string;
    siteName: string;
    isActive: boolean;
    joinedAt: string | null;
    lastActivity: string | null;
    fields: Record<string, string | number | null>;
}

/** MADLeague 서비스 프로필 조회 */
async function getMadLeagueProfile(email: string): Promise<ServiceProfileData | null> {
    const { data } = await supabase
        .from('mad_applications')
        .select('club_slug, cohort, activity_year, university, major, minor, industry, job_function, created_at, updated_at')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (!data) return null;
    return {
        siteId: 'madleague',
        siteName: 'MAD League',
        isActive: true,
        joinedAt: data.created_at,
        lastActivity: data.updated_at,
        fields: {
            '소속 동아리': data.club_slug,
            '기수': data.cohort ? `${data.cohort}기` : null,
            '활동 연도': data.activity_year ? `${data.activity_year}년` : null,
            '소속 대학': data.university,
            '전공': data.major,
            '부전공': data.minor,
            '관심 산업군': data.industry,
            '관심 직무군': data.job_function,
        },
    };
}

/** Badak 서비스 프로필 조회 */
async function getBadakProfile(email: string): Promise<ServiceProfileData | null> {
    const { data } = await supabase
        .from('badak_profiles')
        .select('job_function, industry, job_level, looking_for, can_offer, created_at, updated_at')
        .eq('email', email)
        .limit(1)
        .single();
    if (!data) return null;
    return {
        siteId: 'badak',
        siteName: 'Badak',
        isActive: true,
        joinedAt: data.created_at,
        lastActivity: data.updated_at,
        fields: {
            '직무': data.job_function,
            '산업군': data.industry,
            '경력': data.job_level,
        },
    };
}

/** HeRo 서비스 프로필 조회 */
async function getHeroProfile(email: string): Promise<ServiceProfileData | null> {
    const { data } = await supabase
        .from('career_profiles')
        .select('desired_position, desired_industry, skills, created_at, updated_at')
        .eq('email', email)
        .limit(1)
        .single();
    if (!data) return null;
    return {
        siteId: 'hero',
        siteName: 'HeRo',
        isActive: true,
        joinedAt: data.created_at,
        lastActivity: data.updated_at,
        fields: {
            '희망 직무': data.desired_position,
            '희망 산업군': Array.isArray(data.desired_industry) ? data.desired_industry.join(', ') : data.desired_industry,
            '스킬': Array.isArray(data.skills) ? data.skills.join(', ') : data.skills,
        },
    };
}

/** 전체 서비스 프로필 한번에 조회 */
export async function getAllServiceProfiles(email: string): Promise<ServiceProfileData[]> {
    const results = await Promise.allSettled([
        getMadLeagueProfile(email),
        getBadakProfile(email),
        getHeroProfile(email),
    ]);

    return results
        .filter((r): r is PromiseFulfilledResult<ServiceProfileData | null> => r.status === 'fulfilled')
        .map(r => r.value)
        .filter((v): v is ServiceProfileData => v !== null);
}

/* ── 소속(affiliation) 관리 ── */

/** 서비스 가입 시 affiliations에 추가 */
export async function joinService(email: string, siteId: string) {
    const profile = await getUniverseProfile(email);
    if (!profile) throw new Error('프로필을 찾을 수 없습니다');

    const affiliations = [...new Set([...profile.affiliations, siteId])];
    return updateUniverseProfile(email, {} as never).then(() =>
        supabase
            .from('members')
            .update({ affiliations, updated_at: new Date().toISOString() })
            .eq('email', email)
    );
}

/** 서비스 탈퇴 시 affiliations에서 제거 */
export async function leaveService(email: string, siteId: string) {
    const profile = await getUniverseProfile(email);
    if (!profile) throw new Error('프로필을 찾을 수 없습니다');

    const affiliations = profile.affiliations.filter(a => a !== siteId);
    return supabase
        .from('members')
        .update({ affiliations, updated_at: new Date().toISOString() })
        .eq('email', email);
}
