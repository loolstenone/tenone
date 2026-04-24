import { ProjectDetailView } from "@/features/planners/ProjectDetailView";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ProjectDetailView projectId={id} />;
}
