import './smarcomm.css';
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { getSiteConfigServer } from "@/lib/supabase/site-configs";
// Preview gate removed — SmarComm 활성화 (Phase 1-B, 2026-04-03)

export async function generateMetadata(): Promise<Metadata> {
    const db = await getSiteConfigServer('smarcomm');
    const site = siteConfigs.smarcomm;
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

export default async function SmarCommGroupLayout({ children }: { children: React.ReactNode }) {
  return <div className="smarcomm-theme">{children}</div>;
}
