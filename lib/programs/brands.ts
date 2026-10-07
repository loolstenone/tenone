/**
 * 코어 프로그램 모듈 — 브랜드 확장 훅 (서버 전용)
 * 코어 테이블은 브랜드 테이블을 직접 참조하지 않는다 (데이터 계약 3조). 브랜드 전용 값은 team.context에 두고, 여기서 해석한다.
 *   groups     : 팀 소속 단위 (MADLeague = 동아리 → team.context.club_id)
 *   candidates : 인트라 팀 배정 후보 (MADLeague = 현역·임원 매드리거 / 그 외 = 브랜드 가입 회원 member_brand_joins)
 */
import { createAdminClient } from "@/lib/supabase/admin";

export interface ProgramGroup { id: string; name: string; logo_url: string | null }
export interface Candidate { member_id: string; group_id: string | null }

export const GROUP_LABEL: Record<string, string> = { madleague: "동아리" };

export async function brandGroups(brand: string): Promise<ProgramGroup[]> {
    if (brand !== "madleague") return [];
    const { data } = await createAdminClient().from("mad_clubs").select("id, name, logo_url").order("name");
    return (data ?? []) as ProgramGroup[];
}

export async function brandCandidates(brand: string): Promise<Candidate[]> {
    const admin = createAdminClient();
    if (brand === "madleague") {
        const { data } = await admin.from("member_capability_roles").select("member_id, context")
            .eq("brand_id", "madleague").eq("capability_key", "club").in("role", ["현역", "임원"]).is("valid_until", null);
        const seen = new Map<string, Candidate>();
        for (const r of (data ?? []) as { member_id: string; context: { club_id?: string } | null }[]) {
            if (!seen.has(r.member_id)) seen.set(r.member_id, { member_id: r.member_id, group_id: r.context?.club_id ?? null });
        }
        return [...seen.values()];
    }
    const { data } = await admin.from("member_brand_joins").select("member_id").eq("brand_id", brand).is("withdrawn_at", null).limit(2000);
    return (data ?? []).map((r: { member_id: string }) => ({ member_id: r.member_id, group_id: null }));
}

/* ─── 2단계: 사이트에서 팀 구성 (2026-10-08) ─────────────────────────────
 * officer : 브랜드가 정한 "팀을 꾸릴 수 있는 사람" — MADLeague = 동아리 운영진(club 임원) → 자기 동아리 팀만
 * 후보   : 그 그룹의 그 해 활동 회원 — MADLeague = 동아리 현역(context.year = 회차 연도, 연도 미기록 포함)·운영진
 */

/** 이 회원이 팀을 꾸릴 수 있는 그룹 id (운영진인 동아리) */
export async function officerGroupIds(brand: string, memberId: string): Promise<string[]> {
    if (brand !== "madleague") return [];
    const { data } = await createAdminClient().from("member_capability_roles").select("context")
        .eq("member_id", memberId).eq("brand_id", "madleague").eq("capability_key", "club").eq("role", "임원").is("valid_until", null);
    return [...new Set((data ?? []).map((r: { context: { club_id?: string } | null }) => r.context?.club_id).filter((x): x is string => typeof x === "string"))];
}

/** 그룹별 팀 배정 후보 (그 해 활동 회원) */
export async function groupCandidates(brand: string, groupIds: string[], year: number): Promise<Candidate[]> {
    if (brand !== "madleague" || !groupIds.length) return [];
    const { data } = await createAdminClient().from("member_capability_roles").select("member_id, role, context")
        .eq("brand_id", "madleague").eq("capability_key", "club").in("role", ["현역", "임원"]).is("valid_until", null)
        .in("context->>club_id", groupIds);
    const seen = new Map<string, Candidate>();
    for (const r of (data ?? []) as { member_id: string; role: string; context: { club_id?: string; year?: number | string | null; term?: string } | null }[]) {
        const y = r.context?.year ?? (r.context?.term ? String(r.context.term).slice(0, 4) : null);
        if (y != null && String(y) !== String(year)) continue;
        if (!seen.has(r.member_id)) seen.set(r.member_id, { member_id: r.member_id, group_id: r.context?.club_id ?? null });
    }
    return [...seen.values()];
}

/* ─── 3단계: 인증서 (2026-10-08) ─────────────────────────────────────────
 * 브랜드 활동 인증 (회차와 무관) — MADLeague = 동아리 현역 활동 연도 (끝난 연도 또는 종료된 현역 기록)
 * 인증서 표기용 브랜드 값 — MADLeague = 소속 동아리·기수 (+ 지원서의 대학·전공은 첫 발급 입력 기본값)
 */
export interface ActivityCert { key: string; year: number; group_id: string | null }

export async function brandActivityCerts(brand: string, memberId: string): Promise<ActivityCert[]> {
    if (brand !== "madleague") return [];
    const { data } = await createAdminClient().from("member_capability_roles").select("context, valid_until")
        .eq("member_id", memberId).eq("brand_id", "madleague").eq("capability_key", "club").in("role", ["현역", "임원"]);
    const thisYear = new Date().getFullYear();
    const byYear = new Map<number, ActivityCert>();
    for (const r of (data ?? []) as { context: { club_id?: string; year?: number | string; term?: string } | null; valid_until: string | null }[]) {
        const y = Number(r.context?.year ?? (r.context?.term ? String(r.context.term).slice(0, 4) : NaN));
        if (!Number.isFinite(y) || !(y < thisYear || r.valid_until)) continue;
        if (!byYear.has(y)) byYear.set(y, { key: `activity:${y}`, year: y, group_id: r.context?.club_id ?? null });
    }
    return [...byYear.values()].sort((a, b) => b.year - a.year);
}

export interface BrandCertExtras { group_label: string | null; group_name: string | null; cohort: string | null; university: string | null; major: string | null }

export async function brandCertExtras(brand: string, memberId: string, groupId: string | null, year: number | null): Promise<BrandCertExtras> {
    const empty: BrandCertExtras = { group_label: GROUP_LABEL[brand] ?? null, group_name: null, cohort: null, university: null, major: null };
    if (brand !== "madleague") return empty;
    const admin = createAdminClient();
    const [{ data: club }, { data: apps }] = await Promise.all([
        groupId ? admin.from("mad_clubs").select("name").eq("id", groupId).maybeSingle() : Promise.resolve({ data: null }),
        admin.from("mad_applications").select("club_id, activity_year, cohort, university, major, created_at")
            .eq("member_id", memberId).order("created_at", { ascending: false }).limit(20),
    ]);
    type App = { club_id: string | null; activity_year: number | null; cohort: number | null; university: string | null; major: string | null };
    const list = (apps ?? []) as App[];
    const app = list.find(a => (!groupId || a.club_id === groupId) && (!year || a.activity_year === year)) ?? list[0] ?? null;
    return {
        ...empty,
        group_name: (club as { name: string } | null)?.name ?? null,
        cohort: app?.cohort != null ? `${app.cohort}기` : null,
        university: app?.university ?? null,
        major: app?.major ?? null,
    };
}
