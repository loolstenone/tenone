"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function BrandGravityFooter() {
    return (
        <UniverseFooter
            brandName="Brand Gravity"
            tagline="AI 시대 브랜드 최적화 솔루션"
            accentColor="#f59e0b"
            dark={true}
            linkColumns={[
                {
                    title: "서비스",
                    links: [
                        { label: "Gravity Scan", href: "/brandgravity/services" },
                        { label: "Life Mark", href: "/brandgravity/lifemark" },
                        { label: "요금", href: "/brandgravity/pricing" },
                    ],
                },
                {
                    title: "시작하기",
                    links: [
                        { label: "신청하기", href: "/brandgravity/apply" },
                        { label: "마이페이지", href: "/brandgravity/my" },
                    ],
                },
            ]}
        />
    );
}
