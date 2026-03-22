import { YouInOneHeader } from "@/components/YouInOneHeader";
import { YouInOneFooter } from "@/components/YouInOneFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "YouInOne - We are Project Group to solve Problems",
    description: "기업과 사회의 문제를 해결하는 프로젝트 그룹. Idea + Strategy. 소규모 기업 연합 얼라이언스.",
    icons: {
        icon: "/icon.png",
    },
};

export default function YouInOneLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <YouInOneHeader />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <YouInOneFooter />
        </div>
    );
}
