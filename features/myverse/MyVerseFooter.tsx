"use client";

import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";
import { UniverseFooter } from "@/components/UniverseFooter";

export function MyVerseFooter() {
    return (
        <UniverseFooter
            brandName="Myverse"
            tagline="Personal Blackbox · 셀프 디스커버리"
            accentColor="#6366f1"
            linkColumns={[
                {
                    title: "Menu",
                    links: [
                        { label: "서비스", href: "/myverse/service" },
                        { label: "기술", href: "/myverse/technology" },
                        { label: "철학", href: "/myverse/philosophy" },
                        { label: "팀", href: "/myverse/team" },
                        { label: "로드맵", href: "/myverse/roadmap" },
                    ],
                },
                {
                    title: "Contact",
                    links: [
                        { label: "문의", href: "/myverse/contact" },
                    ],
                },
            ]}
        >
            <div className="mx-auto max-w-2xl">
                <NewsletterSubscribeForm source="myverse" brandName="Myverse" accentColor="#6366f1" />
            </div>
        </UniverseFooter>
    );
}
