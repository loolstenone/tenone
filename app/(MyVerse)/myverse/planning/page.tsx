import type { Metadata } from "next";
import { PlanningPage } from "@/features/myverse/planner/PlanningPage";

export const metadata: Metadata = {
  title: "Planning — 기획자가 되는 법",
  description: "기획과 계획의 차이, Vrief 프레임워크, Vridge 사고법. 22년 기획 현장에서 검증한 방법론.",
  openGraph: {
    title: "Planning — 기획자가 되는 법 | 마이버스",
    description: "진짜 문제를 찾고, 가설을 세우고, 검증하는 기획자의 사고 체계.",
  },
};

export default function Page() {
  return <PlanningPage />;
}
