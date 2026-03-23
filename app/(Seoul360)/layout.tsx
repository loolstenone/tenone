import { Seoul360Header } from "@/components/Seoul360Header";
import { Seoul360Footer } from "@/components/Seoul360Footer";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.seoul360;

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

export default function Seoul360Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-[#F5F0E8] text-neutral-900 flex flex-col">
            <Seoul360Header />
            <main className="flex-1 pt-14">
                {children}
            </main>
            <Seoul360Footer />
        </div>
    );
}
