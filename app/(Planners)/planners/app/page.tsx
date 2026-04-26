import { redirect } from "next/navigation";

export default async function AppRootPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
    const params = await searchParams;
    const welcome = params.welcome === "1" ? "?welcome=1" : "";
    redirect(`/planners/app/daily${welcome}`);
}
