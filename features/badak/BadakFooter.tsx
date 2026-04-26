"use client";

import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";
import { UniverseFooter } from "@/components/UniverseFooter";

export function BadakFooter() {
    return (
        <UniverseFooter
            brandName="Badak"
            tagline="기획자 네트워크"
            accentColor="#ffd93d"
            dark={true}
            linkColumns={[
                {
                    title: "서비스",
                    links: [
                        { label: "모임", href: "/badak/groups" },
                        { label: "니즈 탐색", href: "/badak/explore" },
                        { label: "커뮤니티", href: "/badak/community" },
                        { label: "스토리", href: "/badak/story" },
                    ],
                },
                {
                    title: "참여",
                    links: [
                        { label: "모임 개설", href: "/badak/groups/create" },
                        { label: "바닥장 신청", href: "/badak/apply" },
                    ],
                },
            ]}
        >
            <div className="mx-auto max-w-2xl">
                <NewsletterSubscribeForm source="badak" brandName="Badak" dark accentColor="#ffd93d" />
            </div>
        </UniverseFooter>
    );
}
