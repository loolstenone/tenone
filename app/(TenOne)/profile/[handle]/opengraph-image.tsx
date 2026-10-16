/** 공개 프로필 링크 미리보기 카드 (카카오톡·SNS) — 공개 프로필만 이름·소개, 그 외는 기본 카드 */
import { createClient } from "@supabase/supabase-js";
import { HANDLE_RE, type PublicProfileRow } from "@/lib/profile/public-profile";
import { OG_SIZE, renderProfileCard } from "@/lib/profile/og-card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ten:One™ Universe 프로필";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
    const h = decodeURIComponent((await params).handle).replace(/^@/, "").toLowerCase();
    let row: PublicProfileRow | null = null;
    if (HANDLE_RE.test(h)) {
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        row = (await sb.rpc("get_public_profile", { p_handle: h })).data as PublicProfileRow | null;
    }
    return renderProfileCard({
        isPublic: row?.profile_visibility === "public" && !!row.name,
        name: row?.name, handle: row?.handle, bio: row?.bio, avatarUrl: row?.avatar_url,
        label: "Ten:One™ Universe",
    });
}
