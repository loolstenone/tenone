import { MonthlyView } from "@/features/planners/MonthlyView";

export default async function MonthlyPage({ searchParams }: { searchParams: Promise<{ year?: string; month?: string }> }) {
    const params = await searchParams;
    const now = new Date();
    const year = params.year ? parseInt(params.year, 10) : now.getFullYear();
    const month = params.month ? parseInt(params.month, 10) : now.getMonth() + 1;
    return <MonthlyView initialYear={year} initialMonth={month} />;
}
