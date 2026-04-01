import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "TrendHunter → Mindle",
    robots: { index: false },
};

export default function TrendHunterLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
