import { PublicHeader } from "@/components/PublicHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { TenOneThemeWrapper } from "@/components/TenOneThemeWrapper";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.tenone;

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
