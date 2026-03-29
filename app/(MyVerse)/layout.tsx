import { MyVerseHeader } from "@/components/MyVerseHeader";
import { MyVerseFooter } from "@/components/MyVerseFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.myverse;

export const metadata: Metadata = {
    title: { default: site.meta.title, template: `%s | ${site.name}` },
    description: site.meta.description,
    icons: { icon: site.faviconUrl, apple: site.appleTouchIcon },
    openGraph: {
        title: site.meta.title,
        description: site.meta.description,
        siteName: 'Ten:One™ Universe',
        type: 'website',
    },
};

export default function MyVerseLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-[#0B0D17] text-white flex flex-col">
            <MyVerseHeader />
            <main className="flex-1 pt-14">
                {children}
            </main>
            <MyVerseFooter />
        </div>
    );
}
