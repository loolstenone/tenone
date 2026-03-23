import { TrendHunterHeader } from "@/components/TrendHunterHeader";
import { TrendHunterFooter } from "@/components/TrendHunterFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.trendhunter;

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

export default function TrendHunterLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
            <TrendHunterHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <TrendHunterFooter />
        </div>
    );
}
