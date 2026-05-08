import { TimeCapsulesView } from "@/features/myverse/app/TimeCapsulesView";
import { LaneSubNav, AI_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const dynamic = "force-dynamic";

export default function CapsulesPage() {
    return (
        <>
            <LaneSubNav tabs={AI_LANE_TABS} />
            <TimeCapsulesView />
        </>
    );
}
