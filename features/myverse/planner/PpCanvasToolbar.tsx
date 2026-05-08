"use client";

import { useEffect, useRef, useState } from "react";
import {
    Undo2, Redo2, Hand, Eraser, MousePointer2, Lasso,
    Pen, Pencil, PenTool, Paintbrush, Highlighter, Brush,
    Square, Circle, Diamond, ArrowRight, Minus,
    LayoutGrid, Type, ImagePlus, Download,
} from "lucide-react";
import type { BackgroundTemplate, PenKind, ToolMode } from "@/lib/canvas-engine";
import { BACKGROUND_TEMPLATES, getBackgroundLabel } from "@/lib/canvas-engine";

const QUICK_COLORS = [
    "#1e1e1e", "#ef4444", "#3b82f6", "#22c55e", "#eab308",
] as const;

type ShapeKind = "rect" | "ellipse" | "diamond" | "arrow" | "line";

const PEN_TOOLS: { pen: PenKind; icon: React.ElementType; label: string }[] = [
    { pen: "pen",         icon: Pen,          label: "펜" },
    { pen: "pencil",      icon: Pencil,       label: "연필" },
    { pen: "fountain",    icon: PenTool,      label: "만년필" },
    { pen: "marker",      icon: Paintbrush,   label: "마커" },
    { pen: "highlighter", icon: Highlighter,  label: "형광펜" },
    { pen: "brush",       icon: Brush,        label: "브러쉬" },
];

const SHAPE_TOOLS: { shape: ShapeKind; icon: React.ElementType; label: string }[] = [
    { shape: "rect",    icon: Square,     label: "사각형" },
    { shape: "ellipse", icon: Circle,     label: "원" },
    { shape: "diamond", icon: Diamond,    label: "다이아몬드" },
    { shape: "arrow",   icon: ArrowRight, label: "화살표" },
    { shape: "line",    icon: Minus,      label: "선" },
];

const SIZE_PRESETS = [4, 8, 12, 20, 32] as const;

export interface PpCanvasToolbarProps {
    tool: ToolMode;
    onToolChange: (t: ToolMode) => void;
    canUndo: boolean;
    onUndo: () => void;
    canRedo: boolean;
    onRedo: () => void;
    background: BackgroundTemplate;
    onBgChange: (bg: BackgroundTemplate) => void;
    onInsertImage?: () => void;
    onExport?: (format: "png" | "svg") => void;
}

export function PpCanvasToolbar({
    tool, onToolChange,
    canUndo, onUndo, canRedo, onRedo,
    background, onBgChange,
    onInsertImage, onExport,
}: PpCanvasToolbarProps) {
    const [color, setColor] = useState<string>(
        tool.mode === "stroke" ? tool.color
        : tool.mode === "shape" ? tool.color
        : "#1e1e1e"
    );
    const [size, setSize] = useState<number>(
        tool.mode === "stroke" ? tool.size : 8
    );
    const [activePen, setActivePen] = useState<PenKind>(
        tool.mode === "stroke" ? tool.pen : "pen"
    );
    const [activeShape, setActiveShape] = useState<ShapeKind>(
        tool.mode === "shape" ? (tool.shape as ShapeKind) : "rect"
    );
    const [bgOpen,     setBgOpen]     = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const bgRef     = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!bgOpen) return;
        const h = (e: MouseEvent) => {
            if (!bgRef.current?.contains(e.target as Node)) setBgOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [bgOpen]);

    useEffect(() => {
        if (!exportOpen) return;
        const h = (e: MouseEvent) => {
            if (!exportRef.current?.contains(e.target as Node)) setExportOpen(false);
        };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, [exportOpen]);

    function selectPen(pen: PenKind) {
        setActivePen(pen);
        onToolChange({ mode: "stroke", pen, color, size, opacity: 100 });
    }

    function selectShape(shape: ShapeKind) {
        setActiveShape(shape);
        onToolChange({ mode: "shape", shape, color });
    }

    function changeColor(c: string) {
        setColor(c);
        if (tool.mode === "stroke") {
            onToolChange({ mode: "stroke", pen: activePen, color: c, size, opacity: 100 });
        } else if (tool.mode === "shape") {
            onToolChange({ mode: "shape", shape: activeShape, color: c });
        }
    }

    function changeSize(s: number) {
        setSize(s);
        if (tool.mode === "stroke") {
            onToolChange({ mode: "stroke", pen: activePen, color, size: s, opacity: 100 });
        }
    }

    const isSelection = tool.mode === "selection";
    const isLasso  = tool.mode === "lasso";
    const isStroke = tool.mode === "stroke";
    const isShape  = tool.mode === "shape";
    const isText   = tool.mode === "text";

    const base   = "flex items-center justify-center w-8 h-8 rounded-lg transition-colors";
    const active  = "bg-[#6366F1] text-white";
    const idle    = "text-neutral-400 hover:text-white hover:bg-white/10";
    const divider = <div className="w-px h-6 bg-white/10 mx-1 shrink-0" />;

    return (
        <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900/95 backdrop-blur-sm border border-white/10 rounded-2xl px-3 py-2 shadow-2xl z-50 select-none overflow-x-auto max-w-[calc(100vw-2rem)]"
            onPointerDown={(e) => e.stopPropagation()}
        >
            {/* Undo / Redo */}
            <button
                onClick={onUndo}
                disabled={!canUndo}
                title="실행 취소 (Ctrl+Z)"
                className={`${base} ${canUndo ? idle : "text-neutral-700 cursor-not-allowed"}`}
            >
                <Undo2 className="h-4 w-4" />
            </button>
            <button
                onClick={onRedo}
                disabled={!canRedo}
                title="다시 실행 (Ctrl+Y)"
                className={`${base} ${canRedo ? idle : "text-neutral-700 cursor-not-allowed"}`}
            >
                <Redo2 className="h-4 w-4" />
            </button>

            {divider}

            {/* 선택 도구 */}
            <button
                onClick={() => onToolChange({ mode: "selection" })}
                title="선택 (V)"
                className={`${base} ${isSelection ? active : idle}`}
            >
                <MousePointer2 className="h-4 w-4" />
            </button>
            <button
                onClick={() => onToolChange({ mode: "lasso" })}
                title="올가미 선택"
                className={`${base} ${isLasso ? active : idle}`}
            >
                <Lasso className="h-4 w-4" />
            </button>

            {divider}

            {/* 펜 도구 6종 */}
            {PEN_TOOLS.map(({ pen, icon: Icon, label }) => (
                <button
                    key={pen}
                    onClick={() => selectPen(pen)}
                    title={label}
                    className={`${base} ${isStroke && activePen === pen ? active : idle}`}
                >
                    <Icon className="h-4 w-4" />
                </button>
            ))}

            {divider}

            {/* 도형 도구 5종 */}
            {SHAPE_TOOLS.map(({ shape, icon: Icon, label }) => (
                <button
                    key={shape}
                    onClick={() => selectShape(shape)}
                    title={label}
                    className={`${base} ${isShape && activeShape === shape ? active : idle}`}
                >
                    <Icon className="h-4 w-4" />
                </button>
            ))}

            {divider}

            {/* 텍스트 도구 */}
            <button
                onClick={() => onToolChange({ mode: "text" })}
                title="텍스트 (T)"
                className={`${base} ${isText ? active : idle}`}
            >
                <Type className="h-4 w-4" />
            </button>

            {divider}

            {/* 이미지 삽입 */}
            {onInsertImage && (
                <button
                    onClick={onInsertImage}
                    title="이미지 삽입"
                    className={`${base} ${idle}`}
                >
                    <ImagePlus className="h-4 w-4" />
                </button>
            )}

            {divider}

            {/* 지우개 + 이동 */}
            <button
                onClick={() => onToolChange({ mode: "eraser" })}
                title="지우개"
                className={`${base} ${tool.mode === "eraser" ? active : idle}`}
            >
                <Eraser className="h-4 w-4" />
            </button>
            <button
                onClick={() => onToolChange({ mode: "pan" })}
                title="이동 (스페이스바)"
                className={`${base} ${tool.mode === "pan" ? active : idle}`}
            >
                <Hand className="h-4 w-4" />
            </button>

            {divider}

            {/* 색상 팔레트 */}
            <div className="flex items-center gap-1">
                {QUICK_COLORS.map((c) => (
                    <button
                        key={c}
                        onClick={() => changeColor(c)}
                        title={c}
                        className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
                        style={{
                            backgroundColor: c,
                            borderColor: color === c ? "white" : "transparent",
                        }}
                    />
                ))}
                {/* 커스텀 컬러 피커 */}
                <label
                    title="커스텀 색상"
                    className="relative w-5 h-5 rounded-full border-2 border-dashed border-neutral-500 hover:border-white cursor-pointer flex items-center justify-center shrink-0 overflow-hidden transition-colors"
                    style={{ borderColor: !QUICK_COLORS.includes(color as typeof QUICK_COLORS[number]) ? "white" : undefined }}
                >
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => changeColor(e.target.value)}
                        className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <span className="text-[8px] leading-none text-neutral-400 select-none pointer-events-none">+</span>
                </label>
            </div>

            {/* 크기 프리셋 (펜 모드에서만) */}
            {isStroke && (
                <>
                    {divider}
                    <div className="flex items-center gap-1">
                        {SIZE_PRESETS.map((s) => (
                            <button
                                key={s}
                                onClick={() => changeSize(s)}
                                title={`크기 ${s}`}
                                className={`${base} ${size === s ? active : idle}`}
                            >
                                <span
                                    className="rounded-full bg-current block"
                                    style={{
                                        width:  Math.min(s / 2, 12),
                                        height: Math.min(s / 2, 12),
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}

            {divider}

            {/* 배경 선택 드롭다운 */}
            <div ref={bgRef} className="relative">
                <button
                    onClick={() => setBgOpen((p) => !p)}
                    title="배경"
                    className={`${base} ${bgOpen ? active : idle}`}
                >
                    <LayoutGrid className="h-4 w-4" />
                </button>
                {bgOpen && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-800 border border-white/10 rounded-xl shadow-xl py-1 min-w-[100px] z-10">
                        {BACKGROUND_TEMPLATES.map((t) => (
                            <button
                                key={t}
                                onClick={() => { onBgChange(t); setBgOpen(false); }}
                                className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-white/5 ${
                                    t === background
                                        ? "text-[#6366F1] font-semibold"
                                        : "text-neutral-300"
                                }`}
                            >
                                {getBackgroundLabel(t)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {/* 내보내기 */}
            {onExport && (
                <>
                    {divider}
                    <div ref={exportRef} className="relative">
                        <button
                            onClick={() => setExportOpen((p) => !p)}
                            title="내보내기"
                            className={`${base} ${exportOpen ? active : idle}`}
                        >
                            <Download className="h-4 w-4" />
                        </button>
                        {exportOpen && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-neutral-800 border border-white/10 rounded-xl shadow-xl py-1 min-w-[100px] z-10">
                                <button
                                    onClick={() => { onExport("png"); setExportOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5 transition-colors"
                                >
                                    PNG 다운로드
                                </button>
                                <button
                                    onClick={() => { onExport("svg"); setExportOpen(false); }}
                                    className="w-full text-left px-3 py-1.5 text-xs text-neutral-300 hover:bg-white/5 transition-colors"
                                >
                                    SVG 다운로드
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
