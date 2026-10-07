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
