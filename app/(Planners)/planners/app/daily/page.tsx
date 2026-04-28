import { DailyView } from "@/features/planners/DailyView";

// KST(Asia/Seoul) 기준 오늘 — 서버 UTC 시각을 KST로 변환해 YYYY-MM-DD 추출
function todayKST(): string {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric", month: "2-digit", day: "2-digit",
    });
    return fmt.format(new Date()); // en-CA → YYYY-MM-DD
}

export default async function DailyPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await searchParams;
    const date = params.date || todayKST();
    return <DailyView initialDate={date} />;
}
