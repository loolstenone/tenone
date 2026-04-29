import type { Metadata } from "next";
import { ProgramsPage } from "@/features/planners/ProgramsPage";

export const metadata: Metadata = {
  title: "Programs — 기획 교육",
  description: "AI 시대에 살아남는 기획력. Vrief 사고 체계, AI 활용, GPR 성과 관리 — 세 가지를 훈련합니다.",
  openGraph: {
    title: "Programs — 기획 교육 | Planner's",
    description: "기획은 가르칠 수 있는 것이 아니라 훈련할 수 있는 것이다.",
  },
};

export default function Page() {
  return <ProgramsPage />;
}
