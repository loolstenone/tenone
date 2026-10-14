import { MonthlyView } from "@/features/myverse/planner/MonthlyView";
import { ViewToggle } from "@/features/myverse/planner/ViewToggle";

export default async function MonthlyPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
    const params = await searchParams;
    const now = new Date();
    const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
    const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;
    return (
        <div>
            <div className="mx-auto flex max-w-6xl justify-end px-4 pt-6 md:px-10 md:pt-8 -mb-2 md:-mb-6">
                <ViewToggle current="monthly" />
            </div>
            <MonthlyView initialYear={year} initialMonth={month} />
        </div>
    );
}
