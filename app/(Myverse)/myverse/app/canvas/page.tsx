import type { Metadata } from "next";
import { CanvasListView } from "@/features/myverse/planner/CanvasListView";
import { LaneSubNav, WORK_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const metadata: Metadata = {
    title: "자유 캔버스",
};

export const dynamic = "force-dynamic";

export default function CanvasIndexPage() {
    return (
        <>
            <LaneSubNav tabs={WORK_LANE_TABS} />
            <CanvasListView />
        </>
    );
}
