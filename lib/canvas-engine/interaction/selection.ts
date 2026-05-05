// PP Canvas Engine — 선택·변형 핸들 계산 유틸
//
// 선택된 엘리먼트의 bounding box, 8 리사이즈 핸들, 회전 핸들 위치를 계산.
// stroke·shape·image·text 모두 동일 인터페이스로 처리.
//
// wrapper 컴포넌트는 이 결과를 받아 SVG로 렌더 (점선 outline + 핸들 사각형 + 회전 그립).

import type { CanvasElement, StrokeElement } from "../types";

export type HandleId = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "rotate";

export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SelectionGeometry {
    bbox: BoundingBox;
    /** 8 리사이즈 핸들 좌표 (회전 미반영 — 시각적 표시는 wrapper가 회전 행렬 적용) */
    handles: Record<Exclude<HandleId, "rotate">, { x: number; y: number }>;
    /** 회전 핸들 (상단 중앙에서 위로 24px) */
    rotateHandle: { x: number; y: number };
    /** rotation (라디안) — multi 선택 시 0 */
    rotation: number;
    /** rotation의 중심 (회전 적용 시 기준점) */
    pivot: { x: number; y: number };
}

const ROTATE_HANDLE_OFFSET = 24;

// ─── 단일 엘리먼트 bbox ─────────────────────────────────────────────────────

export function elementBoundingBox(el: CanvasElement): BoundingBox {
    switch (el.type) {
        case "stroke":
            return strokeBoundingBox(el);
        case "rect":
        case "ellipse":
        case "diamond":
        case "image":
            return { x: el.x, y: el.y, width: el.width, height: el.height };
        case "text": {
            const lines = el.text ? el.text.split("\n") : [""];
            const lineCount = Math.max(lines.length, 1);
            const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b, "");
            const estWidth = el.maxWidth ?? Math.max(longestLine.length * el.fontSize * 0.58, 20);
            return { x: el.x, y: el.y, width: estWidth, height: lineCount * el.fontSize * 1.4 };
        }
        case "line":
        case "arrow":
            return pointsBoundingBox(el.points);
    }
}

function strokeBoundingBox(s: StrokeElement): BoundingBox {
    if (s.points.length === 0) return { x: s.x, y: s.y, width: 0, height: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [px, py] of s.points) {
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function pointsBoundingBox(points: Array<[number, number]>): BoundingBox {
    if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [px, py] of points) {
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// ─── 다중 선택 union bbox ──────────────────────────────────────────────────

export function multiBoundingBox(els: CanvasElement[]): BoundingBox {
    if (els.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    if (els.length === 1) return elementBoundingBox(els[0]);

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of els) {
        const b = elementBoundingBox(el);
        if (b.x < minX) minX = b.x;
        if (b.y < minY) minY = b.y;
        if (b.x + b.width > maxX) maxX = b.x + b.width;
        if (b.y + b.height > maxY) maxY = b.y + b.height;
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// ─── 선택 geometry (bbox + 핸들 + 회전) ────────────────────────────────────

export function selectionGeometry(els: CanvasElement[]): SelectionGeometry | null {
    if (els.length === 0) return null;
    const bbox = multiBoundingBox(els);
    const rotation = els.length === 1 ? els[0].rotation : 0;
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    return {
        bbox,
        rotation,
        pivot: { x: cx, y: cy },
        handles: {
            nw: { x: bbox.x,                    y: bbox.y                    },
            n:  { x: bbox.x + bbox.width / 2,   y: bbox.y                    },
            ne: { x: bbox.x + bbox.width,       y: bbox.y                    },
            e:  { x: bbox.x + bbox.width,       y: bbox.y + bbox.height / 2  },
            se: { x: bbox.x + bbox.width,       y: bbox.y + bbox.height      },
            s:  { x: bbox.x + bbox.width / 2,   y: bbox.y + bbox.height      },
            sw: { x: bbox.x,                    y: bbox.y + bbox.height      },
            w:  { x: bbox.x,                    y: bbox.y + bbox.height / 2  },
        },
        rotateHandle: { x: cx, y: bbox.y - ROTATE_HANDLE_OFFSET },
    };
}

// ─── 핸들 hit-test ───────────────────────────────────────────────────────

const HANDLE_HIT_RADIUS = 8;

/** 화면 좌표 (xs, ys)가 어느 핸들을 가리키는지 — 없으면 null */
export function hitHandle(geo: SelectionGeometry, xs: number, ys: number): HandleId | null {
    if (Math.hypot(xs - geo.rotateHandle.x, ys - geo.rotateHandle.y) <= HANDLE_HIT_RADIUS + 2) {
        return "rotate";
    }
    for (const id of ["nw","n","ne","e","se","s","sw","w"] as const) {
        const h = geo.handles[id];
        if (Math.abs(xs - h.x) <= HANDLE_HIT_RADIUS && Math.abs(ys - h.y) <= HANDLE_HIT_RADIUS) {
            return id;
        }
    }
    return null;
}

// ─── 리사이즈 변환 ──────────────────────────────────────────────────────

/**
 * 핸들 드래그 결과로 새 bbox 계산. shift 누르면 종횡비 유지.
 * @param origBbox 드래그 시작 시점 bbox
 * @param handle 잡고 있는 핸들
 * @param dx 캔버스 좌표 델타
 * @param dy
 * @param maintainAspect shift 누름 (코너 핸들에서만 의미)
 */
export function applyResize(
    origBbox: BoundingBox,
    handle: Exclude<HandleId, "rotate">,
    dx: number,
    dy: number,
    maintainAspect: boolean,
): BoundingBox {
    let { x, y, width, height } = origBbox;

    if      (handle === "nw") { x += dx; y += dy; width -= dx; height -= dy; }
    else if (handle === "n")  { y += dy; height -= dy; }
    else if (handle === "ne") { width += dx; y += dy; height -= dy; }
    else if (handle === "e")  { width += dx; }
    else if (handle === "se") { width += dx; height += dy; }
    else if (handle === "s")  { height += dy; }
    else if (handle === "sw") { x += dx; width -= dx; height += dy; }
    else if (handle === "w")  { x += dx; width -= dx; }

    // shift: 종횡비 유지 (코너 핸들만)
    if (maintainAspect && (handle === "nw" || handle === "ne" || handle === "se" || handle === "sw")) {
        const ratio = origBbox.width / origBbox.height;
        if (ratio > 0) {
            const wAbs = Math.abs(width), hAbs = Math.abs(height);
            if (wAbs / hAbs > ratio) {
                const newH = wAbs / ratio * Math.sign(height || 1);
                if (handle === "nw" || handle === "ne") y = origBbox.y + origBbox.height - newH;
                height = newH;
            } else {
                const newW = hAbs * ratio * Math.sign(width || 1);
                if (handle === "nw" || handle === "sw") x = origBbox.x + origBbox.width - newW;
                width = newW;
            }
        }
    }

    // 음수 size 방지 (반전 시 좌표 정규화)
    if (width < 0)  { x += width;  width  = -width; }
    if (height < 0) { y += height; height = -height; }

    return { x, y, width, height };
}

// ─── 회전 변환 ──────────────────────────────────────────────────────────

/**
 * 회전 핸들 드래그 → 새 rotation (라디안).
 * @param pivot 회전 중심 (bbox 중앙)
 * @param startX 드래그 시작 화면 좌표
 * @param startY
 * @param currentX 현재 화면 좌표
 * @param currentY
 * @param origRotation 드래그 시작 시점 rotation
 * @param snapToAngle 15도 스냅 (shift 누름)
 */
export function applyRotation(
    pivot: { x: number; y: number },
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    origRotation: number,
    snapToAngle: boolean,
): number {
    const startAngle = Math.atan2(startY - pivot.y, startX - pivot.x);
    const currAngle = Math.atan2(currentY - pivot.y, currentX - pivot.x);
    let next = origRotation + (currAngle - startAngle);
    if (snapToAngle) {
        const SNAP = Math.PI / 12;  // 15deg
        next = Math.round(next / SNAP) * SNAP;
    }
    // -π ~ π 정규화
    while (next > Math.PI) next -= 2 * Math.PI;
    while (next < -Math.PI) next += 2 * Math.PI;
    return next;
}
