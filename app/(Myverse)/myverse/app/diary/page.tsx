import { AiDiaryView } from "@/features/myverse/app/AiDiaryView";
import { LaneSubNav, AI_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const dynamic = "force-dynamic";

export default function DiaryPage() {
    return (
        <>
            <LaneSubNav tabs={AI_LANE_TABS} />
            <AiDiaryView />
        </>
    );
}
