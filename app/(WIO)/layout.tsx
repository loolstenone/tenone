import type { Metadata } from "next";
import { siteConfigs } from "@/lib/site-config";

const site = siteConfigs.wio;

export const metadata: Metadata = {
    title: { default: site.meta.title, template: `%s | ${site.name}` },
    description: site.meta.description,
    openGraph: {
        title: site.meta.title,
        description: site.meta.description,
        siteName: 'Ten:One™ Universe',
        type: 'website',
    },
};

export default function WIOLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0F0F23] text-white flex flex-col">
            {children}
        </div>
    );
}
