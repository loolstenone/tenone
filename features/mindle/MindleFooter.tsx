"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function MindleFooter() {
    return (
        <UniverseFooter
            brandName="Mindle"
            tagline="신호에서 인사이트를 피워냅니다 · Whole See"
            accentColor="#F5C518"
            dark={true}
            linkColumns={[
                {
                    title: "콘텐츠",
                    links: [
                        { label: "트렌드", href: "/mindle/trends" },
                        { label: "리포트", href: "/mindle/reports" },
                        { label: "데이터", href: "/mindle/data" },
                        { label: "레퍼런스", href: "/mindle/references" },
                    ],
                },
                {
                    title: "소개",
                    links: [
                        { label: "Mindle 소개", href: "/mindle/about" },
                        { label: "뉴스레터", href: "/mindle/newsletter" },
                        { label: "문의", href: "/contact" },
                    ],
                },
            ]}
        />
    );
}
