import { ProgramEditor } from "@/components/intra/programs/ProgramEditor";

export default async function MadleagueCompetitionEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProgramEditor id={id} basePath="/intra/ums/madleague/competitions" />;
}
