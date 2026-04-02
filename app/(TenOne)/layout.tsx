import { PublicHeader } from "@/features/tenone/PublicHeader";
import { PublicFooter } from "@/features/tenone/PublicFooter";
import { TenOneThemeWrapper } from "@/features/tenone/TenOneThemeWrapper";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('tenone');
    const site = siteConfigs.tenone;
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

export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TenOneThemeWrapper>
            <PublicHeader />
            <main className="flex-1 pt-20">
                {children}
            </main>
            <PublicFooter />
        </TenOneThemeWrapper>
    );
}
