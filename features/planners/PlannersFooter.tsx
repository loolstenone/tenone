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
            tagline={<>우리는 모두 기획자다.<br />자기 인생에서만큼은.</>}
            accentColor="#14B8A6"
            dark={true}
            actions={[
                { label: "플래너'스 PAD 받기", href: "/planners/pad" },
                { label: "플래너'스 AI 열기", href: "/planners/app" },
                { label: "훈련 프로젝트 보기", href: "/planners/projects" },
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
