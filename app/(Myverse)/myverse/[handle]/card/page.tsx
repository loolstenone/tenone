// 공개 디지털 명함 — /myverse/[handle]/card
// 받는 사람 시점. QR 스캔으로 도착. 인증 불필요.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ReceivedCardView } from "@/features/myverse/app/ReceivedCardView";

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
            title: "Myverse — 명함을 찾을 수 없음",
            description: "해당 핸들의 명함이 없습니다.",
        };
    }
    const { member } = data;
    const title = `${member.name}님의 명함 (@${member.handle}) · Myverse`;
    const description = `${member.name}${member.company ? ` · ${member.company}` : ""}`;
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

export default async function HandleCardPage({ params }: Props) {
    const { handle } = await params;
    const data = await fetchPublic(handle);
    if (!data) notFound();
    return <ReceivedCardView member={data.member} />;
}
