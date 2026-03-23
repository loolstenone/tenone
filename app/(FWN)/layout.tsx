import { FWNHeader } from "@/components/FWNHeader";
import { FWNFooter } from "@/components/FWNFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.fwn;

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
