// @handle 공개 페이지 데이터 집계 (서버 전용)
//
// 한 사용자의 visibility='public' 콘텐츠를 5섹션으로 집계:
//   1. 프로필 헤더 (members)
//   2. 프로페셔널 (myverse_identities.resume)
//   3. 포트폴리오 (myverse_projects WHERE visibility='public')
//   4. 다이어리 하이라이트 (myverse_daily_moments WHERE visibility='public', 최근 12개)
//   5. 외부 링크 (members.affiliations + 직접 입력 추가 예정)
//
// anon 클라이언트로 호출 가능 — RLS는 visibility='public' row만 조회 허용해야 함.
// 임시 정책: admin 클라이언트로 fetch 후 visibility 필터로 안전 노출.

import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicProfile {
    handle: string;
    member_id: string;
    name: string | null;
    avatar_url: string | null;
    affiliations: string[];
    joined_at: string;
}

export interface ResumeSection {
    type: "education" | "experience" | "certification" | "skills" | "languages" | "awards";
    label: string;
    items: Array<Record<string, unknown>>;
}

export interface PublicProject {
    id: string;
    title: string;
    description: string | null;
    cover_url: string | null;
    updated_at: string;
}

export interface PublicMoment {
    id: string;
    date: string;
    happened_at: string | null;
    caption: string | null;
    media_url: string;
    media_type: "image" | "video";
    domain: string | null;
}

export interface PublicBrandAsset {
    id: string;
    type: "logo" | "palette" | "typography" | "image" | "template" | "link" | "tagline" | "mission";
    title: string;
    file_url: string | null;
    data: Record<string, unknown>;
    is_primary: boolean;
}

export interface PublicPageData {
    profile: PublicProfile;
    resume_sections: ResumeSection[];
    projects: PublicProject[];
    moments: PublicMoment[];
    brand_assets: PublicBrandAsset[];
}

const SECTION_LABELS: Record<ResumeSection["type"], string> = {
    education:     "학력",
    experience:    "경력",
    certification: "자격증",
    skills:        "기술",
    languages:     "언어",
    awards:        "수상",
};

export async function getPublicPageData(handle: string): Promise<PublicPageData | null> {
    const admin = createAdminClient();

    // 1) 프로필 (myverse_public_handles view)
    const { data: profile } = await admin
        .from("myverse_public_handles")
        .select("*")
        .eq("handle", handle)
        .maybeSingle();

    if (!profile) return null;

    // 1-b) page_visible 체크 — false 시 비공개 처리
    const { data: userSettings } = await admin
        .from("myverse_users")
        .select("page_visible")
        .eq("member_id", profile.member_id)
        .maybeSingle();

    // row 없으면 기본값 true (신규 사용자)
    if (userSettings && userSettings.page_visible === false) return null;

    // 2) 이력서 (myverse_identities.resume JSONB)
    const { data: identity } = await admin
        .from("myverse_identities")
        .select("resume")
        .eq("member_id", profile.member_id)
        .maybeSingle();

    const resume = (identity?.resume as Record<string, unknown[]> | null) ?? {};
    const resume_sections: ResumeSection[] = (Object.keys(SECTION_LABELS) as ResumeSection["type"][])
        .filter(t => Array.isArray(resume[t]) && (resume[t] as unknown[]).length > 0)
        .map(t => ({
            type: t,
            label: SECTION_LABELS[t],
            items: resume[t] as Array<Record<string, unknown>>,
        }));

    // 3) 포트폴리오 (visibility='public')
    const { data: projects } = await admin
        .from("myverse_projects")
        .select("id, title, description, cover_url, updated_at")
        .eq("member_id", profile.member_id)
        .eq("visibility", "public")
        .order("updated_at", { ascending: false })
        .limit(20);

    // 4) 다이어리 하이라이트
    const { data: moments } = await admin
        .from("myverse_daily_moments")
        .select("id, date, happened_at, caption, media_url, media_type, domain")
        .eq("member_id", profile.member_id)
        .eq("visibility", "public")
        .order("happened_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(12);

    // 5) 브랜드 자산 (show_on_portfolio=true + visibility=public)
    const { data: brandAssets } = await admin
        .from("myverse_brand_assets")
        .select("id, type, title, file_url, data, is_primary")
        .eq("member_id", profile.member_id)
        .eq("show_on_portfolio", true)
        .eq("visibility", "public")
        .order("is_primary", { ascending: false })
        .order("type")
        .order("order_index");

    return {
        profile: {
            handle: profile.handle,
            member_id: profile.member_id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            affiliations: (profile.affiliations as string[] | null) ?? [],
            joined_at: profile.joined_at,
        },
        resume_sections,
        projects: (projects ?? []) as PublicProject[],
        moments: (moments ?? []) as PublicMoment[],
        brand_assets: (brandAssets ?? []) as PublicBrandAsset[],
    };
}

/** 단일 모먼트 조회 (단축 URL 용) — visibility='public' 필수 */
export async function getPublicMoment(handle: string, momentId: string): Promise<{ profile: PublicProfile; moment: PublicMoment } | null> {
    const admin = createAdminClient();
    const { data: profile } = await admin
        .from("myverse_public_handles")
        .select("*")
        .eq("handle", handle)
        .maybeSingle();
    if (!profile) return null;

    const { data: moment } = await admin
        .from("myverse_daily_moments")
        .select("id, date, happened_at, caption, media_url, media_type, domain, visibility")
        .eq("id", momentId)
        .eq("member_id", profile.member_id)
        .eq("visibility", "public")
        .maybeSingle();
    if (!moment) return null;

    return {
        profile: {
            handle: profile.handle,
            member_id: profile.member_id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            affiliations: (profile.affiliations as string[] | null) ?? [],
            joined_at: profile.joined_at,
        },
        moment: moment as PublicMoment,
    };
}
