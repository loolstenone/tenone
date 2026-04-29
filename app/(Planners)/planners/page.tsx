import type { Metadata } from "next";
import { PlannersHomePage } from "@/features/planners/PlannersHomePage";

export const metadata: Metadata = {
  title: "우리는 모두 기획자다",
  description: "기획·기획자 교육 커뮤니티 + 능동 AI 플래너. 22년 기획 노하우를 담은 Planner's Planner AI.",
  openGraph: {
    title: "우리는 모두 기획자다 | Planner's",
    description: "AI가 실행을 대신할수록, 방향을 정하는 힘이 곧 경쟁력이다.",
  },
};

export default function Page() {
  return <PlannersHomePage />;
}
