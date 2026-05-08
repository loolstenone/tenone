// 오늘 — Lane 1차 진입점 (canonical home).
// Daily / Index 콘텐츠를 통합한 단일 홈. 기존 /daily·/index URL은 유지(LANE_PATHS에 매핑).

import { DailyView } from "@/features/myverse/planner/DailyView";

export const dynamic = "force-dynamic";

function todayKST(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
}

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ date?: string; compose?: string }> }) {
    const params = await searchParams;
    const date = params.date || todayKST();
    return <DailyView initialDate={date} autoCompose={params.compose === "1"} />;
}
