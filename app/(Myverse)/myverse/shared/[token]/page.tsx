// 공유 링크 공개 뷰어 — 인증 불필요, 읽기 전용

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SharedCanvas } from "@/features/myverse/planner/SharedCanvas";
import type { MindmapDoc } from "@/features/myverse/planner/MindmapEditor";
import type { CanvasDocument } from "@/lib/canvas-engine";

export async function generateMetadata(
    { params }: { params: Promise<{ token: string }> }
): Promise<Metadata> {
    const { token } = await params;
    const admin = createAdminClient();
    const { data } = await admin
        .from("myverse_canvases")
        .select("title")
        .eq("share_token", token)
        .maybeSingle();
    if (!data) return { title: "캔버스를 찾을 수 없습니다" };
    return { title: `${data.title ?? "마인드맵"} — Myverse AI` };
}

export default async function SharedCanvasPage(
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;
    const admin = createAdminClient();
    const { data } = await admin
        .from("myverse_canvases")
        .select("id, title, data")
        .eq("share_token", token)
        .maybeSingle();

    if (!data) notFound();

    const mode: "mindmap" | "canvas" = data.data?.mindmap ? "mindmap" : "canvas";

    return (
        <SharedCanvas
            title={data.title ?? ""}
            mode={mode}
            mindmapDoc={(data.data?.mindmap ?? null) as MindmapDoc | null}
            canvasDoc={(data.data?.ppcanvas ?? null) as CanvasDocument | null}
        />
    );
}
