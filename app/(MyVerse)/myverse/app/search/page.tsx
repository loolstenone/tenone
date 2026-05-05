import { SearchView } from "@/features/myverse/planner/SearchView";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    return <SearchView initialQuery={params.q || ""} />;
}
