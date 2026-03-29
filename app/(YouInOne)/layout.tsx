import { YouInOneHeader } from "@/components/YouInOneHeader";
import { YouInOneFooter } from "@/components/YouInOneFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.youinone;

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
