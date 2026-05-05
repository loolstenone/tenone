import type { Metadata } from "next";
import { GprPage } from "@/features/myverse/planner/GprPage";

export const metadata: Metadata = {
  title: "GPR — 성장의 나침반",
  description: "Goal · Plan · Result. 목표를 세우고, 실행하고, 돌아본다. 평가가 아닌 성장의 프로토콜.",
  openGraph: {
    title: "GPR — 성장의 나침반 | 마이버스",
    description: "기록하지 않으면 흘러간다. 기록하면 자산이 된다.",
  },
};

export default function Page() {
  return <GprPage />;
}
