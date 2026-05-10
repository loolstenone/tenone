import { Suspense } from "react";
import { TemplatesView } from "@/features/myverse/planner/TemplatesView";
import { LaneSubNav, WORK_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export default function TemplatesPage() {
    return (
        <>
            <LaneSubNav tabs={WORK_LANE_TABS} />
            <Suspense><TemplatesView /></Suspense>
        </>
    );
}
