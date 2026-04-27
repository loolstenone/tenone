"use client";

// 손글씨 캔버스 — perfect-freehand 기반.
// - Apple Pencil / S Pen 의 압력·기울기 자동 반영
// - 스타일러스 지우개 버튼 자동 감지 (eraser-mode 임시 전환)
// - 팜 리젝션(Pen Only) 모드: 손가락은 페이지 스크롤만, 펜만 그림
// - 펜 타입 4종: 펜 / 만년필 / 마커 / 형광펜
// - 캔버스 자동 확장: 하단 80% 진입 시 높이 +200px
//
// 저장 포맷:
//   { strokes: Stroke[], width: number, height: number }
//   Stroke = { points: [x, y, pressure][], color: string, size: number, penType?: PenType }

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { getStroke } from "perfect-freehand";
import { Eraser, Undo2, RotateCcw, Pencil, Hand } from "lucide-react";

export type PenType = "pen" | "fountain" | "marker" | "highlighter";

export interface HandStroke {
    points: number[][];          // [x, y, pressure]
    color: string;
    size: number;
    penType?: PenType;
}
export interface HandNoteData {
    strokes: HandStroke[];
    width: number;
    height: number;
}

interface Props {
    value: HandNoteData | null;
    onChange: (next: HandNoteData) => void;
    height?: number;
    className?: string;
    placeholder?: string;
    minHeight?: number;
}

interface PenPreset {
    label: string;
    thinning: number;
    smoothing: number;
    streamline: number;
    baseSize: number;
    opacity: number;
    simulatePressure: boolean;
}

const PEN_PRESETS: Record<PenType, PenPreset> = {
    pen:         { label: "펜",     thinning: 0.5, smoothing: 0.6, streamline: 0.5, baseSize: 2.5, opacity: 1,    simulatePressure: true },
    fountain:    { label: "만년필", thinning: 0.8, smoothing: 0.7, streamline: 0.7, baseSize: 3.0, opacity: 1,    simulatePressure: true },
    marker:      { label: "마커",   thinning: 0.1, smoothing: 0.5, streamline: 0.4, baseSize: 5.0, opacity: 1,    simulatePressure: false },
    highlighter: { label: "형광",   thinning: 0.0, smoothing: 0.4, streamline: 0.3, baseSize: 10,  opacity: 0.32, simulatePressure: false },
};

const COLORS = [
    { key: "ink",    color: "#0F172A" },
    { key: "blue",   color: "#1E40AF" },
    { key: "red",    color: "#9F1239" },
    { key: "green",  color: "#166534" },
    { key: "yellow", color: "#B45309" },
];

/** SVG path d= 문자열 생성 */
function strokeToPath(points: number[][], size: number, penType: PenType = "pen"): string {
    const preset = PEN_PRESETS[penType];
    const stroke = getStroke(points, {
        size,
        thinning: preset.thinning,
        smoothing: preset.smoothing,
        streamline: preset.streamline,
        easing: (t: number) => t,
        simulatePressure: preset.simulatePressure,
    });
    if (!stroke.length) return "";
    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"] as (string | number)[],
    );
    d.push("Z");
    return d.join(" ");
}

/** 두 선분이 가까운지(eraser hit) 판정 */
function strokeNearPoint(stroke: HandStroke, x: number, y: number, threshold: number): boolean {
    for (const [px, py] of stroke.points) {
        const dx = px - x;
        const dy = py - y;
        if (dx * dx + dy * dy <= threshold * threshold) return true;
    }
    return false;
}

export function HandNote({
    value,
    onChange,
    height: initialHeight = 240,
    className = "",
    placeholder = "Apple Pencil · S Pen 또는 마우스로 직접 쓰세요",
    minHeight,
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [width, setWidth] = useState(0);
    const [drawing, setDrawing] = useState<number[][] | null>(null);
    const [penType, setPenType] = useState<PenType>("pen");
    const [color, setColor] = useState(value?.strokes?.[value.strokes.length - 1]?.color ?? COLORS[0].color);
    const [size, setSize] = useState(value?.strokes?.[value.strokes.length - 1]?.size ?? PEN_PRESETS.pen.baseSize);
    const [eraserMode, setEraserMode] = useState(false);
    const [stylusEraser, setStylusEraser] = useState(false); // 스타일러스 지우개 버튼 누른 동안만 true
    const [penOnly, setPenOnly] = useState(false);
    const [autoHeight, setAutoHeight] = useState(value?.height ?? initialHeight);

    const effectiveErase = eraserMode || stylusEraser;
    const height = Math.max(autoHeight, value?.height ?? initialHeight);

    // 컨테이너 width 추적 (반응형 SVG)
    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const ro = new ResizeObserver(entries => {
            for (const e of entries) setWidth(e.contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    /** 스트로크가 새로 들어왔을 때 캔버스 높이 자동 확장 */
    function maybeExpand(yMax: number) {
        if (yMax > autoHeight - 40) {
            setAutoHeight(autoHeight + 240);
        }
    }

    function eraseAt(x: number, y: number) {
        const strokes = value?.strokes ?? [];
        const radius = size + 6;
        const next = strokes.filter(s => !strokeNearPoint(s, x, y, radius));
        if (next.length !== strokes.length) {
            onChange({ strokes: next, width: width || (value?.width ?? 600), height });
        }
    }

    function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
        // 팜 리젝션: pen 모드 ON이면 pen 만 허용
        if (penOnly && e.pointerType !== "pen") return;
        // 마우스는 좌클릭만, 펜·터치는 그대로 통과
        if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 5) return;

        // 스타일러스 지우개 버튼 자동 감지 (Wacom·Apple Pencil 일부·Surface Pen)
        // - button === 5 또는 buttons & 32 (eraser)
        const isEraserButton =
            e.pointerType === "pen" && (e.button === 5 || (e.buttons & 32) === 32);
        setStylusEraser(isEraserButton);

        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (eraserMode || isEraserButton) {
            eraseAt(x, y);
        } else {
            setDrawing([[x, y, e.pressure || 0.5]]);
        }
        e.preventDefault();
    }

    function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
        if (penOnly && e.pointerType !== "pen") return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (eraserMode || stylusEraser) {
            // 드래그 중에도 지우기 (e.buttons & 1 = 좌클릭/펜 누름 / & 32 = eraser)
            if (e.buttons > 0) eraseAt(x, y);
            return;
        }

        if (!drawing) return;
        setDrawing([...drawing, [x, y, e.pressure || 0.5]]);
        e.preventDefault();
    }

    function onPointerUp() {
        setStylusEraser(false);
        if (!drawing || drawing.length < 2) {
            setDrawing(null);
            return;
        }
        const newStroke: HandStroke = { points: drawing, color, size, penType };
        const yMax = drawing.reduce((m, [, y]) => Math.max(m, y), 0);
        maybeExpand(yMax);
        const next: HandNoteData = {
            strokes: [...(value?.strokes ?? []), newStroke],
            width: width || (value?.width ?? 600),
            height: Math.max(height, yMax + 40),
        };
        onChange(next);
        setDrawing(null);
    }

    function undo() {
        if (!value?.strokes?.length) return;
        const next = { ...value, strokes: value.strokes.slice(0, -1) };
        onChange(next);
    }
    function clearAll() {
        if (!value?.strokes?.length) return;
        if (!confirm("이 손글씨를 모두 지울까요?")) return;
        onChange({ strokes: [], width: width || 600, height: initialHeight });
        setAutoHeight(initialHeight);
    }

    function selectPen(t: PenType) {
        setPenType(t);
        setSize(PEN_PRESETS[t].baseSize);
        setEraserMode(false);
    }

    const strokes = value?.strokes ?? [];
    const isEmpty = strokes.length === 0 && !drawing;

    // 팜 리젝션 시 손가락 스크롤 허용 (touchAction: pan-y)
    const touchAction = penOnly ? "pan-y" : "none";

    return (
        <div
            ref={containerRef}
            className={`relative bg-white border border-slate-200 rounded-lg overflow-hidden ${className}`}
        >
            {/* Toolbar — 모바일에서도 가로 스크롤로 모든 도구 접근 가능 */}
            <div
                className="flex items-center gap-2 px-2 py-1.5 border-b border-slate-100 bg-slate-50/60 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
            >
                {/* Pen type selector */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {(Object.keys(PEN_PRESETS) as PenType[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => selectPen(t)}
                            type="button"
                            className={`px-1.5 h-5 text-[10px] rounded transition-colors whitespace-nowrap ${
                                penType === t && !effectiveErase
                                    ? "bg-slate-900 text-white"
                                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                            }`}
                            title={`${PEN_PRESETS[t].label} 도구`}
                        >
                            {PEN_PRESETS[t].label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-3 bg-slate-200 shrink-0" />

                {/* Colors */}
                <div className="flex items-center gap-1 shrink-0">
                    {COLORS.map(c => (
                        <button
                            key={c.key}
                            onClick={() => { setColor(c.color); setEraserMode(false); }}
                            type="button"
                            className={`w-4 h-4 rounded-full border-2 transition-all ${color === c.color && !effectiveErase ? "ring-2 ring-offset-1 ring-slate-400 scale-110 border-white" : "border-white"}`}
                            style={{ backgroundColor: c.color }}
                            title={c.key}
                        />
                    ))}
                </div>

                <div className="w-px h-3 bg-slate-200 shrink-0" />

                {/* Size dot — clickable to cycle */}
                <button
                    type="button"
                    onClick={() => {
                        const presets = [PEN_PRESETS[penType].baseSize * 0.6, PEN_PRESETS[penType].baseSize, PEN_PRESETS[penType].baseSize * 1.6];
                        const idx = presets.findIndex(p => Math.abs(p - size) < 0.5);
                        setSize(presets[(idx + 1) % presets.length]);
                    }}
                    className="px-1.5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 hover:bg-slate-100 shrink-0"
                    title="두께 변경"
                >
                    <span className="rounded-full bg-slate-700" style={{ width: Math.min(size * 1.4, 10), height: Math.min(size * 1.4, 10) }} />
                </button>

                <div className="ml-auto flex items-center gap-1 shrink-0">
                    {/* Pen-only (palm rejection) */}
                    <button
                        onClick={() => setPenOnly(p => !p)}
                        type="button"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${penOnly ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:bg-slate-100"}`}
                        title={penOnly ? "Pen Only ON · 손은 스크롤" : "Pen Only OFF · 손가락 그리기 허용"}
                    >
                        <Hand className="h-3.5 w-3.5" />
                    </button>
                    {/* Eraser mode */}
                    <button
                        onClick={() => setEraserMode(m => !m)}
                        type="button"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${effectiveErase ? "bg-rose-100 text-rose-700" : "text-slate-400 hover:bg-slate-100"}`}
                        title={effectiveErase ? "지우개 ON" : "지우개 모드"}
                    >
                        <Eraser className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={undo}
                        disabled={strokes.length === 0}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="실행 취소"
                    >
                        <Undo2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={clearAll}
                        disabled={strokes.length === 0}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="전체 지우고 새로 시작"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="relative" style={{ height, minHeight }}>
                <svg
                    ref={svgRef}
                    width="100%"
                    height={height}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    style={{
                        touchAction,
                        cursor: effectiveErase ? "cell" : "crosshair",
                        background: "repeating-linear-gradient(transparent 0 31px, rgba(15,23,42,0.04) 31px 32px)",
                    }}
                >
                    {strokes.map((s, i) => {
                        const preset = PEN_PRESETS[s.penType ?? "pen"];
                        return (
                            <path
                                key={i}
                                d={strokeToPath(s.points, s.size, s.penType ?? "pen")}
                                fill={s.color}
                                opacity={preset.opacity}
                            />
                        );
                    })}
                    {drawing && drawing.length > 1 && (
                        <path
                            d={strokeToPath(drawing, size, penType)}
                            fill={color}
                            opacity={(PEN_PRESETS[penType].opacity) * 0.85}
                        />
                    )}
                </svg>
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center px-4">
                            <Pencil className="h-5 w-5 mx-auto text-slate-300 mb-1" />
                            <p className="text-xs text-slate-400 italic">{placeholder}</p>
                            <p className="text-[10px] text-slate-300 mt-1">손바닥 닿음 방지: 우측 ✋ 토글</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/**
 * 손글씨 데이터를 노트 content 안에 임베드/추출하는 마커 헬퍼.
 *
 *   <!-- planners:handwriting -->
 *   { "strokes": [...], "width": 600, "height": 240 }
 */
const HW_MARKER = "<!-- planners:handwriting -->";

export function isHandwritingContent(content: string | null | undefined): boolean {
    return !!content && content.startsWith(HW_MARKER);
}

export function parseHandwriting(content: string | null | undefined): HandNoteData | null {
    if (!content || !content.startsWith(HW_MARKER)) return null;
    const json = content.slice(HW_MARKER.length).trim();
    try {
        const parsed = JSON.parse(json);
        if (!parsed || !Array.isArray(parsed.strokes)) return null;
        return parsed as HandNoteData;
    } catch { return null; }
}

export function serializeHandwriting(data: HandNoteData): string {
    return `${HW_MARKER}\n${JSON.stringify(data)}`;
}
