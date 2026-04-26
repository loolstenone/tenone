"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function MullaesianFooter() {
    return (
        <UniverseFooter
            brandName="문래지앙"
            tagline="작은 철공소, 골목 그리고 가난한 예술가들 · 문래동의 이야기"
            accentColor="#007BBF"
            dark={true}
            linkColumns={[
                {
                    title: "Menu",
                    links: [
                        { label: "뚜르 드 문래", href: "/mullaesian/#tour" },
                        { label: "갤러리 문래", href: "/mullaesian/#gallery" },
                        { label: "문래 꼬뮨", href: "/mullaesian/#commune" },
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
