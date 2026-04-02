import { MindleHeader } from "@/features/mindle/MindleHeader";
import { MindleFooter } from "@/features/mindle/MindleFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('mindle');
    const site = siteConfigs.mindle;
    return {
        title: { default: db?.meta_title ?? "Mindle — 보이기 전에, 먼저 본다", template: `%s | ${db?.name ?? "Mindle"}` },
        description: db?.meta_description ?? "AI가 분석하는 트렌드 인텔리전스 플랫폼. 신호에서 인사이트를 피워냅니다.",
        icons: { icon: db?.favicon_url ?? site.faviconUrl, apple: db?.apple_touch_icon ?? site.appleTouchIcon },
        openGraph: {
            title: db?.meta_title ?? "Mindle — 보이기 전에, 먼저 본다",
            description: db?.meta_description ?? "AI가 분석하는 트렌드 인텔리전스 플랫폼. 신호에서 인사이트를 피워냅니다.",
            siteName: 'Ten:One™ Universe',
            type: 'website',
        },
    };
}

export default function MindleLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
            <MindleHeader />
            <main className="flex-1 pt-[82px]">{children}</main>
            <MindleFooter />
        </div>
    );
}
