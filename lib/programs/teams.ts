/**
 * 코어 프로그램 모듈 — 사이트 팀 구성 권한 (서버 전용, 2단계)
 *   staff   : 전 팀
 *   officer : 자기 그룹(MADLeague = 운영진인 동아리) 팀 — 만들기·배정·팀장 지정·초대 링크 (모집 예정·진행 중 회차만)
 *   leader  : 자기 팀 — 팀명·소개 수정·초대 링크
 *   member  : 자기 팀 보기
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { isStaffMember } from "@/lib/api-guard";
import { getRound, sessionMemberId, type RoundInfo } from "@/lib/programs/access";
import { officerGroupIds } from "@/lib/programs/brands";

export interface TeamScope {
    memberId: string;
    round: RoundInfo & { year: number };
    isStaff: boolean;
    /** 팀을 꾸릴 수 있는 그룹 (staff는 전체라 비움 — isStaff로 판단) */
    groupIds: string[];
    myTeamId: string | null;
    myRole: "leader" | "member" | null;
    /** 회차가 팀 구성 가능한 상태인가 (모집 예정·진행 중) */
    open: boolean;
}

export async function getTeamScope(roundId: string): Promise<TeamScope | null> {
    const round = await getRound(roundId);
    if (!round) return null;
    const memberId = await sessionMemberId();
    if (!memberId) return null;
    const admin = createAdminClient();
    const [isStaff, groupIds, { data: part }, { data: yr }] = await Promise.all([
        isStaffMember(admin, memberId),
        officerGroupIds(round.brand_id, memberId),
        admin.from("program_participants").select("team_id, role").eq("round_id", roundId).eq("member_id", memberId).maybeSingle(),
        admin.from("program_rounds").select("year").eq("id", roundId).single(),
    ]);
    const p = part as { team_id: string | null; role: "leader" | "member" } | null;
    return {
        memberId, round: { ...round, year: (yr as { year: number } | null)?.year ?? new Date().getFullYear() },
        isStaff, groupIds,
        myTeamId: p?.team_id ?? null, myRole: p?.team_id ? p.role : null,
        open: round.status === "upcoming" || round.status === "ongoing",
    };
}

/** 이 팀을 운영(배정·팀장·삭제)할 수 있는가 */
export function canRunTeam(s: TeamScope, team: { context: unknown }): boolean {
    if (s.isStaff) return true;
    if (!s.open) return false;
    const gid = (team.context as { club_id?: string } | null)?.club_id;
    return !!gid && s.groupIds.includes(gid);
}

/** 이 팀 이름·소개·초대 링크를 고칠 수 있는가 (운영 + 팀장) */
export function canEditTeam(s: TeamScope, team: { id: string; context: unknown }): boolean {
    return canRunTeam(s, team) || (s.open && s.myTeamId === team.id && s.myRole === "leader");
}

/** 초대 코드 — 10자 (혼동 문자 제외) */
export function newInviteCode(): string {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    return Array.from(bytes, b => chars[b % chars.length]).join("");
}
