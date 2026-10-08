"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

// 푸터 규칙 CLAUDE.md §1.9.4 — 메뉴는 헤더 레지스트리에서 자동(siteId), 참여·채널만 여기서
export function MadLeagueFooter() {
    return (
        <UniverseFooter
            siteId="madleague"
            brandName="MAD League"
            tagline="Match, Act, Develop · 실전 경쟁을 통한 성장"
            accentColor="#EC1D25"
            dark={true}
            actions={[
                { label: "매드리거 등록", href: "/madleague/apply" },
                { label: "공식 동아리 신청", href: "/madleague/contact?type=club-apply" },
                { label: "문의하기", href: "/madleague/contact" },
                { label: "마이페이지", href: "/madleague/my" },
            ]}
            channels={[
                // 유니버스 안의 결이 맞는 사이트 — 커리어(HeRo) · 크리에이티브(RooK) · 전략 기획(Planner's)
                { label: "HeRo", href: "/hero" },
                { label: "RooK", href: "/rook" },
                { label: "Planner's", href: "/madleague/programs/planners" },
            ]}
        />
    );
}
