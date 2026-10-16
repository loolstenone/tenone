/** MAD League 공개 프로필 링크 미리보기 카드 — 공개 프로필만 이름·소개 */
import { createClient } from "@supabase/supabase-js";
import { HANDLE_RE, type BrandProfileRow } from "@/lib/profile/public-profile";
import { BRAND_PROFILES } from "@/lib/profile/brand-profiles";
import { OG_SIZE, renderProfileCard } from "@/lib/profile/og-card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "MAD League 프로필";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
    const cfg = BRAND_PROFILES.madleague;
    const h = decodeURIComponent((await params).handle).replace(/^@/, "").toLowerCase();
    let row: BrandProfileRow | null = null;
    if (HANDLE_RE.test(h)) {
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        row = (await sb.rpc("get_brand_profile", { p_handle: h, p_brand: cfg.siteId })).data as BrandProfileRow | null;
    }
    return renderProfileCard({
        isPublic: row?.profile_visibility === "public" && !!row.name,
        name: row?.name, handle: row?.handle, bio: row?.bio, avatarUrl: row?.avatar_url,
        label: cfg.name, accent: cfg.accent, dark: cfg.dark,
    });
}
