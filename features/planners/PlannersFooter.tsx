"use client";

import { usePathname } from "next/navigation";
import { UniverseFooter } from "@/components/UniverseFooter";
import { isPlannersAppPath } from "@/features/planners/app/nav";

// 푸터 규칙 CLAUDE.md §1.9.4 — 메뉴는 헤더 레지스트리에서 자동(siteId), 참여·채널만 여기서
export function PlannersFooter() {
    const pathname = usePathname();
    // 플래너'스 AI 앱(/planners/app)은 사이트 푸터 없이 전체 화면
    if (isPlannersAppPath(pathname)) return null;
    return (
        <UniverseFooter
            siteId="planners"
            brandName="Planner's"
            tagline={<>내 손으로, 내 뜻대로.<br />생각하고 기록하고 계획하는 사람의 인공지능 플래너.</>}
            accentColor="#14B8A6"
            dark={true}
            actions={[
                { label: "플래너'스 AI 알아보기", href: "/planners/ai" },
                { label: "플래너'스 PAD 받기", href: "/planners/pad" },
                { label: "기획자 과정", href: "/planners/projects" },
                { label: "내 참여 확인서", href: "/planners/certificate" },
            ]}
            channels={[
                // 유니버스 안의 결이 맞는 사이트
                { label: "MAD League", href: "/madleague" },
                { label: "RooK", href: "/rook" },
            ]}
        />
    );
}
