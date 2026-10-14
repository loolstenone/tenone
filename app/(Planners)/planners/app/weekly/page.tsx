import { WeeklyView } from "@/features/myverse/planner/WeeklyView";
import { ViewToggle } from "@/features/myverse/planner/ViewToggle";
import { WeeklyReview } from "@/features/planners/app/WeeklyReview";
import { getISOWeek } from "@/lib/myverse/types";

export default async function WeeklyPage({ searchParams }: { searchParams: Promise<{ year?: string; week?: string }> }) {
    const params = await searchParams;
    const now = new Date();
    const { year: y0, week: w0 } = getISOWeek(now);
    const year = params.year ? parseInt(params.year, 10) : y0;
    const week = params.week ? parseInt(params.week, 10) : w0;
    return (
        <div>
            <div className="mx-auto max-w-6xl px-4 pt-6 md:px-10 md:pt-8">
                <div className="mb-4 flex justify-end">
                    <ViewToggle current="weekly" />
                </div>
                {/* 주간 회고 — 숫자는 무료, '한 주 읽기'는 유료 AI (2단계 2026-10-14) */}
                <WeeklyReview />
            </div>
            <div className="-mt-6 md:-mt-12">
                <WeeklyView initialYear={year} initialWeek={week} />
            </div>
        </div>
    );
}
