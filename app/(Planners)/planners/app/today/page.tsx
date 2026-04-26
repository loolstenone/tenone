import { redirect } from "next/navigation";

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
    const params = await searchParams;
    const date = params.date ? `?date=${params.date}` : "";
    redirect(`/planners/app/daily${date}`);
}
