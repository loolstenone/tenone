// /myverse/app/daily 는 /today 의 별칭 — IA 5-Lane 정리 (세션 121)
// "오늘" lane의 일간 줌 진입점은 /today 단 하나.
import { ClientRedirect } from "@/components/ClientRedirect";

export const dynamic = "force-dynamic";

export default async function DailyAliasPage({ searchParams }: { searchParams: Promise<{ date?: string; compose?: string }> }) {
    const params = await searchParams;
    const qs = new URLSearchParams();
    if (params.date) qs.set("date", params.date);
    if (params.compose) qs.set("compose", params.compose);
    const target = `/myverse/app/today${qs.toString() ? `?${qs.toString()}` : ""}`;
    return <ClientRedirect to={target} />;
}
