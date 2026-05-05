import { ClientRedirect } from "@/components/ClientRedirect";

export const dynamic = "force-dynamic";

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await searchParams;
    const date = params.date ? `?date=${params.date}` : "";
    return <ClientRedirect to={`/myverse/app/daily${date}`} />;
}
