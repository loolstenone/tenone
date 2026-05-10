import { YearlyView } from "@/features/myverse/planner/YearlyView";
import { LaneSubNav, RECORD_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export default async function YearlyPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const params = await searchParams;
    const year = params.year ? parseInt(params.year, 10) : new Date().getFullYear();
    return (
        <>
            <LaneSubNav tabs={RECORD_LANE_TABS} />
            <YearlyView initialYear={year} />
        </>
    );
}
