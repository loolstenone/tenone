/**
 * MADLeague 동아리 멤버 목록 (서버 전용)
 *   진행 중 club 활동 역할(현역·임원·OB·멘토) + 공통 프로필(이름·사진) — 동아리 관리 화면(운영진·직원)에서만 보여준다
 *   2026-10-11 동아리 방(카페) 폐지 — lib/madleague-club-cafe.ts에서 멤버 조회만 남김
 */
import { createAdminClient } from "@/lib/supabase/admin";

export interface ClubMember { member_id: string; name: string; avatar_url: string | null; role: string; position: string | null; year: number | null }

const ROLE_ORDER: Record<string, number> = { 임원: 0, 멘토: 1, 현역: 2, OB: 3 };
const POSITION_ORDER: Record<string, number> = { 회장: 0, 부회장: 1, 총무: 2 };

export async function getClubMembers(clubId: string): Promise<ClubMember[]> {
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
    const best = new Map<string, ClubMember>();
    for (const r of rows) {
        const p = byId.get(r.member_id);
        const m: ClubMember = {
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
