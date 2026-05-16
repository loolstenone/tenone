"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function WIOFooter() {
    return (
        <UniverseFooter
            brandName="WIO"
            tagline="Enterprise Unified System"
            accentColor="#6366f1"
            dark={true}
            linkColumns={[
                {
                    title: "솔루션",
                    links: [
                        { label: "서비스 소개", href: "/wio/solutions" },
                        { label: "AI Matrix", href: "/wio/ai-matrix" },
                        { label: "프레임워크", href: "/wio/framework" },
                        { label: "요금", href: "/wio/pricing" },
                    ],
                },
                {
                    title: "시작하기",
                    links: [
                        { label: "Orbi 시작하기", href: "/wio/app" },
                        { label: "문의하기", href: "/wio/contact" },
                        { label: "마이페이지", href: "/wio/my" },
                    ],
                },
            ]}
        />
    );
}
