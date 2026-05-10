import { WeeklyView } from "@/features/myverse/planner/WeeklyView";
import { ViewToggle } from "@/features/myverse/planner/ViewToggle";
import { getISOWeek } from "@/lib/myverse/types";

export default async function WeeklyPage({ searchParams }: { searchParams: Promise<{ year?: string; week?: string }> }) {
    const params = await searchParams;
    const now = new Date();
    const { year: y0, week: w0 } = getISOWeek(now);
    const year = params.year ? parseInt(params.year, 10) : y0;
    const week = params.week ? parseInt(params.week, 10) : w0;
    return (
        <div>
            <div className="flex justify-end px-4 pt-3">
                <ViewToggle current="weekly" />
            </div>
            <WeeklyView initialYear={year} initialWeek={week} />
        </div>
    );
}
