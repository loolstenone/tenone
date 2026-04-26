"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function HeRoFooter() {
    return (
        <UniverseFooter
            brandName="HeRo"
            tagline="Human enhancement & Recruit Optimization · Talent Agency"
            accentColor="#E53935"
            dark={true}
            linkColumns={[
                {
                    title: "서비스",
                    links: [
                        { label: "HIT 검사", href: "/hero/hit" },
                        { label: "AI 상담", href: "/hero/coaching/ai" },
                        { label: "커리어 코칭", href: "/hero/coaching" },
                        { label: "써치 라이트", href: "/hero/search-light" },
                        { label: "이력서", href: "/hero/resume/workspace" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "lools@tenone.biz", href: "mailto:lools@tenone.biz", external: true },
                        { label: "기업 문의", href: "/hero/company" },
                    ],
                },
            ]}
        />
    );
}
