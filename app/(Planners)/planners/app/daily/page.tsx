import { DailyView } from "@/features/planners/DailyView";

export default async function DailyPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await searchParams;
    const date = params.date || new Date().toISOString().slice(0, 10);
    return <DailyView initialDate={date} />;
}
