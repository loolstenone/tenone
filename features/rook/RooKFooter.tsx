"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

// 푸터 규칙 CLAUDE.md §1.9.4 — 메뉴는 헤더 레지스트리에서 자동(siteId), 참여·채널만 여기서
export function RooKFooter() {
    return (
        <UniverseFooter
            siteId="rook"
            brandName="RooK"
            tagline="AI Creator"
            accentColor="#00d255"
            dark={true}
            actions={[
                { label: "RooKie 지원", href: "/rook/rookie#apply" },
                { label: "상담 / 문의", href: "/rook/about#contact" },
            ]}
            channels={[
                { label: "YouTube", href: "https://www.youtube.com/@RooK_AI_Creator", external: true },
                // 유니버스 안의 결이 맞는 사이트
                { label: "MAD League", href: "/madleague" },
            ]}
        />
    );
}
