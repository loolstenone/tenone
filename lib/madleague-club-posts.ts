/**
 * 동아리 홍보 게시물 공통 — 2026-10-11 동아리 방(비공개 카페) 폐지 후 대외 홍보 기능
 * 쓰기 권한 = canEditClubProfile (소개 페이지 편집과 같은 범위: 직원·회장·임원). 작성자 = members.id (데이터 계약 1조)
 * route.ts는 핸들러만 export할 수 있어 헬퍼를 여기에 둔다.
 */
import { NextRequest, NextResponse } from "next/server";
import { requireMember } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEditClubProfile, getMadAccess } from "@/lib/madleague-roles";

export interface ClubPostMedia { url: string; type: "image" | "video" | "file"; name: string; size: number }
export const CLUB_POST_MAX_MEDIA = 10;
export const CLUB_POST_SELECT = "id, club_id, title, content, media, is_pinned, is_published, created_at, updated_at";

export async function clubPostContext(req: NextRequest, slug: string) {
    const auth = await requireMember(req);
    if (auth instanceof NextResponse) return { error: auth };
    const admin = createAdminClient();
    const { data: club } = await admin.from("mad_clubs").select("id, slug, president_member_id").eq("slug", slug).maybeSingle();
    if (!club) return { error: NextResponse.json({ error: "동아리를 찾을 수 없습니다." }, { status: 404 }) };
    const access = await getMadAccess(auth.memberId);
    if (!canEditClubProfile(access, auth.memberId, club)) {
        return { error: NextResponse.json({ error: "이 동아리 운영진만 올릴 수 있습니다." }, { status: 403 }) };
    }
    return { admin, club, memberId: auth.memberId };
}

export function sanitizeMedia(input: unknown): ClubPostMedia[] {
    if (!Array.isArray(input)) return [];
    return input.slice(0, CLUB_POST_MAX_MEDIA).flatMap((m) => {
        if (!m || typeof m !== "object") return [];
        const { url, type, name, size } = m as Record<string, unknown>;
        if (typeof url !== "string" || !/^https:\/\//.test(url)) return [];
        if (type !== "image" && type !== "video" && type !== "file") return [];
        return [{ url, type, name: typeof name === "string" ? name.slice(0, 200) : "", size: typeof size === "number" ? size : 0 }];
    });
}
