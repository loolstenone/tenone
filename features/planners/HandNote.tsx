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
import { Eraser, Undo2, Redo2, RotateCcw, Pencil, PenLine, SlidersHorizontal, ImagePlus, MousePointer2, Trash2 } from "lucide-react";
import { ConfirmSheet } from "./ConfirmSheet";

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

    // Undo / redo
    const undoRef    = useRef<HandStroke[][]>([]);
    const redoRef    = useRef<HandStroke[][]>([]);
    const [stackVer, setStackVer] = useState(0);
    const bumpVer    = () => setStackVer(v => v + 1);

    // 포인터 다운 시 캡처 (undo 커밋용)
    const preActionRef = useRef<HandStroke[] | null>(null);

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

    // ── Init ──────────────────────────────────────────────────────────────────

    useEffect(() => setRecentColors(loadRecent()), []);

    // planners-dark 감지 — SVG 배경·팔레트 팝업 적응
    useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains('planners-dark'));
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
        onChange({ strokes: prev, width: value?.width || width || 600, height });
        bumpVer();
    }, [value, onChange, width, height]);

    const redo = useCallback(() => {
        if (!redoRef.current.length) return;
        const next = redoRef.current.pop()!;
        undoRef.current.push([...(value?.strokes ?? [])]);
        onChange({ strokes: next, width: value?.width || width || 600, height });
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
        if (fillHeight) return;
        setAutoH(h => yMax > h - 40 ? h + 240 : h);
    }

    // ── Erase ─────────────────────────────────────────────────────────────────

    function eraseAt(x: number, y: number) {
        const cur = value?.strokes ?? [];
        const next = cur.filter(s => !nearStroke(s, x, y, size + 8));
        if (next.length !== cur.length)
            onChange({ strokes: next, width: value?.width || width || 600, height });
    }

    // ── Canvas live render (RAF — React re-render 없음) ───────────────────────

    function renderToCanvas() {
        rafRef.current = null;
        const canvas = canvasRef.current;
        const svg    = svgRef.current;
        const points = drawingRef.current;
        if (!canvas || !svg || !points || points.length < 2) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { penType: pt, color: cl, size: sz, stabilizer: stab } = penStateRef.current;
        const p = PEN_PRESETS[pt];

        // viewBox 논리 좌표 → 캔버스 물리 픽셀 변환 스케일
        const vb      = svg.viewBox.baseVal;
        const svgRect = svg.getBoundingClientRect();
        const dpr     = window.devicePixelRatio || 1;
        const sx = vb.width  > 0 ? (svgRect.width  / vb.width)  * dpr : dpr;
        const sy = vb.height > 0 ? (svgRect.height / vb.height) * dpr : dpr;

        const scaledPts = points.map(([lx, ly, pr]) => [lx * sx, ly * sy, pr]);
        const stroke = getStroke(scaledPts, {
            size: sz * Math.min(sx, sy),  // brush size도 동일 스케일 적용
            thinning:         p.thinning,
            smoothing:        p.smoothing,
            streamline:       stab ?? p.streamline,
            easing:           (t) => t,
            simulatePressure: p.simulatePressure,
        });
        if (!stroke.length) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = cl;
        ctx.beginPath();
        const [fx, fy] = stroke[0];
        ctx.moveTo(fx, fy);
        for (let i = 0; i < stroke.length - 1; i++) {
            const [x0, y0] = stroke[i];
            const [x1, y1] = stroke[i + 1];
            ctx.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // ── Pointer events ────────────────────────────────────────────────────────

    function onPointerDown(e: ReactPointerEvent<SVGSVGElement>) {
        if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 5) return;
        // 오버레이 텍스트 모드: SVG pointer-events가 none이므로 이 핸들러는 호출되지 않음
        // (아래 SVG style의 pointerEvents 참조)
        if (children !== undefined && !drawEnabled) return;

        const isEraserBtn =
            e.pointerType === "pen" && (e.button === 5 || (e.buttons & 32) === 32);
        setStylusEraser(isEraserBtn);

        e.currentTarget.setPointerCapture(e.pointerId);
        const { x, y } = getSVGPoint(e.currentTarget, e.clientX, e.clientY);

        // ── 선택/이동 모드 ─────────────────────────────────────────────────────
        if (selectMode) {
            const imgs = value?.images ?? [];
            // z-order 역순으로 hit-test (나중에 그린 게 위에)
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

        // 이번 제스처의 "이전 상태" 캡처 (undo 커밋용)
        preActionRef.current = [...(value?.strokes ?? [])];

        if (eraserMode || isEraserBtn) {
            eraseAt(x, y);
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
        // 오버레이 텍스트 모드에서는 SVG pointer-events가 none이므로 이 핸들러 호출 안 됨
        // (방어적 가드)
        if (children !== undefined && !drawEnabled) return;

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
        if (selectMode) return;

        if (eraserMode || stylusEraser) {
            if (e.buttons > 0) {
                const { x: ex, y: ey } = getSVGPoint(e.currentTarget, e.clientX, e.clientY);
                eraseAt(ex, ey);
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

        // RAF 스케줄 (이미 예약돼 있으면 중복 방지)
        if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(renderToCanvas);
        }
        e.preventDefault();
    }

    function onPointerUp() {
        // 이미지 드래그 종료
        if (dragImgRef.current) { dragImgRef.current = null; return; }

        const wasErasing = effectiveErase;
        setStylusEraser(false);

        // 진행 중인 RAF 취소 + 캔버스 클리어
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }

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

        const points = drawingRef.current;
        drawingRef.current = null;

        if (!points || points.length < 2) return;

        const yMax = points.reduce((m, [, y]) => Math.max(m, y), 0);
        maybeExpand(yMax);

        // 드로잉 undo 커밋
        if (pre !== null) commitUndo(pre);

        const svgH = fillHeight
            ? height  // fillHeight 모드: 현재 논리 높이 유지
            : Math.max(height, yMax + 40);
        const newStroke: HandStroke = { points, color, size, penType, streamline: stabilizer };
        onChange({
            strokes: [...strokes, newStroke],
            width:   value?.width || width || 600,  // 캐노니컬 폭 유지 (기기마다 달라지지 않게)
            height:  svgH,
        });
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
        if (!strokes.length) return;
        commitUndo(strokes);
        onChange({ strokes: [], width: width || 600, height: initH });
        setAutoH(initH);
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

    const isEmpty   = strokes.length === 0;
    const touchAct  = "none";
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
                            title={PEN_PRESETS[t].label}
                            className={`px-2 h-6 text-xs rounded transition-colors whitespace-nowrap ${
                                penType === t && !effectiveErase
                                    ? "bg-[#0F766E] text-white"
                                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border border-neutral-200"
                            }`}
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
                                    ? "ring-2 ring-offset-1 ring-[#0F766E] scale-110 border-white"
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
                        onClick={() => { setSelectMode(m => !m); setEraserMode(false); }}
                        type="button"
                        title="이미지 선택·이동"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            selectMode ? "bg-sky-100 text-sky-600" : "text-neutral-500 hover:bg-neutral-200"
                        }`}
                    >
                        <MousePointer2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="w-px h-3 bg-neutral-300 shrink-0" />
                    {/* 오버레이 모드: 그리기 ↔ 텍스트 토글 (children 있을 때만) */}
                    {children !== undefined && (
                        <>
                            <button
                                onClick={() => setDrawEnabled(d => !d)}
                                type="button"
                                title={drawEnabled ? "텍스트 편집 모드로 전환" : "손글씨 그리기 모드로 전환"}
                                className={`flex items-center gap-1 px-2 h-6 text-xs rounded transition-colors mr-0.5 ${
                                    drawEnabled
                                        ? "bg-[#0F766E] text-white"
                                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 border border-neutral-200"
                                }`}
                            >
                                <PenLine className="h-2.5 w-2.5" />
                                {drawEnabled ? "그리기 중" : "그리기"}
                            </button>
                            <div className="w-px h-3 bg-neutral-300 shrink-0 mx-0.5" />
                        </>
                    )}
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

                    {/* 지우개 */}
                    <button
                        onClick={() => setEraserMode(m => !m)}
                        type="button"
                        className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                            effectiveErase ? "bg-rose-100 text-rose-600" : "text-neutral-500 hover:bg-neutral-200"
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
                    viewBox={`0 0 ${canonW} ${height}`}
                    preserveAspectRatio={fillHeight ? "none" : "xMinYMin meet"}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                    style={{
                        touchAction: touchAct,
                        cursor: (children !== undefined && !drawEnabled) ? "default" : (effectiveErase ? "cell" : "crosshair"),
                        // 오버레이 모드: 텍스트 모드(drawEnabled=false)에선 none → 클릭이 children 텍스트영역에 직접 전달
                        // 그리기 모드(drawEnabled=true)에선 all → SVG가 포인터 이벤트 캡처
                        pointerEvents: (children !== undefined && !drawEnabled) ? "none" : "all",
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
                            {/* 선택 핸들 */}
                            {selectedId === img.id && (
                                <>
                                    <rect x={img.x - 2} y={img.y - 2}
                                        width={img.w + 4} height={img.h + 4}
                                        fill="none" stroke="#0F766E" strokeWidth="1.5"
                                        strokeDasharray="5 3" />
                                    {/* 삭제 버튼 (우상단) */}
                                    <g
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            const imgs = (value?.images ?? []).filter(i => i.id !== img.id);
                                            onChange({ ...(value ?? { strokes: [], width: canonW, height }), images: imgs });
                                            setSelectedId(null);
                                        }}
                                    >
                                        <circle cx={img.x + img.w + 2} cy={img.y - 2} r={8} fill="#ef4444" />
                                        <text x={img.x + img.w + 2} y={img.y + 2}
                                            textAnchor="middle" fill="white"
                                            fontSize="10" fontWeight="bold">✕</text>
                                    </g>
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

/** content에서 텍스트 본문만 꺼내기 — 손글씨 모드에서도 .text가 있으면 그걸 반환 */
export function extractTextPart(content: string | null | undefined): string {
    if (!content) return "";
    if (content.startsWith(HW_MARKER)) {
        return parseHandwriting(content)?.text ?? "";
    }
    return content;
}

/** 텍스트 본문만 갱신 — 기존 손글씨가 있으면 보존, 없으면 평문 저장 */
export function setTextPart(content: string | null | undefined, newText: string): string {
    if (content?.startsWith(HW_MARKER)) {
        const data = parseHandwriting(content) ?? { strokes: [], width: 600, height: 240 };
        return serializeHandwriting({ ...data, text: newText });
    }
    return newText;
}

/** content를 손글씨 모드로 전환(또는 갱신) — 기존 텍스트는 .text 로 보존 */
export function setHandPart(content: string | null | undefined, hand: HandNoteData): string {
    const prevText = extractTextPart(content);
    return serializeHandwriting({ ...hand, text: hand.text ?? prevText });
}
