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
import { Eraser, Undo2, Redo2, RotateCcw, Pencil, PenLine, SlidersHorizontal, ImagePlus, MousePointer2, Trash2, Lasso, ZoomOut } from "lucide-react";
import { ConfirmSheet } from "./ConfirmSheet";
import { CanvasEngine } from "@/lib/canvas-engine/engine";
import { PalmRejection } from "@/lib/canvas-engine/interaction/palm-rejection";
import { renderLiveStroke, makeLiveContext, clearLiveStroke } from "@/lib/canvas-engine/render";
import { toCanvasDocument, toHandNoteData } from "@/lib/canvas-engine/adapters/handnote";
import type { StrokeElement } from "@/lib/canvas-engine/types";
import { createElementId } from "@/lib/canvas-engine/types";
import type { PenKind } from "@/lib/canvas-engine/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PenType = "pen" | "fountain" | "marker" | "highlighter" | "pencil" | "brush";

export interface HandStroke {
    points: number[][];
    color: string;
    size: number;
    penType?: PenType;
    streamline?: number;
}

export interface HandImage {
    id: string;
    src: string;    // dataURL
    x: number;     // viewBox 논리 좌표
    y: number;
    w: number;     // 논리 너비
    h: number;     // 논리 높이
}

export interface HandNoteData {
    strokes: HandStroke[];
    width: number;
    height: number;
    images?: HandImage[];   // 삽입 이미지 목록
    /** 같은 노트의 텍스트 모드 본문 — 손글씨와 공존 보존 (모드 전환 시 사라지지 않음) */
    text?: string;
    _pages?: HandNoteData[];  // multi-page: 추가 페이지 데이터
}

interface HandNoteProps {
    value: HandNoteData | null;
    onChange: (next: HandNoteData) => void;
    height?: number;
    className?: string;
    placeholder?: string;
    minHeight?: number;
    fillHeight?: boolean;
    /** 아래에 콘텐츠(코넬 노트 등)를 깔고 투명 SVG로 덮는 오버레이 모드 */
    children?: React.ReactNode;
    /** 이미지 하단 끝 y 좌표(논리 px)를 알려주는 콜백 — 오버레이 콘텐츠가 이미지 아래로 밀리도록 padding 계산에 사용 */
    onImageFootprintChange?: (px: number) => void;
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
    "#166534", "#16A34A", "#6366F1", "#0E7490", "#7C3AED",
];

// 퀵 선택 기본 5색
const QUICK_COLORS = ["#0F172A", "#1E40AF", "#9F1239", "#166534", "#B45309"];

const RECENT_KEY = "myverse-recent-colors";
const LEGACY_RECENT_KEY = "planners-recent-colors";
const MAX_RECENT = 8;
const MAX_UNDO   = 50;

function loadRecent(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const current = localStorage.getItem(RECENT_KEY);
        if (current) return JSON.parse(current);
        // 레거시 키 마이그레이션
        const legacy = localStorage.getItem(LEGACY_RECENT_KEY);
        if (legacy) {
            localStorage.setItem(RECENT_KEY, legacy);
            localStorage.removeItem(LEGACY_RECENT_KEY);
            return JSON.parse(legacy);
        }
        return [];
    } catch { return []; }
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

/** 화면 좌표 → SVG viewBox 논리 좌표 변환 (viewBox 스케일 자동 반영) */
function getSVGPoint(
    svg: SVGSVGElement,
    clientX: number,
    clientY: number,
): { x: number; y: number } {
    const ctm = svg.getScreenCTM();
    if (ctm) {
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const p = pt.matrixTransform(ctm.inverse());
        return { x: p.x, y: p.y };
    }
    // fallback: viewBox 없을 때
    const rect = svg.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
}

function pointInPoly(x: number, y: number, poly: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
            inside = !inside;
    }
    return inside;
}
function strokeInLasso(s: HandStroke, poly: number[][]): boolean {
    return s.points.some(([x, y]) => pointInPoly(x, y, poly));
}
function areaEraseStrokes(strokes: HandStroke[], cx: number, cy: number, r: number): HandStroke[] {
    const out: HandStroke[] = [];
    for (const s of strokes) {
        let seg: number[][] = [];
        for (const pt of s.points) {
            const [px, py] = pt;
            if ((px - cx) ** 2 + (py - cy) ** 2 <= r * r) {
                if (seg.length >= 2) out.push({ ...s, points: seg });
                seg = [];
            } else { seg.push(pt); }
        }
        if (seg.length >= 2) out.push({ ...s, points: seg });
    }
    return out;
}
function maybeStraighten(pts: number[][]): number[][] {
    if (pts.length < 3) return pts;
    let arcLen = 0;
    for (let i = 1; i < pts.length; i++)
        arcLen += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const directLen = Math.hypot(pts[pts.length - 1][0] - pts[0][0], pts[pts.length - 1][1] - pts[0][1]);
    if (arcLen > 0 && directLen / arcLen > 0.95)
        return [pts[0], pts[pts.length - 1]];
    return pts;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HandNote({
    value,
    onChange,
    height: initH = 240,
    className = "",
    placeholder = "Apple Pencil · S Pen 또는 마우스로 직접 쓰세요",
    minHeight,
    fillHeight = false,
    children,
    onImageFootprintChange,
}: HandNoteProps) {
    // DOM
    const containerRef    = useRef<HTMLDivElement>(null);
    const outerRef        = useRef<HTMLDivElement>(null);
    const [fillH, setFillH] = useState(0);
    const svgRef          = useRef<SVGSVGElement>(null);
    const canvasRef       = useRef<HTMLCanvasElement>(null); // 라이브 스트로크 오버레이
    const paletteRef      = useRef<HTMLDivElement>(null);
    const paletteBtnRef   = useRef<HTMLButtonElement>(null);
    const [palettePos, setPalettePos] = useState({ top: 0, left: 0 });

    // CanvasEngine + PalmRejection
    const engineRef   = useRef<CanvasEngine>(new CanvasEngine());
    const palmRef     = useRef<PalmRejection>(new PalmRejection());
    // 엔진 → onChange 루프 방지
    const localChangeRef = useRef(false);
    // 이미지 전용 onChange 시 엔진 reload 방지 (strokes 레퍼런스 동일하면 skip)
    const lastStrokesRef = useRef<HandStroke[] | null | undefined>(undefined);

    // Undo / redo — stackVer은 toolbar 버튼 disabled 상태 강제 갱신에만 사용
    const [stackVer, setStackVer] = useState(0);
    const bumpVer    = () => setStackVer(v => v + 1);

    // ─ 드로잉 Ref (state 대신 → React re-render 없음) ─
    const drawingRef  = useRef<number[][] | null>(null); // 현재 스트로크 포인트
    const rafRef      = useRef<number | null>(null);     // requestAnimationFrame handle

    // 드로잉 상태 (React state — UI 업데이트 필요한 것만)
    const [width,        setWidth]        = useState(0);
    const [penType,      setPenType]      = useState<PenType>("pen");
    const [color,        setColor]        = useState(QUICK_COLORS[0]);
    const [size,         setSize]         = useState(PEN_PRESETS.pen.baseSize);
    const [stabilizer,   setStabilizer]   = useState<number | undefined>(undefined);
    const [showStab,     setShowStab]     = useState(false);
    const [eraserMode,   setEraserMode]   = useState(false);
    const [stylusEraser, setStylusEraser] = useState(false);
    const [selectMode,   setSelectMode]   = useState(false); // 이미지 선택/이동 모드
    const [selectedId,   setSelectedId]   = useState<string | null>(null);
    const dragImgRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
    const resizeRef  = useRef<{ handle: string; startX: number; startY: number; origImg: HandImage } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [autoH,        setAutoH]        = useState(value?.height ?? initH);

    // RAF 콜백에서 항상 최신 펜 설정을 읽기 위한 ref (stale closure 방지)
    const penStateRef = useRef({ penType, color, size, stabilizer });
    penStateRef.current = { penType, color, size, stabilizer };

    // 팔레트
    const [showPalette,  setShowPalette]  = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [hexInput,     setHexInput]     = useState("");

    const effectiveErase = eraserMode || stylusEraser;
    const height  = fillHeight && fillH > 0 ? fillH : Math.max(autoH, value?.height ?? initH);
    const strokes = value?.strokes ?? [];
    // 캐노니컬 폭: 저장된 value.width 우선 → 처음 그릴 때만 현재 컨테이너 폭 사용
    // 이 값을 viewBox 기준으로 써야 화면 크기가 달라도 스트로크가 잘리지 않고 비례 축소됨
    const canonW = value?.width || width || 600;

    const [confirmClearOpen, setConfirmClearOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    /** 오버레이 모드(children 제공 시): true=그리기, false=텍스트 편집 */
    const [drawEnabled, setDrawEnabled] = useState(false);

    // ── Samsung Notes 업그레이드 refs ─────────────────────────────────────────
    // Viewport (pan/zoom): x,y = viewBox origin offset, s = scale
    const [vp, setVp] = useState({ x: 0, y: 0, s: 1 });
    const vpRef = useRef({ x: 0, y: 0, s: 1 });
    // Touch tracking for pinch/pan
    const touchPtsRef = useRef<Map<number, { x: number; y: number }>>(new Map());
    // Pinch snapshot: canvas-coords midpoint + viewport at pinch start
    const pinchRef = useRef<{ pivX: number; pivY: number; vpSnap: { x: number; y: number; s: number }; d0: number } | null>(null);
    // One-finger pan snapshot
    const pan1Ref = useRef<{ cx: number; cy: number; vpSnap: { x: number; y: number; s: number } } | null>(null);
    // Eraser type: "stroke" | "area"
    const [eraserType, setEraserType] = useState<"stroke" | "area">("stroke");
    // Area erase cursor position (SVG coords)
    const [areaEraseCursor, setAreaEraseCursor] = useState<{ x: number; y: number } | null>(null);
    // Lasso mode
    const [lassoMode, setLassoMode] = useState(false);
    const lassoRef = useRef<number[][] | null>(null);
    const [lassoPreview, setLassoPreview] = useState<number[][] | null>(null);
    const [selectedIdxs, setSelectedIdxs] = useState<Set<number>>(new Set());

    // ── Engine Init / Cleanup ─────────────────────────────────────────────────

    useEffect(() => {
        const doc = toCanvasDocument(value ?? { strokes: [], width: canonW, height: initH });
        engineRef.current.load(doc);
        lastStrokesRef.current = value?.strokes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => { engineRef.current.destroy(); };
    }, []);

    // value(strokes) → 엔진 동기화 (외부 변경 시에만, 이미지 전용 변경은 skip)
    useEffect(() => {
        if (localChangeRef.current) { localChangeRef.current = false; return; }
        if (value?.strokes === lastStrokesRef.current) return;
        lastStrokesRef.current = value?.strokes;
        const doc = toCanvasDocument({
            strokes: value?.strokes ?? [],
            width: canonW,
            height: value?.height ?? initH,
        });
        engineRef.current.load(doc);
        bumpVer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // ── Init ──────────────────────────────────────────────────────────────────

    useEffect(() => setRecentColors(loadRecent()), []);

    // myverse-dark 감지 — SVG 배경·팔레트 팝업 적응
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('myverse-dark'));
        check();
        const obs = new MutationObserver(check);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    // pp-pen-mode 레거시 설정 초기화 (버튼 제거 후 이전 localStorage 값 클리어)
    useEffect(() => {
        localStorage.removeItem("pp-pen-mode");
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (!fillHeight || !outerRef.current) return;
        const ro = new ResizeObserver(([e]) => setFillH(e.contentRect.height));
        ro.observe(outerRef.current);
        return () => ro.disconnect();
    }, [fillHeight]);

    // 이미지 푸트프린트 변경 알림 — 오버레이 아래 콘텐츠(Cornell 노트 등)가 이미지 아래로 밀리도록
    useEffect(() => {
        if (!onImageFootprintChange) return;
        const imgs = value?.images ?? [];
        const bottom = imgs.length > 0 ? Math.max(...imgs.map(img => img.y + img.h)) : 0;
        // fillHeight 모드: viewBox 논리 px → CSS 실제 px 변환
        const viewboxH = value?.height ?? initH;
        const scale = (fillHeight && fillH > 0 && viewboxH > 0) ? fillH / viewboxH : 1;
        onImageFootprintChange(bottom * scale);
    }, [value?.images, onImageFootprintChange, fillHeight, fillH, value?.height, initH]);

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

    // ── emitChange — 엔진 상태를 HandNoteData로 직렬화해 부모에 전달 ────────────

    function emitChange(overrideHeight?: number) {
        localChangeRef.current = true;
        const doc = engineRef.current.serialize();
        const newData = toHandNoteData(doc, {
            width: canonW,
            height: overrideHeight ?? height,
            text: value?.text,
        });
        lastStrokesRef.current = newData.strokes;
        onChange({
            ...newData,
            ...(value?.images?.length ? { images: value.images } : {}),
        });
    }

    // ── Undo / Redo ───────────────────────────────────────────────────────────

    const undo = useCallback(() => {
        if (!engineRef.current.canUndo()) return;
        engineRef.current.undo();
        localChangeRef.current = true;
        const doc = engineRef.current.serialize();
        const newData = toHandNoteData(doc, { width: canonW, height, text: value?.text });
        lastStrokesRef.current = newData.strokes;
        onChange({ ...newData, ...(value?.images?.length ? { images: value.images } : {}) });
        bumpVer();
    }, [value, onChange, canonW, height]);

    const redo = useCallback(() => {
        if (!engineRef.current.canRedo()) return;
        engineRef.current.redo();
        localChangeRef.current = true;
        const doc = engineRef.current.serialize();
        const newData = toHandNoteData(doc, { width: canonW, height, text: value?.text });
        lastStrokesRef.current = newData.strokes;
        onChange({ ...newData, ...(value?.images?.length ? { images: value.images } : {}) });
        bumpVer();
    }, [value, onChange, canonW, height]);

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
        if (fillHeight) return;
        setAutoH(h => yMax > h - 40 ? h + 240 : h);
    }

    // ── Erase ─────────────────────────────────────────────────────────────────

    function eraseAt(x: number, y: number) {
        const idsToRemove = (engineRef.current.getElements() as StrokeElement[])
            .filter(el => el.type === "stroke" && nearStroke({ points: el.points } as unknown as HandStroke, x, y, size + 8))
            .map(el => el.id);
        if (idsToRemove.length > 0) {
            engineRef.current.removeElements(idsToRemove);
            emitChange();
            bumpVer();
        }
    }

    // ── Canvas live render (RAF — React re-render 없음) ───────────────────────

    function renderToCanvas() {
        rafRef.current = null;
        const canvas = canvasRef.current;
        const svg    = svgRef.current;
        const points = drawingRef.current;
        if (!canvas || !svg || !points || points.length < 2) return;
        const liveCtx = makeLiveContext(canvas, svg);
        if (!liveCtx) return;
        const { penType: pt, color: cl, size: sz, stabilizer: stab } = penStateRef.current;
        renderLiveStroke(liveCtx, points, {
            pen:           pt as PenKind,
            color:         cl,
            size:          sz,
            streamline:    stab,
            isRealPressure: palmRef.current.isRealPressure(),
        });
    }

    // ── Image resize handle hit-test ─────────────────────────────────────────

    const HANDLE_HIT_R = 8;

    function getResizeHandle(img: HandImage, x: number, y: number): string | null {
        const cx = img.x + img.w / 2, cy = img.y + img.h / 2;
        const candidates = [
            { id: "nw", hx: img.x,         hy: img.y          },
            { id: "n",  hx: cx,             hy: img.y          },
            { id: "ne", hx: img.x + img.w,  hy: img.y          },
            { id: "e",  hx: img.x + img.w,  hy: cy             },
            { id: "se", hx: img.x + img.w,  hy: img.y + img.h  },
            { id: "s",  hx: cx,             hy: img.y + img.h  },
            { id: "sw", hx: img.x,          hy: img.y + img.h  },
            { id: "w",  hx: img.x,          hy: cy             },
        ];
        for (const c of candidates) {
            if (Math.abs(x - c.hx) <= HANDLE_HIT_R && Math.abs(y - c.hy) <= HANDLE_HIT_R) return c.id;
        }
        return null;
    }

    // ── Pointer events ────────────────────────────────────────────────────────

    function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
        if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 5) return;
        // 오버레이 모드: drawEnabled=false여도 선택/이동 모드는 허용
        if (children !== undefined && !drawEnabled && !selectMode && !lassoMode) return;

        // ── Palm rejection ─────────────────────────────────────────────────────
        palmRef.current.onPointerDown(e.nativeEvent);
        if (palmRef.current.shouldReject(e.nativeEvent)) { e.preventDefault(); return; }
        if (e.pointerType === "touch") {
            touchPtsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const touches = touchPtsRef.current;
            if (touches.size === 2) {
                // 두 손가락: 핀치 시작
                const pts = [...touches.values()];
                const cx = (pts[0].x + pts[1].x) / 2;
                const cy = (pts[0].y + pts[1].y) / 2;
                const d0 = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                const rect = svgRef.current?.getBoundingClientRect();
                if (rect) {
                    const sw = rect.width;
                    const vSnap = { ...vpRef.current };
                    const pivX = vSnap.x + (cx - rect.left) / sw * (canonW / vSnap.s);
                    const pivY = vSnap.y + (cy - rect.top) / rect.height * (height / vSnap.s);
                    pinchRef.current = { pivX, pivY, vpSnap: vSnap, d0 };
                }
                pan1Ref.current = null;
                drawingRef.current = null;
                e.preventDefault(); return;
            } else if (touches.size === 1 && vpRef.current.s > 1) {
                // 한 손가락 + 줌 상태: 패닝
                pan1Ref.current = { cx: e.clientX, cy: e.clientY, vpSnap: { ...vpRef.current } };
                drawingRef.current = null;
                e.preventDefault(); return;
            }
            // 한 손가락 + 줌=1: 일반 드로잉으로 진행
        }

        const isEraserBtn =
            e.pointerType === "pen" && (e.button === 5 || (e.buttons & 32) === 32);
        setStylusEraser(isEraserBtn);

        e.currentTarget.setPointerCapture(e.pointerId);
        const { x, y } = getSVGPoint(e.currentTarget, e.clientX, e.clientY);

        // ── 선택/이동 모드 ─────────────────────────────────────────────────────
        if (selectMode) {
            const imgs = value?.images ?? [];
            if (selectedId) {
                const selImg = imgs.find(img => img.id === selectedId);
                if (selImg) {
                    const delCx = selImg.x + selImg.w - 10, delCy = selImg.y + 10;
                    if (Math.hypot(x - delCx, y - delCy) <= 12) {
                        const newImgs = imgs.filter(i => i.id !== selImg.id);
                        onChange({ ...(value ?? { strokes: [], width: canonW, height }), images: newImgs });
                        setSelectedId(null);
                        e.preventDefault();
                        return;
                    }
                    const hitHandle = getResizeHandle(selImg, x, y);
                    if (hitHandle) {
                        resizeRef.current = { handle: hitHandle, startX: x, startY: y, origImg: { ...selImg } };
                        e.preventDefault();
                        return;
                    }
                }
            }
            const hit = [...imgs].reverse().find(img =>
                x >= img.x && x <= img.x + img.w && y >= img.y && y <= img.y + img.h
            );
            if (hit) {
                setSelectedId(hit.id);
                dragImgRef.current = { id: hit.id, ox: x - hit.x, oy: y - hit.y };
            } else {
                setSelectedId(null);
                dragImgRef.current = null;
            }
            e.preventDefault();
            return;
        }

        // ── 올가미 모드 ────────────────────────────────────────────────────────
        if (lassoMode) {
            lassoRef.current = [[x, y]];
            setLassoPreview([[x, y]]);
            e.preventDefault(); return;
        }

        if (eraserMode || isEraserBtn) {
            if (eraserType === "area") {
                setAreaEraseCursor({ x, y });
            } else {
                eraseAt(x, y);
            }
        } else {
            // 연필: 포인트 레벨 노이즈로 거친 질감
            const nx = penType === "pencil" ? x + (Math.random() - 0.5) * 1.2 : x;
            const ny = penType === "pencil" ? y + (Math.random() - 0.5) * 1.2 : y;
            drawingRef.current = [[nx, ny, e.pressure || 0.5]];

            // 캔버스 DPR 동기화 (포인터 다운 시 1회)
            const canvas = canvasRef.current;
            if (canvas) {
                const dpr = window.devicePixelRatio || 1;
                const w = canvas.offsetWidth;
                const h = canvas.offsetHeight;
                if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
                    canvas.width  = Math.round(w * dpr);
                    canvas.height = Math.round(h * dpr);
                }
            }
        }
        e.preventDefault();
    }

    function onPointerMove(e: ReactPointerEvent<SVGSVGElement>) {
        if (children !== undefined && !drawEnabled && !selectMode && !lassoMode) return;

        // ── 핀치 줌/팬 ─────────────────────────────────────────────────────────
        if (e.pointerType === "touch") {
            touchPtsRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
            const pinch = pinchRef.current;
            if (pinch && touchPtsRef.current.size >= 2) {
                const pts = [...touchPtsRef.current.values()];
                const cx = (pts[0].x + pts[1].x) / 2;
                const cy = (pts[0].y + pts[1].y) / 2;
                const d = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
                const rect = svgRef.current?.getBoundingClientRect();
                if (rect) {
                    const sw = rect.width;
                    const newS = Math.max(1, Math.min(5, pinch.vpSnap.s * (d / pinch.d0)));
                    const newX = pinch.pivX - (cx - rect.left) / sw * (canonW / newS);
                    const newY = pinch.pivY - (cy - rect.top) / rect.height * (height / newS);
                    const maxX = canonW - canonW / newS, maxY = height - height / newS;
                    const clampedX = Math.max(0, Math.min(maxX, newX));
                    const clampedY = Math.max(0, Math.min(maxY, newY));
                    const newVp = { x: clampedX, y: clampedY, s: newS };
                    vpRef.current = newVp;
                    setVp(newVp);
                }
                e.preventDefault(); return;
            }
            const pan1 = pan1Ref.current;
            if (pan1 && touchPtsRef.current.size === 1) {
                const dx = e.clientX - pan1.cx;
                const dy = e.clientY - pan1.cy;
                const rect = svgRef.current?.getBoundingClientRect();
                if (rect) {
                    const sw = rect.width;
                    const s = pan1.vpSnap.s;
                    const newX = pan1.vpSnap.x - dx / sw * (canonW / s);
                    const newY = pan1.vpSnap.y - dy / rect.height * (height / s);
                    const maxX = canonW - canonW / s, maxY = height - height / s;
                    const newVp = { x: Math.max(0, Math.min(maxX, newX)), y: Math.max(0, Math.min(maxY, newY)), s };
                    vpRef.current = newVp;
                    setVp(newVp);
                }
                e.preventDefault(); return;
            }
            if (pinchRef.current || pan1Ref.current) { e.preventDefault(); return; }
        }

        // ── 이미지 드래그 이동 ──────────────────────────────────────────────────
        if (selectMode && dragImgRef.current && e.buttons > 0) {
            const { x, y } = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
            const { id, ox, oy } = dragImgRef.current;
            const imgs = (value?.images ?? []).map(img =>
                img.id === id ? { ...img, x: x - ox, y: y - oy } : img
            );
            onChange({ ...(value ?? { strokes: [], width: canonW, height }), images: imgs });
            e.preventDefault();
            return;
        }
        // ── 이미지 리사이즈 ────────────────────────────────────────────────────
        if (selectMode && resizeRef.current && e.buttons > 0) {
            const { x, y } = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
            const { handle, startX, startY, origImg } = resizeRef.current;
            const dx = x - startX, dy = y - startY;
            const MIN = 20;
            let { x: nx, y: ny, w: nw, h: nh } = origImg;
            if      (handle === "nw") { nx = origImg.x + dx; ny = origImg.y + dy; nw = origImg.w - dx; nh = origImg.h - dy; }
            else if (handle === "n")  { ny = origImg.y + dy; nh = origImg.h - dy; }
            else if (handle === "ne") { nw = origImg.w + dx; ny = origImg.y + dy; nh = origImg.h - dy; }
            else if (handle === "e")  { nw = origImg.w + dx; }
            else if (handle === "se") { nw = origImg.w + dx; nh = origImg.h + dy; }
            else if (handle === "s")  { nh = origImg.h + dy; }
            else if (handle === "sw") { nx = origImg.x + dx; nw = origImg.w - dx; nh = origImg.h + dy; }
            else if (handle === "w")  { nx = origImg.x + dx; nw = origImg.w - dx; }
            if (e.shiftKey && "nw ne se sw".includes(handle)) {
                const ratio = origImg.w / origImg.h;
                if (Math.abs(nw - origImg.w) >= Math.abs(nh - origImg.h)) {
                    nh = nw / ratio;
                    if (handle === "nw" || handle === "ne") ny = origImg.y + origImg.h - nh;
                } else {
                    nw = nh * ratio;
                    if (handle === "nw" || handle === "sw") nx = origImg.x + origImg.w - nw;
                }
            }
            if (nw < MIN) { if ("nw sw w".includes(handle)) nx = origImg.x + origImg.w - MIN; nw = MIN; }
            if (nh < MIN) { if ("nw ne n".includes(handle)) ny = origImg.y + origImg.h - MIN; nh = MIN; }
            const imgs = (value?.images ?? []).map(img =>
                img.id === origImg.id ? { ...img, x: nx, y: ny, w: nw, h: nh } : img
            );
            onChange({ ...(value ?? { strokes: [], width: canonW, height }), images: imgs });
            e.preventDefault();
            return;
        }
        if (selectMode) return;

        // ── 올가미 드로우 ──────────────────────────────────────────────────────
        if (lassoMode && lassoRef.current && e.buttons > 0) {
            const { x, y } = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
            lassoRef.current.push([x, y]);
            setLassoPreview([...lassoRef.current]);
            e.preventDefault(); return;
        }

        if (eraserMode || stylusEraser) {
            if (e.buttons > 0) {
                const { x: ex, y: ey } = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
                if (eraserType === "area") {
                    const r = size * 3;
                    setAreaEraseCursor({ x: ex, y: ey });
                    const idsToRemove = (engineRef.current.getElements() as StrokeElement[])
                        .filter(el => el.type === "stroke" && nearStroke({ points: el.points } as unknown as HandStroke, ex, ey, r))
                        .map(el => el.id);
                    if (idsToRemove.length > 0) {
                        engineRef.current.removeElements(idsToRemove);
                        emitChange();
                        bumpVer();
                    }
                } else {
                    eraseAt(ex, ey);
                }
            } else {
                if (eraserType === "area") {
                    const { x: ex, y: ey } = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
                    setAreaEraseCursor({ x: ex, y: ey });
                }
            }
            return;
        }
        if (!drawingRef.current) return;

        // getCoalescedEvents — 스타일러스 서브프레임 포인트 포착
        const rawEvents: PointerEvent[] =
            typeof e.nativeEvent.getCoalescedEvents === "function"
                ? e.nativeEvent.getCoalescedEvents()
                : [e.nativeEvent];

        const svg = e.currentTarget;
        for (const ce of rawEvents) {
            const { x, y } = getSVGPoint(svg, ce.clientX, ce.clientY);
            const nx = penType === "pencil" ? x + (Math.random() - 0.5) * 1.2 : x;
            const ny = penType === "pencil" ? y + (Math.random() - 0.5) * 1.2 : y;
            drawingRef.current.push([nx, ny, ce.pressure || 0.5]);
        }

        if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(renderToCanvas);
        }
        e.preventDefault();
    }

    function onPointerUp(e?: ReactPointerEvent<SVGSVGElement>) {
        // ── 터치 포인터 정리 ────────────────────────────────────────────────────
        if (e && e.pointerType === "touch") {
            touchPtsRef.current.delete(e.pointerId);
            if (touchPtsRef.current.size < 2) pinchRef.current = null;
            if (touchPtsRef.current.size === 0) pan1Ref.current = null;
        }
        if (e) palmRef.current.onPointerUp(e.nativeEvent);

        // ── 올가미 닫기 ────────────────────────────────────────────────────────
        if (lassoMode && lassoRef.current && lassoRef.current.length >= 3) {
            const poly = lassoRef.current;
            const hits = new Set<number>();
            (value?.strokes ?? []).forEach((s, i) => {
                if (strokeInLasso(s, poly)) hits.add(i);
            });
            setSelectedIdxs(hits);
            lassoRef.current = null;
            setLassoPreview(null);
            return;
        }
        lassoRef.current = null;
        setLassoPreview(null);

        // 이미지 드래그/리사이즈 종료
        if (dragImgRef.current) { dragImgRef.current = null; return; }
        if (resizeRef.current)  { resizeRef.current  = null; return; }

        setStylusEraser(false);

        // 진행 중인 RAF 취소 + 캔버스 클리어
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        const canvas = canvasRef.current;
        const svg    = svgRef.current;
        if (canvas && svg) {
            const liveCtx = makeLiveContext(canvas, svg);
            if (liveCtx) clearLiveStroke(liveCtx);
        }

        const points = drawingRef.current;
        drawingRef.current = null;

        if (!points || points.length < 2) return;

        const yMax = points.reduce((m, [, y]) => Math.max(m, y), 0);
        maybeExpand(yMax);

        // ── 직선 보조 ──────────────────────────────────────────────────────────
        const finalPoints = maybeStraighten(points);

        const svgH = fillHeight
            ? height
            : Math.max(height, yMax + 40);

        const el: StrokeElement = {
            id:         createElementId(),
            type:       "stroke",
            x: 0, y: 0,
            rotation:   0,
            opacity:    100,
            zIndex:     engineRef.current.getElements().length,
            createdAt:  Date.now(),
            updatedAt:  Date.now(),
            points:     finalPoints as [number, number, number][],
            color,
            size,
            pen:        penType as PenKind,
            streamline: stabilizer ?? PEN_PRESETS[penType].streamline,
        };
        engineRef.current.addElement(el);
        emitChange(svgH);
        bumpVer();
    }

    // ── Pen selection ─────────────────────────────────────────────────────────

    function selectPen(t: PenType) {
        // 같은 펜을 다시 클릭하면 그리기 모드 해제 (텍스트 입력으로 복귀)
        if (penType === t && drawEnabled && !selectMode && !lassoMode && !eraserMode) {
            setDrawEnabled(false);
            return;
        }
        setPenType(t);
        setSize(PEN_PRESETS[t].baseSize);
        setEraserMode(false);
        setStabilizer(undefined);
        // 펜 선택 = 즉시 그리기 모드 진입 (별도 "그리기" 토글 불필요)
        setDrawEnabled(true);
        setSelectMode(false);
        setLassoMode(false);
    }

    // ── Clear all ─────────────────────────────────────────────────────────────

    function clearAll() {
        const allIds = engineRef.current.getElements().map(el => el.id);
        if (!allIds.length) return;
        engineRef.current.removeElements(allIds);
        emitChange(initH);
        setAutoH(initH);
        bumpVer();
    }

    // ── Image insert ──────────────────────────────────────────────────────────

    function insertImageFile(file: File) {
        const reader = new FileReader();
        reader.onload = () => {
            const src = reader.result as string;
            const img = new window.Image();
            img.onload = () => {
                const maxW = canonW * 0.7;
                const scale = Math.min(1, maxW / img.naturalWidth);
                const w = img.naturalWidth * scale;
                const h = img.naturalHeight * scale;
                const cx = (canonW - w) / 2;
                const cy = height * 0.1;
                const newImg: HandImage = { id: `img_${Date.now()}`, src, x: cx, y: cy, w, h };
                const prevImgs = value?.images ?? [];
                onChange({ ...(value ?? { strokes: [], width: canonW, height }), images: [...prevImgs, newImg] });
                if (!fillHeight) setAutoH(a => Math.max(a, cy + h + 60));
                setSelectMode(true);
                setSelectedId(newImg.id);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
    }

    // 이미지 붙이기 (Ctrl+V)
    useEffect(() => {
        const handler = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of Array.from(items)) {
                if (item.type.startsWith("image/")) {
                    const file = item.getAsFile();
                    if (file) { e.preventDefault(); insertImageFile(file); return; }
                }
            }
        };
        window.addEventListener("paste", handler);
        return () => window.removeEventListener("paste", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, canonW, height]);

    // 선택된 이미지 Delete/Backspace로 삭제
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!selectedId || !selectMode) return;
            if (e.key === "Delete" || e.key === "Backspace") {
                const imgs = (value?.images ?? []).filter(img => img.id !== selectedId);
                onChange({ ...(value ?? { strokes: [], width: canonW, height }), images: imgs });
                setSelectedId(null);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, selectMode, value, canonW, height]);

    // ── Derived ───────────────────────────────────────────────────────────────

    void stackVer;  // force re-render on engine history change
    const isEmpty   = strokes.length === 0;
    const touchAct  = "none";
    const canUndo   = engineRef.current.canUndo();
    const canRedo   = engineRef.current.canRedo();

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
        <div ref={outerRef} className={fillHeight ? "flex-1 min-h-0 flex flex-col" : undefined}>
        <div
            ref={containerRef}
            className={`relative overflow-hidden select-none ${children !== undefined ? "bg-transparent border-0 rounded-none" : "bg-white border border-neutral-200 rounded-lg"} ${fillHeight ? "flex flex-col flex-1 min-h-0" : ""} ${className}`}
        >
            {/* ── Toolbar ── */}
            <div
                className={`flex items-center gap-1.5 px-2 py-1.5 border-b border-neutral-200 bg-neutral-50 overflow-x-auto [&::-webkit-scrollbar]:hidden ${fillHeight ? "shrink-0" : ""}`}
                style={{ scrollbarWidth: "none" }}
            >
                {/* Pen types */}
                <div className="flex items-center gap-0.5 shrink-0">
                    {(Object.keys(PEN_PRESETS) as PenType[]).map(t => (
                        <button
                            key={t}
                            onClick={() => selectPen(t)}
                            type="button"
                            className={`px-2 h-6 text-xs rounded transition-colors whitespace-nowrap ${
                                penType === t && drawEnabled && !effectiveErase && !selectMode && !lassoMode
                                    ? "bg-[#6366F1] text-white"
                                    : penType === t
                                        ? "bg-neutral-200 text-neutral-700 border border-neutral-300"
                                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border border-neutral-200"
                            }`}
                            title={`${PEN_PRESETS[t].label}${penType === t && drawEnabled ? " (다시 누르면 그리기 종료)" : ""}`}
                        >
                            {PEN_PRESETS[t].label}
                        </button>
                    ))}
                </div>

                <div className="w-px h-3 bg-neutral-300 shrink-0" />

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
                                    ? "ring-2 ring-offset-1 ring-[#6366F1] scale-110 border-white"
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
                        className="w-5 h-5 rounded-full border-2 border-neutral-300 hover:border-neutral-500 transition-all shrink-0"
                        style={{ background: "conic-gradient(#f87171, #fb923c, #facc15, #4ade80, #60a5fa, #a78bfa, #f87171)" }}
                    />

                    {/* 팔레트 팝오버 — fixed로 overflow-hidden 탈출. 색상 선택기라 항상 라이트 모드 */}
                    {showPalette && (
                        <div
                            ref={paletteRef}
                            className="fixed z-[9999] rounded-xl shadow-2xl p-3 w-52"
                            style={{ top: palettePos.top, left: palettePos.left, background: '#ffffff', border: '1px solid #e5e7eb', color: '#111827' }}
                        >
                            {/* 현재 색상 */}
                            <div className="flex items-center gap-2 mb-2.5 pb-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <div
                                    className="w-7 h-7 rounded-lg shadow-inner"
                                    style={{ backgroundColor: color, border: '1px solid #e5e7eb' }}
                                />
                                <span className="text-[11px] font-mono" style={{ color: '#6b7280' }}>{color.toUpperCase()}</span>
                            </div>

                            {/* 20색 그리드 */}
                            <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                                {PALETTE.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => pickColor(c)}
                                        type="button"
                                        title={c}
                                        className={`w-7 h-7 rounded-md transition-all hover:scale-110 ${
                                            c === "#FFFFFF" ? "shadow-inner" : ""
                                        }`}
                                        style={{
                                            backgroundColor: c,
                                            border: color === c ? '2px solid #374151' : '2px solid #f1f5f9',
                                            transform: color === c ? 'scale(1.1)' : undefined,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* 최근 사용 */}
                            {recentColors.length > 0 && (
                                <div className="mb-2.5 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                                    <p className="text-[9px] mb-1.5 uppercase tracking-wide" style={{ color: '#9ca3af' }}>최근 사용</p>
                                    <div className="flex gap-1 flex-wrap">
                                        {recentColors.map((c, i) => (
                                            <button
                                                key={i}
                                                onClick={() => pickColor(c)}
                                                type="button"
                                                title={c}
                                                className="w-5 h-5 rounded hover:scale-110 transition-all"
                                                style={{
                                                    backgroundColor: c,
                                                    border: color === c ? '2px solid #374151' : '2px solid #f1f5f9',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* HEX 직접 입력 */}
                            <div className="flex gap-1 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                                <input
                                    type="text"
                                    value={hexInput}
                                    onChange={e => setHexInput(e.target.value)}
                                    placeholder="#RRGGBB"
                                    className="flex-1 text-[11px] px-2 py-1 rounded-lg font-mono outline-none"
                                    style={{ border: '1px solid #e5e7eb', background: '#f8fafc', color: '#111827' }}
                                    onKeyDown={e => { if (e.key === "Enter") applyHex(); }}
                                />
                                <button
                                    type="button"
                                    onClick={applyHex}
                                    className="px-2 py-1 text-[10px] rounded-lg transition-colors"
                                    style={{ background: '#111827', color: '#ffffff' }}
                                >
                                    ✓
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-px h-3 bg-neutral-300 shrink-0" />

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
                    {/* 이미지 삽입 */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        title="이미지 삽입 (또는 Ctrl+V 붙이기)"
                        className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
                    >
                        <ImagePlus className="h-3.5 w-3.5" />
                    </button>
                    {/* 선택/이동 모드 */}
                    <button
                        onClick={() => { const next = !selectMode; setSelectMode(next); setEraserMode(false); setLassoMode(false); if (next) setDrawEnabled(true); }}
                        type="button"
                        title="이미지 선택·이동"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            selectMode ? "bg-sky-100 text-sky-600" : "text-neutral-500 hover:bg-neutral-200"
                        }`}
                    >
                        <MousePointer2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-px h-3 bg-neutral-300 shrink-0" />
                    {/* "그리기" 토글 제거 — 펜 선택 시 자동 진입, 선택/올가미/지우개 클릭 시 자동 해제 */}
                    {/* 손 떨림 보정 */}
                    <button
                        onClick={() => setShowStab(s => !s)}
                        type="button"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            showStab ? "bg-violet-100 text-violet-600" : "text-neutral-500 hover:bg-neutral-200"
                        }`}
                        title="손 떨림 보정 (Stabilizer)"
                    >
                        <SlidersHorizontal className="h-3 w-3" />
                    </button>

                    {/* 지우개 (클릭마다 stroke→area→off 순환) */}
                    <button
                        onClick={() => {
                            if (!eraserMode) {
                                setEraserMode(true); setEraserType("stroke");
                                setLassoMode(false); setSelectMode(false); setDrawEnabled(true);
                            } else if (eraserType === "stroke") {
                                setEraserType("area");
                            } else {
                                setEraserMode(false); setAreaEraseCursor(null);
                            }
                        }}
                        type="button"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            effectiveErase ? "bg-rose-100 text-rose-600" : "text-neutral-500 hover:bg-neutral-200"
                        }`}
                        title={eraserMode ? (eraserType === "stroke" ? "지우개: 획 단위 (클릭해서 영역 지우개로)" : "지우개: 영역 (클릭해서 끄기)") : "지우개 켜기"}
                    >
                        <Eraser className="h-3.5 w-3.5" />
                        {eraserMode && eraserType === "area" && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                    </button>

                    {/* 매직 선택 (올가미) */}
                    <button
                        onClick={() => {
                            const next = !lassoMode;
                            setLassoMode(next);
                            setEraserMode(false); setSelectMode(false);
                            if (next) setDrawEnabled(true);
                            if (lassoMode) setSelectedIdxs(new Set());
                        }}
                        type="button"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            lassoMode ? "bg-blue-100 text-blue-600" : "text-neutral-500 hover:bg-neutral-200"
                        }`}
                        title="매직 선택 (올가미)"
                    >
                        <Lasso className="h-3.5 w-3.5" />
                    </button>

                    {/* 선택 삭제 */}
                    {selectedIdxs.size > 0 && (
                        <button
                            onClick={() => {
                                const allEls = engineRef.current.getElements() as StrokeElement[];
                                const strokeEls = allEls.filter(el => el.type === "stroke");
                                const idsToRemove = strokeEls
                                    .filter((_, i) => selectedIdxs.has(i))
                                    .map(el => el.id);
                                if (idsToRemove.length > 0) {
                                    engineRef.current.removeElements(idsToRemove);
                                    emitChange();
                                    bumpVer();
                                }
                                setSelectedIdxs(new Set());
                                setLassoMode(false);
                            }}
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title={`선택 획 삭제 (${selectedIdxs.size}개)`}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}

                    {/* 줌 리셋 */}
                    {vp.s > 1 && (
                        <button
                            onClick={() => { const nv = { x: 0, y: 0, s: 1 }; vpRef.current = nv; setVp(nv); }}
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:bg-neutral-200 transition-colors"
                            title="줌 초기화"
                        >
                            <ZoomOut className="h-3.5 w-3.5" />
                        </button>
                    )}

                    {/* Undo */}
                    <button
                        onClick={undo}
                        disabled={!canUndo}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="실행 취소 (Ctrl+Z)"
                    >
                        <Undo2 className="h-3.5 w-3.5" />
                    </button>

                    {/* Redo */}
                    <button
                        onClick={redo}
                        disabled={!canRedo}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="다시 실행 (Ctrl+Shift+Z)"
                    >
                        <Redo2 className="h-3.5 w-3.5" />
                    </button>

                    {/* 전체 지우기 */}
                    <button
                        onClick={() => setConfirmClearOpen(true)}
                        disabled={!strokes.length}
                        type="button"
                        className="w-6 h-6 rounded flex items-center justify-center text-neutral-500 hover:bg-neutral-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="전체 지우기"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* ── 손 떨림 보정 슬라이더 (토글) ── */}
            {showStab && (
                <div className={`flex items-center gap-2 px-3 py-1.5 border-b border-neutral-200 bg-violet-50/50 ${fillHeight ? "shrink-0" : ""}`}>
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

            {/* ── SVG + Canvas overlay ── */}
            <div
                className={fillHeight ? "flex-1 min-h-0 relative overflow-hidden" : "relative"}
                style={fillHeight ? undefined : { height, minHeight }}
            >
                {/* 오버레이 모드: children(코넬 노트 등)을 아래에 깔기 */}
                {children !== undefined && (
                    <div
                        className="absolute inset-0 overflow-auto"
                        style={{ pointerEvents: drawEnabled ? "none" : "auto" }}
                    >
                        {children}
                    </div>
                )}

                {/* 확정된 스트로크 — SVG */}
                <svg
                    ref={svgRef}
                    width="100%"
                    height={fillHeight ? "100%" : height}
                    viewBox={`${vp.x} ${vp.y} ${canonW / vp.s} ${height / vp.s}`}
                    preserveAspectRatio={fillHeight ? "none" : "xMinYMin meet"}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    style={{
                        touchAction: touchAct,
                        cursor: (children !== undefined && !drawEnabled && !selectMode && !lassoMode) ? "default" : (selectMode || lassoMode) ? "default" : (effectiveErase ? "cell" : "crosshair"),
                        // 오버레이 모드: 텍스트 모드(drawEnabled=false)에선 none → 클릭이 children 텍스트영역에 직접 전달
                        // 선택/올가미 모드이면 drawEnabled 무관하게 이벤트 허용
                        pointerEvents: (children !== undefined && !drawEnabled && !selectMode && !lassoMode) ? "none" : "all",
                        ...(children !== undefined ? {
                            position: "absolute" as const,
                            top: 0, right: 0, bottom: 0, left: 0,
                            background: "transparent",
                        } : {
                            background: isDark ? [
                                "linear-gradient(to right, transparent 198px, rgba(220,60,60,0.20) 198px, rgba(220,60,60,0.20) 200px, transparent 200px)",
                                "repeating-linear-gradient(transparent 0 31px, rgba(255,255,255,0.06) 31px 32px)"
                            ].join(", ") : [
                                "linear-gradient(to right, transparent 198px, rgba(200,30,30,0.12) 198px, rgba(200,30,30,0.12) 200px, transparent 200px)",
                                "repeating-linear-gradient(transparent 0 31px, rgba(15,23,42,0.04) 31px 32px)"
                            ].join(", "),
                        }),
                    }}
                >
                    {/* 삽입 이미지 — 스트로크 아래 레이어 (자리 차지: 흰 배경 + 이미지) */}
                    {(value?.images ?? []).map(img => (
                        <g key={img.id}>
                            {/* 텍스트/배경 위를 가리는 흰 사각형 (자리 차지) */}
                            <rect x={img.x} y={img.y} width={img.w} height={img.h}
                                fill={isDark ? "#1e1e2e" : "white"} />
                            <image
                                href={img.src}
                                x={img.x} y={img.y}
                                width={img.w} height={img.h}
                                preserveAspectRatio="xMidYMid meet"
                                style={{ cursor: selectMode ? "move" : "default" }}
                            />
                            {/* 선택 오버레이 + 리사이즈 핸들 */}
                            {selectedId === img.id && (
                                <>
                                    <rect x={img.x - 2} y={img.y - 2}
                                        width={img.w + 4} height={img.h + 4}
                                        fill="none" stroke="#6366F1" strokeWidth="1.5"
                                        strokeDasharray="5 3" />
                                    {/* 삭제 버튼 (우상단 안쪽 — viewBox 밖으로 안 잘리게) */}
                                    <g style={{ cursor: "pointer" }}>
                                        <circle cx={img.x + img.w - 10} cy={img.y + 10} r={9} fill="#ef4444" />
                                        <text x={img.x + img.w - 10} y={img.y + 14}
                                            textAnchor="middle" fill="white"
                                            fontSize="11" fontWeight="bold">✕</text>
                                    </g>
                                    {/* 리사이즈 핸들 8개 */}
                                    {([
                                        { id: "nw", hx: img.x,           hy: img.y,             cur: "nw-resize" },
                                        { id: "n",  hx: img.x+img.w/2,   hy: img.y,             cur: "n-resize"  },
                                        { id: "ne", hx: img.x+img.w,     hy: img.y,             cur: "ne-resize" },
                                        { id: "e",  hx: img.x+img.w,     hy: img.y+img.h/2,     cur: "e-resize"  },
                                        { id: "se", hx: img.x+img.w,     hy: img.y+img.h,       cur: "se-resize" },
                                        { id: "s",  hx: img.x+img.w/2,   hy: img.y+img.h,       cur: "s-resize"  },
                                        { id: "sw", hx: img.x,           hy: img.y+img.h,       cur: "sw-resize" },
                                        { id: "w",  hx: img.x,           hy: img.y+img.h/2,     cur: "w-resize"  },
                                    ] as const).map(h => (
                                        <rect key={h.id}
                                            x={h.hx - 4} y={h.hy - 4} width={8} height={8} rx={1.5}
                                            fill="white" stroke="#6366F1" strokeWidth="1.5"
                                            style={{ cursor: h.cur }}
                                        />
                                    ))}
                                </>
                            )}
                        </g>
                    ))}
                    {/* 확정된 펜 스트로크 */}
                    {strokes.map((s, i) => (
                        <path
                            key={i}
                            d={strokeToPath(s.points, s.size, s.penType ?? "pen", s.streamline)}
                            fill={s.color}
                            opacity={PEN_PRESETS[s.penType ?? "pen"].opacity}
                        />
                    ))}
                    {/* 올가미 선택 하이라이트 */}
                    {selectedIdxs.size > 0 && strokes.map((s, i) =>
                        selectedIdxs.has(i) ? (
                            <path
                                key={`sel-${i}`}
                                d={strokeToPath(s.points, s.size, s.penType ?? "pen", s.streamline)}
                                fill="#3b82f6"
                                opacity={0.35}
                            />
                        ) : null
                    )}
                    {/* 올가미 드로우 미리보기 */}
                    {lassoPreview && lassoPreview.length >= 2 && (
                        <polyline
                            points={lassoPreview.map(([x, y]) => `${x},${y}`).join(" ")}
                            fill="rgba(59,130,246,0.08)"
                            stroke="#3b82f6"
                            strokeWidth={1.5 / vp.s}
                            strokeDasharray={`${6 / vp.s} ${3 / vp.s}`}
                        />
                    )}
                    {/* 영역 지우개 커서 */}
                    {(eraserMode || stylusEraser) && eraserType === "area" && areaEraseCursor && (
                        <circle
                            cx={areaEraseCursor.x}
                            cy={areaEraseCursor.y}
                            r={size * 3}
                            fill="rgba(239,68,68,0.08)"
                            stroke="#ef4444"
                            strokeWidth={1 / vp.s}
                            strokeDasharray={`${4 / vp.s} ${2 / vp.s}`}
                        />
                    )}
                </svg>

                {/* 라이브 스트로크 캔버스 — React re-render 없이 RAF로 직접 렌더 */}
                <canvas
                    ref={canvasRef}
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        pointerEvents: "none",
                    }}
                />

                {/* 빈 캔버스 안내 — 오버레이 모드에서는 표시 안 함 */}
                {isEmpty && children === undefined && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center px-4">
                            <Pencil className="h-5 w-5 mx-auto text-neutral-400 mb-1" />
                            <p className="text-xs text-neutral-500 italic">{placeholder}</p>
                            <p className="text-[10px] text-neutral-400 mt-1">
                                팜 리젝션 ✋ · 취소 Ctrl+Z · 다시 Ctrl+Shift+Z
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
        {/* 이미지 파일 선택 input (숨김) */}
        <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) insertImageFile(file);
                e.target.value = "";  // 같은 파일 재선택 가능하도록 초기화
            }}
        />
        <ConfirmSheet
            open={confirmClearOpen}
            message="이 손글씨를 모두 지울까요?"
            confirmLabel="지우기"
            onConfirm={() => { setConfirmClearOpen(false); clearAll(); }}
            onCancel={() => setConfirmClearOpen(false)}
        />
        </div>
    );
}

// ─── 직렬화 헬퍼 ────────────────────────────────────────────────────────────
// 실제 구현은 lib/myverse/canvas-engine/adapters/handnote-storage.ts로 이동.
// 외부 사용처(DailyView, ProjectNotesTab 등)는 기존대로 import 가능 (re-export).
export {
    isHandwritingContent,
    parseHandwriting,
    serializeHandwriting,
    extractTextPart,
    setTextPart,
    setHandPart,
} from "@/lib/canvas-engine/adapters/handnote-storage";
