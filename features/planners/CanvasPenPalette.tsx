"use client";

// 캔버스 펜 팔레트 — Excalidraw freedraw 도구의 속성 프리셋 5종 + 색상 7종.
// Excalidraw 기본 도구가 1종(freedraw)뿐이라 펜 종류가 부족한 문제 해결.

import { useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Pen, Pencil, Highlighter, Eraser, MousePointer2 } from "lucide-react";

interface PenPreset {
    key: string;
    label: string;
    icon: React.ReactNode;
    /** Excalidraw appState 프리셋 */
    width: number;        // 1~6
    roughness: number;    // 0(매끈) | 1(보통) | 2(거침)
    opacity: number;      // 0~100
    style: "solid" | "dashed" | "dotted";
    /** 형광펜처럼 색상 강제 시에만 지정 */
    fixedColor?: string;
    /** 형광펜은 elements에 color-blend 효과를 위해 살짝 다른 fillStyle도 적용 가능 */
}

const PEN_PRESETS: PenPreset[] = [
    {
        key: "pen",
        label: "펜",
        icon: <Pen className="h-4 w-4" />,
        width: 2,
        roughness: 1,
        opacity: 100,
        style: "solid",
    },
    {
        key: "pencil",
        label: "연필",
        icon: <Pencil className="h-4 w-4" />,
        width: 1.5,
        roughness: 2,
        opacity: 80,
        style: "solid",
    },
    {
        key: "fountain",
        label: "만년필",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21l3-3" />
                <path d="M5.5 18.5l11-11" />
                <path d="M16 5l3 3" />
                <path d="M14.5 6.5L18 10" />
                <path d="M18 3l3 3l-3 3" />
            </svg>
        ),
        width: 3,
        roughness: 0,
        opacity: 100,
        style: "solid",
    },
    {
        key: "marker",
        label: "마커",
        icon: (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l-6 6v3h3l6-6" />
                <path d="M22 3l-7 7l-3-3l7-7l3 3z" />
            </svg>
        ),
        width: 5,
        roughness: 0,
        opacity: 100,
        style: "solid",
    },
    {
        key: "highlighter",
        label: "형광펜",
        icon: <Highlighter className="h-4 w-4" />,
        width: 12,
        roughness: 0,
        opacity: 35,
        style: "solid",
        fixedColor: "#fde047", // amber-300
    },
];

const COLORS = [
    { hex: "#171717", name: "검정" },
    { hex: "#525252", name: "진회색" },
    { hex: "#dc2626", name: "빨강" },
    { hex: "#ea580c", name: "주황" },
    { hex: "#16a34a", name: "녹색" },
    { hex: "#0F766E", name: "청록" },  // brand accent
    { hex: "#7c3aed", name: "보라" },
];

interface Props {
    apiRef: React.RefObject<ExcalidrawImperativeAPI | null>;
}

export function CanvasPenPalette({ apiRef }: Props) {
    const [activePen, setActivePen] = useState<string>("pen");
    const [activeColor, setActiveColor] = useState<string>(COLORS[0].hex);
    const [activeTool, setActiveTool] = useState<"freedraw" | "eraser" | "selection">("selection");

    function applyPen(preset: PenPreset) {
        const api = apiRef.current;
        if (!api) return;
        setActivePen(preset.key);
        setActiveTool("freedraw");
        api.setActiveTool({ type: "freedraw" });
        const color = preset.fixedColor ?? activeColor;
        api.updateScene({
            appState: {
                currentItemStrokeColor: color,
                currentItemStrokeWidth: preset.width,
                currentItemRoughness: preset.roughness,
                currentItemOpacity: preset.opacity,
                currentItemStrokeStyle: preset.style,
            },
        });
    }

    function applyColor(hex: string) {
        const api = apiRef.current;
        if (!api) return;
        setActiveColor(hex);
        // 현재 펜 프리셋이 fixedColor가 없을 때만 색상 반영
        const preset = PEN_PRESETS.find(p => p.key === activePen);
        if (preset && !preset.fixedColor) {
            api.updateScene({ appState: { currentItemStrokeColor: hex } });
        }
    }

    function selectTool(tool: "selection" | "eraser") {
        const api = apiRef.current;
        if (!api) return;
        setActiveTool(tool);
        api.setActiveTool({ type: tool });
    }

    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-1.5 bg-white/95 backdrop-blur border border-neutral-200 rounded-full shadow-md max-w-[calc(100vw-16px)] overflow-x-auto">
            {/* 선택 도구 */}
            <button
                onClick={() => selectTool("selection")}
                title="선택 / 이동"
                className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    activeTool === "selection"
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-500 hover:bg-neutral-100"
                }`}
            >
                <MousePointer2 className="h-4 w-4" />
            </button>

            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-0.5" />

            {/* 펜 프리셋 5종 */}
            {PEN_PRESETS.map(preset => (
                <button
                    key={preset.key}
                    onClick={() => applyPen(preset)}
                    title={preset.label}
                    className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        activeTool === "freedraw" && activePen === preset.key
                            ? "bg-[#0F766E] text-white"
                            : "text-neutral-500 hover:bg-neutral-100"
                    }`}
                >
                    {preset.icon}
                </button>
            ))}

            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-0.5" />

            {/* 색상 7종 — 형광펜 활성 시 비활성화 (고정 색상) */}
            {(() => {
                const currentPreset = PEN_PRESETS.find(p => p.key === activePen);
                const colorsDisabled = activeTool !== "freedraw" || !!currentPreset?.fixedColor;
                return COLORS.map(c => (
                    <button
                        key={c.hex}
                        onClick={() => !colorsDisabled && applyColor(c.hex)}
                        disabled={colorsDisabled}
                        title={c.name}
                        className={`shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                            activeColor === c.hex && !colorsDisabled
                                ? "border-neutral-900 scale-110"
                                : "border-white hover:scale-105"
                        } ${colorsDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                        style={{ backgroundColor: c.hex }}
                    />
                ));
            })()}

            <div className="w-px h-5 bg-neutral-200 shrink-0 mx-0.5" />

            {/* 지우개 */}
            <button
                onClick={() => selectTool("eraser")}
                title="지우개"
                className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    activeTool === "eraser"
                        ? "bg-rose-500 text-white"
                        : "text-neutral-500 hover:bg-neutral-100"
                }`}
            >
                <Eraser className="h-4 w-4" />
            </button>
        </div>
    );
}
