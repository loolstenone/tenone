/** 공개 프로필 링크 미리보기 카드 (카카오톡·SNS) — 공개 프로필만 이름·소개, 그 외는 기본 카드 */
import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { loadKoreanFont } from "@/lib/projects/og-font";
import { HANDLE_RE, type PublicProfileRow } from "@/lib/profile/public-profile";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ten:One™ Universe 프로필";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
    const { handle } = await params;
    const h = decodeURIComponent(handle).replace(/^@/, "").toLowerCase();

    let row: PublicProfileRow | null = null;
    if (HANDLE_RE.test(h)) {
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
        const { data } = await sb.rpc("get_public_profile", { p_handle: h });
        row = data as PublicProfileRow | null;
    }
    const isPublic = row?.profile_visibility === "public" && !!row.name;
    const name = isPublic ? row!.name! : "Ten:One™ Universe";
    const line = isPublic ? `@${row!.handle}` : "프로필";
    const bio = isPublic ? (row!.bio ?? "").slice(0, 80) : "";
    const avatar = isPublic && row!.avatar_url?.startsWith("https://") ? row!.avatar_url : null;
    const initial = name.charAt(0);

    const font = await loadKoreanFont(`${name}${line}${bio}${initial}Ten:One™ Universe`, 700);

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", backgroundColor: "#FAFAF7", padding: "80px 96px", fontFamily: "NotoSansKR" }}>
                {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- next/og
                    <img src={avatar} width={220} height={220} style={{ borderRadius: 110, objectFit: "cover", marginRight: 64 }} alt="" />
                ) : (
                    <div style={{ width: 220, height: 220, borderRadius: 110, backgroundColor: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, marginRight: 64 }}>
                        {initial}
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ fontSize: 68, color: "#111", lineHeight: 1.15 }}>{name}</div>
                    <div style={{ fontSize: 34, color: "#666", marginTop: 12 }}>{line}</div>
                    {bio && <div style={{ fontSize: 30, color: "#333", marginTop: 28, lineHeight: 1.4 }}>{bio}</div>}
                    {isPublic && <div style={{ fontSize: 26, color: "#999", marginTop: 48 }}>Ten:One™ Universe</div>}
                </div>
            </div>
        ),
        { ...size, fonts: font ? [{ name: "NotoSansKR", data: font, weight: 700, style: "normal" }] : [] },
    );
}
