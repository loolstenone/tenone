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
                        { label: "Free board", href: "/rook/board" },
                        { label: "RooKie", href: "/rook/rookie" },
                        { label: "About", href: "/rook/about" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "tenone.biz/contact", href: "https://tenone.biz/contact", external: true },
                    ],
                },
            ]}
        />
    );
}
