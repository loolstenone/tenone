import './smarcomm.css';
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SmarCommPreviewGate } from '@/components/SmarCommPreviewGate';

const site = siteConfigs.smarcomm;
const PREVIEW_KEY = 'tenone1001';

export const metadata: Metadata = {
    title: { default: site.meta.title, template: `%s | ${site.name}` },
    description: site.meta.description,
    icons: { icon: site.faviconUrl, apple: site.appleTouchIcon },
    openGraph: {
        title: site.meta.title,
        description: site.meta.description,
        siteName: 'Ten:One™ Universe',
        type: 'website',
        ...(site.meta.ogImage && { images: [site.meta.ogImage] }),
    },
};

export default async function SmarCommGroupLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasPreview = cookieStore.get('sc_preview')?.value === PREVIEW_KEY;

  if (!hasPreview) {
    return (
      <div className="smarcomm-theme">
        <SmarCommPreviewGate previewKey={PREVIEW_KEY} />
      </div>
    );
  }

  return <div className="smarcomm-theme">{children}</div>;
}
