import { PersonView } from "@/features/myverse/app/PersonView";

export const dynamic = "force-dynamic";

export default async function WithPersonPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    return <PersonView name={decodeURIComponent(name)} />;
}
