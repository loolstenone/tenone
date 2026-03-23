import { DomoHeader } from "@/components/DomoHeader";
import { DomoFooter } from "@/components/DomoFooter";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.domo;

export const metadata: Metadata = {
    title: { default: "Domo — 인생 2회차, 도모하다", template: `%s | ${site.name}` },
    description: site.meta.description,
    icons: { icon: site.faviconUrl, apple: site.appleTouchIcon },
    openGraph: {
        title: "Domo — 인생 2회차, 도모하다",
        description: site.meta.description,
        siteName: site.name,
    },
};

export default function DomoLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <DomoHeader />
            <main className="flex-1 pt-14">
                {children}
            </main>
            <DomoFooter />
        </div>
    );
}
