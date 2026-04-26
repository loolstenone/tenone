"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function PlannersFooter() {
    return (
        <UniverseFooter
            brandName="Planner's"
            tagline="우리는 모두 기획자다 — 적어도 자기 인생에서 만큼은."
            accentColor="#0F766E"
            dark={true}
            linkColumns={[
                {
                    title: "Menu",
                    links: [
                        { label: "Planning", href: "/planners/planning" },
                        { label: "Planner's Planner", href: "/planners/planner-tool" },
                        { label: "Programs", href: "/planners/programs" },
                        { label: "GPR", href: "/planners/gpr" },
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
