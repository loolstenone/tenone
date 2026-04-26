"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function YouInOneFooter() {
    return (
        <UniverseFooter
            brandName="YouInOne"
            tagline="We are Project Group to solve Problems · Idea + Strategy"
            accentColor="#1AAD64"
            dark={true}
            linkColumns={[
                {
                    title: "바로가기",
                    links: [
                        { label: "About", href: "/youinone/about" },
                        { label: "What We Do", href: "/youinone/whatwedo" },
                        { label: "Portfolio", href: "/youinone/portfolio" },
                        { label: "People", href: "/youinone/people" },
                        { label: "Alliance", href: "/youinone/alliance" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "hello@youinone.com", href: "mailto:hello@youinone.com", external: true },
                        { label: "Website", href: "https://youinone.com", external: true },
                    ],
                },
            ]}
        />
    );
}
