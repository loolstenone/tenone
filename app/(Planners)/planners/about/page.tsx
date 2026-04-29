import type { Metadata } from "next";
import { AboutPage } from "@/features/planners/AboutPage";

export const metadata: Metadata = {
    title: "About — Planner's 이야기",
    description: "22년 기획 현장에서 탄생한 플래너. 도구가 아니라 사고 체계를 훈련하는 방법론 — Vrief, GPR, Principle 10.",
    openGraph: {
        title: "About — Planner's 이야기 | Planner's",
        description: "생각한대로 살지 않으면, 사는대로 생각하게 된다.",
    },
};

export default function Page() {
    return <AboutPage />;
}
