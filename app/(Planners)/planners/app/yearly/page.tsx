import { YearlyView } from "@/features/planners/YearlyView";

export default async function YearlyPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
    const params = await searchParams;
    const year = params.year ? parseInt(params.year, 10) : new Date().getFullYear();
    return <YearlyView initialYear={year} />;
}
