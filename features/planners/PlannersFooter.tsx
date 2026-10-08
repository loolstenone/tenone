"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

// 푸터 규칙 CLAUDE.md §1.9.4 — 메뉴는 헤더 레지스트리에서 자동(siteId), 참여·채널만 여기서
export function PlannersFooter() {
    return (
        <UniverseFooter
            siteId="planners"
            brandName="Planner's"
            tagline="우리는 모두 기획자다"
            accentColor="#14B8A6"
            dark={true}
            actions={[
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
