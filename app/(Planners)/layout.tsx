import { PlannersHeader } from "@/components/PlannersHeader";
import { PlannersFooter } from "@/components/PlannersFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "Planner's — 우리는 모두 기획자다", template: "%s | Planner's" },
    description: "기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다.",
    icons: { icon: "/favicon.ico" },
    openGraph: {
        title: "Planner's — 기획 프레임워크",
        description: "기획은 꾀하는 것이고, 계획은 세우는 것이다. Why를 찾고 What을 만드는 사람, 그것이 기획자다.",
        siteName: 'Ten:One™ Universe',
        type: 'website',
    },
};

export default function PlannersLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
            <PlannersHeader />
            <main className="flex-1 pt-14">
                {children}
            </main>
            <PlannersFooter />
        </div>
    );
}
