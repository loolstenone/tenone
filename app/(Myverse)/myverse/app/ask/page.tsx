import { AskMyverseView } from "@/features/myverse/app/AskMyverseView";
import { LaneSubNav, AI_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const dynamic = "force-dynamic";

export default function AskPage() {
    return (
        <>
            <LaneSubNav tabs={AI_LANE_TABS} />
            <AskMyverseView />
        </>
    );
}
