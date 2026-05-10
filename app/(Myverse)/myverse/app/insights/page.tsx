import { InsightsView } from "@/features/myverse/app/InsightsView";
import { LaneSubNav, AI_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const dynamic = "force-dynamic";

export default function InsightsPage() {
    return (
        <>
            <LaneSubNav tabs={AI_LANE_TABS} />
            <InsightsView />
        </>
    );
}
