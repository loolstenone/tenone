import { YouInOneHeader } from "@/features/youinone/YouInOneHeader";
import { YouInOneFooter } from "@/features/youinone/YouInOneFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('youinone');
    const site = siteConfigs.youinone;
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

export default function YouInOneLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <YouInOneHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <YouInOneFooter />
        </div>
    );
}
