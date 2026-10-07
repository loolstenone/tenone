/**
 * MADLeague 회차(경쟁 PT·프로젝트) 접근 — 서버 전용
 *   staff  : 직원 (member_roles — isStaffMember)
 *   client : 그 회차 클라이언트 = member_capability_roles (showcase, madleague, host, {type:'corporate', competition_id})
 *   team   : 그 회차 팀원 (mad_team_members, members.id)
 * 클라이언트에게는 팀 이름·제출물만 보인다 — 팀원 이름·연락처 비노출 (개인정보보호법 제17조, 2026-10-08 결정)
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffMember } from "@/lib/api-guard";

export type RoundRole = "staff" | "client" | "team";

export interface RoundAccess {
    memberId: string;
    role: RoundRole;
    teamId: string | null;
    comp: { id: string; title: string; kind: string; status: string; client_name: string | null };
}

/** 이 회차의 클라이언트 회원 id들 */
export async function roundClientIds(compId: string): Promise<string[]> {
    const { data } = await createAdminClient().from("member_capability_roles").select("member_id")
        .eq("brand_id", "madleague").eq("capability_key", "showcase").eq("role", "host")
        .eq("context->>competition_id", compId).is("valid_until", null);
    return [...new Set((data ?? []).map((r: { member_id: string }) => r.member_id))];
}

/** 회차 팀원 전체 (알림용) */
export async function roundTeamMemberIds(compId: string, teamId?: string | null): Promise<string[]> {
    const admin = createAdminClient();
    let teamIds: string[];
    if (teamId) teamIds = [teamId];
    else {
        const { data: teams } = await admin.from("mad_competition_teams").select("id").eq("competition_id", compId);
        teamIds = (teams ?? []).map((t: { id: string }) => t.id);
    }
    if (!teamIds.length) return [];
    const { data } = await admin.from("mad_team_members").select("member_id").in("team_id", teamIds);
    return [...new Set((data ?? []).map((r: { member_id: string }) => r.member_id))];
}

/** 세션 회원의 회차 접근 권한. 없으면 null */
export async function getRoundAccess(compId: string): Promise<RoundAccess | null> {
    if (!/^[0-9a-f-]{36}$/i.test(compId)) return null;
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const admin = createAdminClient();
    const { data: me } = await admin.from("members").select("id").eq("auth_id", user.id).maybeSingle();
    if (!me) return null;
    const { data: comp } = await admin.from("mad_competitions").select("id, title, kind, status, client_name").eq("id", compId).maybeSingle();
    if (!comp) return null;

    const { data: teams } = await admin.from("mad_competition_teams").select("id").eq("competition_id", compId);
    const teamIds = (teams ?? []).map((t: { id: string }) => t.id);
    const [isStaff, clients, { data: link }] = await Promise.all([
        isStaffMember(admin, me.id),
        roundClientIds(compId),
        teamIds.length
            ? admin.from("mad_team_members").select("team_id").eq("member_id", me.id).in("team_id", teamIds).limit(1).maybeSingle()
            : Promise.resolve({ data: null }),
    ]);
    const teamId = (link as { team_id: string } | null)?.team_id ?? null;
    const role: RoundRole | null = isStaff ? "staff" : clients.includes(me.id) ? "client" : teamId ? "team" : null;
    if (!role) return null;
    return { memberId: me.id, role, teamId, comp };
}
