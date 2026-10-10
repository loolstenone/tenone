"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

// 푸터 규칙 CLAUDE.md §1.9.4 — 메뉴는 헤더 레지스트리에서 자동(siteId), 참여·채널만 여기서 (2026-10-10 4열 이행)
// 공개 페이지에 개인 이메일을 두지 않는다 — 문의는 기업 문의 화면으로
export function HeRoFooter() {
    return (
        <UniverseFooter
            siteId="hero"
            brandName="HeRo"
            tagline="Human enhancement & Recruit Optimization · Talent Agency"
            accentColor="#E53935"
            dark={true}
            actions={[
                { label: "HIT 검사 시작", href: "/hero/hit" },
                { label: "탤런트 에이전시 지원", href: "/hero/talent-agent" },
                { label: "기업 문의", href: "/hero/company" },
                { label: "마이페이지", href: "/hero/my" },
            ]}
            channels={[
                { label: "MADLeague", href: "/madleague" },
                { label: "RooK", href: "/rook" },
            ]}
        />
    );
}
