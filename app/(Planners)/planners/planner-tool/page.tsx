import type { Metadata } from "next";
import { PlannerToolPage } from "@/features/planners/PlannerToolPage";

export const metadata: Metadata = {
  title: "Planner's Planner AI",
  description: "22년 기획 노하우를 담은 종이 플래너 + 능동 AI 비서. 아침 브리핑, 저녁 회고, 59종 템플릿. 연간 19,000원.",
  openGraph: {
    title: "Planner's Planner AI | Planner's",
    description: "아침엔 브리핑하고, 저녁엔 정리한다. PDF 플래너 구매자는 1년 무료.",
  },
};

export default function Page() {
  return <PlannerToolPage />;
}
