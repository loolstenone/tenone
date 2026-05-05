"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function PlannersFooter() {
    return (
        <UniverseFooter
            brandName="Planner's Planner"
            tagline="우리는 모두 기획자다 — 적어도 자기 인생에서 만큼은."
            accentColor="#6366F1"
            dark={true}
            linkColumns={[
                {
                    title: "Menu",
                    links: [
                        { label: "Planning", href: "/myverse/planning" },
                        { label: "Planner's Planner", href: "/myverse/planner-tool" },
                        { label: "Programs", href: "/myverse/programs" },
                        { label: "GPR", href: "/myverse/gpr" },
                        { label: "앱 설치", href: "/myverse/install" },
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
