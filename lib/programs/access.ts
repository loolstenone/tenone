/**
 * 코어 프로그램 모듈 — 회차 접근 (서버 전용) · docs/Program_Module.md
 *   staff       : 직원 (member_roles — isStaffMember)
 *   client      : 그 회차 클라이언트 = member_capability_roles (showcase, {주인 brand}, host, {type:'corporate', round_id})
 *   participant : 그 회차 참가자 (program_participants, members.id) — 팀 참가면 teamId
 * 클라이언트에게는 팀 이름·제출물만 — 참가자 이름·연락처 비노출 (개인정보보호법 제17조, 2026-10-08 결정)
 */
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffMember } from "@/lib/api-guard";

export type RoundRole = "staff" | "client" | "team";

export interface RoundInfo {
    id: string; brand_id: string; channels: string[]; kind: string; mode: string;
    title: string; status: string; client_name: string | null;
}

export interface RoundAccess {
    memberId: string;
    role: RoundRole;
    teamId: string | null;
    round: RoundInfo;
}

const ROUND_COLS = "id, brand_id, channels, kind, mode, title, status, client_name";

export async function getRound(roundId: string): Promise<RoundInfo | null> {
    if (!/^[0-9a-f-]{36}$/i.test(roundId)) return null;
    const { data } = await createAdminClient().from("program_rounds").select(ROUND_COLS).eq("id", roundId).maybeSingle();
    return (data as RoundInfo | null) ?? null;
}

/** 이 회차의 클라이언트 회원 id들 */
export async function roundClientIds(roundId: string): Promise<string[]> {
    const { data } = await createAdminClient().from("member_capability_roles").select("member_id")
        .eq("capability_key", "showcase").eq("role", "host")
        .eq("context->>round_id", roundId).is("valid_until", null);
    return [...new Set((data ?? []).map((r: { member_id: string }) => r.member_id))];
}

/** 회차 참가자 (알림용) — teamId 주면 그 팀만 */
export async function roundParticipantIds(roundId: string, teamId?: string | null): Promise<string[]> {
    let q = createAdminClient().from("program_participants").select("member_id").eq("round_id", roundId);
    if (teamId) q = q.eq("team_id", teamId);
    const { data } = await q;
    return [...new Set((data ?? []).map((r: { member_id: string }) => r.member_id))];
}

/** 세션 회원의 members.id (없으면 null) */
export async function sessionMemberId(): Promise<string | null> {
    const sb = await createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data: me } = await createAdminClient().from("members").select("id").eq("auth_id", user.id).maybeSingle();
    return me?.id ?? null;
}

/** 세션 회원의 회차 접근 권한. 없으면 null */
export async function getRoundAccess(roundId: string): Promise<RoundAccess | null> {
    const round = await getRound(roundId);
    if (!round) return null;
    const memberId = await sessionMemberId();
    if (!memberId) return null;
    const admin = createAdminClient();
    const [isStaff, clients, { data: part }] = await Promise.all([
        isStaffMember(admin, memberId),
        roundClientIds(roundId),
        admin.from("program_participants").select("team_id").eq("round_id", roundId).eq("member_id", memberId).maybeSingle(),
    ]);
    const isParticipant = !!part;
    const role: RoundRole | null = isStaff ? "staff" : clients.includes(memberId) ? "client" : isParticipant ? "team" : null;
    if (!role) return null;
    return { memberId, role, teamId: (part as { team_id: string | null } | null)?.team_id ?? null, round };
}
