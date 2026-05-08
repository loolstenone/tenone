import { Suspense } from "react";
import { TracesTimelineView } from "@/features/myverse/app/TracesTimelineView";

export const dynamic = "force-dynamic";

export default function TracesPage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm text-neutral-400">불러오는 중…</div>}>
            <TracesTimelineView />
        </Suspense>
    );
}
