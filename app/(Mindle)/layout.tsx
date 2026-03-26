import { MindleHeader } from "@/components/MindleHeader";
import { MindleFooter } from "@/components/MindleFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "Mindle — 트렌드의 홀씨를 찾아, 인사이트로 피워냅니다", template: "%s | Mindle" },
    description: "AI 기반 트렌드 분석 플랫폼. 데이터 크롤링부터 인사이트 큐레이션까지.",
    icons: { icon: "/brands/mindle/favicon.png" },
};

export default function MindleLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
            <MindleHeader />
            <main className="flex-1 pt-14">{children}</main>
            <MindleFooter />
        </div>
    );
}
