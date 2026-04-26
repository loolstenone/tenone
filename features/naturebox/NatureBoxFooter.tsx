"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function NatureBoxFooter() {
    return (
        <UniverseFooter
            brandName="자연함"
            tagline="정선의 자연을 담다 · 한소농장에서 전하는 건강한 먹거리"
            accentColor="#6B8E23"
            dark={true}
            linkColumns={[
                {
                    title: "Menu",
                    links: [
                        { label: "자연함 이야기", href: "/naturebox/#about" },
                        { label: "우리 먹거리", href: "/naturebox/#products" },
                        { label: "정선 이야기", href: "/naturebox/#jeongseon" },
                        { label: "오시는 길", href: "/naturebox/#visit" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "강원도 정선군 화암면 용소길 258", href: "/naturebox/#visit" },
                        { label: "tenone.biz/contact", href: "https://tenone.biz/contact", external: true },
                        { label: "KakaoTalk @tenone", href: "https://open.kakao.com/me/tenone", external: true },
                    ],
                },
            ]}
        />
    );
}
