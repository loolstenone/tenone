import { CompetitionEditor } from "@/components/intra/madleague/CompetitionEditor";

export default async function MadleagueCompetitionEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CompetitionEditor id={id} basePath="/intra/ums/madleague/competitions" />;
}
