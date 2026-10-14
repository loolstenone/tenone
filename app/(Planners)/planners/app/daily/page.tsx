// 오늘(메인) — 일간 시간 줌 슬라이스. 상단에 [일간|주간|월간|연간] 토글.
import { DailyView } from "@/features/myverse/planner/DailyView";
import { ViewToggle } from "@/features/myverse/planner/ViewToggle";
import { BrainDump } from "@/features/planners/app/BrainDump";
import { AutoCarry } from "@/features/planners/app/AutoCarry";

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
            <div className="mx-auto max-w-6xl px-4 pt-6 md:px-10 md:pt-8">
                <div className="mb-4 flex justify-end">
                    <ViewToggle current="daily" />
                </div>
                {/* 못 끝낸 일 자동 재배치 — 하루 한 번 (AI 아님, 무료) */}
                <AutoCarry date={date} />
                {/* 생각 쏟아내기 — 적거나 말하면 AI가 할 일·일정으로 정리 (유료 회원 전용, 1단계 2026-10-14) */}
                <BrainDump date={date} />
            </div>
            <div className="-mt-6 md:-mt-12">
                <DailyView initialDate={date} autoCompose={autoCompose} />
            </div>
        </div>
    );
}
