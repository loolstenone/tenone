"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function Seoul360Footer() {
    return (
        <UniverseFooter
            brandName="Seoul/360°"
            tagline="#ChallengeOnlySubwaySeoulTour · 지하철로만 즐기는 서울 가이드"
            accentColor="#F5C518"
            dark={true}
            linkColumns={[
                {
                    title: "Quick Links",
                    links: [
                        { label: "Seoul/360°", href: "/seoul360" },
                        { label: "Subway Line", href: "/seoul360/subway-line" },
                        { label: "District", href: "/seoul360/district" },
                        { label: "Station", href: "/seoul360/station" },
                        { label: "Outside Seoul", href: "/seoul360/outside-seoul" },
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
