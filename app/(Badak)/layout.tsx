import { BadakHeader } from "@/features/badak/BadakHeader";
import { BadakFooter } from "@/features/badak/BadakFooter";
import { BadakAnalytics } from "@/features/badak/BadakAnalytics";
import { BadakOnboardingGate } from "@/features/badak/BadakOnboardingGate";
import { UniverseChatbot } from "@/components/UniverseChatbot";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('badak');
    const site = siteConfigs.badak;
    return {
        title: { default: db?.meta_title ?? site.meta.title, template: `%s | ${db?.name ?? site.name}` },
        description: db?.meta_description ?? site.meta.description,
        icons: { icon: db?.favicon_url ?? site.faviconUrl, apple: db?.apple_touch_icon ?? site.appleTouchIcon },
        openGraph: {
            title: db?.meta_title ?? site.meta.title,
            description: db?.meta_description ?? site.meta.description,
            siteName: 'Ten:One™ Universe',
            type: 'website',
            ...((db?.meta_og_image ?? site.meta.ogImage) && { images: [db?.meta_og_image ?? site.meta.ogImage!] }),
        },
    };
}

export default function BadakLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-[#1a1a2e] text-neutral-900 flex flex-col">
            <BadakHeader />
            <BadakAnalytics />
            <BadakOnboardingGate />
            <main className="flex-1">
                {children}
            </main>
            <BadakFooter />
            <UniverseChatbot siteId="badak" siteName="바닥" />
        </div>
    );
}
