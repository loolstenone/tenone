"use client";

import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";
import { UniverseFooter } from "@/components/UniverseFooter";

// 푸터 규칙 CLAUDE.md §1.9.4 — 메뉴는 헤더 레지스트리에서 자동(siteId), 참여·채널만 여기서 (2026-10-10 4열 이행)
export function BadakFooter() {
    return (
        <UniverseFooter
            siteId="badak"
            brandName="Badak"
            tagline="기획자 네트워크"
            accentColor="#ffd93d"
            dark={true}
            actions={[
                { label: "모임 개설", href: "/badak/groups/create" },
                { label: "바닥장 신청", href: "/badak/apply" },
                { label: "마이페이지", href: "/badak/my" },
            ]}
            channels={[
                { label: "MADLeague", href: "/madleague" },
                { label: "HeRo", href: "/hero" },
            ]}
        >
            <div className="mx-auto max-w-2xl">
                <NewsletterSubscribeForm source="badak" brandName="Badak" dark accentColor="#ffd93d" />
            </div>
        </UniverseFooter>
    );
}
