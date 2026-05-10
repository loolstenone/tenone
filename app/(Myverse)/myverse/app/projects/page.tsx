import { ProjectsView } from "@/features/myverse/planner/ProjectsView";
import { LaneSubNav, WORK_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export default function ProjectsPage() {
    return (
        <>
            <LaneSubNav tabs={WORK_LANE_TABS} />
            <ProjectsView />
        </>
    );
}
