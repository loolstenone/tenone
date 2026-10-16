/** 프로필 링크 미리보기 카드 (next/og) — 유니버스·브랜드 공용. 공개 프로필만 이름·소개, 그 외는 기본 카드 */
import { ImageResponse } from "next/og";
import { loadKoreanFont } from "@/lib/projects/og-font";

export const OG_SIZE = { width: 1200, height: 630 };

export async function renderProfileCard(opts: {
    isPublic: boolean;
    name?: string | null;
    handle?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    /** 아래 표기 (예: "Ten:One™ Universe", "MAD League") */
    label: string;
    accent?: string;
    dark?: boolean;
}) {
    const name = opts.isPublic && opts.name ? opts.name : opts.label;
    const line = opts.isPublic && opts.handle ? `@${opts.handle}` : "프로필";
    const bio = opts.isPublic ? (opts.bio ?? "").slice(0, 80) : "";
    const avatar = opts.isPublic && opts.avatarUrl?.startsWith("https://") ? opts.avatarUrl : null;
    const initial = name.charAt(0);
    const bg = opts.dark ? "#000" : "#FAFAF7";
    const fg = opts.dark ? "#fff" : "#111";
    const sub = opts.dark ? "#999" : "#666";
    const font = await loadKoreanFont(`${name}${line}${bio}${initial}${opts.label}`, 700);

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", backgroundColor: bg, padding: "80px 96px", fontFamily: "NotoSansKR" }}>
                {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- next/og
                    <img src={avatar} width={220} height={220} style={{ borderRadius: 110, objectFit: "cover", marginRight: 64 }} alt="" />
                ) : (
                    <div style={{ width: 220, height: 220, borderRadius: 110, backgroundColor: opts.accent ?? "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, marginRight: 64 }}>
                        {initial}
                    </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ fontSize: 68, color: fg, lineHeight: 1.15 }}>{name}</div>
                    <div style={{ fontSize: 34, color: sub, marginTop: 12 }}>{line}</div>
                    {bio && <div style={{ fontSize: 30, color: fg, opacity: 0.85, marginTop: 28, lineHeight: 1.4 }}>{bio}</div>}
                    {opts.isPublic && <div style={{ fontSize: 26, color: opts.accent ?? sub, marginTop: 48 }}>{opts.label}</div>}
                </div>
            </div>
        ),
        { ...OG_SIZE, fonts: font ? [{ name: "NotoSansKR", data: font, weight: 700, style: "normal" }] : [] },
    );
}
