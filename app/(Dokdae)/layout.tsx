import type { Metadata, Viewport } from 'next';
import { siteConfigs } from '@/lib/site-config';
import { getSiteConfigServer } from '@/lib/supabase/site-configs';

export async function generateMetadata(): Promise<Metadata> {
  const db = await getSiteConfigServer('dokdae');
  const site = siteConfigs.dokdae;
  return {
    title: { default: db?.meta_title ?? site.meta.title, template: `%s | ${db?.name ?? site.name}` },
    description: db?.meta_description ?? site.meta.description,
    manifest: '/dokdae-manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: db?.name ?? '독대',
      startupImage: [],
    },
    icons: {
      icon: db?.favicon_url ?? site.faviconUrl,
      apple: db?.apple_touch_icon ?? site.appleTouchIcon ?? '/dokdae-icon-192.png',
    },
    openGraph: {
      title: db?.meta_title ?? site.meta.title,
      description: db?.meta_description ?? site.meta.description,
      siteName: 'Ten:One™ Universe',
      type: 'website',
      ...((db?.meta_og_image ?? site.meta.ogImage) && { images: [db?.meta_og_image ?? site.meta.ogImage!] }),
    },
    other: {
      'mobile-web-app-capable': 'yes',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#101018',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function DokdaeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#101018] text-white">
      {children}
    </div>
  );
}
