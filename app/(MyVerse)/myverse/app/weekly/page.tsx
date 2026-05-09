import { WeeklyView } from "@/features/myverse/planner/WeeklyView";
import { getISOWeek } from "@/lib/myverse/types";
import { LaneSubNav, RECORD_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export default async function WeeklyPage({ searchParams }: { searchParams: Promise<{ year?: string; week?: string }> }) {
    const params = await searchParams;
    const now = new Date();
    const { year: y0, week: w0 } = getISOWeek(now);
    const year = params.year ? parseInt(params.year, 10) : y0;
    const week = params.week ? parseInt(params.week, 10) : w0;
    return (
        <>
            <LaneSubNav tabs={RECORD_LANE_TABS} />
            <WeeklyView initialYear={year} initialWeek={week} />
        </>
    );
}
