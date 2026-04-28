"use client";

// 손글씨 캔버스 — perfect-freehand 기반 v2.
//
// v2 변경사항 (Canvas 고도화):
//   - Undo/Redo 스택 50단계 (Ctrl+Z / Ctrl+Shift+Z)
//   - 브러시 6종: 펜·만년필·마커·형광펜·연필·붓
//   - 색상 팔레트 20색 + 최근 사용 8색 + HEX 직접 입력
//   - 두께 연속 슬라이더 (1–32px)
//   - 손 떨림 보정(Stabilizer) 슬라이더 (streamline 0–95%)
//   - 연필 터치 노이즈 (포인트 레벨 미세 지터)
//   - 스타일러스 지우개 버튼 자동 감지 / 팜 리젝션 유지
//   - 캔버스 자동 확장 유지
//
// 저장 포맷 (호환):
//   { strokes: HandStroke[], width: number, height: number }
//   HandStroke = { points, color, size, penType?, streamline? }

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";
import { getStroke } from "perfect-freehand";
import { Eraser, Undo2, Redo2, RotateCcw, Pencil, SlidersHorizontal } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PenType = "pen" | "fountain" | "marker" | "highlighter" | "pencil" | "brush";

export interface HandStroke {
    points: number[][];
    color: string;
    size: number;
    penType?: PenType;
    streamline?: number;
}

export interface HandNoteData {
    strokes: HandStroke[];
    width: number;
    height: number;
}

interface HandNoteProps {
    value: HandNoteData | null;
    onChange: (next: HandNoteData) => void;
    height?: number;
    className?: string;
    placeholder?: string;
    minHeight?: number;
}

// ─── Pen Presets ──────────────────────────────────────────────────────────────

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
    pen:         { label: "펜",    thinning: 0.50, smoothing: 0.60, streamline: 0.50, baseSize: 2.5, opacity: 1.00, simulatePressure: true  },
    fountain:    { label: "만년필", thinning: 0.80, smoothing: 0.70, streamline: 0.70, baseSize: 3.0, opacity: 1.00, simulatePressure: true  },
    marker:      { label: "마커",  thinning: 0.10, smoothing: 0.50, streamline: 0.40, baseSize: 5.0, opacity: 1.00, simulatePressure: false },
    highlighter: { label: "형광",  thinning: 0.00, smoothing: 0.40, streamline: 0.30, baseSize: 12,  opacity: 0.32, simulatePressure: false },
    pencil:      { label: "연필",  thinning: 0.35, smoothing: 0.25, streamline: 0.15, baseSize: 2.5, opacity: 0.72, simulatePressure: true  },
    brush:       { label: "붓",   thinning: 0.92, smoothing: 0.70, streamline: 0.60, baseSize: 8.0, opacity: 0.90, simulatePressure: true  },
};

// ─── Colour Palette ───────────────────────────────────────────────────────────

// 20색 큐레이션 (플래너 친화적 — 채도 낮고 읽기 좋은 세트)
const PALETTE: string[] = [
    "#0F172A", "#374151", "#6B7280", "#D1D5DB", "#FFFFFF",
    "#1E3A8A", "#1E40AF", "#3B82F6", "#93C5FD", "#BFDBFE",
    "#9F1239", "#DC2626", "#F97316", "#EAB308", "#B45309",
    "#166534", "#16A34A", "#0F766E", "#0E7490", "#7C3AED",
];

// 퀵 선택 기본 5색
const QUICK_COLORS = ["#0F172A", "#1E40AF", "#9F1239", "#166534", "#B45309"];

const RECENT_KEY = "planners-recent-colors";
const MAX_RECENT = 8;
const MAX_UNDO   = 50;

function loadRecent(): string[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}

function persistRecent(color: string) {
    const arr = loadRecent().filter(c => c !== color);
    arr.unshift(color);
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0, MAX_RECENT)));
}

// ─── SVG Utils ────────────────────────────────────────────────────────────────

function strokeToPath(
    points: number[][],
    size: number,
    penType: PenType = "pen",
    streamlineOverride?: number,
): string {
    const p = PEN_PRESETS[penType];
    const stroke = getStroke(points, {
        size,
        thinning:         p.thinning,
        smoothing:        p.smoothing,
        streamline:       streamlineOverride ?? p.streamline,
        easing:           (t) => t,
        simulatePressure: p.simulatePressure,
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

function nearStroke(s: HandStroke, x: number, y: number, r: number): boolean {
    for (const [px, py] of s.points)
        if ((px - x) ** 2 + (py - y) ** 2 <= r * r) return true;
    return false;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HandNote({
    value,
    onChange,
    height: initH = 240,
    className = "",
    placeholder = "Apple Pencil · S Pen 또는 마우스로 직접 쓰세요",
    minHeight,
}: HandNoteProps) {
    // DOM
    const containerRef    = useRef<HTMLDivElement>(null);
    const svgRef          = useRef<SVGSVGElement>(null);
    const paletteRef      = useRef<HTMLDivElement>(null);  // 팝오버 자체 (외부클릭 감지용)
    const paletteBtnRef   = useRef<HTMLButtonElement>(null); // 무지개 버튼 (위치 기준)
    const [palettePos, setPalettePos] = useState({ top: 0, left: 0 });

    // Undo / redo (ref → 렌더링 없이 스택 관리, forceUpdate로 버튼 disabled 갱신)
    const undoRef    = useRef<HandStroke[][]>([]);
    const redoRef    = useRef<HandStroke[][]>([]);
    const [stackVer, setStackVer] = useState(0);   // undo/redo disabled 갱신 트리거
    const bumpVer    = () => setStackVer(v => v + 1);

    // 포인터 다운 시 캡처 (undo 커밋용)
    const preActionRef = useRef<HandStroke[] | null>(null);

    // 드로잉 상태
    const [width,        setWidth]        = useState(0);
    const [drawing,      setDrawing]      = useState<number[][] | null>(null);
    const [penType,      setPenType]      = useState<PenType>("pen");
    const [color,        setColor]        = useState(QUICK_COLORS[0]);
    const [size,         setSize]         = useState(PEN_PRESETS.pen.baseSize);
    const [stabilizer,   setStabilizer]   = useState<number | undefined>(undefined);
    const [showStab,     setShowStab]     = useState(false);
    const [eraserMode,   setEraserMode]   = useState(false);
    const [stylusEraser, setStylusEraser] = useState(false);
    const [penOnly,      setPenOnly]      = useState(false);
    const [autoH,        setAutoH]        = useState(value?.height ?? initH);

    // 팔레트
    const [showPalette,  setShowPalette]  = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [hexInput,     setHexInput]     = useState("");

    const effectiveErase = eraserMode || stylusEraser;
    const height  = Math.max(autoH, value?.height ?? initH);
    const strokes = value?.strokes ?? [];

    // ── Init ──────────────────────────────────────────────────────────────────

    useEffect(() => setRecentColors(loadRecent()), []);

    // 글로벌 펜 전용 모드 동기화 (pp-pen-mode CustomEvent)
    useEffect(() => {
        // 초기값 반영
        setPenOnly(localStorage.getItem("pp-pen-mode") === "1");
        const handler = (e: Event) => {
            setPenOnly((e as CustomEvent<{ enabled: boolean }>).detail.enabled);
        };
        window.addEventListener("pp-pen-mode", handler);
        return () => window.removeEventListener("pp-pen-mode", handler);
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // 팔레트 외부 클릭 시 닫기 (팝오버 자체 + 열기 버튼은 제외)
    useEffect(() => {
        if (!showPalette) return;
        const handler = (e: MouseEvent) => {
            const inPopover = paletteRef.current?.contains(e.target as Node);
            const inBtn     = paletteBtnRef.current?.contains(e.target as Node);
            if (!inPopover && !inBtn) setShowPalette(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showPalette]);

    // ── Undo / Redo ───────────────────────────────────────────────────────────

    function commitUndo(before: HandStroke[]) {
        undoRef.current.push([...before]);
        if (undoRef.current.length > MAX_UNDO) undoRef.current.shift();
        redoRef.current = [];
        bumpVer();
    }

    const undo = useCallback(() => {
        if (!undoRef.current.length) return;
        const prev = undoRef.current.pop()!;
        redoRef.current.push([...(value?.strokes ?? [])]);
        onChange({ strokes: prev, width: width || (value?.width ?? 600), height });
        bumpVer();
    }, [value, onChange, width, height]);

    const redo = useCallback(() => {
        if (!redoRef.current.length) return;
        const next = redoRef.current.pop()!;
        undoRef.current.push([...(value?.strokes ?? [])]);
        onChange({ strokes: next, width: width || (value?.width ?? 600), height });
        bumpVer();
    }, [value, onChange, width, height]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!(e.metaKey || e.ctrlKey)) return;
            if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
            if (e.key === "z" && e.shiftKey)  { e.preventDefault(); redo(); }
            if (e.key === "y")                 { e.preventDefault(); redo(); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [undo, redo]);

    // ── Color ─────────────────────────────────────────────────────────────────

    function pickColor(c: string) {
        setColor(c);
        setEraserMode(false);
        persistRecent(c);
        setRecentColors(loadRecent());
        setShowPalette(false);
        setHexInput("");
    }

    // ── Canvas auto-expand ────────────────────────────────────────────────────

    function maybeExpand(yMax: number) {
        setAutoH(h => yMax > h - 40 ? h + 240 : h);
    }

    // ── Erase ─────────────────────────────────────────────────────────────────

    function eraseAt(x: number, y: number) {
        const cur = value?.strokes ?? [];
        const next = cur.filter(s => !nearStroke(s, x, y, size + 8));
        if (next.length !== cur.length)
            onChange({ strokes: next, width: width || (value?.width ?? 600), height });
    }

    // ── Pointer events ────────────────────────────────────────────────────────

    function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
        if (penOnly && e.pointerType !== "pen") return;
        if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 5) return;

        const isEraserBtn =
            e.pointerType === "pen" && (e.button === 5 || (e.buttons & 32) === 32);
        setStylusEraser(isEraserBtn);

        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 이번 제스처의 "이전 상태" 캡처 (undo 커밋용)
        preActionRef.current = [...(value?.strokes ?? [])];

        if (eraserMode || isEraserBtn) {
            eraseAt(x, y);
        } else {
            // 연필: 포인트 레벨 노이즈로 거친 질감
            const nx = penType === "pencil" ? x + (Math.random() - 0.5) * 1.2 : x;
            const ny = penType === "pencil" ? y + (Math.random() - 0.5) * 1.2 : y;
            setDrawing([[nx, ny, e.pressure || 0.5]]);
        }
        e.preventDefault();
    }

    function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
        if (penOnly && e.pointerType !== "pen") return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (eraserMode || stylusEraser) {
            if (e.buttons > 0) eraseAt(x, y);
            return;
        }
        if (!drawing) return;

        const nx = penType === "pencil" ? x + (Math.random() - 0.5) * 1.2 : x;
        const ny = penType === "pencil" ? y + (Math.random() - 0.5) * 1.2 : y;
        setDrawing(prev => prev ? [...prev, [nx, ny, e.pressure || 0.5]] : null);
        e.preventDefault();
    }

    function onPointerUp() {
        const wasErasing = effectiveErase;
        setStylusEraser(false);

        const pre = preActionRef.current;
        preActionRef.current = null;

        // 지우개 undo 커밋 (스트로크가 실제로 줄었을 때만)
        if (wasErasing && pre !== null) {
            const cur = value?.strokes ?? [];
            if (cur.length !== pre.length) {
                undoRef.current.push(pre);
                if (undoRef.current.length > MAX_UNDO) undoRef.current.shift();
                redoRef.current = [];
                bumpVer();
            }
        }

        if (!drawing || drawing.length < 2) {
            setDrawing(null);
            return;
        }

        const yMax = drawing.reduce((m, [, y]) => Math.max(m, y), 0);
        maybeExpand(yMax);

        // 드로잉 undo 커밋
        if (pre !== null) commitUndo(pre);

        const newStroke: HandStroke = { points: drawing, color, size, penType, streamline: stabilizer };
        onChange({
            strokes: [...strokes, newStroke],
            width:   width || (value?.width ?? 600),
            height:  Math.max(height, yMax + 40),
        });
        setDrawing(null);
    }

    // ── Pen selection ─────────────────────────────────────────────────────────

    function selectPen(t: PenType) {
        setPenType(t);
        setSize(PEN_PRESETS[t].baseSize);
        setEraserMode(false);
        setStabilizer(undefined);
    }

    // ── Clear all ─────────────────────────────────────────────────────────────

    function clearAll() {
        if (!strokes.length || !confirm("이 손글씨를 모두 지울까요?")) return;
        commitUndo(strokes);
        onChange({ strokes: [], width: width || 600, height: initH });
        setAutoH(initH);
    }

    // ── Derived ───────────────────────────────────────────────────────────────

    const isEmpty   = strokes.length === 0 && !drawing;
    const touchAct  = penOnly ? "pan-y" : "none";
    const canUndo   = undoRef.current.length > 0;
    const canRedo   = redoRef.current.length > 0;

    // 퀵 컬러 행: 최근 사용 우선, 최대 5개
    const quickRow = (() => {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const c of [...recentColors, ...QUICK_COLORS]) {
            if (!seen.has(c)) { seen.add(c); result.push(c); }
            if (result.length >= 5) break;
        }
        return result;
    })();

    // HEX 유효성
    function applyHex() {
        const v = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
        if (/^#[0-9A-Fa-f]{6}$/.test(v)) pickColor(v);
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div
            ref={containerRef}
            className={`relative bg-white border border-slate-200 rounded-lg overflow-hidden select-none ${className}`}
        >
            {/* ── Toolbar ── */}
            <div
                className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/60 overflow-x-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
            >
                {/* Pen types */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {(Object.keys(PEN_PRESETS) as PenType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => selectPen(t)}
                            type="button"
                            title={PEN_PRESETS[t].label}
                            className={`px-1.5 h-5 text-[10px] rounded transition-colors whitespace-nowrap ${
                                penType === t && !effectiveErase
                                    ? "bg-slate-900 text-white"
                                    : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                            }`}
                        >
                            {PEN_PRESETS[t].label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-3 bg-slate-200 shrink-0" />

                {/* 색상 퀵 스와치 + 팔레트 오프너 */}
                <div className="relative flex items-center gap-0.5 shrink-0">
                    {quickRow.map(c => (
                        <button
                            key={c}
                            onClick={() => pickColor(c)}
                            type="button"
                            title={c}
                            className={`rounded-full border-2 transition-all shrink-0 ${
                                color === c && !effectiveErase
                                    ? "ring-2 ring-offset-1 ring-slate-500 scale-110 border-white"
                                    : "border-white hover:scale-110"
                            }`}
                            style={{ backgroundColor: c, width: 14, height: 14 }}
                        />
                    ))}

                    {/* 전체 팔레트 열기 버튼 (무지개 그라디언트) */}
                    <button
                        ref={paletteBtnRef}
                        onClick={() => {
                            if (paletteBtnRef.current) {
                                const r = paletteBtnRef.current.getBoundingClientRect();
                                setPalettePos({ top: r.bottom + 6, left: r.left });
                            }
                            setShowPalette(p => !p);
                        }}
                        type="button"
                        title="색상 팔레트"
                        className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-slate-500 transition-all shrink-0"
                        style={{ background: "conic-gradient(#f87171, #fb923c, #facc15, #4ade80, #60a5fa, #a78bfa, #f87171)" }}
                    />

                    {/* 팔레트 팝오버 — fixed로 overflow-hidden 탈출 */}
                    {showPalette && (
                        <div
                            ref={paletteRef}
                            className="fixed z-[9999] bg-white border border-slate-200 rounded-xl shadow-2xl p-3 w-52"
                            style={{ top: palettePos.top, left: palettePos.left }}
                        >
                            {/* 현재 색상 */}
                            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-slate-100">
                                <div
                                    className="w-7 h-7 rounded-lg border border-slate-200 shadow-inner"
                                    style={{ backgroundColor: color }}
                                />
                                <span className="text-[11px] text-slate-500 font-mono">{color.toUpperCase()}</span>
                            </div>

                            {/* 20색 그리드 */}
                            <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                                {PALETTE.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => pickColor(c)}
                                        type="button"
                                        title={c}
                                        className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
                                            color === c ? "border-slate-600 scale-110" : "border-slate-100 hover:border-slate-300"
                                        } ${c === "#FFFFFF" ? "shadow-inner" : ""}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>

                            {/* 최근 사용 */}
                            {recentColors.length > 0 && (
                                <div className="mb-2.5 pt-2 border-t border-slate-100">
                                    <p className="text-[9px] text-slate-400 mb-1.5 uppercase tracking-wide">최근 사용</p>
                                    <div className="flex gap-1 flex-wrap">
                                        {recentColors.map((c, i) => (
                                            <button
                                                key={i}
                                                onClick={() => pickColor(c)}
                                                type="button"
                                                title={c}
                                                className={`w-5 h-5 rounded border-2 hover:scale-110 transition-all ${
                                                    color === c ? "border-slate-600" : "border-slate-100"
                                                }`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* HEX 직접 입력 */}
                            <div className="flex gap-1 pt-2 border-t border-slate-100">
                                <input
                                    type="text"
                                    value={hexInput}
                                    onChange={e => setHexInput(e.target.value)}
                                    placeholder="#RRGGBB"
                                    className="flex-1 text-[11px] px-2 py-1 border border-slate-200 rounded-lg font-mono outline-none focus:border-slate-400 bg-slate-50"
                                    onKeyDown={e => { if (e.key === "Enter") applyHex(); }}
                                />
                                <button
                                    type="button"
                                    onClick={applyHex}
                                    className="px-2 py-1 bg-slate-900 text-white text-[10px] rounded-lg hover:bg-slate-700 transition-colors"
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-3 bg-slate-200 shrink-0" />

                {/* 두께 슬라이더 */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* 현재 두께 미리보기 점 */}
                    <span
                        className="rounded-full shrink-0 transition-all"
                        style={{
                            backgroundColor: effectiveErase ? "#94a3b8" : color,
                            width:  Math.max(3, Math.min(size * 1.0, 14)),
                            height: Math.max(3, Math.min(size * 1.0, 14)),
                            display: "inline-block",
                        }}
                    />
                    <input
                        type="range"
                        min={1}
                        max={32}
                        step={0.5}
                        value={size}
                        onChange={e => setSize(parseFloat(e.target.value))}
                        className="w-16 h-1 cursor-pointer accent-slate-700"
                        title={`두께 ${size.toFixed(1)}px`}
                    />
                </div>

                {/* 우측 액션 버튼들 */}
                <div className="ml-auto flex items-center gap-0.5 shrink-0">
                    {/* 손 떨림 보정 */}
                    <button
                        onClick={() => setShowStab(s => !s)}
                        type="button"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            showStab ? "bg-violet-100 text-violet-600" : "text-slate-400 hover:bg-slate-100"
                        }`}
                        title="손 떨림 보정 (Stabilizer)"
                    >
                        <SlidersHorizontal className="h-3 w-3" />
                    </button>

                    {/* 지우개 */}
                    <button
                        onClick={() => setEraserMode(m => !m)}
                        type="button"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            effectiveErase ? "bg-rose-100 text-rose-600" : "text-slate-400 hover:bg-slate-100"
                        }`}
                        title="지우개"
                    >
                        <Eraser className="h-3.5 w-3.5" />
                    </button>

                    {/* Undo */}
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="실행 취소 (Ctrl+Z)"
                    >
                        <Undo2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Redo */}
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="다시 실행 (Ctrl+Shift+Z)"
                    >
                        <Redo2 className="h-3.5 w-3.5" />
                    </button>

                    {/* 전체 지우기 */}
                    <button
                        onClick={clearAll}
                        disabled={!strokes.length}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="전체 지우기"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* ── 손 떨림 보정 슬라이더 (토글) ── */}
            {showStab && (
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-100 bg-violet-50/50">
                    <SlidersHorizontal className="h-3 w-3 text-violet-500 shrink-0" />
                    <span className="text-[10px] text-violet-600 shrink-0 font-medium">손 떨림 보정</span>
                    <input
                        type="range"
                        min={0}
                        max={0.95}
                        step={0.05}
                        value={stabilizer ?? PEN_PRESETS[penType].streamline}
                        onChange={e => setStabilizer(parseFloat(e.target.value))}
                        className="flex-1 h-1 accent-violet-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-violet-500 w-7 text-right shrink-0 tabular-nums">
                        {Math.round((stabilizer ?? PEN_PRESETS[penType].streamline) * 100)}%
                    </span>
                    <button
                        type="button"
                        onClick={() => setStabilizer(undefined)}
                        className="text-[9px] text-violet-400 hover:text-violet-600 transition-colors shrink-0"
                        title="펜 기본값으로 리셋"
                    >
                        리셋
                    </button>
                </div>
            )}

            {/* ── SVG Canvas ── */}
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
                        touchAction: touchAct,
                        cursor: effectiveErase ? "cell" : "crosshair",
                        background: "repeating-linear-gradient(transparent 0 31px, rgba(15,23,42,0.04) 31px 32px)",
                    }}
                >
                    {strokes.map((s, i) => (
                        <path
                            key={i}
                            d={strokeToPath(s.points, s.size, s.penType ?? "pen", s.streamline)}
                            fill={s.color}
                            opacity={PEN_PRESETS[s.penType ?? "pen"].opacity}
                        />
                    ))}
                    {drawing && drawing.length > 1 && (
                        <path
                            d={strokeToPath(drawing, size, penType, stabilizer)}
                            fill={color}
                            opacity={PEN_PRESETS[penType].opacity * 0.85}
                        />
                    )}
                </svg>

                {isEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center px-4">
                            <Pencil className="h-5 w-5 mx-auto text-slate-300 mb-1" />
                            <p className="text-xs text-slate-400 italic">{placeholder}</p>
                            <p className="text-[10px] text-slate-300 mt-1">
                                팜 리젝션 ✋ · 취소 Ctrl+Z · 다시 Ctrl+Shift+Z
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── 직렬화 헬퍼 (DailyView 등에서 import해서 사용) ──────────────────────────

const HW_MARKER = "<!-- planners:handwriting -->";

export function isHandwritingContent(content: string | null | undefined): boolean {
    return !!content && content.startsWith(HW_MARKER);
}

export function parseHandwriting(content: string | null | undefined): HandNoteData | null {
    if (!content?.startsWith(HW_MARKER)) return null;
    try {
        const parsed = JSON.parse(content.slice(HW_MARKER.length).trim());
        return Array.isArray(parsed?.strokes) ? (parsed as HandNoteData) : null;
    } catch { return null; }
}

export function serializeHandwriting(data: HandNoteData): string {
    return `${HW_MARKER}\n${JSON.stringify(data)}`;
}
