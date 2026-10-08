/**
 * MADLeague 동아리 방 = 작은 네이버 카페 (서버 전용, 2026-10-08)
 *
 * 입장: 관리자(직원) 전체 · 그 동아리 현역·운영진·OB(club 활동 역할, 진행 중) · 담당 멘토
 * 글·댓글은 매드리거 커뮤니티 테이블(mad_posts·mad_comments) 그대로 — club_id로 범위, 읽기 범위는 DB 정책이 강제
 * (sql/madleague-club-cafe.sql: mad_can_access_club · mad_is_club_officer)
 * 공지 = 운영진·관리자만 · 고정/삭제 관리 = 운영진·관리자 (API에서 확인 후 service_role)
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { getMadAccess, type MadAccess } from "@/lib/madleague-roles";

/** 카페 게시판 — mad_posts.category 값 그대로 (DB 체크 제약과 같은 값만) */
export const CAFE_BOARDS = [
    { key: "notice", label: "공지사항", officerOnly: true },
    { key: "free", label: "자유게시판" },
    { key: "question", label: "질문·답변" },
    { key: "share", label: "자료실" },
    { key: "pinboard", label: "사진첩" },
] as const;
export type CafeBoardKey = (typeof CAFE_BOARDS)[number]["key"];
export const cafeBoardLabel = (k: string) => CAFE_BOARDS.find(b => b.key === k)?.label ?? k;
export const isCafeBoard = (k: string | null | undefined): k is CafeBoardKey => CAFE_BOARDS.some(b => b.key === k);

export interface ClubRoomAccess {
    canEnter: boolean;
    isOfficer: boolean;
    isStaff: boolean;
    /** 이 동아리에서의 내 역할 표기 (회장·현역·OB·멘토 …) */
    myRole: string | null;
}

/** 내가 이 동아리 방에 들어갈 수 있는가 */
export function clubRoomAccess(access: MadAccess, clubId: string): ClubRoomAccess {
    const mine = access.roles.filter(r => r.capability_key === "club" && r.context?.club_id === clubId);
    const officer = mine.find(r => r.role === "임원");
    const role = officer ? String(officer.context?.position ?? "운영진") : mine[0]?.role ?? null;
    return {
        canEnter: access.isStaff || mine.length > 0,
        isOfficer: access.isStaff || !!officer,
        isStaff: access.isStaff,
        myRole: role ?? (access.isStaff ? "관리자" : null),
    };
}

/** 동아리 목록에서 동아리별 입장 가능 여부 (비로그인이면 전부 false) */
export async function clubRoomAccessMap(memberId: string | null, clubIds: string[]): Promise<Record<string, ClubRoomAccess>> {
    const none: ClubRoomAccess = { canEnter: false, isOfficer: false, isStaff: false, myRole: null };
    if (!memberId) return Object.fromEntries(clubIds.map(id => [id, none]));
    const access = await getMadAccess(memberId);
    return Object.fromEntries(clubIds.map(id => [id, clubRoomAccess(access, id)]));
}

export interface CafeMember { member_id: string; name: string; avatar_url: string | null; role: string; position: string | null; year: number | null }

const ROLE_ORDER: Record<string, number> = { 임원: 0, 멘토: 1, 현역: 2, OB: 3 };
const POSITION_ORDER: Record<string, number> = { 회장: 0, 부회장: 1, 총무: 2 };

/** 동아리 멤버 — 진행 중 club 활동 역할 + 공통 프로필(이름·사진). 방 안에서만 보여준다 */
export async function getCafeMembers(clubId: string): Promise<CafeMember[]> {
    const admin = createAdminClient();
    const { data: roles } = await admin.from("member_capability_roles")
        .select("member_id, role, context, valid_until")
        .eq("brand_id", "madleague").eq("capability_key", "club")
        .eq("context->>club_id", clubId)
        .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`);
    const rows = (roles ?? []) as { member_id: string; role: string; context: Record<string, unknown> | null }[];
    if (rows.length === 0) return [];
    const { data: people } = await admin.from("members").select("id, name, avatar_url").in("id", [...new Set(rows.map(r => r.member_id))]);
    const byId = new Map((people ?? []).map((p: { id: string; name: string | null; avatar_url: string | null }) => [p.id, p]));
    // 한 사람이 여러 역할이면 가장 높은 역할 하나
    const best = new Map<string, CafeMember>();
    for (const r of rows) {
        const p = byId.get(r.member_id);
        const m: CafeMember = {
            member_id: r.member_id,
            name: p?.name ?? "이름 없음",
            avatar_url: p?.avatar_url ?? null,
            role: r.role,
            position: r.role === "임원" ? String(r.context?.position ?? "운영진") : null,
            year: typeof r.context?.year === "number" ? (r.context.year as number) : null,
        };
        const cur = best.get(r.member_id);
        if (!cur || (ROLE_ORDER[m.role] ?? 9) < (ROLE_ORDER[cur.role] ?? 9)) best.set(r.member_id, m);
    }
    return [...best.values()].sort((a, b) =>
        (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9)
        || (POSITION_ORDER[a.position ?? ""] ?? 9) - (POSITION_ORDER[b.position ?? ""] ?? 9)
        || a.name.localeCompare(b.name, "ko"));
}
