"use client";

import { UniverseFooter } from "@/components/UniverseFooter";
import { siteHeaderNav } from "@/lib/brand-site-menus";

// 푸터 메뉴 = 헤더 메뉴와 같은 원천 (lib/brand-site-menus.ts) — 메뉴를 바꾸면 헤더·푸터·인트라가 함께 바뀐다 (§1.9.5)
const nav = siteHeaderNav("madleague");
const menuLinks = nav.flatMap(item => {
    const children = (item.dropdown ?? []).filter(d => d.href !== item.href && d.href !== "/madleague/apply");
    // 매드리거 하위의 '동아리'는 푸터에서 따로 보이게 (자주 찾는 메뉴)
    const club = children.find(d => d.href === "/madleague/clubs");
    return [{ label: item.name, href: item.href }, ...(club ? [{ label: club.name, href: club.href }] : [])];
});

export function MadLeagueFooter() {
    return (
        <UniverseFooter
            brandName="MAD League"
            tagline="Match, Act, Develop · 경쟁을 통한 성장 플랫폼"
            accentColor="#EC1D25"
            dark={true}
            linkColumns={[
                { title: "메뉴", links: menuLinks },
                {
                    title: "참여",
                    links: [
                        { label: "매드리거 등록", href: "/madleague/apply" },
                        { label: "공식 동아리 신청", href: "/madleague/contact" },
                        { label: "문의하기", href: "/madleague/contact" },
                        { label: "마이페이지", href: "/madleague/my" },
                    ],
                },
            ]}
        />
    );
}
