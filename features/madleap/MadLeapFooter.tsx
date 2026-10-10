"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

// 푸터 규칙 CLAUDE.md §1.9.4 — 메뉴는 헤더 레지스트리에서 자동(siteId), 참여·채널만 여기서 (2026-10-10 4열 이행)
export function MadLeapFooter() {
    return (
        <UniverseFooter
            siteId="madleap"
            brandName="MADLeap"
            tagline="실전 프로젝트 대학생 연합동아리"
            accentColor="#00B8FF"
            dark={true}
            actions={[
                { label: "커뮤니티", href: "/madleap/community" },
                { label: "마이페이지", href: "/madleap/my" },
                { label: "official@madleap.co.kr", href: "mailto:official@madleap.co.kr", external: true },
            ]}
            channels={[
                { label: "Instagram", href: "https://instagram.com/madleap.official", external: true },
                { label: "Blog (Naver)", href: "https://blog.naver.com/madleap", external: true },
                { label: "MADLeague", href: "/madleague" },
                { label: "Badak", href: "/badak" },
            ]}
        />
    );
}
