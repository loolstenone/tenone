import { Suspense } from "react";
import { TracesTimelineView } from "@/features/myverse/app/TracesTimelineView";
import { LaneSubNav, RECORD_LANE_TABS } from "@/features/myverse/app/LaneSubNav";

export const dynamic = "force-dynamic";

export default function TracesPage() {
    return (
        <>
            <LaneSubNav tabs={RECORD_LANE_TABS} />
            <Suspense fallback={<div className="p-6 text-sm text-neutral-400">불러오는 중…</div>}>
                <TracesTimelineView />
            </Suspense>
        </>
    );
}
