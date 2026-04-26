"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function MoNTZFooter() {
    return (
        <UniverseFooter
            brandName="MoNTZ"
            tagline="월간 전시"
            accentColor="#c8a97e"
            dark={true}
            linkColumns={[
                {
                    title: "Contact",
                    links: [
                        { label: "문의 (tenone.biz)", href: "https://tenone.biz/contact", external: true },
                    ],
                },
            ]}
        />
    );
}
