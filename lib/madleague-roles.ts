// 서버 전용 (service_role 사용) — 클라이언트 컴포넌트에서 import 금지
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * MADLeague 회원 활동 역할 — member_capability_roles(brand_id='madleague') SSOT (§1.3.1)
 * 권한(직원)은 member_roles, 활동 역할(현역·임원·멘토·과제기업)은 capability 모델.
 * 역할 변경은 UPDATE 금지 — 기존 행 valid_until 설정 + 새 행 INSERT
 */

const BRAND_ID = "madleague";
const STAFF_ROLES = ["staff", "manager", "super_admin"];

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
}

/** members.id 기준 MADLeague 접근 정보 (서버 전용) */
export async function getMadAccess(memberId: string): Promise<MadAccess> {
    const admin = createAdminClient();
    const [staffRes, capRes] = await Promise.all([
        admin.from("member_roles").select("role").eq("member_id", memberId).in("role", STAFF_ROLES).eq("is_active", true).limit(1),
        admin
            .from("member_capability_roles")
            .select("capability_key, role, context")
            .eq("member_id", memberId)
            .eq("brand_id", BRAND_ID)
            .in("capability_key", ["club", "showcase"])
            .is("valid_until", null),
    ]);
    const isStaff = (staffRes.data ?? []).length > 0;
    const roles = (capRes.data ?? []) as MadAccess["roles"];
    return {
        isStaff,
        roles,
        canEnter: isStaff || roles.length > 0,
        isMentor: roles.some(r => r.capability_key === "club" && r.role === "멘토"),
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
