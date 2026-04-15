import { MadLeagueHeader } from "@/features/madleague/MadLeagueHeader";
import { MadLeagueFooter } from "@/features/madleague/MadLeagueFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('madleague');
    const site = siteConfigs.madleague;
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

export default function MadLeagueLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div
            className="min-h-screen flex flex-col bg-[var(--mad-black)] text-white"
            style={{
                ['--mad-red' as string]: '#EC1D25',
                ['--mad-black' as string]: '#000000',
                ['--mad-gold' as string]: '#FFC000',
                ['--mad-white' as string]: '#FFFFFF',
                ['--mad-gray' as string]: '#F5F5F5',
            }}
        >
            <MadLeagueHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <MadLeagueFooter />
        </div>
    );
}
