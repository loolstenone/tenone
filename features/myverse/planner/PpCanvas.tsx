"use client";

/**
 * PpCanvas ??PP 캔버???�진 ?�체?�면 ?�퍼
 *
 * Phase 2: ??stroke) + ?�형(shape) + 지?�개(eraser) + ??�?pan-zoom)
 * - ?�단 ?�있???�바(PpCanvasToolbar)
 * - SVG viewBox 기반 ??�?(PanZoomController)
 * - Canvas 2D ?�버?�이�??�이�????�더�?(RAF)
 * - ?�형 ?�래�??�리�?ghost) ???�정(commit)
 * - 1.5s ?�바?�스 ?�동 ?�?? * - ??리젝??PalmRejection)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    CanvasEngine,
    PanZoomController,
    PalmRejection,
    screenToCanvas,
    strokeToPath,
    resolveStrokeStyle,
    shapeToRender,
    getBackgroundStyle,
    elementBoundingBox,
    createElementId,
    getPenProfile,
    selectionGeometry,
    applyResize,
    applyRotation,
} from "@/lib/canvas-engine";
import type {
    CanvasDocument,
    CanvasElement,
    BackgroundTemplate,
    ToolMode,
    Viewport,
    StrokeElement,
    RectElement,
    EllipseElement,
    DiamondElement,
    ArrowElement,
    LineElement,
    TextElement,
    ImageElement,
    ShapeRenderData,
    HandleId,
    BoundingBox,
    SelectionGeometry,
} from "@/lib/canvas-engine";
import { makeLiveContext, renderLiveStroke, clearLiveStroke, exportToPNG, downloadSVG } from "@/lib/canvas-engine";
import { PpCanvasToolbar } from "./PpCanvasToolbar";

// ?�?�?� ?�???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

type ShapeKind = "rect" | "ellipse" | "diamond" | "arrow" | "line";

interface GhostShape {
    x0: number; y0: number;
    x1: number; y1: number;
    shape: ShapeKind;
    color: string;
    shiftKey: boolean;
}

export interface PpCanvasProps {
    initialDoc?: CanvasDocument;
    onSave?: (doc: CanvasDocument) => void;
    className?: string;
    exportFilename?: string;
}

// ?�?�?� ?�퍼: ?�형 ?�리먼트 ?�성 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

function buildShapeElement(
    kind: ShapeKind,
    x0: number, y0: number,
    x1: number, y1: number,
    color: string,
    shiftKey: boolean,
    zIndex: number,
): CanvasElement {
    const DEFAULTS = {
        strokeColor: color,
        fillColor: undefined as string | undefined,
        strokeWidth: 2,
        strokeStyle: "solid" as const,
    };

    if (kind === "arrow" || kind === "line") {
        // shift ??45° ?�냅
        let ex = x1, ey = y1;
        if (shiftKey) {
            const dx = x1 - x0;
            const dy = y1 - y0;
            const angle = Math.atan2(dy, dx);
            const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
            const len = Math.hypot(dx, dy);
            ex = x0 + Math.cos(snapped) * len;
            ey = y0 + Math.sin(snapped) * len;
        }
        const now = Date.now();
        if (kind === "arrow") {
            return {
                id: createElementId(), type: "arrow", zIndex,
                x: x0, y: y0, rotation: 0, opacity: 100,
                createdAt: now, updatedAt: now,
                points: [[x0, y0], [ex, ey]],
                color, strokeWidth: 2, strokeStyle: "solid" as const,
                arrowEnd: true,
            } as ArrowElement;
        }
        return {
            id: createElementId(), type: "line", zIndex,
            x: x0, y: y0, rotation: 0, opacity: 100,
            createdAt: now, updatedAt: now,
            points: [[x0, y0], [ex, ey]],
            color, strokeWidth: 2, strokeStyle: "solid" as const,
        } as LineElement;
    }

    // rect / ellipse / diamond
    let w = x1 - x0;
    let h = y1 - y0;
    if (shiftKey) {
        const side = Math.min(Math.abs(w), Math.abs(h));
        w = w < 0 ? -side : side;
        h = h < 0 ? -side : side;
    }
    const lx = w >= 0 ? x0 : x0 + w;
    const ly = h >= 0 ? y0 : y0 + h;
    const aw = Math.abs(w);
    const ah = Math.abs(h);

    if (kind === "rect") {
        return {
            id: createElementId(), type: "rect", zIndex,
            x: lx, y: ly, width: aw, height: ah,
            ...DEFAULTS,
        } as RectElement;
    }
    if (kind === "ellipse") {
        return {
            id: createElementId(), type: "ellipse", zIndex,
            x: lx, y: ly, width: aw, height: ah,
            ...DEFAULTS,
        } as EllipseElement;
    }
    // diamond
    return {
        id: createElementId(), type: "diamond", zIndex,
        x: lx, y: ly, width: aw, height: ah,
        ...DEFAULTS,
    } as DiamondElement;
}

// ?�?�?� 배경 CSS (???�프??보정) ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

function getBgStyle(bg: BackgroundTemplate, vp: Viewport): React.CSSProperties {
    const base = getBackgroundStyle(bg, vp.zoom);
    if (!base) return { backgroundColor: "#ffffff" };

    const size = 24 * vp.zoom;
    const ox = bg !== "lines"
        ? ((-vp.x * vp.zoom) % size + size) % size
        : 0;
    const oy = ((-vp.y * vp.zoom) % size + size) % size;

    return {
        ...base,
        backgroundPosition: `${ox}px ${oy}px`,
        backgroundColor: "#ffffff",
    };
}

// ?�?�?� ElementPath ???�정 ?�리먼트 SVG ?�더 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

function ElementPath({ el }: { el: CanvasElement }) {
    if (el.type === "stroke") {
        const d = strokeToPath(el);
        if (!d) return null;
        const { fillColor, opacity } = resolveStrokeStyle(el);
        return <path d={d} fill={fillColor} opacity={opacity} />;
    }

    const rot = el.rotation ?? 0;
    const deg = (rot * 180) / Math.PI;

    if (el.type === "text") {
        const te = el as TextElement;
        if (!te.text) return null;
        const lines = te.text.split("\n");
        const lineHeight = te.fontSize * 1.4;
        const anchorMap: Record<string, string> = { left: "start", center: "middle", right: "end" };
        const bbox = elementBoundingBox(te);
        const textEl = (
            <text
                opacity={te.opacity / 100}
                fontSize={te.fontSize}
                fontFamily={te.fontFamily}
                fontWeight={te.bold ? "bold" : "normal"}
                fontStyle={te.italic ? "italic" : "normal"}
                fill={te.color}
                textAnchor={(anchorMap[te.align] ?? "start") as "start" | "middle" | "end"}
            >
                {lines.map((line, i) => (
                    <tspan key={i} x={te.x} y={te.y + te.fontSize + i * lineHeight}>
                        {line || " "}
                    </tspan>
                ))}
            </text>
        );
        if (rot === 0) return textEl;
        return (
            <g transform={`rotate(${deg} ${bbox.x + bbox.width / 2} ${bbox.y + bbox.height / 2})`}>
                {textEl}
            </g>
        );
    }

    if (el.type === "image") {
        const ie = el as ImageElement;
        const rot2 = ie.rotation ?? 0;
        const deg2 = (rot2 * 180) / Math.PI;
        const imgEl = (
            // eslint-disable-next-line @next/next/no-img-element
            <image
                href={ie.src}
                x={ie.x}
                y={ie.y}
                width={ie.width}
                height={ie.height}
                opacity={ie.opacity / 100}
                preserveAspectRatio="xMidYMid meet"
            />
        );
        if (rot2 === 0) return imgEl;
        const cx = ie.x + ie.width / 2;
        const cy = ie.y + ie.height / 2;
        return <g transform={`rotate(${deg2} ${cx} ${cy})`}>{imgEl}</g>;
    }

    const rd: ShapeRenderData | null = shapeToRender(el);
    if (!rd) return null;

    const shapeContent = (
        <g
            opacity={1}
            stroke={rd.strokeColor}
            strokeWidth={rd.strokeWidth}
            strokeDasharray={rd.dashArray ?? undefined}
            fill={rd.fillColor ?? "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d={rd.path} />
            {rd.extras?.startHead && <path d={rd.extras.startHead} fill={rd.strokeColor} stroke="none" />}
            {rd.extras?.endHead   && <path d={rd.extras.endHead}   fill={rd.strokeColor} stroke="none" />}
        </g>
    );

    // line/arrow: ??좌표가 ?�전???��? ?�코????별도 transform 불필??    if (el.type === "line" || el.type === "arrow" || rot === 0) return shapeContent;

    const bbox = elementBoundingBox(el);
    return (
        <g transform={`rotate(${deg} ${bbox.x + bbox.width / 2} ${bbox.y + bbox.height / 2})`}>
            {shapeContent}
        </g>
    );
}

// ?�?�?� GhostPath ???�래�?�??�형 ?�리�??�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

function GhostPath({ ghost }: { ghost: GhostShape }) {
    const { x0, y0, x1, y1, shape, color, shiftKey } = ghost;
    const w = Math.abs(x1 - x0);
    const h = Math.abs(y1 - y0);
    if (w < 2 && h < 2) return null;

    const el = buildShapeElement(shape, x0, y0, x1, y1, color, shiftKey, 0);
    const rd: ShapeRenderData | null = shapeToRender(el);
    if (!rd) return null;

    return (
        <g
            opacity={0.55}
            stroke={rd.strokeColor}
            strokeWidth={rd.strokeWidth}
            strokeDasharray="6 4"
            fill={rd.fillColor ?? "none"}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d={rd.path} />
            {rd.extras?.startHead && <path d={rd.extras.startHead} fill={rd.strokeColor} stroke="none" />}
            {rd.extras?.endHead   && <path d={rd.extras.endHead}   fill={rd.strokeColor} stroke="none" />}
        </g>
    );
}

// ?�?�?� SelectionOverlay ???�택 ?�들 + 경계??SVG ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

function SelectionOverlay({ geo, zoom }: { geo: SelectionGeometry; zoom: number }) {
    const H  = 8 / zoom;
    const sw = 1.5 / zoom;
    const { bbox, handles, rotateHandle } = geo;
    const cx = bbox.x + bbox.width / 2;
    return (
        <g>
            <rect
                x={bbox.x} y={bbox.y} width={bbox.width} height={bbox.height}
                fill="none" stroke="#6366F1" strokeWidth={sw}
                strokeDasharray={`${4 / zoom} ${3 / zoom}`}
            />
            {(Object.entries(handles) as [string, { x: number; y: number }][]).map(([id, pos]) => (
                <rect
                    key={id}
                    x={pos.x - H / 2} y={pos.y - H / 2} width={H} height={H}
                    fill="white" stroke="#6366F1" strokeWidth={sw}
                />
            ))}
            <line
                x1={cx} y1={bbox.y}
                x2={rotateHandle.x} y2={rotateHandle.y}
                stroke="#6366F1" strokeWidth={sw}
            />
            <circle
                cx={rotateHandle.x} cy={rotateHandle.y} r={H / 2}
                fill="white" stroke="#6366F1" strokeWidth={sw}
            />
        </g>
    );
}

// ?�?�?� ?�택 ?�이???�퍼 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

function hitTestElement(el: CanvasElement, cx: number, cy: number): boolean {
    const bbox = elementBoundingBox(el);
    const pad  = 4;
    return cx >= bbox.x - pad && cx <= bbox.x + bbox.width  + pad &&
           cy >= bbox.y - pad && cy <= bbox.y + bbox.height + pad;
}

function findTopElement(els: readonly CanvasElement[], cx: number, cy: number): CanvasElement | null {
    for (let i = els.length - 1; i >= 0; i--) {
        if (hitTestElement(els[i], cx, cy)) return els[i];
    }
    return null;
}

function hitHandleCanvas(geo: SelectionGeometry, cx: number, cy: number, zoom: number): HandleId | null {
    const R = 10 / zoom;
    if (Math.hypot(cx - geo.rotateHandle.x, cy - geo.rotateHandle.y) <= R) return "rotate";
    for (const id of ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const) {
        const h = geo.handles[id];
        if (Math.abs(cx - h.x) <= R && Math.abs(cy - h.y) <= R) return id;
    }
    return null;
}

function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i][0], yi = poly[i][1];
        const xj = poly[j][0], yj = poly[j][1];
        if (((yi > py) !== (yj > py)) && (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

function boxIntersects(bbox: BoundingBox, box: { x: number; y: number; w: number; h: number }): boolean {
    return bbox.x < box.x + box.w && bbox.x + bbox.width  > box.x &&
           bbox.y < box.y + box.h && bbox.y + bbox.height > box.y;
}

function computeMovePatch(el: CanvasElement, dx: number, dy: number): Partial<CanvasElement> {
    switch (el.type) {
        case "stroke":
            return { points: (el as StrokeElement).points.map(([x, y, p]) => [x + dx, y + dy, p] as [number, number, number]) };
        case "rect": case "ellipse": case "diamond":
            return { x: el.x + dx, y: el.y + dy };
        case "line": case "arrow":
            return { points: (el as LineElement).points.map(([x, y]) => [x + dx, y + dy] as [number, number]) };
        case "text":
        case "image":
            return { x: el.x + dx, y: el.y + dy };
        default: return {};
    }
}

function computeResizePatch(el: CanvasElement, origBbox: BoundingBox, newBbox: BoundingBox): Partial<CanvasElement> {
    const scaleX = origBbox.width  > 0 ? newBbox.width  / origBbox.width  : 1;
    const scaleY = origBbox.height > 0 ? newBbox.height / origBbox.height : 1;
    function scalePoint(x: number, y: number): [number, number] {
        return [newBbox.x + (x - origBbox.x) * scaleX, newBbox.y + (y - origBbox.y) * scaleY];
    }
    switch (el.type) {
        case "rect": case "ellipse": case "diamond": case "image":
            return { x: newBbox.x, y: newBbox.y, width: newBbox.width, height: newBbox.height };
        case "line": case "arrow":
            return { points: (el as LineElement).points.map(([x, y]) => scalePoint(x, y) as [number, number]) };
        case "stroke":
            return { points: (el as StrokeElement).points.map(([x, y, p]) => [...scalePoint(x, y), p] as [number, number, number]) };
        case "text":
            return { x: newBbox.x, y: newBbox.y, maxWidth: newBbox.width };
        default: return {};
    }
}

function computeRotatePatch(
    el: CanvasElement,
    newRotation: number,
    deltaRotation: number,
    pivot: { x: number; y: number },
): Partial<CanvasElement> {
    const cos = Math.cos(deltaRotation);
    const sin = Math.sin(deltaRotation);
    function rotPt(x: number, y: number): [number, number] {
        const dx = x - pivot.x;
        const dy = y - pivot.y;
        return [pivot.x + dx * cos - dy * sin, pivot.y + dx * sin + dy * cos];
    }
    switch (el.type) {
        case "rect": case "ellipse": case "diamond": case "image": {
            const w = (el as RectElement | ImageElement).width;
            const h = (el as RectElement | ImageElement).height;
            const [ncx, ncy] = rotPt(el.x + w / 2, el.y + h / 2);
            return { x: ncx - w / 2, y: ncy - h / 2, rotation: newRotation };
        }
        case "text": {
            const [nx, ny] = rotPt(el.x, el.y);
            return { x: nx, y: ny, rotation: newRotation };
        }
        case "stroke": {
            return {
                points: (el as StrokeElement).points.map(([x, y, p]) => {
                    const [rx, ry] = rotPt(x, y);
                    return [rx, ry, p] as [number, number, number];
                }),
            };
        }
        case "line": case "arrow": {
            const pts = (el as LineElement).points.map(([x, y]) => rotPt(x, y) as [number, number]);
            return { points: pts, x: pts[0][0], y: pts[0][1] };
        }
        default: return {};
    }
}

function duplicateElement(el: CanvasElement, offset = 16): CanvasElement {
    const now   = Date.now();
    const newId = createElementId();
    switch (el.type) {
        case "stroke":
            return { ...el, id: newId, zIndex: now, points: (el as StrokeElement).points.map(([x, y, p]) => [x + offset, y + offset, p] as [number, number, number]) };
        case "rect": case "ellipse": case "diamond":
            return { ...el, id: newId, zIndex: now, x: el.x + offset, y: el.y + offset };
        case "line": case "arrow":
            return { ...el, id: newId, zIndex: now, points: (el as LineElement).points.map(([x, y]) => [x + offset, y + offset] as [number, number]) };
        case "text":
        case "image":
            return { ...el, id: newId, zIndex: now, x: el.x + offset, y: el.y + offset };
    }
}

// ?�?�?� 메인 컴포?�트 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

export default function PpCanvas({ initialDoc, onSave, className, exportFilename = "canvas" }: PpCanvasProps) {
    // ?�?� UI ?�태
    const [elements,   setElements]   = useState<CanvasElement[]>([]);
    const [viewport,   setViewport]   = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
    const [tool,       setTool]       = useState<ToolMode>({ mode: "stroke", pen: "pen", color: "#1e1e1e", size: 8, opacity: 100 });
    const [canUndo,    setCanUndo]    = useState(false);
    const [canRedo,    setCanRedo]    = useState(false);
    const [background, setBackground] = useState<BackgroundTemplate>("blank");
    const [ghostShape, setGhostShape] = useState<GhostShape | null>(null);
    const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

    // ?�?� ?�택 UI ?�태
    const [selectedIds,     setSelectedIds]     = useState<string[]>([]);
    const [boxSelectRect,   setBoxSelectRect]   = useState<{ x: number; y: number; w: number; h: number } | null>(null);
    const [resizePreviewGeo, setResizePreviewGeo] = useState<SelectionGeometry | null>(null);

    // ?�?� DOM ?�퍼?�스
    const containerRef    = useRef<HTMLDivElement>(null);
    const svgRef          = useRef<SVGSVGElement>(null);
    const overlayRef      = useRef<HTMLCanvasElement>(null);
    const selectedGroupRef   = useRef<SVGGElement>(null);
    const selOverlayGroupRef = useRef<SVGGElement>(null);

    // ?�?� ?�진/?�터?�션 ?�퍼?�스
    const engineRef    = useRef<CanvasEngine | null>(null);
    const panZoomRef   = useRef<PanZoomController | null>(null);
    const palmRef      = useRef<PalmRejection>(new PalmRejection());

    const saveTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileInputRef  = useRef<HTMLInputElement>(null);

    // ?�?� stale-closure 방�? ref
    const toolRef         = useRef<ToolMode>(tool);
    const viewportRef     = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });
    const selectedIdsRef  = useRef<string[]>([]);

    // 올가미(lasso) 상태
    const [lassoPoints, setLassoPoints] = useState<[number, number][]>([]);
    const lassoPointsRef = useRef<[number, number][]>([]);
    const isLassoingRef  = useRef(false);

    // ?�?� ?�택 ?�래�??�태 머신
    interface SelDrag {
        mode: "none" | "down" | "box" | "move" | "resize" | "rotate";
        startCx: number;
        startCy: number;
        handle?: Exclude<HandleId, "rotate">;
        origElements: Map<string, CanvasElement>;
        origBbox?: BoundingBox;
        origRotation?: number;
        origPivot?: { x: number; y: number };
        didMove: boolean;
    }
    const selDragRef = useRef<SelDrag>({
        mode: "none", startCx: 0, startCy: 0,
        origElements: new Map(), didMove: false,
    });

    // ?�?� ?�스???�집 ?�태
    const [editingTextId,  setEditingTextId]  = useState<string | null>(null);
    const [editingText,    setEditingText]    = useState<string>("");
    const [editingPos,     setEditingPos]     = useState<{ canvasX: number; canvasY: number; screenX: number; screenY: number } | null>(null);
    const textareaRef    = useRef<HTMLTextAreaElement>(null);
    const editingIdRef   = useRef<string | null>(null);
    const editingTextRef = useRef<string>("");
    const editingPosRef  = useRef<{ canvasX: number; canvasY: number; screenX: number; screenY: number } | null>(null);
    const lastColorRef   = useRef<string>("#1e1e1e");

    // ?�?� ???�로???�태
    const livePointsRef = useRef<[number, number, number][]>([]);
    const isDrawingRef  = useRef(false);
    const rafRef        = useRef<number | null>(null);

    // ?�?� ?�형 ?�래�??�태
    const shapeStartRef = useRef<{ cx: number; cy: number; shiftKey: boolean } | null>(null);

    // toolRef ?�기??    useEffect(() => { toolRef.current = tool; }, [tool]);

    // ?�?� 1. ?�진 초기???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    useEffect(() => {
        const engine = new CanvasEngine(initialDoc);
        engineRef.current = engine;

        const initVp: Viewport = initialDoc?.viewport ?? { x: 0, y: 0, zoom: 1 };
        viewportRef.current = initVp;
        setViewport({ ...initVp });
        setElements([...engine.serialize().elements]);
        setBackground(engine.serialize().background);

        const panZoom = new PanZoomController(initVp, (vp) => {
            viewportRef.current = vp;
            setViewport({ ...vp });
        });
        panZoomRef.current = panZoom;

        const unsubChange = engine.on("change", () => {
            const doc = engine.serialize();
            const ids = new Set(doc.elements.map(e => e.id));
            setSelectedIds(prev => {
                const next = prev.filter(id => ids.has(id));
                selectedIdsRef.current = next;
                return next;
            });
            setElements([...doc.elements]);
            setBackground(doc.background);
            setCanUndo(engine.canUndo());
            setCanRedo(engine.canRedo());
            scheduleSave();
        });

        return () => {
            unsubChange();
            engine.destroy();
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ?�?� 2. ResizeObserver ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const ro = new ResizeObserver((entries) => {
            const { width: w, height: h } = entries[0].contentRect;
            setContainerSize({ w, h });

            const canvas = overlayRef.current;
            if (canvas) {
                const dpr = window.devicePixelRatio ?? 1;
                canvas.width  = w * dpr;
                canvas.height = h * dpr;
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // ?�?� 3. ??�?(passive:false ?�수) ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            const rect = el.getBoundingClientRect();
            panZoomRef.current?.onWheelZoom(e.deltaY, {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    // ?�?� 4. ?�보???�축???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (textareaRef.current && document.activeElement === textareaRef.current) return;
            const eng = engineRef.current;
            if (!eng) return;
            if (e.key === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
                eng.undo();
                setCanUndo(eng.canUndo());
                setCanRedo(eng.canRedo());
                setElements([...eng.serialize().elements]);
            } else if (
                (e.key === "y" && (e.ctrlKey || e.metaKey)) ||
                (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey)
            ) {
                eng.redo();
                setCanUndo(eng.canUndo());
                setCanRedo(eng.canRedo());
                setElements([...eng.serialize().elements]);
            }

            // 선택 모드 단축키
            const ids = selectedIdsRef.current;
            if (ids.length > 0) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    e.preventDefault();
                    eng.removeElements(ids);
                    selectedIdsRef.current = [];
                    setSelectedIds([]);
                } else if (e.key === "d" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    const els = eng.serialize().elements;
                    const dups = els.filter(el => ids.includes(el.id)).map(el => duplicateElement(el));
                    eng.addElements(dups);
                    const newIds = dups.map(el => el.id);
                    selectedIdsRef.current = newIds;
                    setSelectedIds(newIds);
                } else if (e.key === "b" && (e.ctrlKey || e.metaKey) && ids.length === 1) {
                    e.preventDefault();
                    const el = eng.serialize().elements.find(x => x.id === ids[0]);
                    if (el?.type === "text") { eng.updateElement(ids[0], { bold: !el.bold }); setElements([...eng.serialize().elements]); }
                } else if (e.key === "i" && (e.ctrlKey || e.metaKey) && ids.length === 1) {
                    e.preventDefault();
                    const el = eng.serialize().elements.find(x => x.id === ids[0]);
                    if (el?.type === "text") { eng.updateElement(ids[0], { italic: !el.italic }); setElements([...eng.serialize().elements]); }
                } else if (e.key === "]" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (e.shiftKey) { eng.bringToFront(ids); } else { eng.bringForward(ids); }
                    setElements([...eng.serialize().elements]);
                } else if (e.key === "[" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    if (e.shiftKey) { eng.sendToBack(ids); } else { eng.sendBackward(ids); }
                    setElements([...eng.serialize().elements]);
                }
            }
            if (e.key === "Escape") {
                selectedIdsRef.current = [];
                setSelectedIds([]);
                setBoxSelectRect(null);
                selDragRef.current = { mode: "none", startCx: 0, startCy: 0, origElements: new Map(), didMove: false };
            }
        };

        const onPaste = async (e: ClipboardEvent) => {
            if (textareaRef.current && document.activeElement === textareaRef.current) return;
            const items = Array.from(e.clipboardData?.items ?? []);
            const imgItem = items.find((it) => it.type.startsWith("image/"));
            if (!imgItem) return;
            e.preventDefault();
            const file = imgItem.getAsFile();
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const src = ev.target?.result as string;
                if (!src) return;
                const img = new Image();
                img.onload = () => {
                    const vp  = viewportRef.current;
                    const cw  = containerRef.current?.clientWidth  ?? 800;
                    const ch  = containerRef.current?.clientHeight ?? 600;
                    const maxW = (cw / vp.zoom) * 0.6;
                    const maxH = (ch / vp.zoom) * 0.6;
                    const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
                    const w = img.naturalWidth  * scale;
                    const h = img.naturalHeight * scale;
                    const cx = vp.x + cw / vp.zoom / 2 - w / 2;
                    const cy = vp.y + ch / vp.zoom / 2 - h / 2;
                    const now = Date.now();
                    const el: ImageElement = {
                        id: createElementId(), type: "image", zIndex: now,
                        x: cx, y: cy, width: w, height: h,
                        rotation: 0, opacity: 100,
                        createdAt: now, updatedAt: now,
                        src,
                    };
                    engineRef.current?.addElement(el);
                };
                img.src = src;
            };
            reader.readAsDataURL(file);
        };

        window.addEventListener("keydown", onKey);
        window.addEventListener("paste", onPaste);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("paste", onPaste);
        };
    }, []);

    // 이미지 삽입 핸들러
    function handleInsertImage() {
        fileInputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        const reader = new FileReader();
        reader.onload = (ev) => {
            const src = ev.target?.result as string;
            if (!src) return;
            const img = new Image();
            img.onload = () => {
                const vp  = viewportRef.current;
                const cw  = containerRef.current?.clientWidth  ?? 800;
                const ch  = containerRef.current?.clientHeight ?? 600;
                const maxW = (cw / vp.zoom) * 0.6;
                const maxH = (ch / vp.zoom) * 0.6;
                const scale = Math.min(1, maxW / img.naturalWidth, maxH / img.naturalHeight);
                const w = img.naturalWidth  * scale;
                const h = img.naturalHeight * scale;
                const cx = vp.x + cw / vp.zoom / 2 - w / 2;
                const cy = vp.y + ch / vp.zoom / 2 - h / 2;
                const now = Date.now();
                const el: ImageElement = {
                    id: createElementId(), type: "image", zIndex: now,
                    x: cx, y: cy, width: w, height: h,
                    rotation: 0, opacity: 100,
                    createdAt: now, updatedAt: now,
                    src,
                };
                engineRef.current?.addElement(el);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
    }

    // PNG / SVG 내보내기
    async function handleExport(format: "png" | "svg") {
        const eng = engineRef.current;
        if (!eng) return;
        const doc = eng.serialize();
        const name = exportFilename;
        if (format === "svg") {
            downloadSVG(doc, `${name}.svg`);
        } else {
            try {
                const dataUrl = await exportToPNG(doc, 2);
                const a = document.createElement("a");
                a.href     = dataUrl;
                a.download = `${name}.png`;
                a.click();
            } catch (err) {
                console.error("PNG 내보내기 실패:", err);
            }
        }
    }

    // ?�?� 5. ?�동 ?�???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function scheduleSave() {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            const eng = engineRef.current;
            if (!eng || !onSave) return;
            eng.setViewport(viewportRef.current);
            onSave(eng.serialize());
        }, 1500);
    }

    // ?�?� 6. RAF ?�더 루프 (?�이�??? ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function startRaf() {
        if (rafRef.current !== null) return;

        function tick() {
            if (!isDrawingRef.current) { rafRef.current = null; return; }

            const canvas = overlayRef.current;
            const svg    = svgRef.current;
            const t      = toolRef.current;
            if (canvas && svg && t.mode === "stroke") {
                const ctx = makeLiveContext(canvas, svg);
                if (ctx) {
                    const profile = getPenProfile(t.pen);
                    renderLiveStroke(ctx, livePointsRef.current, {
                        pen:              t.pen,
                        color:            t.color,
                        size:             t.size,
                        streamline:       profile.streamline,
                        isRealPressure:   palmRef.current.isRealPressure(),
                        opacity:          t.opacity / 100,
                    });
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        }
        rafRef.current = requestAnimationFrame(tick);
    }

    // ?�?� 7. ?�정: ??커밋 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function commitStroke(t: ToolMode & { mode: "stroke" }) {
        const points = livePointsRef.current;
        if (points.length < 2) return;

        const profile = getPenProfile(t.pen);
        const now = Date.now();
        const el: StrokeElement = {
            id:         createElementId(),
            type:       "stroke",
            zIndex:     now,
            x:          0,
            y:          0,
            rotation:   0,
            createdAt:  now,
            updatedAt:  now,
            points,
            color:      t.color,
            size:       t.size,
            opacity:    t.opacity,
            pen:        t.pen,
            streamline: profile.streamline,
        };
        engineRef.current?.addElement(el);

        // 오버레이 클리어
        const canvas = overlayRef.current;
        const svg    = svgRef.current;
        if (canvas && svg) {
            const ctx = makeLiveContext(canvas, svg);
            if (ctx) clearLiveStroke(ctx);
        }
    }

    // ?�?� 8. ?�정: ?�형 커밋 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function commitShape(
        kind: ShapeKind, x0: number, y0: number,
        x1: number, y1: number,
        color: string, shiftKey: boolean
    ) {
        const w = Math.abs(x1 - x0);
        const h = Math.abs(y1 - y0);
        if (w < 4 && h < 4) return; // ?�무 ?��? ?�형 무시

        const el = buildShapeElement(kind, x0, y0, x1, y1, color, shiftKey, Date.now());
        engineRef.current?.addElement(el);
        setGhostShape(null);
    }

    // ?�?� 9. 지?�개 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function eraseAt(cx: number, cy: number) {
        const eng = engineRef.current;
        if (!eng) return;
        const els = eng.serialize().elements;

        // ?�에?��???(topmost) ?�색
        for (let i = els.length - 1; i >= 0; i--) {
            const bbox = elementBoundingBox(els[i]);
            if (
                cx >= bbox.x && cx <= bbox.x + bbox.width &&
                cy >= bbox.y && cy <= bbox.y + bbox.height
            ) {
                eng.removeElement(els[i].id);
                return;
            }
        }
    }

    // ?�?� 10. 좌표 ?�퍼 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function clientToCanvas(clientX: number, clientY: number): { x: number; y: number } {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return { x: 0, y: 0 };
        return screenToCanvas(
            { x: clientX - rect.left, y: clientY - rect.top },
            viewportRef.current,
        );
    }

    // ?�?� 10.5 ?�스???�집 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function startTextEdit(canvasX: number, canvasY: number, existingEl?: TextElement) {
        const vp  = viewportRef.current;
        const cx  = existingEl ? existingEl.x : canvasX;
        const cy  = existingEl ? existingEl.y : canvasY;
        const pos = {
            canvasX: cx, canvasY: cy,
            screenX: (cx - vp.x) * vp.zoom,
            screenY: (cy - vp.y) * vp.zoom,
        };
        const id   = existingEl?.id ?? null;
        const text = existingEl?.text ?? "";
        editingIdRef.current   = id;
        editingTextRef.current = text;
        editingPosRef.current  = pos;
        setEditingTextId(id);
        setEditingText(text);
        setEditingPos(pos);
        setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.select(); }, 0);
    }

    function commitTextEdit() {
        const id   = editingIdRef.current;
        const text = editingTextRef.current;
        const pos  = editingPosRef.current;
        const eng  = engineRef.current;

        if (id) {
            if (text.trim()) {
                eng?.updateElement(id, { text });
            } else {
                eng?.removeElement(id);
            }
        } else if (text.trim() && pos && eng) {
            const el: TextElement = {
                id:         createElementId(),
                type:       "text",
                zIndex:     Date.now(),
                x:          pos.canvasX,
                y:          pos.canvasY,
                rotation:   0,
                opacity:    100,
                createdAt:  Date.now(),
                updatedAt:  Date.now(),
                text,
                fontSize:   16,
                fontFamily: "system-ui, sans-serif",
                color:      lastColorRef.current,
                align:      "left",
            };
            eng.addElement(el);
        }

        editingIdRef.current   = null;
        editingTextRef.current = "";
        editingPosRef.current  = null;
        setEditingTextId(null);
        setEditingText("");
        setEditingPos(null);
    }

    function cancelTextEdit() {
        editingIdRef.current   = null;
        editingTextRef.current = "";
        editingPosRef.current  = null;
        setEditingTextId(null);
        setEditingText("");
        setEditingPos(null);
    }

    // ?�?� 11. ?�택 모드 ?�인???�들???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function onPointerDownSelection(e: React.PointerEvent, cx: number, cy: number) {
        const eng = engineRef.current;
        if (!eng) return;
        const els  = eng.serialize().elements;
        const zoom = viewportRef.current.zoom;
        const selEls = els.filter(el => selectedIdsRef.current.includes(el.id));
        const currentGeo = selEls.length > 0 ? selectionGeometry(selEls) : null;

        if (currentGeo) {
            const hid = hitHandleCanvas(currentGeo, cx, cy, zoom);
            if (hid === "rotate") {
                const origElements = new Map(selEls.map(el => [el.id, el]));
                selDragRef.current = {
                    mode: "rotate", startCx: cx, startCy: cy,
                    origElements, origBbox: currentGeo.bbox,
                    origRotation: currentGeo.rotation,
                    origPivot: currentGeo.pivot,
                    didMove: false,
                };
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                return;
            }
            if (hid) {
                const origElements = new Map(selEls.map(el => [el.id, el]));
                selDragRef.current = {
                    mode: "resize", startCx: cx, startCy: cy,
                    handle: hid as Exclude<HandleId, "rotate">,
                    origElements, origBbox: currentGeo.bbox, didMove: false,
                };
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                return;
            }
        }

        const topEl = findTopElement(els, cx, cy);
        if (topEl) {
            if (e.shiftKey) {
                const next = selectedIdsRef.current.includes(topEl.id)
                    ? selectedIdsRef.current.filter(id => id !== topEl.id)
                    : [...selectedIdsRef.current, topEl.id];
                selectedIdsRef.current = next;
                setSelectedIds(next);
            } else {
                if (!selectedIdsRef.current.includes(topEl.id)) {
                    selectedIdsRef.current = [topEl.id];
                    setSelectedIds([topEl.id]);
                }
                const currentIds = selectedIdsRef.current;
                const origElements = new Map(els.filter(el => currentIds.includes(el.id)).map(el => [el.id, el]));
                selDragRef.current = { mode: "down", startCx: cx, startCy: cy, origElements, didMove: false };
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            }
            return;
        }

        if (!e.shiftKey) { selectedIdsRef.current = []; setSelectedIds([]); }
        selDragRef.current = { mode: "down", startCx: cx, startCy: cy, origElements: new Map(), didMove: false };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onPointerMoveSelection(e: React.PointerEvent, cx: number, cy: number) {
        const drag = selDragRef.current;
        if (drag.mode === "none") return;
        const dx = cx - drag.startCx;
        const dy = cy - drag.startCy;
        const zoom = viewportRef.current.zoom;
        const threshold = 3 / zoom;

        if (drag.mode === "rotate") {
            if (!drag.origPivot) return;
            const newRot = applyRotation(
                drag.origPivot, drag.startCx, drag.startCy, cx, cy,
                drag.origRotation ?? 0, e.shiftKey,
            );
            const deg = (newRot * 180) / Math.PI;
            const { x: px, y: py } = drag.origPivot;
            const t = `rotate(${deg} ${px} ${py})`;
            selectedGroupRef.current?.setAttribute("transform", t);
            selOverlayGroupRef.current?.setAttribute("transform", t);
            selDragRef.current.didMove = true;
            return;
        }

        if (drag.mode === "resize") {
            if (!drag.origBbox || !drag.handle) return;
            const newBbox = applyResize(drag.origBbox, drag.handle, dx, dy, e.shiftKey);
            const fakeEls = Array.from(drag.origElements.values())
                .map(el => ({ ...el, ...computeResizePatch(el, drag.origBbox!, newBbox) })) as CanvasElement[];
            setResizePreviewGeo(selectionGeometry(fakeEls));

            // 실시간으로 선택 엘리먼트도 시각적으로 리사이즈
            const ob = drag.origBbox;
            const scaleX = ob.width  > 0 ? newBbox.width  / ob.width  : 1;
            const scaleY = ob.height > 0 ? newBbox.height / ob.height : 1;
            const t = `translate(${newBbox.x} ${newBbox.y}) scale(${scaleX} ${scaleY}) translate(${-ob.x} ${-ob.y})`;
            selectedGroupRef.current?.setAttribute("transform", t);

            selDragRef.current.didMove = true;
            return;
        }

        if (drag.mode === "down" && Math.hypot(dx, dy) < threshold) return;

        if (drag.mode === "down" || drag.mode === "move") {
            if (drag.origElements.size > 0) {
                selDragRef.current.mode = "move";
                selDragRef.current.didMove = true;
                selectedGroupRef.current?.setAttribute("transform", `translate(${dx} ${dy})`);
                selOverlayGroupRef.current?.setAttribute("transform", `translate(${dx} ${dy})`);
            } else {
                selDragRef.current.mode = "box";
                setBoxSelectRect({
                    x: Math.min(drag.startCx, cx), y: Math.min(drag.startCy, cy),
                    w: Math.abs(dx), h: Math.abs(dy),
                });
            }
            return;
        }

        if (drag.mode === "box") {
            setBoxSelectRect({
                x: Math.min(drag.startCx, cx), y: Math.min(drag.startCy, cy),
                w: Math.abs(dx), h: Math.abs(dy),
            });
        }
    }

    function onPointerUpSelection(e: React.PointerEvent, cx: number, cy: number) {
        const drag = selDragRef.current;
        const eng  = engineRef.current;
        if (!eng) return;

        if (drag.mode === "move" && drag.didMove) {
            const dx = cx - drag.startCx;
            const dy = cy - drag.startCy;
            eng.updateElementsBatch(
                Array.from(drag.origElements.entries()).map(([id, origEl]) => ({
                    id, patch: computeMovePatch(origEl, dx, dy),
                })),
            );
            selectedGroupRef.current?.setAttribute("transform", "");
            selOverlayGroupRef.current?.setAttribute("transform", "");
        } else if (drag.mode === "resize" && drag.didMove && drag.origBbox && drag.handle) {
            const newBbox = applyResize(drag.origBbox, drag.handle, cx - drag.startCx, cy - drag.startCy, e.shiftKey);
            eng.updateElementsBatch(
                Array.from(drag.origElements.entries()).map(([id, origEl]) => ({
                    id, patch: computeResizePatch(origEl, drag.origBbox!, newBbox),
                })),
            );
            selectedGroupRef.current?.setAttribute("transform", "");
            setResizePreviewGeo(null);
        } else if (drag.mode === "rotate" && drag.didMove && drag.origPivot) {
            const newRot = applyRotation(
                drag.origPivot, drag.startCx, drag.startCy, cx, cy,
                drag.origRotation ?? 0, e.shiftKey,
            );
            const deltaRot = newRot - (drag.origRotation ?? 0);
            eng.updateElementsBatch(
                Array.from(drag.origElements.entries()).map(([id, origEl]) => ({
                    id, patch: computeRotatePatch(origEl, newRot, deltaRot, drag.origPivot!),
                })),
            );
            selectedGroupRef.current?.setAttribute("transform", "");
            selOverlayGroupRef.current?.setAttribute("transform", "");
        } else if (drag.mode === "box") {
            const box = {
                x: Math.min(drag.startCx, cx), y: Math.min(drag.startCy, cy),
                w: Math.abs(cx - drag.startCx),  h: Math.abs(cy - drag.startCy),
            };
            const selected = eng.serialize().elements
                .filter(el => boxIntersects(elementBoundingBox(el), box))
                .map(el => el.id);
            const merged = e.shiftKey ? [...new Set([...selectedIdsRef.current, ...selected])] : selected;
            selectedIdsRef.current = merged;
            setSelectedIds(merged);
            setBoxSelectRect(null);
        }

        selDragRef.current = { mode: "none", startCx: 0, startCy: 0, origElements: new Map(), didMove: false };
    }

    // ?�?� 12. ?�인???�들???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function onPointerDown(e: React.PointerEvent) {
        palmRef.current.onPointerDown(e.nativeEvent);
        if (palmRef.current.shouldReject(e.nativeEvent)) return;

        const isTouchPointer = e.pointerType === "touch";
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        if (isTouchPointer) {
            panZoomRef.current?.onTouchDown(e.pointerId, screen);
            return;
        }

        // ??모드
        if (toolRef.current.mode === "pan") {
            panZoomRef.current?.onTouchDown(e.pointerId, screen);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            return;
        }

        const t = toolRef.current;
        const canvas = clientToCanvas(e.clientX, e.clientY);

        if (t.mode === "selection") {
            onPointerDownSelection(e, canvas.x, canvas.y);
        } else if (t.mode === "lasso") {
            isLassoingRef.current = true;
            lassoPointsRef.current = [[canvas.x, canvas.y]];
            setLassoPoints([[canvas.x, canvas.y]]);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } else if (t.mode === "stroke") {
            isDrawingRef.current = true;
            livePointsRef.current = [[canvas.x, canvas.y, e.pressure || 0.5]];
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
            startRaf();
        } else if (t.mode === "shape") {
            shapeStartRef.current = { cx: canvas.x, cy: canvas.y, shiftKey: e.shiftKey };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } else if (t.mode === "eraser") {
            eraseAt(canvas.x, canvas.y);
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } else if (t.mode === "text") {
            if (editingPosRef.current) {
                commitTextEdit();
                return;
            }
            const els = engineRef.current?.serialize().elements ?? [];
            const topEl = findTopElement(els, canvas.x, canvas.y);
            if (topEl?.type === "text") {
                startTextEdit(canvas.x, canvas.y, topEl as TextElement);
            } else {
                startTextEdit(canvas.x, canvas.y);
            }
        }
    }

    function onPointerMove(e: React.PointerEvent) {
        if (palmRef.current.shouldReject(e.nativeEvent)) return;

        const isTouchPointer = e.pointerType === "touch";
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const screen = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        if (isTouchPointer || toolRef.current.mode === "pan") {
            const moved = panZoomRef.current?.onTouchMove(e.pointerId, screen);
            if (moved) return;
        }

        const t = toolRef.current;
        const canvas = clientToCanvas(e.clientX, e.clientY);

        if (t.mode === "selection") {
            onPointerMoveSelection(e, canvas.x, canvas.y);
        } else if (t.mode === "lasso" && isLassoingRef.current) {
            lassoPointsRef.current = [...lassoPointsRef.current, [canvas.x, canvas.y]];
            // 6포인트마다 React 상태 업데이트 (너무 잦은 리렌더 방지)
            if (lassoPointsRef.current.length % 6 === 0) {
                setLassoPoints([...lassoPointsRef.current]);
            }
        } else if (t.mode === "stroke" && isDrawingRef.current) {
            livePointsRef.current.push([canvas.x, canvas.y, e.pressure || 0.5]);
        } else if (t.mode === "shape" && shapeStartRef.current) {
            const { cx, cy } = shapeStartRef.current;
            setGhostShape({
                x0: cx, y0: cy,
                x1: canvas.x, y1: canvas.y,
                shape: t.shape as ShapeKind,
                color: t.color,
                shiftKey: e.shiftKey,
            });
        } else if (t.mode === "eraser" && e.buttons > 0) {
            eraseAt(canvas.x, canvas.y);
        }
    }

    function onPointerUp(e: React.PointerEvent) {
        palmRef.current.onPointerUp(e.nativeEvent);

        const isTouchPointer = e.pointerType === "touch";

        if (isTouchPointer || toolRef.current.mode === "pan") {
            panZoomRef.current?.onTouchUp(e.pointerId);
        }

        const t = toolRef.current;

        if (t.mode === "selection") {
            const canvas = clientToCanvas(e.clientX, e.clientY);
            onPointerUpSelection(e, canvas.x, canvas.y);
        } else if (t.mode === "lasso" && isLassoingRef.current) {
            isLassoingRef.current = false;
            const pts = lassoPointsRef.current;
            lassoPointsRef.current = [];
            setLassoPoints([]);
            if (pts.length >= 3 && engineRef.current) {
                const selected = engineRef.current.serialize().elements
                    .filter(el => {
                        const bbox = elementBoundingBox(el);
                        const cx = bbox.x + bbox.width  / 2;
                        const cy = bbox.y + bbox.height / 2;
                        return pointInPolygon(cx, cy, pts);
                    })
                    .map(el => el.id);
                const merged = e.shiftKey
                    ? [...new Set([...selectedIdsRef.current, ...selected])]
                    : selected;
                selectedIdsRef.current = merged;
                setSelectedIds(merged);
            }
        } else if (t.mode === "stroke" && isDrawingRef.current) {
            isDrawingRef.current = false;
            commitStroke(t as ToolMode & { mode: "stroke" });
            livePointsRef.current = [];
        } else if (t.mode === "shape" && shapeStartRef.current) {
            const { cx, cy, shiftKey } = shapeStartRef.current;
            const canvas = clientToCanvas(e.clientX, e.clientY);
            commitShape(
                t.shape as ShapeKind,
                cx, cy, canvas.x, canvas.y,
                t.color, shiftKey || e.shiftKey,
            );
            shapeStartRef.current = null;
        }
    }

    function onPointerCancel(e: React.PointerEvent) {
        palmRef.current.onPointerUp(e.nativeEvent);
        isDrawingRef.current = false;
        livePointsRef.current = [];
        shapeStartRef.current = null;
        setGhostShape(null);
        isLassoingRef.current = false;
        lassoPointsRef.current = [];
        setLassoPoints([]);

        const canvas = overlayRef.current;
        const svg    = svgRef.current;
        if (canvas && svg) {
            const ctx = makeLiveContext(canvas, svg);
            if (ctx) clearLiveStroke(ctx);
        }
    }

    // ?�?� 커서 ?��????�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    const cursorStyle = useCallback((): string => {
        switch (tool.mode) {
            case "pan":    return "grab";
            case "eraser": return "cell";
            case "stroke": return "crosshair";
            case "shape":  return "crosshair";
            case "lasso":  return "crosshair";
            case "text":   return "text";
            default:       return "default";
        }
    }, [tool.mode]);

    // ?�?� ??변�??�들???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function handleToolChange(t: ToolMode) {
        if (t.mode === "stroke" || t.mode === "shape") lastColorRef.current = t.color;
        setTool(t);
        toolRef.current = t;
    }

    // ?�?� 배경 변�??�들???�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function handleBgChange(bg: BackgroundTemplate) {
        engineRef.current?.setBackground(bg);
    }

    // ?�?� ?�블?�릭: ?�스???�집 진입 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    function handleDoubleClick(e: React.MouseEvent) {
        const t = toolRef.current;
        if (t.mode !== "selection" && t.mode !== "text") return;
        const canvas = clientToCanvas(e.clientX, e.clientY);
        const eng = engineRef.current;
        if (!eng) return;
        const topEl = findTopElement(eng.serialize().elements, canvas.x, canvas.y);
        if (topEl?.type === "text") {
            selectedIdsRef.current = [];
            setSelectedIds([]);
            startTextEdit(canvas.x, canvas.y, topEl as TextElement);
        }
    }

    // ?�?� SVG viewBox ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    const zoom = viewport.zoom;
    const vw   = containerSize.w / zoom;
    const vh   = containerSize.h / zoom;
    const viewBox = `${viewport.x} ${viewport.y} ${vw} ${vh}`;

    // ?�?� ?�택 지?�메?�리 (?�더?? ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    const selGeo: SelectionGeometry | null = resizePreviewGeo ?? (() => {
        if (selectedIds.length === 0) return null;
        const selEls = elements.filter(el => selectedIds.includes(el.id));
        if (selEls.length === 0) return null;
        return selectionGeometry(selEls);
    })();

    // ?�?� ?�더 ?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�?�

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden w-full h-full ${className ?? ""}`}
            style={{
                cursor:      cursorStyle(),
                touchAction: "none",
                ...getBgStyle(background, viewport),
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onDoubleClick={handleDoubleClick}
        >
            {/* ?�정 ?�리먼트 SVG */}
            <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full"
                viewBox={viewBox}
                xmlns="http://www.w3.org/2000/svg"
                style={{ overflow: "visible" }}
            >
                {/* 비선???�리먼트 */}
                <g>
                    {elements.filter(el => !selectedIds.includes(el.id) && el.id !== editingTextId).map((el) => (
                        <ElementPath key={el.id} el={el} />
                    ))}
                </g>
                {/* ?�택???�리먼트 (?�동 ?�래�???DOM transform) */}
                <g ref={selectedGroupRef}>
                    {elements.filter(el => selectedIds.includes(el.id) && el.id !== editingTextId).map((el) => (
                        <ElementPath key={el.id} el={el} />
                    ))}
                </g>
                {/* ?�형 ?�래�??�리�?*/}
                {ghostShape && tool.mode === "shape" && (
                    <GhostPath ghost={ghostShape} />
                )}
                {/* 올가미 선택 경로 */}
                {lassoPoints.length >= 2 && (
                    <polyline
                        points={lassoPoints.map(([x, y]) => `${x},${y}`).join(" ")}
                        fill="#6366F1"
                        fillOpacity={0.08}
                        stroke="#6366F1"
                        strokeWidth={1.5 / zoom}
                        strokeDasharray={`${5 / zoom} ${3 / zoom}`}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                )}

                {/* 박스 ?�택 */}
                {boxSelectRect && (
                    <rect
                        x={boxSelectRect.x} y={boxSelectRect.y}
                        width={boxSelectRect.w} height={boxSelectRect.h}
                        fill="#6366F1" fillOpacity={0.08}
                        stroke="#6366F1" strokeWidth={1 / zoom}
                        strokeDasharray={`${4 / zoom} ${3 / zoom}`}
                    />
                )}
                {/* ?�택 ?�들 ?�버?�이 */}
                <g ref={selOverlayGroupRef}>
                    {selGeo && <SelectionOverlay geo={selGeo} zoom={zoom} />}
                </g>
            </svg>

            {/* ?�이�???Canvas 2D ?�버?�이 */}
            <canvas
                ref={overlayRef}
                className="absolute inset-0 pointer-events-none"
                style={{ width: containerSize.w, height: containerSize.h }}
            />

            {/* ?�스???�집 textarea ?�버?�이 */}
            {editingPos && (
                <textarea
                    ref={textareaRef}
                    value={editingText}
                    onChange={(e) => {
                        setEditingText(e.target.value);
                        editingTextRef.current = e.target.value;
                    }}
                    onBlur={commitTextEdit}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            cancelTextEdit();
                        }
                    }}
                    onInput={(e) => {
                        const ta = e.currentTarget;
                        ta.style.height = "auto";
                        ta.style.height = ta.scrollHeight + "px";
                        ta.style.width = "auto";
                        ta.style.width = Math.max(80, ta.scrollWidth + 8) + "px";
                    }}
                    style={{
                        position:     "absolute",
                        left:         editingPos.screenX,
                        top:          editingPos.screenY,
                        minWidth:     80,
                        fontSize:     `${16 * zoom}px`,
                        fontFamily:   "system-ui, sans-serif",
                        fontWeight:   (() => {
                            const el = engineRef.current?.serialize().elements.find(e => e.id === editingTextId);
                            return el?.type === "text" && el.bold ? "bold" : "normal";
                        })(),
                        fontStyle:    (() => {
                            const el = engineRef.current?.serialize().elements.find(e => e.id === editingTextId);
                            return el?.type === "text" && el.italic ? "italic" : "normal";
                        })(),
                        lineHeight:   1.4,
                        color:        lastColorRef.current,
                        background:   "rgba(255,255,255,0.85)",
                        border:       "1.5px dashed #6366F1",
                        borderRadius: 2,
                        outline:      "none",
                        resize:       "none",
                        padding:      "2px 4px",
                        zIndex:       60,
                        overflow:     "hidden",
                        whiteSpace:   "pre",
                    }}
                    rows={1}
                />
            )}

            {/* 텍스트 서식 바 — 단일 텍스트 선택 시 */}
            {(() => {
                if (selectedIds.length !== 1) return null;
                const selEl = elements.find(e => e.id === selectedIds[0]);
                if (!selEl || selEl.type !== "text") return null;
                const te = selEl as TextElement;
                if (!selGeo) return null;
                const barY = (selGeo.bbox.y - viewport.y) * zoom - 44;
                const barX = ((selGeo.bbox.x + selGeo.bbox.width / 2) - viewport.x) * zoom;
                const btn  = "flex items-center justify-center w-7 h-7 rounded transition-colors text-xs font-medium";
                const on   = "bg-[#6366F1] text-white";
                const off  = "text-neutral-300 hover:bg-white/10";
                const sep  = <div className="w-px h-5 bg-white/15 mx-0.5" />;
                return (
                    <div
                        className="absolute pointer-events-auto flex items-center gap-0.5 bg-neutral-900/95 backdrop-blur-sm border border-white/10 rounded-xl px-2 py-1 shadow-xl z-50 select-none"
                        style={{ left: barX, top: Math.max(4, barY), transform: "translateX(-50%)" }}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <button className={`${btn} font-bold ${te.bold ? on : off}`}
                            onMouseDown={(e) => { e.preventDefault(); engineRef.current?.updateElement(te.id, { bold: !te.bold }); setElements([...engineRef.current!.serialize().elements]); }}
                            title="굵게 (Ctrl+B)">B</button>
                        <button className={`${btn} italic ${te.italic ? on : off}`}
                            onMouseDown={(e) => { e.preventDefault(); engineRef.current?.updateElement(te.id, { italic: !te.italic }); setElements([...engineRef.current!.serialize().elements]); }}
                            title="기울임 (Ctrl+I)">I</button>
                        {sep}
                        {(["left","center","right"] as const).map(align => (
                            <button key={align} className={`${btn} ${te.align === align ? on : off}`}
                                onMouseDown={(e) => { e.preventDefault(); engineRef.current?.updateElement(te.id, { align }); setElements([...engineRef.current!.serialize().elements]); }}
                                title={align === "left" ? "왼쪽" : align === "center" ? "가운데" : "오른쪽"}>
                                {align === "left" ? "⇤" : align === "center" ? "↔" : "⇥"}
                            </button>
                        ))}
                        {sep}
                        <button className={`${btn} ${off}`}
                            onMouseDown={(e) => { e.preventDefault(); const fs = Math.max(8, te.fontSize - 2); engineRef.current?.updateElement(te.id, { fontSize: fs }); setElements([...engineRef.current!.serialize().elements]); }}
                            title="글자 작게">−</button>
                        <span className="text-xs text-neutral-400 min-w-[28px] text-center">{te.fontSize}</span>
                        <button className={`${btn} ${off}`}
                            onMouseDown={(e) => { e.preventDefault(); const fs = Math.min(96, te.fontSize + 2); engineRef.current?.updateElement(te.id, { fontSize: fs }); setElements([...engineRef.current!.serialize().elements]); }}
                            title="글자 크게">+</button>
                    </div>
                );
            })()}

            {/* 이미지 파일 입력 (hidden) */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* 툴바 */}
            <PpCanvasToolbar
                tool={tool}
                onToolChange={handleToolChange}
                canUndo={canUndo}
                onUndo={() => {
                    const eng = engineRef.current;
                    eng?.undo();
                    if (eng) {
                        setElements([...eng.serialize().elements]);
                        setCanUndo(eng.canUndo());
                        setCanRedo(eng.canRedo());
                    }
                }}
                canRedo={canRedo}
                onRedo={() => {
                    const eng = engineRef.current;
                    eng?.redo();
                    if (eng) {
                        setElements([...eng.serialize().elements]);
                        setCanUndo(eng.canUndo());
                        setCanRedo(eng.canRedo());
                    }
                }}
                background={background}
                onBgChange={handleBgChange}
                onInsertImage={handleInsertImage}
                onExport={handleExport}
            />
        </div>
    );
}
