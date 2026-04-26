"use client";

import { UniverseFooter } from "@/components/UniverseFooter";

export function ChangeUpFooter() {
    return (
        <UniverseFooter
            brandName="ChangeUp"
            tagline="미래를 만드는 일, 창업 · AI 시대 청소년·대학생 창업 교육 플랫폼"
            accentColor="#1AAD64"
            dark={true}
            linkColumns={[
                {
                    title: "바로가기",
                    links: [
                        { label: "프로그램", href: "/changeup/programs" },
                        { label: "투자", href: "/changeup/invest" },
                        { label: "스타트업", href: "/changeup/startups" },
                        { label: "커뮤니티", href: "/changeup/community" },
                        { label: "About", href: "/changeup/about" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "hello@changeup.company", href: "mailto:hello@changeup.company", external: true },
                    ],
                },
            ]}
        />
    );
}
