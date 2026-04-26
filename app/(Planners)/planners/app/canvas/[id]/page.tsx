import type { Metadata } from "next";
import { CanvasEditor } from "@/features/planners/CanvasEditor";

export const metadata: Metadata = {
    title: "캔버스 편집",
};

interface Props { params: Promise<{ id: string }> }

export default async function CanvasEditorPage({ params }: Props) {
    const { id } = await params;
    return <CanvasEditor canvasId={id} />;
}
