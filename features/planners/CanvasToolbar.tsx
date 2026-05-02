"use client";

// PP Canvas 단일 통합 툴바 — Excalidraw 기본 UI를 모두 숨기고 이 컴포넌트가 전담.
//
// 구성: [선택] [펜 5종] [색 7종] [도형 4종] [텍스트] [지우개] [undo/redo]
// 모든 동작은 ExcalidrawImperativeAPI를 통해 호출 — 단일 진실 소스.

import { useCallback, useEffect, useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
    Pen, Pencil, Highlighter, Eraser, MousePointer2,
    Square, Circle, ArrowRight, Type, Undo2, Redo2, Diamond,
} from "lucide-react";

// ─── 펜 프리셋 ──────────────────────────────────────────────────────────────

interface PenPreset {
    key: string;
    label: string;
    icon: React.ReactNode;
    width: number;
    roughness: number;
    opacity: number;
    style: "solid" | "dashed" | "dotted";
    fixedColor?: string;
}

const FOUNTAIN_ICON = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21l3-3" />
        <path d="M5.5 18.5l11-11" />
        <path d="M16 5l3 3" />
        <path d="M14.5 6.5L18 10" />
        <path d="M18 3l3 3l-3 3" />
    </svg>
);

const MARKER_ICON = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l-6 6v3h3l6-6" />
        <path d="M22 3l-7 7l-3-3l7-7l3 3z" />
    </svg>
);

const PEN_PRESETS: PenPreset[] = [
    { key: "pen",         label: "펜",       icon: <Pen className="h-4 w-4" />,         width: 2,   roughness: 1, opacity: 100, style: "solid" },
    { key: "pencil",      label: "연필",     icon: <Pencil className="h-4 w-4" />,      width: 1.5, roughness: 2, opacity: 80,  style: "solid" },
    { key: "fountain",    label: "만년필",   icon: FOUNTAIN_ICON,                       width: 3,   roughness: 0, opacity: 100, style: "solid" },
    { key: "marker",      label: "마커",     icon: MARKER_ICON,                         width: 5,   roughness: 0, opacity: 100, style: "solid" },
    { key: "highlighter", label: "형광펜",   icon: <Highlighter className="h-4 w-4" />, width: 12,  roughness: 0, opacity: 35,  style: "solid", fixedColor: "#fde047" },
];

// ─── 색상 팔레트 ────────────────────────────────────────────────────────────

const COLORS = [
    { hex: "#171717", name: "검정" },
    { hex: "#525252", name: "진회색" },
    { hex: "#dc2626", name: "빨강" },
    { hex: "#ea580c", name: "주황" },
    { hex: "#16a34a", name: "녹색" },
    { hex: "#0F766E", name: "청록" },
    { hex: "#7c3aed", name: "보라" },
];

// ─── 도형·기타 도구 ──────────────────────────────────────────────────────────

type ShapeKind = "rectangle" | "ellipse" | "diamond" | "arrow";

const SHAPES: { kind: ShapeKind; label: string; icon: React.ReactNode }[] = [
    { kind: "rectangle", label: "사각형",   icon: <Square className="h-4 w-4" /> },
    { kind: "ellipse",   label: "원",       icon: <Circle className="h-4 w-4" /> },
    { kind: "diamond",   label: "다이아",   icon: <Diamond className="h-4 w-4" /> },
    { kind: "arrow",     label: "화살표",   icon: <ArrowRight className="h-4 w-4" /> },
];

// ─── 컴포넌트 ───────────────────────────────────────────────────────────────

type ActiveTool =
    | { mode: "selection" }
    | { mode: "freedraw"; pen: string }
    | { mode: "shape"; shape: ShapeKind }
    | { mode: "text" }
    | { mode: "eraser" };

interface Props {
    apiRef: React.RefObject<ExcalidrawImperativeAPI | null>;
}

export function CanvasToolbar({ apiRef }: Props) {
    const [active, setActive] = useState<ActiveTool>({ mode: "selection" });
    const [color, setColor] = useState<string>(COLORS[0].hex);

    // ── undo/redo: Excalidraw가 키보드 단축키만 노출 → DOM에 키 이벤트 디스패치 ─
    const dispatchKey = useCallback((key: string, opts: KeyboardEventInit = {}) => {
        const target = document.querySelector(".excalidraw") as HTMLElement | null;
        if (!target) return;
        const ev = new KeyboardEvent("keydown", { key, bubbles: true, ctrlKey: true, ...opts });
        target.dispatchEvent(ev);
    }, []);
    const undo = useCallback(() => dispatchKey("z"), [dispatchKey]);
    const redo = useCallback(() => dispatchKey("z", { shiftKey: true }), [dispatchKey]);

    // ── 펜 프리셋 적용 ──────────────────────────────────────────────────────
    const selectPen = useCallback((preset: PenPreset) => {
        const api = apiRef.current;
        if (!api) return;
        setActive({ mode: "freedraw", pen: preset.key });
        api.setActiveTool({ type: "freedraw" });
        const stroke = preset.fixedColor ?? color;
        api.updateScene({
            appState: {
                currentItemStrokeColor: stroke,
                currentItemStrokeWidth: preset.width,
                currentItemRoughness: preset.roughness,
                currentItemOpacity: preset.opacity,
                currentItemStrokeStyle: preset.style,
            },
        });
    }, [apiRef, color]);

    function selectColor(hex: string) {
        const api = apiRef.current;
        if (!api) return;
        setColor(hex);
        if (active.mode === "freedraw") {
            const preset = PEN_PRESETS.find(p => p.key === active.pen);
            if (preset && !preset.fixedColor) {
                api.updateScene({ appState: { currentItemStrokeColor: hex } });
            }
        }
        if (active.mode === "shape" || active.mode === "text") {
            api.updateScene({ appState: { currentItemStrokeColor: hex } });
        }
    }

    const selectShape = useCallback((shape: ShapeKind) => {
        const api = apiRef.current;
        if (!api) return;
        setActive({ mode: "shape", shape });
        api.setActiveTool({ type: shape });
        api.updateScene({ appState: { currentItemStrokeColor: color } });
    }, [apiRef, color]);

    const selectText = useCallback(() => {
        const api = apiRef.current;
        if (!api) return;
        setActive({ mode: "text" });
        api.setActiveTool({ type: "text" });
        api.updateScene({ appState: { currentItemStrokeColor: color } });
    }, [apiRef, color]);

    const selectTool = useCallback((mode: "selection" | "eraser") => {
        const api = apiRef.current;
        if (!api) return;
        setActive({ mode });
        api.setActiveTool({ type: mode });
    }, [apiRef]);

    // ── 키보드 단축키 ─────────────────────────────────────────────────────
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            const target = e.target as HTMLElement;
            if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            switch (e.key.toLowerCase()) {
                case "v": selectTool("selection"); break;
                case "p": selectPen(PEN_PRESETS[0]); break;
                case "e": selectTool("eraser"); break;
                case "r": selectShape("rectangle"); break;
                case "o": selectShape("ellipse"); break;
                case "a": selectShape("arrow"); break;
                case "t": selectText(); break;
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selectPen, selectShape, selectText, selectTool]);

    // ── 활성 색상 비활성 여부 (형광펜) ──────────────────────────────────────
    const colorsDisabled = active.mode === "freedraw" && PEN_PRESETS.find(p => p.key === active.pen)?.fixedColor !== undefined;

    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 px-1.5 py-1.5 bg-white/95 planners-dark:bg-[#1c1c1c]/95 backdrop-blur border border-neutral-200 planners-dark:border-[#2a2a2a] rounded-full shadow-md max-w-[calc(100vw-16px)] overflow-x-auto">
            <ToolButton title="선택 (V)" active={active.mode === "selection"} onClick={() => selectTool("selection")}>
                <MousePointer2 className="h-4 w-4" />
            </ToolButton>

            <Divider />

            {PEN_PRESETS.map(preset => (
                <ToolButton
                    key={preset.key}
                    title={preset.label}
                    active={active.mode === "freedraw" && active.pen === preset.key}
                    onClick={() => selectPen(preset)}
                >
                    {preset.icon}
                </ToolButton>
            ))}

            <Divider />

            {COLORS.map(c => (
                <button
                    key={c.hex}
                    onClick={() => !colorsDisabled && selectColor(c.hex)}
                    disabled={colorsDisabled}
                    title={c.name}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                        color === c.hex && !colorsDisabled
                            ? "border-neutral-900 planners-dark:border-white scale-110"
                            : "border-white planners-dark:border-[#1c1c1c] hover:scale-105"
                    } ${colorsDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                    style={{ backgroundColor: c.hex }}
                />
            ))}

            <Divider />

            {SHAPES.map(s => (
                <ToolButton
                    key={s.kind}
                    title={s.label}
                    active={active.mode === "shape" && active.shape === s.kind}
                    onClick={() => selectShape(s.kind)}
                >
                    {s.icon}
                </ToolButton>
            ))}

            <ToolButton title="텍스트 (T)" active={active.mode === "text"} onClick={selectText}>
                <Type className="h-4 w-4" />
            </ToolButton>

            <Divider />

            <ToolButton title="지우개 (E)" active={active.mode === "eraser"} onClick={() => selectTool("eraser")} activeColor="rose">
                <Eraser className="h-4 w-4" />
            </ToolButton>

            <Divider />

            <ToolButton title="실행 취소 (Ctrl+Z)" onClick={undo}>
                <Undo2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton title="다시 실행 (Ctrl+Shift+Z)" onClick={redo}>
                <Redo2 className="h-4 w-4" />
            </ToolButton>
        </div>
    );
}

// ─── 보조 컴포넌트 ───────────────────────────────────────────────────────────

function ToolButton({
    children, onClick, title, active, activeColor = "teal",
}: {
    children: React.ReactNode;
    onClick: () => void;
    title: string;
    active?: boolean;
    activeColor?: "teal" | "rose";
}) {
    const activeCls = activeColor === "rose" ? "bg-rose-500 text-white" : "bg-[#0F766E] text-white";
    return (
        <button
            onClick={onClick}
            title={title}
            className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                active ? activeCls : "text-neutral-500 planners-dark:text-neutral-300 hover:bg-neutral-100 planners-dark:hover:bg-[#2a2a2a]"
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-neutral-200 planners-dark:bg-[#2a2a2a] shrink-0 mx-0.5" />;
}
