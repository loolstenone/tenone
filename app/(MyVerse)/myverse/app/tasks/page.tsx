import { TasksView } from "@/features/myverse/planner/TasksView";
import { LaneSubNav, WORK_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export default function TasksPage() {
    return (
        <>
            <LaneSubNav tabs={WORK_LANE_TABS} />
            <TasksView />
        </>
    );
}
