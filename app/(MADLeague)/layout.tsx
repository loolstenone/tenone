import { MadLeagueHeader } from "@/components/MadLeagueHeader";
import { MadLeagueFooter } from "@/components/MadLeagueFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "MAD League - 경쟁을 통한 성장 플랫폼",
    description: "Match, Act, Develop. 경쟁하고, 행동하고, 성장하라. 전국 대학 연합 마케팅 경쟁 플랫폼 MAD League.",
    icons: {
        icon: "/icon.png",
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
