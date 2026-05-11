"use client";

import NewsletterSubscribeForm from "@/components/newsletter/NewsletterSubscribeForm";
import { UniverseFooter } from "@/components/UniverseFooter";

export function MyVerseFooter() {
    return (
        <UniverseFooter
            brandName="Myverse"
            tagline="Personal OS — 나를 운영하는 OS"
            accentColor="#6366f1"
            linkColumns={[
                {
                    title: "Menu",
                    links: [
                        { label: "브랜드 스토리", href: "/myverse/story" },
                        { label: "가격", href: "/myverse/pricing" },
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
