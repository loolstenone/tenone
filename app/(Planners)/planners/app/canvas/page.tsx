import type { Metadata } from "next";
import { CanvasListView } from "@/features/planners/CanvasListView";

export const metadata: Metadata = {
    title: "자유 캔버스",
};

export default function CanvasIndexPage() {
    return <CanvasListView />;
}
