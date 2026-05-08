// 공개 Verse 페이지 — /myverse/v/[handle]
// 누구나 접근. SSR + OG meta 자동 생성.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { VersePublicView } from "@/features/myverse/app/VersePublicView";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ handle: string }>;
}

async function fetchPublic(handle: string) {
    const h = await headers();
    const host = h.get("host") || "myverse.kr";
    const proto = host.startsWith("localhost") ? "http" : "https";
    const url = `${proto}://${host}/api/myverse/v/${encodeURIComponent(handle)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { handle } = await params;
    const data = await fetchPublic(handle);
    if (!data) {
        return {
            title: "Myverse — 찾을 수 없음",
            description: "해당 핸들의 페이지가 없습니다.",
        };
    }
    const { member, stats } = data;
    const title = `${member.name} (@${member.handle}) · Myverse`;
    const description = `${stats.moments_count}개의 흔적 · ${stats.recorded_days}일의 기록`;
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            ...(member.avatar_url ? { images: [member.avatar_url] } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(member.avatar_url ? { images: [member.avatar_url] } : {}),
        },
    };
}

export default async function VersePage({ params }: Props) {
    const { handle } = await params;
    const data = await fetchPublic(handle);
    if (!data) notFound();
    return <VersePublicView data={data} />;
}
