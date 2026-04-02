import { DomoHeader } from "@/features/domo/DomoHeader";
import { DomoFooter } from "@/features/domo/DomoFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('domo');
    const site = siteConfigs.domo;
    return {
        title: { default: db?.meta_title ?? "Domo — 인생 2회차, 도모하다", template: `%s | ${db?.name ?? site.name}` },
        description: db?.meta_description ?? site.meta.description,
        icons: { icon: db?.favicon_url ?? site.faviconUrl, apple: db?.apple_touch_icon ?? site.appleTouchIcon },
        openGraph: {
            title: db?.meta_title ?? "Domo — 인생 2회차, 도모하다",
            description: db?.meta_description ?? site.meta.description,
            siteName: db?.name ?? site.name,
        },
    };
}

export default function DomoLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <DomoHeader />
            <main className="flex-1 pt-14">
                {children}
            </main>
            <DomoFooter />
        </div>
    );
}
