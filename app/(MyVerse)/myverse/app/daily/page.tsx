import { DailyView } from "@/features/myverse/planner/DailyView";

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
    return <DailyView initialDate={date} autoCompose={params.compose === "1"} />;
}
