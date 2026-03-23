import { TownityHeader } from "@/components/TownityHeader";
import { TownityFooter } from "@/components/TownityFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.townity;

export const metadata: Metadata = {
    title: { default: site.meta.title, template: `%s | ${site.name}` },
    description: site.meta.description,
    icons: { icon: site.faviconUrl, apple: site.appleTouchIcon },
    openGraph: {
        title: site.meta.title,
        description: site.meta.description,
        siteName: site.name,
    },
};

export default function TownityLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <TownityHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <TownityFooter />
        </div>
    );
}
