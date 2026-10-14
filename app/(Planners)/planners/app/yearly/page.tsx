import { YearlyView } from "@/features/myverse/planner/YearlyView";
import { ViewToggle } from "@/features/myverse/planner/ViewToggle";

export default async function YearlyPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const params = await searchParams;
    const year = params.year ? parseInt(params.year, 10) : new Date().getFullYear();
    return (
        <div>
            <div className="mx-auto flex max-w-6xl justify-end px-4 pt-6 md:px-10 md:pt-8 -mb-2 md:-mb-6">
                <ViewToggle current="yearly" />
            </div>
            <YearlyView initialYear={year} />
        </div>
    );
}
