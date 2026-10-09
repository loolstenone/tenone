// 인트라 서버 게이트 (Server Component 전용) — 인트라 껍데기(메뉴·목차)를 직원에게만 내려주기 위한 판단
// 직원 정의는 lib/api-guard.ts isStaffMember 하나 (member_roles staff 계열 @universe). middleware 1b와 같은 기준
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffMember } from "@/lib/api-guard";

export type IntraViewer = "staff" | "signed-in" | "anonymous";

/** 현재 요청의 세션을 서버에서 검증(getUser)해 직원 여부 판단 — 클라이언트 캐시·JWT 로컬 읽기를 믿지 않는다 */
export async function getIntraViewer(): Promise<IntraViewer> {
    return (await getIntraContext()).viewer;
}

/**
 * 직원이면 입사 상태도 함께 — invited·onboarding이면 인트라 대신 첫 로그인 확인 화면(StaffWelcome) (2026-10-10)
 *   tenone_staff_profiles row가 없는 기존 직원은 active로 본다
 */
export async function getIntraContext(): Promise<{ viewer: IntraViewer; staffStatus: string | null }> {
    const viewer = await resolveViewer();
    if (viewer.kind !== "staff") return { viewer: viewer.kind, staffStatus: null };
    const { data } = await createAdminClient().from("tenone_staff_profiles").select("status").eq("member_id", viewer.memberId).maybeSingle();
    return { viewer: "staff", staffStatus: (data?.status as string | undefined) ?? "active" };
}

async function resolveViewer(): Promise<{ kind: "anonymous" | "signed-in" } | { kind: "staff"; memberId: string }> {
    const sb = await createClient();
    const { data, error } = await sb.auth.getUser();
    const user = data?.user;
    if (error || !user) return { kind: "anonymous" };

    const admin = createAdminClient();
    let { data: member } = await admin.from("members").select("id").eq("auth_id", user.id).maybeSingle();
    // auth_id 미연결 row는 인증 완료 이메일일 때만 매칭 (api-guard resolveMember와 같은 규칙)
    if (!member && user.email && user.email_confirmed_at) {
        ({ data: member } = await admin.from("members").select("id").eq("email", user.email).is("auth_id", null).maybeSingle());
    }
    if (!member) return { kind: "signed-in" };
    return (await isStaffMember(admin, member.id)) ? { kind: "staff", memberId: member.id } : { kind: "signed-in" };
}
