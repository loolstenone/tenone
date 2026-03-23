import { BadakHeader } from "@/components/BadakHeader";
import { BadakFooter } from "@/components/BadakFooter";
import { StarfieldWrapper } from "@/components/StarfieldWrapper";
import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.badak;

export const metadata: Metadata = {
    title: { default: "Badak - 마케팅 광고 네트워킹 커뮤니티", template: `%s | ${site.name}` },
    description: site.meta.description,
    icons: { icon: site.faviconUrl, apple: site.appleTouchIcon },
    openGraph: {
        title: "Badak - 마케팅 광고 네트워킹 커뮤니티",
        description: site.meta.description,
        siteName: site.name,
    },
};

export default function BadakLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <BadakHeader />
            <main className="flex-1 pt-14">
                {children}
            </main>
            <BadakFooter />
            <StarfieldWrapper />
        </div>
    );
}
