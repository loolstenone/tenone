"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function TownityFooter() {
    return (
        <UniverseFooter
            brandName="타우니티"
            tagline="지역이 살아야 우리가 산다 · AI 시대의 지역 커뮤니티"
            accentColor="#10B981"
            dark={true}
            linkColumns={[
                {
                    title: "Menu",
                    links: [
                        { label: "타우니티란", href: "/townity/#about" },
                        { label: "우리 동네", href: "/townity/#town" },
                        { label: "함께 해요", href: "/townity/#together" },
                        { label: "이야기", href: "/townity/#stories" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "tenone.biz/contact", href: "https://tenone.biz/contact", external: true },
                        { label: "KakaoTalk @tenone", href: "https://open.kakao.com/me/tenone", external: true },
                    ],
                },
            ]}
        />
    );
}
