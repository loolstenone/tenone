"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function JakkaFooter() {
    return (
        <UniverseFooter
            brandName="JAKKA"
            tagline="Capturing moments, telling stories · 순간을 포착하고, 이야기를 전합니다"
            accentColor="#1a1a2e"
            dark={true}
            linkColumns={[
                {
                    title: "Portfolio",
                    links: [
                        { label: "인물 사진", href: "/jakka/category/portrait" },
                        { label: "스튜디오", href: "/jakka/category/studio" },
                        { label: "스포츠", href: "/jakka/category/sports" },
                        { label: "항공 사진", href: "/jakka/category/aerial" },
                        { label: "콘서트", href: "/jakka/category/concert" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "문의 (tenone.biz)", href: "https://tenone.biz/contact", external: true },
                        { label: "마이페이지", href: "/jakka/my" },
                    ],
                },
            ]}
        />
    );
}
