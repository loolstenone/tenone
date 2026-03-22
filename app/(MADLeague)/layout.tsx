import { MadLeagueHeader } from "@/components/MadLeagueHeader";
import { MadLeagueFooter } from "@/components/MadLeagueFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.madleague;

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

export default function MadLeagueLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <MadLeagueHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <MadLeagueFooter />
        </div>
    );
}
