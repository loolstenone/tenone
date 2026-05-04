// PP Canvas Engine — 렌더 레이어
//
// 두 가지 타깃:
//  1. SVG — 영구 보관용. 엘리먼트 → JSX/path 데이터로 변환. wrapper 컴포넌트가 React로 렌더.
//     stroke의 SVG path는 layers/strokes.ts의 strokeToPath()가 담당.
//  2. Canvas 2D — 라이브 드로잉 오버레이. 사용자가 그리는 중인 stroke를 RAF로 화면에 표시.
//     커밋되면 SVG 영구 레이어로 이동.
//
// 책임이 아닌 것:
//  - DOM 마운트 (wrapper 컴포넌트가 전담)
//  - React 상태 관리 (wrapper가 전담)
//  - 포인터 입력 (interaction/pointer.ts가 전담)

import { getStroke } from "perfect-freehand";
import type { PenKind } from "./types";
import { getPenProfile, resolveStrokeStyle } from "./layers/strokes";

// ─── Canvas 2D 라이브 stroke 렌더 ──────────────────────────────────────────────

export interface LiveStrokeContext {
    /** 그릴 대상 캔버스의 2D 컨텍스트 */
    ctx: CanvasRenderingContext2D;
    /** 캔버스 물리 픽셀 너비/높이 */
    canvasWidth: number;
    canvasHeight: number;
    /** 논리 좌표 → 물리 픽셀 변환 스케일 */
    scaleX: number;
    scaleY: number;
    /** 논리 좌표계의 viewBox 원점 (보통 0,0) */
    viewBoxX: number;
    viewBoxY: number;
}

export interface LiveStrokeStyle {
    pen: PenKind;
    color: string;
    /** 입력 size (논리 좌표 기준) — 내부에서 scale 적용 */
    size: number;
    /** stabilizer (streamline) override — undefined면 펜 프로파일 사용 */
    streamline?: number;
    /** 0~1 — 실제 필압 감지된 경우 simulatePressure 끔 */
    isRealPressure?: boolean;
    /** 0~1 opacity */
    opacity?: number;
}

/**
 * 그리는 중인 stroke를 Canvas 2D에 즉시 렌더.
 * 매 RAF마다 호출 → clearRect 후 현재 points 전체를 다시 그림.
 *
 * @param points  논리 좌표계의 [x,y,pressure] 배열
 */
export function renderLiveStroke(
    ctx: LiveStrokeContext,
    points: [number, number, number][] | number[][],
    style: LiveStrokeStyle,
): void {
    if (points.length < 2) return;
    const { ctx: c, canvasWidth, canvasHeight, scaleX, scaleY, viewBoxX, viewBoxY } = ctx;
    const profile = getPenProfile(style.pen);

    // 논리 좌표 → 물리 픽셀
    const scaledPts = points.map(([lx, ly, pr]) => [
        (lx - viewBoxX) * scaleX,
        (ly - viewBoxY) * scaleY,
        pr ?? 0.5,
    ] as [number, number, number]);

    const stroke = getStroke(scaledPts, {
        size: style.size * profile.sizeMultiplier * Math.min(scaleX, scaleY),
        thinning: profile.thinning,
        smoothing: profile.smoothing,
        streamline: style.streamline ?? profile.streamline,
        simulatePressure: profile.simulatePressure && !style.isRealPressure,
        start: { taper: profile.cap.taperStart, cap: true },
        end: { taper: profile.cap.taperEnd, cap: true },
    });
    if (!stroke.length) return;

    const fillColor = profile.fixedColor ?? style.color;
    const opacity = (style.opacity ?? 1) * profile.defaultOpacity;

    c.clearRect(0, 0, canvasWidth, canvasHeight);
    c.save();
    c.globalAlpha = opacity;
    c.fillStyle = fillColor;
    c.beginPath();
    const [fx, fy] = stroke[0];
    c.moveTo(fx, fy);
    for (let i = 0; i < stroke.length - 1; i++) {
        const [x0, y0] = stroke[i];
        const [x1, y1] = stroke[i + 1];
        c.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    }
    c.closePath();
    c.fill();
    c.restore();
}

/** 라이브 stroke 캔버스 비우기 (커밋 또는 취소 시) */
export function clearLiveStroke(ctx: LiveStrokeContext): void {
    ctx.ctx.clearRect(0, 0, ctx.canvasWidth, ctx.canvasHeight);
}

// ─── 좌표 변환 헬퍼 ────────────────────────────────────────────────────────────

/**
 * SVG viewBox + DOM rect + DPR로부터 LiveStrokeContext 만들기.
 * wrapper 컴포넌트의 RAF 루프에서 매번 호출 가능.
 */
export function makeLiveContext(
    canvas: HTMLCanvasElement,
    svg: SVGSVGElement,
): LiveStrokeContext | null {
    const c = canvas.getContext("2d");
    if (!c) return null;
    const vb = svg.viewBox.baseVal;
    const rect = svg.getBoundingClientRect();
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    return {
        ctx: c,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        scaleX: vb.width > 0 ? (rect.width / vb.width) * dpr : dpr,
        scaleY: vb.height > 0 ? (rect.height / vb.height) * dpr : dpr,
        viewBoxX: vb.x,
        viewBoxY: vb.y,
    };
}

// ─── 영구 stroke → SVG path (재export) ─────────────────────────────────────────

export { strokeToPath, resolveStrokeStyle } from "./layers/strokes";
