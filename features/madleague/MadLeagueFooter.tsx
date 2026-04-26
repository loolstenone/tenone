"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function MadLeagueFooter() {
    return (
        <UniverseFooter
            brandName="MAD League"
            tagline="Match, Act, Develop · 경쟁을 통한 성장 플랫폼"
            accentColor="#EC1D25"
            dark={true}
            linkColumns={[
                {
                    title: "프로그램",
                    links: [
                        { label: "동아리", href: "/madleague/clubs" },
                        { label: "프로그램", href: "/madleague/programs" },
                        { label: "MADzine", href: "/madleague/madzine" },
                        { label: "아카이브", href: "/madleague/archive" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "lools@tenone.biz", href: "mailto:lools@tenone.biz", external: true },
                        { label: "마이페이지", href: "/madleague/my" },
                    ],
                },
            ]}
        />
    );
}
