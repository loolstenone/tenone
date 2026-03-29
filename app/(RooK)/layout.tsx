import { RooKHeader } from "@/components/RooKHeader";
import { RooKFooter } from "@/components/RooKFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.rook;

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

export default function RooKLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <RooKHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <RooKFooter />
        </div>
    );
}
