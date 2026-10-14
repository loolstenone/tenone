// 오늘(메인) — 일간 시간 줌 슬라이스. 상단에 [일간|주간|월간|연간] 토글.
import { DailyView } from "@/features/myverse/planner/DailyView";
import { ViewToggle } from "@/features/myverse/planner/ViewToggle";

export const dynamic = "force-dynamic";

function todayKST(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());
}

export default async function DailyPage({ searchParams }: { searchParams: Promise<{ date?: string; compose?: string }> }) {
    const params = await searchParams;
    const date = params.date || todayKST();
    const autoCompose = params.compose === "1" || params.compose === "true";
    return (
        <div>
            <div className="flex justify-end px-4 pt-3">
                <ViewToggle current="daily" />
            </div>
            <DailyView initialDate={date} autoCompose={autoCompose} />
        </div>
    );
}
