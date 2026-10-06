"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function RooKFooter() {
    return (
        <UniverseFooter
            brandName="RooK"
            tagline="AI Creator"
            accentColor="#00d255"
            dark={true}
            linkColumns={[
                {
                    title: "Menu",
                    links: [
                        { label: "Works", href: "/rook/works" },
                        { label: "Artist", href: "/rook/artist" },
                        { label: "Free board", href: "/rook/freeboard" },
                        { label: "RooKie", href: "/rook/rookie" },
                        { label: "About", href: "/rook/about" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "상담 / 문의", href: "/rook/about#contact" },
                        { label: "RooKie 지원", href: "/rook/rookie#apply" },
                        { label: "YouTube", href: "https://www.youtube.com/@RooK_AI_Creator", external: true },
                    ],
                },
            ]}
        />
    );
}
