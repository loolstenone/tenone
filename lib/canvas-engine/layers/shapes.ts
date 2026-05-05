// PP Canvas Engine — 도형 레이어
//
// rect/ellipse/diamond/arrow/line 엘리먼트 → SVG path 'd' attribute 변환.
// 채우기·테두리·점선·화살촉은 wrapper 컴포넌트가 SVG attribute로 그대로 전달.

import type {
    RectElement, EllipseElement, DiamondElement,
    ArrowElement, LineElement, CanvasElement,
} from "../types";

// ─── 사각형 ──────────────────────────────────────────────────────────────────

export function rectToPath(r: RectElement): string {
    const { x, y, width, height, cornerRadius = 0 } = r;
    if (cornerRadius <= 0) {
        return `M ${x} ${y} h ${width} v ${height} h ${-width} Z`;
    }
    const rad = Math.min(cornerRadius, width / 2, height / 2);
    return [
        `M ${x + rad} ${y}`,
        `h ${width - 2 * rad}`,
        `a ${rad} ${rad} 0 0 1 ${rad} ${rad}`,
        `v ${height - 2 * rad}`,
        `a ${rad} ${rad} 0 0 1 ${-rad} ${rad}`,
        `h ${-(width - 2 * rad)}`,
        `a ${rad} ${rad} 0 0 1 ${-rad} ${-rad}`,
        `v ${-(height - 2 * rad)}`,
        `a ${rad} ${rad} 0 0 1 ${rad} ${-rad}`,
        "Z",
    ].join(" ");
}

// ─── 타원 ──────────────────────────────────────────────────────────────────

export function ellipseToPath(e: EllipseElement): string {
    const cx = e.x + e.width / 2;
    const cy = e.y + e.height / 2;
    const rx = e.width / 2;
    const ry = e.height / 2;
    return [
        `M ${cx - rx} ${cy}`,
        `a ${rx} ${ry} 0 1 0 ${2 * rx} 0`,
        `a ${rx} ${ry} 0 1 0 ${-2 * rx} 0`,
        "Z",
    ].join(" ");
}

// ─── 다이아몬드 (마름모) ────────────────────────────────────────────────────

export function diamondToPath(d: DiamondElement): string {
    const cx = d.x + d.width / 2;
    const cy = d.y + d.height / 2;
    return [
        `M ${cx} ${d.y}`,
        `L ${d.x + d.width} ${cy}`,
        `L ${cx} ${d.y + d.height}`,
        `L ${d.x} ${cy}`,
        "Z",
    ].join(" ");
}

// ─── 선 ──────────────────────────────────────────────────────────────────

export function lineToPath(l: LineElement): string {
    if (l.points.length < 2) return "";
    return l.points
        .map(([px, py], i) => `${i === 0 ? "M" : "L"} ${px} ${py}`)
        .join(" ");
}

// ─── 화살표 ─────────────────────────────────────────────────────────────

export interface ArrowGeometry {
    bodyPath: string;       // 선 본체 d
    startHead?: string;     // 시작 화살촉 d (3점 폴리곤)
    endHead?: string;       // 끝 화살촉 d
}

const ARROW_HEAD_LENGTH = 10;
const ARROW_HEAD_HALF_WIDTH = 4;

export function arrowToGeometry(a: ArrowElement): ArrowGeometry {
    const pts = a.points;
    if (pts.length < 2) return { bodyPath: "" };
    const bodyPath = pts.map(([px, py], i) => `${i === 0 ? "M" : "L"} ${px} ${py}`).join(" ");

    const result: ArrowGeometry = { bodyPath };
    const showStart = a.arrowStart;
    const showEnd = a.arrowEnd ?? true;

    if (showStart) {
        const [x0, y0] = pts[0];
        const [x1, y1] = pts[1];
        result.startHead = makeArrowHead(x1, y1, x0, y0);
    }
    if (showEnd) {
        const [xn1, yn1] = pts[pts.length - 2];
        const [xn, yn] = pts[pts.length - 1];
        result.endHead = makeArrowHead(xn1, yn1, xn, yn);
    }
    return result;
}

/** from(x0,y0) → to(x1,y1) 방향의 끝점에 그릴 화살촉 (삼각형 path) */
function makeArrowHead(x0: number, y0: number, x1: number, y1: number): string {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len === 0) return "";
    const ux = dx / len;
    const uy = dy / len;
    // 화살촉 베이스 (끝에서 ARROW_HEAD_LENGTH만큼 뒤)
    const bx = x1 - ux * ARROW_HEAD_LENGTH;
    const by = y1 - uy * ARROW_HEAD_LENGTH;
    // 좌우 직각 단위 벡터
    const px = -uy;
    const py = ux;
    const lx = bx + px * ARROW_HEAD_HALF_WIDTH;
    const ly = by + py * ARROW_HEAD_HALF_WIDTH;
    const rx = bx - px * ARROW_HEAD_HALF_WIDTH;
    const ry = by - py * ARROW_HEAD_HALF_WIDTH;
    return `M ${x1} ${y1} L ${lx} ${ly} L ${rx} ${ry} Z`;
}

// ─── strokeStyle → SVG dasharray ─────────────────────────────────────────

export function strokeDashArray(style: "solid" | "dashed" | "dotted", strokeWidth: number): string | undefined {
    if (style === "solid") return undefined;
    if (style === "dashed") return `${strokeWidth * 4} ${strokeWidth * 2}`;
    if (style === "dotted") return `${strokeWidth} ${strokeWidth * 2}`;
    return undefined;
}

// ─── 통합 디스패처 ──────────────────────────────────────────────────────

/**
 * 도형 엘리먼트 → SVG 렌더 데이터.
 * stroke/text/image는 별도 layer가 처리하므로 여기서 null 반환.
 */
export interface ShapeRenderData {
    path: string;
    extras?: { startHead?: string; endHead?: string };
    strokeColor: string;
    fillColor?: string;
    strokeWidth: number;
    dashArray?: string;
}

export function shapeToRender(el: CanvasElement): ShapeRenderData | null {
    switch (el.type) {
        case "rect": return {
            path: rectToPath(el),
            strokeColor: el.strokeColor,
            fillColor: el.fillColor,
            strokeWidth: el.strokeWidth,
            dashArray: strokeDashArray(el.strokeStyle, el.strokeWidth),
        };
        case "ellipse": return {
            path: ellipseToPath(el),
            strokeColor: el.strokeColor,
            fillColor: el.fillColor,
            strokeWidth: el.strokeWidth,
            dashArray: strokeDashArray(el.strokeStyle, el.strokeWidth),
        };
        case "diamond": return {
            path: diamondToPath(el),
            strokeColor: el.strokeColor,
            fillColor: el.fillColor,
            strokeWidth: el.strokeWidth,
            dashArray: strokeDashArray(el.strokeStyle, el.strokeWidth),
        };
        case "line": return {
            path: lineToPath(el),
            strokeColor: el.color,
            strokeWidth: el.strokeWidth,
            dashArray: strokeDashArray(el.strokeStyle, el.strokeWidth),
        };
        case "arrow": {
            const geo = arrowToGeometry(el);
            return {
                path: geo.bodyPath,
                extras: { startHead: geo.startHead, endHead: geo.endHead },
                strokeColor: el.color,
                strokeWidth: el.strokeWidth,
                dashArray: strokeDashArray(el.strokeStyle, el.strokeWidth),
            };
        }
        default:
            return null;
    }
}
