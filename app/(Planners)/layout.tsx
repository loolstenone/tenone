import { PlannersHeader } from "@/features/planners/PlannersHeader";
import { PlannersFooter } from "@/features/planners/PlannersFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('planners');
    const site = siteConfigs.planners;
    return {
        title: { default: db?.meta_title ?? "Planner's — 우리는 모두 기획자다", template: `%s | ${db?.name ?? "Planner's"}` },
        description: db?.meta_description ?? "기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다.",
        icons: { icon: db?.favicon_url ?? site.faviconUrl, apple: db?.apple_touch_icon ?? site.appleTouchIcon },
        openGraph: {
            title: db?.meta_title ?? "Planner's — 기획 프레임워크",
            description: db?.meta_description ?? "기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다.",
            siteName: 'Ten:One™ Universe',
            type: 'website',
        },
    };
}

export default function PlannersLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <PlannersHeader />
            <main className="flex-1 pt-14">
                {children}
            </main>
            <PlannersFooter />
        </div>
    );
}
