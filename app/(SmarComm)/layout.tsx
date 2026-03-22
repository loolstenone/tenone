import './smarcomm.css';
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.smarcomm;

export const metadata: Metadata = {
    title: { default: site.meta.title, template: `%s | ${site.name}` },
    description: site.meta.description,
    icons: { icon: site.faviconUrl, apple: site.appleTouchIcon },
    openGraph: {
        title: site.meta.title,
        description: site.meta.description,
        siteName: site.name,
        ...(site.meta.ogImage && { images: [site.meta.ogImage] }),
    },
};

export default function SmarCommGroupLayout({ children }: { children: React.ReactNode }) {
  return <div className="smarcomm-theme">{children}</div>;
}
