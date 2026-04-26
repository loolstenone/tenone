"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function FWNFooter() {
    return (
        <UniverseFooter
            brandName="FWN"
            tagline="Fashion Week Network · The World is on the Runway"
            accentColor="#00C853"
            dark={true}
            linkColumns={[
                {
                    title: "도시",
                    links: [
                        { label: "New York", href: "/fwn/category/newyork" },
                        { label: "Paris", href: "/fwn/category/paris" },
                        { label: "London", href: "/fwn/category/london" },
                        { label: "Milan", href: "/fwn/category/milan" },
                        { label: "Seoul", href: "/fwn/category/seoul" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "About FWN", href: "/fwn/about" },
                        { label: "문의 (tenone.biz)", href: "https://tenone.biz/contact", external: true },
                    ],
                },
            ]}
        />
    );
}
