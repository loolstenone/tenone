import type { Metadata } from "next";
import { CanvasStudio } from "@/features/planners/CanvasStudio";

export const metadata: Metadata = {
    title: "캔버스 스튜디오",
};

interface Props {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ embed?: string }>;
}

export default async function CanvasEditorPage({ params, searchParams }: Props) {
    const { id } = await params;
    const { embed } = await searchParams;
    return <CanvasStudio canvasId={id} embed={embed === "1"} />;
}
