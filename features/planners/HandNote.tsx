"use client";

// 손글씨 캔버스 — perfect-freehand 기반.
// - Apple Pencil / S Pen 의 압력·기울기 자동 반영
// - SVG path 로 저장 (벡터, 무손실 확대) — JSON 직렬화 가능
// - 입력 → 부드러운 곡선 변환은 perfect-freehand 가 처리
// - undo / clear 만 제공 (단순함이 본질)
//
// 저장 포맷:
//   { strokes: Stroke[], width: number, height: number }
//   Stroke = { points: [x, y, pressure][], color: string, size: number }
//
// 외부 사용:
//   <HandNote value={data} onChange={setData} height={200} />
//   data: HandNoteData | null

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { getStroke } from "perfect-freehand";
import { Eraser, Undo2, Trash2, Pencil } from "lucide-react";

export interface HandStroke {
    points: number[][];          // [x, y, pressure]
    color: string;
    size: number;
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

const DEFAULT_OPTIONS = {
    size: 2.5,
    thinning: 0.6,
    smoothing: 0.6,
    streamline: 0.5,
    easing: (t: number) => t,
    simulatePressure: true,
};

const COLORS = [
    { key: "ink",    color: "#0F172A" },  // slate-900 (기본 잉크)
    { key: "blue",   color: "#1E40AF" },
    { key: "red",    color: "#9F1239" },
    { key: "green",  color: "#166534" },
    { key: "yellow", color: "#B45309" },
];
const SIZES = [
    { key: "thin",   size: 1.6 },
    { key: "medium", size: 2.5 },
    { key: "thick",  size: 4.0 },
];

/** SVG path d= 문자열 생성 */
function strokeToPath(points: number[][], size: number): string {
    const stroke = getStroke(points, { ...DEFAULT_OPTIONS, size });
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

export function HandNote({
    value,
    onChange,
    height = 240,
    className = "",
    placeholder = "✏️ Apple Pencil · S Pen 또는 마우스로 직접 쓰세요",
    minHeight,
}: Props) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(0);
    const [drawing, setDrawing] = useState<number[][] | null>(null);
    const [color, setColor] = useState(value?.strokes?.[value.strokes.length - 1]?.color ?? COLORS[0].color);
    const [size, setSize] = useState(value?.strokes?.[value.strokes.length - 1]?.size ?? DEFAULT_OPTIONS.size);

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

    function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
        if (e.button !== 0 && e.pointerType !== "pen" && e.pointerType !== "touch") return;
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);
        const rect = target.getBoundingClientRect();
        setDrawing([[e.clientX - rect.left, e.clientY - rect.top, e.pressure || 0.5]]);
        e.preventDefault();
    }
    function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
        if (!drawing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setDrawing([...drawing, [e.clientX - rect.left, e.clientY - rect.top, e.pressure || 0.5]]);
        e.preventDefault();
    }
    function onPointerUp() {
        if (!drawing || drawing.length < 2) {
            setDrawing(null);
            return;
        }
        const newStroke: HandStroke = { points: drawing, color, size };
        const next: HandNoteData = {
            strokes: [...(value?.strokes ?? []), newStroke],
            width: width || (value?.width ?? 600),
            height,
        };
        onChange(next);
        setDrawing(null);
    }

    function undo() {
        if (!value?.strokes?.length) return;
        const next = { ...value, strokes: value.strokes.slice(0, -1) };
        onChange(next);
    }
    function clear() {
        if (!value?.strokes?.length) return;
        if (!confirm("이 손글씨를 모두 지울까요?")) return;
        onChange({ strokes: [], width: width || 600, height });
    }

    const strokes = value?.strokes ?? [];
    const isEmpty = strokes.length === 0 && !drawing;

    return (
        <div
            ref={containerRef}
            className={`relative bg-white border border-slate-200 rounded-lg overflow-hidden ${className}`}
        >
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-2 py-1.5 border-b border-slate-100 bg-slate-50/60">
                <Pencil className="h-3 w-3 text-slate-400 shrink-0" />
                {/* Colors */}
                <div className="flex items-center gap-1">
                    {COLORS.map(c => (
                        <button
                            key={c.key}
                            onClick={() => setColor(c.color)}
                            type="button"
                            className={`w-4 h-4 rounded-full border-2 transition-all ${color === c.color ? "ring-2 ring-offset-1 ring-slate-400 scale-110 border-white" : "border-white"}`}
                            style={{ backgroundColor: c.color }}
                            title={c.key}
                        />
                    ))}
                </div>
                <div className="w-px h-3 bg-slate-200" />
                {/* Sizes */}
                <div className="flex items-center gap-1">
                    {SIZES.map(s => (
                        <button
                            key={s.key}
                            onClick={() => setSize(s.size)}
                            type="button"
                            className={`px-1.5 h-5 flex items-center justify-center rounded transition-colors ${size === s.size ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"}`}
                            title={`두께 ${s.key}`}
                        >
                            <span className="rounded-full bg-current" style={{ width: s.size * 1.4, height: s.size * 1.4 }} />
                        </button>
                    ))}
                </div>
                <div className="ml-auto flex items-center gap-1">
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
                        onClick={clear}
                        disabled={strokes.length === 0}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="모두 지우기"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="relative" style={{ height, minHeight }}>
                <svg
                    width="100%"
                    height={height}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    style={{ touchAction: "none", cursor: "crosshair", background: "repeating-linear-gradient(transparent 0 31px, rgba(15,23,42,0.04) 31px 32px)" }}
                >
                    {strokes.map((s, i) => (
                        <path key={i} d={strokeToPath(s.points, s.size)} fill={s.color} />
                    ))}
                    {drawing && drawing.length > 1 && (
                        <path d={strokeToPath(drawing, size)} fill={color} opacity={0.85} />
                    )}
                </svg>
                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <Eraser className="h-5 w-5 mx-auto text-slate-300 mb-1" />
                            <p className="text-xs text-slate-400 italic">{placeholder}</p>
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
