"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function MadLeapFooter() {
    return (
        <UniverseFooter
            brandName="MADLeap"
            tagline="실전 프로젝트 대학생 연합동아리"
            accentColor="#D32F2F"
            dark={true}
            linkColumns={[
                {
                    title: "Contact",
                    links: [
                        { label: "official@madleap.co.kr", href: "mailto:official@madleap.co.kr", external: true },
                        { label: "Instagram @madleap.official", href: "https://instagram.com/madleap.official", external: true },
                        { label: "Blog (Naver)", href: "https://blog.naver.com/madleap", external: true },
                    ],
                },
                {
                    title: "Universe",
                    links: [
                        { label: "Badak (마케팅·광고)", href: "https://badak.biz", external: true },
                        { label: "MADLeague (경연의 장)", href: "https://madleague.net", external: true },
                    ],
                },
            ]}
        />
    );
}
