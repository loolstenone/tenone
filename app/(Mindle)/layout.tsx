import { MindleHeader } from "@/components/MindleHeader";
import { MindleFooter } from "@/components/MindleFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "Mindle — Bloom insights from signals", template: "%s | Mindle" },
    description: "AI-powered trend analysis platform. From data crawling to insight curation.",
    icons: { icon: "/brands/mindle/favicon.png" },
    openGraph: {
        title: "Mindle — Bloom insights from signals",
        description: "AI-powered trend analysis platform. From data crawling to insight curation.",
        siteName: 'Ten:One™ Universe',
        type: 'website',
    },
};

export default function MindleLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
            <MindleHeader />
            <main className="flex-1 pt-[82px]">{children}</main>
            <MindleFooter />
        </div>
    );
}
