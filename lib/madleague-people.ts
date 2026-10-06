// 서버 전용 (service_role 사용) — 클라이언트 컴포넌트에서 import 금지
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * MADLeague 회원 표시 정보 — 이름·사진은 공통 프로필(members)이 SSOT (데이터 계약 1).
 * mad_members는 MADLeague 고유 데이터(동아리·기수·포트폴리오)만 가진다.
 * 공개 범위(2026-10-06 사용자 결정): 작성한 글·댓글에 이름과 프로필 사진 공개.
 */

export interface MadPerson {
    name: string;
    avatar_url: string | null;
}

/** mad_members.id 목록 → 표시 정보 (계정 연결 없는 옛 행은 결과에서 빠짐 → 화면은 '익명') */
export async function getMadPeople(madMemberIds: (string | null | undefined)[]): Promise<Map<string, MadPerson>> {
    const ids = [...new Set(madMemberIds.filter((v): v is string => !!v))];
    const result = new Map<string, MadPerson>();
    if (ids.length === 0) return result;

    const admin = createAdminClient();
    const { data: madRows } = await admin.from("mad_members").select("id, member_id").in("id", ids);
    const rows = (madRows ?? []) as { id: string; member_id: string | null }[];

    const memberIds = rows.map(r => r.member_id).filter((v): v is string => !!v);
    const { data: memberRows } = memberIds.length
        ? await admin.from("members").select("id, name, avatar_url").in("id", memberIds)
        : { data: [] };
    const byMember = new Map(((memberRows ?? []) as { id: string; name: string; avatar_url: string | null }[]).map(m => [m.id, m]));

    for (const r of rows) {
        const m = r.member_id ? byMember.get(r.member_id) : undefined;
        if (m) result.set(r.id, { name: m.name, avatar_url: m.avatar_url });
    }
    return result;
}

/** author_id(mad_members.id)를 가진 행들에 기존 응답 모양 그대로 `mad_members: { name, avatar_url }`를 붙인다 */
export async function withMadAuthors<T extends { author_id?: string | null }>(rows: T[]): Promise<(T & { mad_members: MadPerson | null })[]> {
    const people = await getMadPeople(rows.map(r => r.author_id));
    return rows.map(r => ({ ...r, mad_members: (r.author_id && people.get(r.author_id)) || null }));
}

export interface MemberCore {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
}

/** 세션 사용자의 공통 프로필 (auth uid 기준) — 이름·이메일·전화·사진의 SSOT */
export async function getMemberCoreByAuthId(authId: string): Promise<MemberCore | null> {
    const { data } = await createAdminClient()
        .from("members")
        .select("id, name, email, phone, avatar_url")
        .eq("auth_id", authId)
        .maybeSingle();
    return (data as MemberCore | null) ?? null;
}
