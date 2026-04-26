"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function DomoFooter() {
    return (
        <UniverseFooter
            brandName="Domo"
            tagline="인생 2회차, 함께 도모하다 · 시니어 비즈니스맨 플랫폼"
            accentColor="#2D1B2E"
            dark={true}
            linkColumns={[
                {
                    title: "서비스",
                    links: [
                        { label: "준비서 서비스", href: "/domo/services" },
                        { label: "네트워킹", href: "/domo/network" },
                        { label: "인사이트", href: "/domo/insights" },
                        { label: "이벤트", href: "/domo/events" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "문의 (tenone.biz)", href: "https://tenone.biz/contact", external: true },
                        { label: "KakaoTalk @tenone", href: "https://open.kakao.com/me/tenone", external: true },
                    ],
                },
            ]}
        />
    );
}
