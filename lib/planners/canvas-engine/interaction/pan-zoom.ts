// PP Canvas Engine — Pan & Zoom
//
// 무한 캔버스 뷰포트 조작:
//  - 1손가락 pan: 한 손가락으로 화면 이동
//  - 2손가락 pinch: 두 손가락으로 줌 + 동시 pan
//
// Viewport는 { x, y, zoom } — 화면 좌상단이 캔버스 좌표계의 (x, y)에 위치, zoom 배율.
// 변환: 화면 좌표 (sx, sy) → 캔버스 좌표 (sx/zoom + x, sy/zoom + y)

import type { Viewport } from "../types";

interface ScreenPoint {
    x: number;
    y: number;
}

interface PinchState {
    pivotX: number;       // 두 손가락 중점 (화면 좌표, 시작 시점)
    pivotY: number;
    initialDistance: number;
    initialViewport: Viewport;
}

interface PanState {
    startX: number;       // 시작 손가락 위치 (화면 좌표)
    startY: number;
    initialViewport: Viewport;
}

export class PanZoomController {
    private touchPoints = new Map<number, ScreenPoint>();
    private pinch: PinchState | null = null;
    private pan: PanState | null = null;
    private viewport: Viewport;
    private onChange: (vp: Viewport) => void;

    constructor(initial: Viewport, onChange: (vp: Viewport) => void) {
        this.viewport = initial;
        this.onChange = onChange;
    }

    setViewport(vp: Viewport): void {
        this.viewport = vp;
    }

    getViewport(): Viewport {
        return this.viewport;
    }

    onTouchDown(pointerId: number, screen: ScreenPoint): void {
        this.touchPoints.set(pointerId, screen);
        const pts = [...this.touchPoints.values()];
        if (pts.length === 2) {
            const [a, b] = pts;
            this.pinch = {
                pivotX: (a.x + b.x) / 2,
                pivotY: (a.y + b.y) / 2,
                initialDistance: Math.hypot(a.x - b.x, a.y - b.y),
                initialViewport: { ...this.viewport },
            };
            this.pan = null;
        } else if (pts.length === 1) {
            this.pan = {
                startX: pts[0].x,
                startY: pts[0].y,
                initialViewport: { ...this.viewport },
            };
        }
    }

    onTouchMove(pointerId: number, screen: ScreenPoint): boolean {
        if (!this.touchPoints.has(pointerId)) return false;
        this.touchPoints.set(pointerId, screen);

        // 핀치 (2 손가락 이상)
        if (this.pinch && this.touchPoints.size >= 2) {
            const pts = [...this.touchPoints.values()];
            const [a, b] = pts;
            const distance = Math.hypot(a.x - b.x, a.y - b.y);
            if (this.pinch.initialDistance === 0) return true;
            const scale = distance / this.pinch.initialDistance;
            const newZoom = clamp(this.pinch.initialViewport.zoom * scale, 0.1, 10);

            // 핀치 중점이 화면상 같은 캔버스 좌표를 가리키도록 보정
            const { initialViewport, pivotX, pivotY } = this.pinch;
            const canvasPivotX = pivotX / initialViewport.zoom + initialViewport.x;
            const canvasPivotY = pivotY / initialViewport.zoom + initialViewport.y;
            const newX = canvasPivotX - pivotX / newZoom;
            const newY = canvasPivotY - pivotY / newZoom;

            this.viewport = { x: newX, y: newY, zoom: newZoom };
            this.onChange(this.viewport);
            return true;
        }

        // 1손가락 pan
        if (this.pan && this.touchPoints.size === 1) {
            const dx = screen.x - this.pan.startX;
            const dy = screen.y - this.pan.startY;
            const { initialViewport } = this.pan;
            this.viewport = {
                x: initialViewport.x - dx / initialViewport.zoom,
                y: initialViewport.y - dy / initialViewport.zoom,
                zoom: initialViewport.zoom,
            };
            this.onChange(this.viewport);
            return true;
        }
        return false;
    }

    onTouchUp(pointerId: number): void {
        this.touchPoints.delete(pointerId);
        if (this.touchPoints.size < 2) this.pinch = null;
        if (this.touchPoints.size === 0) this.pan = null;
    }

    /** 마우스 휠 줌 — center는 화면 좌표 기준 줌 중심 */
    onWheelZoom(deltaY: number, center: ScreenPoint): void {
        const factor = Math.exp(-deltaY * 0.001);
        const newZoom = clamp(this.viewport.zoom * factor, 0.1, 10);
        const canvasX = center.x / this.viewport.zoom + this.viewport.x;
        const canvasY = center.y / this.viewport.zoom + this.viewport.y;
        this.viewport = {
            x: canvasX - center.x / newZoom,
            y: canvasY - center.y / newZoom,
            zoom: newZoom,
        };
        this.onChange(this.viewport);
    }

    isInteracting(): boolean {
        return this.pinch !== null || this.pan !== null;
    }

    reset(): void {
        this.touchPoints.clear();
        this.pinch = null;
        this.pan = null;
    }
}

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}

// ─── 좌표 변환 헬퍼 ────────────────────────────────────────────────────────────

export function screenToCanvas(screen: ScreenPoint, vp: Viewport): { x: number; y: number } {
    return { x: screen.x / vp.zoom + vp.x, y: screen.y / vp.zoom + vp.y };
}

export function canvasToScreen(canvas: ScreenPoint, vp: Viewport): { x: number; y: number } {
    return { x: (canvas.x - vp.x) * vp.zoom, y: (canvas.y - vp.y) * vp.zoom };
}
