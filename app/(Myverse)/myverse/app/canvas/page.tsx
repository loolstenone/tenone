import type { Metadata } from "next";
import { CanvasListView } from "@/features/myverse/planner/CanvasListView";

export const metadata: Metadata = {
    title: "자유 캔버스",
};

export const dynamic = "force-dynamic";

export default function CanvasIndexPage() {
    return <CanvasListView />;
}
