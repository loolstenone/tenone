// 서버 전용 (service_role 사용) — 클라이언트 컴포넌트에서 import 금지
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffMember } from "@/lib/api-guard";

/**
 * MADLeague 회원 활동 역할 — member_capability_roles(brand_id='madleague') SSOT (§1.3.1)
 * 권한(직원)은 member_roles, 활동 역할(현역·임원·멘토·과제기업)은 capability 모델.
 * 역할 변경은 UPDATE 금지 — 기존 행 valid_until 설정 + 새 행 INSERT
 */

const BRAND_ID = "madleague";

export type MadApplicantRole = "member" | "club_leader" | "mentor" | "corporate";

interface CapabilityRole {
    capability_key: "club" | "showcase";
    role: string;
    context: Record<string, unknown>;
}

/** 지원 유형 → capability 역할 */
export function capabilityRoleForApplicant(
    applicantRole: MadApplicantRole,
    extra: { clubId?: string | null; activityYear?: number | null; companyName?: string | null },
): CapabilityRole {
    switch (applicantRole) {
        case "club_leader":
            return { capability_key: "club", role: "임원", context: { position: "회장", club_id: extra.clubId ?? null, year: extra.activityYear ?? null } };
        case "mentor":
            return { capability_key: "club", role: "멘토", context: { club_id: extra.clubId ?? null } };
        case "corporate":
            return { capability_key: "showcase", role: "host", context: { type: "corporate", company: extra.companyName ?? null } };
        default:
            return { capability_key: "club", role: "현역", context: { club_id: extra.clubId ?? null, year: extra.activityYear ?? null } };
    }
}

/** 활동 역할 부여 — 같은 capability·역할의 진행 중 행이 있으면 건너뜀 */
export async function grantMadCapabilityRole(memberId: string, cap: CapabilityRole): Promise<void> {
    const admin = createAdminClient();
    const { data: existing } = await admin
        .from("member_capability_roles")
        .select("id")
        .eq("member_id", memberId)
        .eq("brand_id", BRAND_ID)
        .eq("capability_key", cap.capability_key)
        .eq("role", cap.role)
        .is("valid_until", null)
        .limit(1);
    if (existing && existing.length > 0) return;

    const { error } = await admin.from("member_capability_roles").insert({
        member_id: memberId,
        brand_id: BRAND_ID,
        capability_key: cap.capability_key,
        role: cap.role,
        context: cap.context,
    });
    if (error) throw new Error(`member_capability_roles insert failed: ${error.message}`);
}

export interface MadAccess {
    isStaff: boolean;
    /** 진행 중인 MADLeague 활동 역할 (club·showcase) */
    roles: { capability_key: string; role: string; context: Record<string, unknown> | null }[];
    /** 매드리거 전용 공간(아레나·커뮤니티·PT·프로젝트) 입장 가능 */
    canEnter: boolean;
    isMentor: boolean;
    /** 멘토로 담당하는 동아리 id (context.club_id) — 지원서 열람은 담당 동아리만 */
    mentorClubIds: string[];
}

/** 동아리 지원서(소속 인증) 열람 가능 여부: 직원 · 해당 동아리 운영진 · (옛) 회장 · 담당 멘토 */
export function canViewClubApplications(
    access: MadAccess,
    memberId: string,
    club: { id: string; president_member_id: string | null },
): boolean {
    return access.isStaff || officerClubIds(access).includes(club.id) || club.president_member_id === memberId || access.mentorClubIds.includes(club.id);
}

/* ─── 동아리 운영진 (2026-10-08) ───────────────────────────────────────────
 * 운영진 = (club, 임원, {club_id, position, term}) 활동 역할. 동아리당 최대 5명, 회장 1명 필수.
 * 지정·교체 = 직원 또는 해당 동아리 회장·부회장 / 지원서 승인 = 해당 동아리 운영진 전원 (사용자 결정)
 * 새 명단 저장 = 이전 임기 운영진 자동 종료 (인수인계 공백 없음)
 */
export const OFFICER_POSITIONS = ["회장", "부회장", "총무"] as const;
const OFFICER_MANAGER_POSITIONS = ["회장", "부회장"];
export const MAX_OFFICERS = 5;

export type TermUnit = "year" | "semester";

/** 임기 표기 — 연간 2026 · 학기 2026-1(3~8월)·2026-2(9~2월, 1·2월은 전년도 2학기) */
export function termLabel(unit: TermUnit, d = new Date()): string {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (unit === "year") return String(y);
    if (m >= 3 && m <= 8) return `${y}-1`;
    return m >= 9 ? `${y}-2` : `${y - 1}-2`;
}

/** 다음 임기 표기 */
export function nextTermLabel(unit: TermUnit, d = new Date()): string {
    const cur = termLabel(unit, d);
    if (unit === "year") return String(Number(cur) + 1);
    const [y, s] = cur.split("-").map(Number);
    return s === 1 ? `${y}-2` : `${y + 1}-1`;
}

/** 내가 운영진인 동아리 id */
export function officerClubIds(access: MadAccess): string[] {
    return access.roles
        .filter(r => r.capability_key === "club" && r.role === "임원")
        .map(r => r.context?.club_id)
        .filter((id): id is string => typeof id === "string");
}

/** 동아리 소개 페이지를 고칠 수 있는가: 직원 · 해당 동아리 운영진 전원 · (옛) 회장 (2026-10-10) */
export function canEditClubProfile(
    access: MadAccess,
    memberId: string,
    club: { id: string; president_member_id: string | null },
): boolean {
    return access.isStaff || officerClubIds(access).includes(club.id) || club.president_member_id === memberId;
}

/** 운영진을 지정할 수 있는가: 직원 또는 해당 동아리 회장·부회장 */
export function canManageClubOfficers(access: MadAccess, clubId: string): boolean {
    if (access.isStaff) return true;
    return access.roles.some(r =>
        r.capability_key === "club" && r.role === "임원"
        && r.context?.club_id === clubId
        && OFFICER_MANAGER_POSITIONS.includes(String(r.context?.position ?? "")));
}

export interface ClubOfficer { id: string; member_id: string; position: string; term: string | null; valid_from: string; valid_until: string | null }

/** 동아리 운영진 — 진행 중(valid_until null) + 최근 종료 이력 */
export async function getClubOfficers(clubId: string, opts: { history?: boolean } = {}): Promise<ClubOfficer[]> {
    let q = createAdminClient()
        .from("member_capability_roles")
        .select("id, member_id, context, valid_from, valid_until")
        .eq("brand_id", BRAND_ID).eq("capability_key", "club").eq("role", "임원")
        .eq("context->>club_id", clubId)
        .order("valid_from", { ascending: false });
    q = opts.history ? q.not("valid_until", "is", null).limit(30) : q.is("valid_until", null);
    const { data } = await q;
    return (data ?? []).map((r: { id: string; member_id: string; context: Record<string, unknown> | null; valid_from: string; valid_until: string | null }) => ({
        id: r.id,
        member_id: r.member_id,
        position: String(r.context?.position ?? "운영진"),
        term: typeof r.context?.term === "string" ? r.context.term : (r.context?.year != null ? String(r.context.year) : null),
        valid_from: r.valid_from,
        valid_until: r.valid_until,
    }));
}

/**
 * 운영진 명단 저장 — 이전 운영진 종료(valid_until) + 새 명단 INSERT + mad_clubs.president_member_id 동기화
 * 검증(1~5명·회장 1명·중복 없음)은 여기서 한다. 호출 전 권한 확인은 API 책임.
 */
export async function saveClubOfficers(
    clubId: string,
    term: string,
    officers: { member_id: string; position: string }[],
    actorMemberId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    const list = officers
        .map(o => ({ member_id: String(o.member_id), position: String(o.position ?? "").trim().slice(0, 20) }))
        .filter(o => o.member_id && o.position);
    if (list.length === 0 || list.length > MAX_OFFICERS) return { ok: false, error: `운영진은 1~${MAX_OFFICERS}명입니다.` };
    if (new Set(list.map(o => o.member_id)).size !== list.length) return { ok: false, error: "같은 사람이 두 번 들어 있습니다." };
    if (list.filter(o => o.position === "회장").length !== 1) return { ok: false, error: "회장은 1명이어야 합니다." };
    if (!/^\d{4}(-[12])?$/.test(term)) return { ok: false, error: "임기 표기가 올바르지 않습니다." };

    const admin = createAdminClient();
    const now = new Date().toISOString();
    // 새 명단 먼저 넣고 → 그 외 진행 중 운영진 종료 (INSERT 실패 시 기존 운영진 유지)
    const { data: inserted, error: insErr } = await admin.from("member_capability_roles").insert(list.map(o => ({
        member_id: o.member_id,
        brand_id: BRAND_ID,
        capability_key: "club",
        role: "임원",
        context: { club_id: clubId, position: o.position, term, appointed_by: actorMemberId },
        valid_from: now,
    }))).select("id");
    if (insErr) return { ok: false, error: insErr.message };

    const newIds = (inserted ?? []).map((r: { id: string }) => r.id);
    const { error: endErr } = await admin.from("member_capability_roles")
        .update({ valid_until: now })
        .eq("brand_id", BRAND_ID).eq("capability_key", "club").eq("role", "임원")
        .eq("context->>club_id", clubId).is("valid_until", null)
        .not("id", "in", `(${newIds.join(",")})`);
    if (endErr) return { ok: false, error: endErr.message };

    const president = list.find(o => o.position === "회장")!;
    await admin.from("mad_clubs").update({ president_member_id: president.member_id }).eq("id", clubId);
    return { ok: true };
}

/** members.id 기준 MADLeague 접근 정보 (서버 전용) */
export async function getMadAccess(memberId: string): Promise<MadAccess> {
    const admin = createAdminClient();
    const [isStaff, capRes] = await Promise.all([
        isStaffMember(admin, memberId),
        admin
            .from("member_capability_roles")
            .select("capability_key, role, context")
            .eq("member_id", memberId)
            .eq("brand_id", BRAND_ID)
            .in("capability_key", ["club", "showcase"])
            .is("valid_until", null),
    ]);
    const roles = (capRes.data ?? []) as MadAccess["roles"];
    const mentorRoles = roles.filter(r => r.capability_key === "club" && r.role === "멘토");
    return {
        isStaff,
        roles,
        canEnter: isStaff || roles.length > 0,
        isMentor: mentorRoles.length > 0,
        mentorClubIds: mentorRoles
            .map(r => r.context?.club_id)
            .filter((id): id is string => typeof id === "string"),
    };
}

/** 진행 중인 club 현역 회원 id 목록 (회장 선택용) */
export async function listActiveMadleaguers(): Promise<string[]> {
    const { data } = await createAdminClient()
        .from("member_capability_roles")
        .select("member_id")
        .eq("brand_id", BRAND_ID)
        .eq("capability_key", "club")
        .in("role", ["현역", "임원"])
        .is("valid_until", null);
    return [...new Set((data ?? []).map((r: { member_id: string }) => r.member_id))];
}

export type AcceptMadResult =
    | { ok: true }
    | { ok: false; error: "NOT_FOUND" | "ALREADY_PROCESSED" | "UPDATE_FAILED"; status: number };

/**
 * 지원서 승인 — 회장 승인(/api/madleague/applications/[id]/approve)·인트라 승인(admin/applications) 공통.
 * 권한 확인은 호출자 책임. status = 'accepted' (DB 트리거 mad_promote_application_to_member 기준값)
 * 지원자 = 지원서의 member_id (데이터 계약 1). 계정 연결 없는 옛 지원서는 상태만 승인
 */
export async function acceptMadApplication(appId: string, reviewerNote?: string | null): Promise<AcceptMadResult> {
    const admin = createAdminClient();
    const { data: app } = await admin
        .from("mad_applications")
        .select("id, member_id, club_id, status, university, major, activity_year, applicant_role, company_name")
        .eq("id", appId)
        .maybeSingle();
    if (!app) return { ok: false, error: "NOT_FOUND", status: 404 };
    if (app.status !== "pending" && app.status !== "reviewing") return { ok: false, error: "ALREADY_PROCESSED", status: 400 };

    // 상태 변경 → 트리거가 mad_members 1행 생성 (member_id 있을 때)
    const { error: updateErr } = await admin
        .from("mad_applications")
        .update({ status: "accepted", reviewed_at: new Date().toISOString(), ...(reviewerNote !== undefined && { reviewer_note: reviewerNote }) })
        .eq("id", appId);
    if (updateErr) return { ok: false, error: "UPDATE_FAILED", status: 500 };

    if (!app.member_id) return { ok: true };
    const { data: applicant } = await admin.from("members").select("id, auth_id").eq("id", app.member_id).maybeSingle();
    if (!applicant) return { ok: true };

    const applicantRole = (app.applicant_role ?? "member") as MadApplicantRole;
    const madRole = applicantRole; // mad_members.role 값 = 지원 유형 (member·club_leader·mentor·corporate)

    // 트리거가 만든 행(또는 기존 행)에 역할 반영, 없으면 생성. 이름·이메일·전화·사진은 복사하지 않는다 (members SSOT)
    const { data: existing } = await admin
        .from("mad_members")
        .select("id")
        .or(`member_id.eq.${applicant.id}${applicant.auth_id ? `,user_id.eq.${applicant.auth_id}` : ""}`)
        .limit(1);
    if (existing && existing.length > 0) {
        await admin.from("mad_members").update({ role: madRole, member_id: applicant.id }).eq("id", existing[0].id);
    } else {
        await admin.from("mad_members").insert({
            member_id: applicant.id,
            user_id: applicant.auth_id,
            club_id: app.club_id,
            university: app.university ?? null,
            major: app.major ?? null,
            role: madRole,
            activity_years: app.activity_year ? [app.activity_year] : [],
            source_application_id: app.id,
        });
    }

    // 활동 역할 = member_capability_roles (§1.3.1)
    await grantMadCapabilityRole(
        applicant.id,
        capabilityRoleForApplicant(applicantRole, {
            clubId: app.club_id, activityYear: app.activity_year, companyName: app.company_name,
        }),
    );

    if (applicantRole === "club_leader" && app.club_id) {
        await admin.from("mad_clubs").update({ president_member_id: applicant.id }).eq("id", app.club_id);
    }
    return { ok: true };
}
