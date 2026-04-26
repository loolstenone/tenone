import type { Metadata } from "next";
import { InstallView } from "@/features/planners/InstallView";

export const metadata: Metadata = {
    title: "앱 설치",
    description: "Planner's Planner AI 를 휴대폰·PC 홈 화면에 설치하세요. 모든 기능은 웹에서 그대로 작동합니다.",
};

export default function InstallPage() {
    return (
        <main className="min-h-screen bg-[#FAFAF7]">
            <InstallView />
        </main>
    );
}
