"use client";

// 공유 링크 읽기 전용 뷰어 — onSave·canvasId 없이 렌더 → 저장/편집 비활성

import Link from "next/link";
import type { CanvasDocument } from "@/lib/canvas-engine";
import type { MindmapDoc } from "./MindmapEditor";
import { MindmapEditor } from "./MindmapEditor";
import CanvasEditor from "./CanvasEditor";

interface Props {
    title: string;
    mode: "mindmap" | "canvas";
    mindmapDoc: MindmapDoc | null;
    canvasDoc: CanvasDocument | null;
}

export function SharedCanvas({ title, mode, mindmapDoc, canvasDoc }: Props) {
    return (
        <div className="fixed inset-0 flex flex-col bg-neutral-50">
            <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-neutral-200 shrink-0 z-10">
                <span className="text-sm font-medium text-neutral-700 truncate max-w-xs">
                    {title || "마인드맵"}
                </span>
                <Link
                    href="/myverse"
                    className="text-[11px] text-[#6366F1] hover:underline shrink-0 ml-4"
                >
                    마이버스로 만들기 →
                </Link>
            </header>

            <div className="flex-1 min-h-0 relative">
                {mode === "mindmap" ? (
                    <MindmapEditor
                        initialDoc={mindmapDoc ?? undefined}
                        className="absolute inset-0"
                    />
                ) : (
                    <CanvasEditor
                        initialDoc={canvasDoc ?? undefined}
                        className="absolute inset-0"
                    />
                )}
            </div>

            <footer className="shrink-0 flex items-center justify-center py-1.5 bg-white border-t border-neutral-100">
                <p className="text-[10px] text-neutral-400">
                    <Link href="/myverse" className="hover:text-[#6366F1] transition-colors">
                        Myverse AI
                    </Link>
                    {" "}로 만들어진 공유 캔버스
                </p>
            </footer>
        </div>
    );
}
