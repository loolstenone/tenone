import { FWNHeader } from "@/features/fwn/FWNHeader";
import { FWNFooter } from "@/features/fwn/FWNFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('fwn');
    const site = siteConfigs.fwn;
    return {
        title: { default: db?.meta_title ?? site.meta.title, template: `%s | ${db?.name ?? site.name}` },
        description: db?.meta_description ?? site.meta.description,
        icons: { icon: db?.favicon_url ?? site.faviconUrl, apple: db?.apple_touch_icon ?? site.appleTouchIcon },
        openGraph: {
            title: db?.meta_title ?? site.meta.title,
            description: db?.meta_description ?? site.meta.description,
            siteName: db?.name ?? site.name,
            ...((db?.meta_og_image ?? site.meta.ogImage) && { images: [db?.meta_og_image ?? site.meta.ogImage!] }),
        },
    };
}

export default function FWNLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col">
            <FWNHeader />
            <main className="flex-1 pt-24 lg:pt-[96px]">
                {children}
            </main>
            <FWNFooter />
        </div>
    );
}
