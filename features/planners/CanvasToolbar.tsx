"use client";

// PP Canvas 단일 통합 툴바 — Excalidraw 기본 UI를 모두 숨기고 이 컴포넌트가 전담.
//
// 구성: [선택] [펜 5종] [굵기] [색 7+확장] [도형 4종] [텍스트] [지우개] [undo/redo]
// 모든 동작은 ExcalidrawImperativeAPI를 통해 호출 — 단일 진실 소스.

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
    Pen, Pencil, Highlighter, Eraser, MousePointer2,
    Square, Circle, ArrowRight, Type, Undo2, Redo2, Diamond, Plus,
    Image as ImageIcon, MoveUp, MoveDown, ChevronsUp, ChevronsDown, MoreHorizontal,
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

const QUICK_COLORS = [
    { hex: "#171717", name: "검정" },
    { hex: "#525252", name: "진회색" },
    { hex: "#dc2626", name: "빨강" },
    { hex: "#ea580c", name: "주황" },
    { hex: "#16a34a", name: "녹색" },
    { hex: "#6366F1", name: "청록" },
    { hex: "#7c3aed", name: "보라" },
];

// 24색 확장 팔레트 (4행 × 6열) — 톤 다양성
const EXTENDED_COLORS = [
    // 무채/기본
    "#000000", "#171717", "#404040", "#737373", "#a3a3a3", "#e5e5e5",
    // 따뜻
    "#7f1d1d", "#dc2626", "#ea580c", "#f59e0b", "#eab308", "#84cc16",
    // 차가움
    "#16a34a", "#10b981", "#6366F1", "#0891b2", "#3b82f6", "#1e40af",
    // 강조
    "#7c3aed", "#a855f7", "#ec4899", "#f43f5e", "#fde047", "#ffffff",
];

const RECENT_KEY = "pp-canvas-recent-colors";
const MAX_RECENT = 10;

function loadRecent(): string[] {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}

function saveRecent(hex: string) {
    if (typeof window === "undefined") return;
    const arr = loadRecent().filter(c => c.toLowerCase() !== hex.toLowerCase());
    arr.unshift(hex);
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0, MAX_RECENT)));
}

// ─── 펜 굵기 ────────────────────────────────────────────────────────────────

const WIDTH_PRESETS = [
    { value: 1,  label: "가는" },
    { value: 2,  label: "기본" },
    { value: 4,  label: "굵은" },
    { value: 8,  label: "매우 굵은" },
];
const WIDTH_MIN = 0.5;
const WIDTH_MAX = 32;

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
    /** 현재 선택된 엘리먼트 ID 수 — 0이면 레이어 버튼 숨김 */
    selectedCount?: number;
}

export function CanvasToolbar({ apiRef, selectedCount = 0 }: Props) {
    const [active, setActive] = useState<ActiveTool>({ mode: "selection" });
    const [color, setColor] = useState<string>(QUICK_COLORS[0].hex);
    // 굵기는 펜 프리셋 변경 시 그 펜의 기본 굵기로 리셋, 사용자가 슬라이더로 override 가능
    const [width, setWidth] = useState<number>(PEN_PRESETS[0].width);
    const [colorOpen, setColorOpen] = useState(false);
    const [widthOpen, setWidthOpen] = useState(false);
    const [moreOpen, setMoreOpen] = useState(false);
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [hexInput, setHexInput] = useState("");

    const colorPopRef = useRef<HTMLDivElement>(null);
    const widthPopRef = useRef<HTMLDivElement>(null);
    const morePopRef = useRef<HTMLDivElement>(null);
    const colorBtnRef = useRef<HTMLButtonElement>(null);
    const widthBtnRef = useRef<HTMLButtonElement>(null);
    const moreBtnRef = useRef<HTMLButtonElement>(null);

    // ── 최초 로드 시 최근 색상 복원 ──────────────────────────────────────────
    useEffect(() => setRecentColors(loadRecent()), []);

    // ── 팝오버 외부 클릭 시 닫기 ──────────────────────────────────────────
    useEffect(() => {
        if (!colorOpen && !widthOpen && !moreOpen) return;
        function onClick(e: MouseEvent) {
            const t = e.target as Node;
            if (colorOpen && !colorPopRef.current?.contains(t) && !colorBtnRef.current?.contains(t)) {
                setColorOpen(false);
            }
            if (widthOpen && !widthPopRef.current?.contains(t) && !widthBtnRef.current?.contains(t)) {
                setWidthOpen(false);
            }
            if (moreOpen && !morePopRef.current?.contains(t) && !moreBtnRef.current?.contains(t)) {
                setMoreOpen(false);
            }
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [colorOpen, widthOpen, moreOpen]);

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
        setWidth(preset.width);
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

    // ── 색상 적용 (palette + custom 공통) ───────────────────────────────────
    const applyColor = useCallback((hex: string) => {
        const api = apiRef.current;
        if (!api) return;
        setColor(hex);
        saveRecent(hex);
        setRecentColors(loadRecent());
        if (active.mode === "freedraw") {
            const preset = PEN_PRESETS.find(p => p.key === active.pen);
            if (preset && !preset.fixedColor) {
                api.updateScene({ appState: { currentItemStrokeColor: hex } });
            }
        }
        if (active.mode === "shape" || active.mode === "text") {
            api.updateScene({ appState: { currentItemStrokeColor: hex } });
        }
    }, [apiRef, active]);

    // ── 굵기 적용 ──────────────────────────────────────────────────────────
    const applyWidth = useCallback((w: number) => {
        const api = apiRef.current;
        if (!api) return;
        const clamped = Math.max(WIDTH_MIN, Math.min(WIDTH_MAX, w));
        setWidth(clamped);
        api.updateScene({ appState: { currentItemStrokeWidth: clamped } });
    }, [apiRef]);

    // ── HEX 입력 처리 ───────────────────────────────────────────────────────
    function commitHex() {
        const v = hexInput.trim();
        const normalized = v.startsWith("#") ? v : `#${v}`;
        if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
            applyColor(normalized.toLowerCase());
            setHexInput("");
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

    // ── 이미지 삽입 ──────────────────────────────────────────────────────────
    const insertImage = useCallback(() => {
        const api = apiRef.current;
        if (!api) return;
        // Excalidraw 이미지 도구 — 클릭 시 파일 선택 다이얼로그가 자동으로 뜸
        api.setActiveTool({ type: "image" });
    }, [apiRef]);

    // ── 레이어 순서 변경 ─────────────────────────────────────────────────────
    // selectedCount > 0일 때만 동작. 선택 엘리먼트를 배열 내에서 이동.
    const reorderSelection = useCallback((dir: "front" | "back" | "forward" | "backward") => {
        const api = apiRef.current;
        if (!api) return;
        const elements = api.getSceneElements();
        const sel = api.getAppState().selectedElementIds;
        const selIdSet = new Set(Object.keys(sel).filter(id => sel[id]));
        if (selIdSet.size === 0) return;

        const others = elements.filter(e => !selIdSet.has(e.id));
        const selected = elements.filter(e => selIdSet.has(e.id));

        let next: typeof elements;
        if (dir === "front") {
            next = [...others, ...selected];
        } else if (dir === "back") {
            next = [...selected, ...others];
        } else {
            // forward/backward: 한 칸씩 이동 (간단 구현)
            const arr = [...elements];
            const indices = arr.map((e, i) => selIdSet.has(e.id) ? i : -1).filter(i => i >= 0);
            const range = dir === "forward" ? [...indices].reverse() : indices;
            for (const i of range) {
                const swap = dir === "forward" ? i + 1 : i - 1;
                if (swap < 0 || swap >= arr.length || selIdSet.has(arr[swap].id)) continue;
                [arr[i], arr[swap]] = [arr[swap], arr[i]];
            }
            next = arr;
        }
        api.updateScene({ elements: next });
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
    const widthVisible = active.mode === "freedraw" || active.mode === "shape";

    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-0.5 px-1.5 py-1.5 bg-white/95 myverse-dark:bg-[#1c1c1c]/95 backdrop-blur border border-neutral-200 myverse-dark:border-[#2a2a2a] rounded-full shadow-md">
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

            {/* ── 굵기 ─────────────────────────────────────────────────── */}
            {widthVisible && (
                <>
                    <Divider />
                    <div className="relative shrink-0">
                        <button
                            ref={widthBtnRef}
                            onClick={() => { setWidthOpen(o => !o); setColorOpen(false); }}
                            title={`굵기: ${width.toFixed(1)}px`}
                            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                                widthOpen
                                    ? "bg-[#6366F1] text-white"
                                    : "text-neutral-500 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]"
                            }`}
                        >
                            <span
                                className="block rounded-full bg-current"
                                style={{ width: Math.min(20, Math.max(2, width * 1.2)), height: Math.min(20, Math.max(2, width * 1.2)) }}
                            />
                        </button>
                        {widthOpen && (
                            <div
                                ref={widthPopRef}
                                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 p-3 bg-white myverse-dark:bg-[#1c1c1c] border border-neutral-200 myverse-dark:border-[#2a2a2a] rounded-xl shadow-xl"
                            >
                                <div className="text-[11px] font-medium text-neutral-500 myverse-dark:text-neutral-400 mb-2">굵기</div>
                                <div className="grid grid-cols-4 gap-1.5 mb-3">
                                    {WIDTH_PRESETS.map(p => (
                                        <button
                                            key={p.value}
                                            onClick={() => applyWidth(p.value)}
                                            title={p.label}
                                            className={`flex flex-col items-center justify-center h-12 rounded-lg border transition-colors ${
                                                Math.abs(width - p.value) < 0.01
                                                    ? "border-[#6366F1] bg-[#6366F1]/10"
                                                    : "border-neutral-200 myverse-dark:border-[#2a2a2a] hover:bg-neutral-50 myverse-dark:hover:bg-[#252525]"
                                            }`}
                                        >
                                            <span className="block rounded-full bg-neutral-700 myverse-dark:bg-neutral-200" style={{ width: p.value * 1.5, height: p.value * 1.5 }} />
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="range"
                                    min={WIDTH_MIN}
                                    max={WIDTH_MAX}
                                    step={0.5}
                                    value={width}
                                    onChange={e => applyWidth(parseFloat(e.target.value))}
                                    className="w-full accent-[#6366F1]"
                                />
                                <div className="text-center text-xs text-neutral-500 myverse-dark:text-neutral-400 mt-1">
                                    {width.toFixed(1)}px
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            <Divider />

            {/* ── 인라인 7색 (sm 이상에서만 — 모바일은 "+"만) ─────────────── */}
            <div className="hidden sm:flex items-center gap-0.5">
                {QUICK_COLORS.map(c => (
                    <button
                        key={c.hex}
                        onClick={() => !colorsDisabled && applyColor(c.hex)}
                        disabled={colorsDisabled}
                        title={c.name}
                        className={`shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                            color.toLowerCase() === c.hex.toLowerCase() && !colorsDisabled
                                ? "border-neutral-900 myverse-dark:border-white scale-110"
                                : "border-white myverse-dark:border-[#1c1c1c] hover:scale-105"
                        } ${colorsDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                        style={{ backgroundColor: c.hex }}
                    />
                ))}
            </div>

            {/* ── 모바일: 현재 색상 미리보기 (color picker 트리거 옆) ──────── */}
            <div className="sm:hidden shrink-0 w-5 h-5 rounded-full border-2 border-white myverse-dark:border-[#1c1c1c]"
                 style={{ backgroundColor: color, opacity: colorsDisabled ? 0.3 : 1 }}
                 title={`현재 색상: ${color}`}
            />

            {/* ── 색상 팝오버 트리거 ─────────────────────────────────────── */}
            <div className="relative shrink-0">
                <button
                    ref={colorBtnRef}
                    onClick={() => { if (!colorsDisabled) { setColorOpen(o => !o); setWidthOpen(false); } }}
                    disabled={colorsDisabled}
                    title="더 많은 색상"
                    className={`flex items-center justify-center w-7 h-7 rounded-full border border-dashed transition-colors ${
                        colorOpen
                            ? "border-[#6366F1] bg-[#6366F1]/10 text-[#6366F1]"
                            : "border-neutral-300 myverse-dark:border-[#3a3a3a] text-neutral-500 myverse-dark:text-neutral-400 hover:border-neutral-400"
                    } ${colorsDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
                {colorOpen && (
                    <div
                        ref={colorPopRef}
                        className="absolute top-full mt-2 right-0 w-72 p-3 bg-white myverse-dark:bg-[#1c1c1c] border border-neutral-200 myverse-dark:border-[#2a2a2a] rounded-xl shadow-xl"
                    >
                        <div className="text-[11px] font-medium text-neutral-500 myverse-dark:text-neutral-400 mb-1.5">팔레트</div>
                        <div className="grid grid-cols-6 gap-1.5 mb-3">
                            {EXTENDED_COLORS.map(hex => (
                                <button
                                    key={hex}
                                    onClick={() => applyColor(hex)}
                                    title={hex}
                                    className={`w-7 h-7 rounded-md border-2 transition-transform hover:scale-110 ${
                                        color.toLowerCase() === hex.toLowerCase()
                                            ? "border-neutral-900 myverse-dark:border-white"
                                            : "border-neutral-200 myverse-dark:border-[#2a2a2a]"
                                    }`}
                                    style={{ backgroundColor: hex }}
                                />
                            ))}
                        </div>

                        {recentColors.length > 0 && (
                            <>
                                <div className="text-[11px] font-medium text-neutral-500 myverse-dark:text-neutral-400 mb-1.5">최근 사용</div>
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {recentColors.map(hex => (
                                        <button
                                            key={hex}
                                            onClick={() => applyColor(hex)}
                                            title={hex}
                                            className="w-6 h-6 rounded-full border border-neutral-200 myverse-dark:border-[#2a2a2a] hover:scale-110 transition-transform"
                                            style={{ backgroundColor: hex }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        <div className="text-[11px] font-medium text-neutral-500 myverse-dark:text-neutral-400 mb-1.5">HEX</div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-neutral-400">#</span>
                            <input
                                type="text"
                                value={hexInput}
                                onChange={e => setHexInput(e.target.value.replace("#", ""))}
                                onKeyDown={e => { if (e.key === "Enter") commitHex(); }}
                                placeholder="0F766E"
                                maxLength={7}
                                className="flex-1 px-2 py-1 text-xs font-mono bg-neutral-50 myverse-dark:bg-[#262626] border border-neutral-200 myverse-dark:border-[#2a2a2a] rounded outline-none focus:border-[#6366F1]"
                            />
                            <button
                                onClick={commitHex}
                                className="shrink-0 px-2.5 py-1 text-xs bg-[#6366F1] text-white rounded hover:bg-[#0d6660] whitespace-nowrap"
                            >
                                적용
                            </button>
                            <label className="cursor-pointer w-7 h-7 flex items-center justify-center rounded border border-neutral-200 myverse-dark:border-[#2a2a2a] hover:bg-neutral-50 myverse-dark:hover:bg-[#252525]" title="색상 선택기">
                                <input
                                    type="color"
                                    value={color}
                                    onChange={e => applyColor(e.target.value)}
                                    className="w-0 h-0 opacity-0 absolute"
                                />
                                <span className="block w-4 h-4 rounded" style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }} />
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* ── 도형·텍스트·이미지 (md 이상) ─────────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5">
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

                <ToolButton title="이미지 삽입 (I)" onClick={insertImage}>
                    <ImageIcon className="h-4 w-4" />
                </ToolButton>
            </div>

            {/* ── 레이어 순서 (선택 있을 때만, md 이상) ─────────────────────── */}
            {selectedCount > 0 && (
                <div className="hidden md:flex items-center gap-0.5">
                    <Divider />
                    <ToolButton title="맨 앞으로" onClick={() => reorderSelection("front")}>
                        <ChevronsUp className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton title="앞으로" onClick={() => reorderSelection("forward")}>
                        <MoveUp className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton title="뒤로" onClick={() => reorderSelection("backward")}>
                        <MoveDown className="h-4 w-4" />
                    </ToolButton>
                    <ToolButton title="맨 뒤로" onClick={() => reorderSelection("back")}>
                        <ChevronsDown className="h-4 w-4" />
                    </ToolButton>
                </div>
            )}

            <Divider />

            <ToolButton title="지우개 (E)" active={active.mode === "eraser"} onClick={() => selectTool("eraser")} activeColor="rose">
                <Eraser className="h-4 w-4" />
            </ToolButton>

            {/* ── 더보기 (md 미만에서만 보임) ──────────────────────────────── */}
            <div className="md:hidden relative shrink-0">
                <button
                    ref={moreBtnRef}
                    onClick={() => { setMoreOpen(o => !o); setColorOpen(false); setWidthOpen(false); }}
                    title="도형·텍스트·이미지·레이어"
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        moreOpen
                            ? "bg-[#6366F1] text-white"
                            : "text-neutral-500 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]"
                    }`}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
                {moreOpen && (
                    <div
                        ref={morePopRef}
                        className="absolute top-full mt-2 right-0 w-56 p-2 bg-white myverse-dark:bg-[#1c1c1c] border border-neutral-200 myverse-dark:border-[#2a2a2a] rounded-xl shadow-xl"
                    >
                        <div className="text-[11px] font-medium text-neutral-500 myverse-dark:text-neutral-400 px-2 py-1">도형</div>
                        <div className="grid grid-cols-4 gap-1 mb-2">
                            {SHAPES.map(s => (
                                <button
                                    key={s.kind}
                                    onClick={() => { selectShape(s.kind); setMoreOpen(false); }}
                                    title={s.label}
                                    className={`flex items-center justify-center h-9 rounded-lg transition-colors ${
                                        active.mode === "shape" && active.shape === s.kind
                                            ? "bg-[#6366F1] text-white"
                                            : "text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]"
                                    }`}
                                >
                                    {s.icon}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1 mb-2">
                            <button
                                onClick={() => { selectText(); setMoreOpen(false); }}
                                className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs transition-colors ${
                                    active.mode === "text"
                                        ? "bg-[#6366F1] text-white"
                                        : "text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]"
                                }`}
                            >
                                <Type className="h-3.5 w-3.5" /> 텍스트
                            </button>
                            <button
                                onClick={() => { insertImage(); setMoreOpen(false); }}
                                className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]"
                            >
                                <ImageIcon className="h-3.5 w-3.5" /> 이미지
                            </button>
                        </div>
                        {selectedCount > 0 && (
                            <>
                                <div className="text-[11px] font-medium text-neutral-500 myverse-dark:text-neutral-400 px-2 py-1">레이어 순서</div>
                                <div className="grid grid-cols-4 gap-1 mb-2">
                                    <button onClick={() => { reorderSelection("front"); setMoreOpen(false); }} title="맨 앞으로" className="flex items-center justify-center h-9 rounded-lg text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]">
                                        <ChevronsUp className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => { reorderSelection("forward"); setMoreOpen(false); }} title="앞으로" className="flex items-center justify-center h-9 rounded-lg text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]">
                                        <MoveUp className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => { reorderSelection("backward"); setMoreOpen(false); }} title="뒤로" className="flex items-center justify-center h-9 rounded-lg text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]">
                                        <MoveDown className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => { reorderSelection("back"); setMoreOpen(false); }} title="맨 뒤로" className="flex items-center justify-center h-9 rounded-lg text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]">
                                        <ChevronsDown className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}
                        {/* 모바일 전용: undo/redo */}
                        <div className="text-[11px] font-medium text-neutral-500 myverse-dark:text-neutral-400 px-2 py-1">실행</div>
                        <div className="grid grid-cols-2 gap-1">
                            <button onClick={() => { undo(); setMoreOpen(false); }} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]">
                                <Undo2 className="h-3.5 w-3.5" /> 취소
                            </button>
                            <button onClick={() => { redo(); setMoreOpen(false); }} className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs text-neutral-600 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]">
                                <Redo2 className="h-3.5 w-3.5" /> 다시
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── undo/redo (md 이상에서만 인라인) ─────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5">
                <Divider />
                <ToolButton title="실행 취소 (Ctrl+Z)" onClick={undo}>
                    <Undo2 className="h-4 w-4" />
                </ToolButton>
                <ToolButton title="다시 실행 (Ctrl+Shift+Z)" onClick={redo}>
                    <Redo2 className="h-4 w-4" />
                </ToolButton>
            </div>
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
    const activeCls = activeColor === "rose" ? "bg-rose-500 text-white" : "bg-[#6366F1] text-white";
    return (
        <button
            onClick={onClick}
            title={title}
            className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                active ? activeCls : "text-neutral-500 myverse-dark:text-neutral-300 hover:bg-neutral-100 myverse-dark:hover:bg-[#2a2a2a]"
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-neutral-200 myverse-dark:bg-[#2a2a2a] shrink-0 mx-0.5" />;
}
