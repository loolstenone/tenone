import { SearchView } from "@/features/planners/SearchView";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams;
    return <SearchView initialQuery={params.q || ""} />;
}
