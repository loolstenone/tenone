import { MindleHeader } from "@/features/mindle/MindleHeader";
import { MindleFooter } from "@/features/mindle/MindleFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "Mindle — 보이기 전에, 먼저 본다", template: "%s | Mindle" },
    description: "AI가 분석하는 트렌드 인텔리전스 플랫폼. 신호에서 인사이트를 피워냅니다.",
    icons: { icon: "/brands/mindle/favicon.png" },
    openGraph: {
        title: "Mindle — 보이기 전에, 먼저 본다",
        description: "AI가 분석하는 트렌드 인텔리전스 플랫폼. 신호에서 인사이트를 피워냅니다.",
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
