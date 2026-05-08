// PP Canvas Engine — 공유 타입 정의 (단일 진실 소스)
//
// 모든 엘리먼트는 BaseElement를 상속하며 type 필드로 구분.
// 변경 시 마이그레이션 정책: docs/PP_Canvas_Engine_Plan.md §4 참조.

// ─── 문서 ───────────────────────────────────────────────────────────────────

export interface CanvasDocument {
    /** 스키마 버전 — 향후 마이그레이션 분기 용도 */
    version: 1;
    elements: CanvasElement[];
    background: BackgroundTemplate;
    /** 마지막 사용자 뷰포트 — 다음 열기 시 복원 */
    viewport?: Viewport;
}

export interface Viewport {
    x: number;       // 캔버스 좌표 기준 좌상단
    y: number;
    zoom: number;    // 1 = 100%, 0.5 = 50%, 2 = 200%
}

export type BackgroundTemplate = "blank" | "dots" | "grid" | "lines";

// ─── 엘리먼트 ───────────────────────────────────────────────────────────────

export type CanvasElement =
    | StrokeElement
    | RectElement
    | EllipseElement
    | DiamondElement
    | ArrowElement
    | LineElement
    | TextElement
    | ImageElement;

export interface BaseElement {
    id: string;             // ULID 또는 nanoid
    type: ElementType;
    /** 캔버스 좌표 — 좌상단 또는 도형 중심 (type별 정의 다름) */
    x: number;
    y: number;
    /** 라디안 단위 회전 */
    rotation: number;
    /** 0~100 */
    opacity: number;
    /** 같은 z에서는 배열 순서대로 렌더 */
    zIndex: number;
    createdAt: number;      // epoch ms
    updatedAt: number;
    /** 편집 잠금 (선택·이동·삭제 차단) */
    locked?: boolean;
}

export type ElementType =
    | "stroke"
    | "rect" | "ellipse" | "diamond"
    | "arrow" | "line"
    | "text"
    | "image";

// ─── 자유 그리기 (필기) ──────────────────────────────────────────────────────

export interface StrokeElement extends BaseElement {
    type: "stroke";
    /** [x, y, pressure] 시퀀스 — 압력 0~1, 펜 미지원 시 0.5 */
    points: [number, number, number][];
    color: string;          // hex
    /** perfect-freehand size 파라미터 — 1~32 */
    size: number;
    pen: PenKind;
    /** 손 떨림 보정 streamline — 0(원본) ~ 0.95(매우 매끈) */
    streamline: number;
    /** 수직 방향 폭 변동(연필 노이즈 등) — true 시 size에 미세 지터 */
    jitter?: boolean;
}

export type PenKind = "pen" | "pencil" | "fountain" | "marker" | "highlighter" | "brush";

// ─── 도형 ──────────────────────────────────────────────────────────────────

interface ShapeBase extends BaseElement {
    width: number;
    height: number;
    strokeColor: string;
    fillColor?: string;     // undefined = 채움 없음
    strokeWidth: number;    // px
    strokeStyle: "solid" | "dashed" | "dotted";
}

export interface RectElement extends ShapeBase {
    type: "rect";
    /** 모서리 둥글기 — 0(각짐) ~ 32(많이 둥금) */
    cornerRadius?: number;
}

export interface EllipseElement extends ShapeBase {
    type: "ellipse";
}

export interface DiamondElement extends ShapeBase {
    type: "diamond";
}

// ─── 화살표·선 ──────────────────────────────────────────────────────────────

export interface LineElement extends BaseElement {
    type: "line";
    /** 절대 좌표 — x/y는 무시, points로 정의 */
    points: [number, number][];
    color: string;
    strokeWidth: number;
    strokeStyle: "solid" | "dashed" | "dotted";
}

export interface ArrowElement extends Omit<LineElement, "type"> {
    type: "arrow";
    /** 시작 화살촉 — 보통 false */
    arrowStart?: boolean;
    /** 끝 화살촉 — 기본 true */
    arrowEnd?: boolean;
}

// ─── 텍스트 ────────────────────────────────────────────────────────────────

export interface TextElement extends BaseElement {
    type: "text";
    text: string;
    fontSize: number;       // px
    fontFamily: string;     // CSS 폰트 패밀리
    color: string;
    align: "left" | "center" | "right";
    bold?: boolean;
    italic?: boolean;
    /** 자동 줄바꿈 너비 — undefined면 텍스트 길이만큼 자동 */
    maxWidth?: number;
}

// ─── 이미지 ────────────────────────────────────────────────────────────────

export interface ImageElement extends BaseElement {
    type: "image";
    width: number;
    height: number;
    /** data URL (base64) 또는 외부 URL */
    src: string;
}

// ─── 도구 모드 ──────────────────────────────────────────────────────────────

export type ToolMode =
    | { mode: "selection" }
    | { mode: "lasso" }
    | { mode: "stroke"; pen: PenKind; color: string; size: number; opacity: number }
    | { mode: "shape"; shape: "rect" | "ellipse" | "diamond" | "arrow" | "line"; color: string }
    | { mode: "text" }
    | { mode: "eraser" }
    | { mode: "pan" };

// ─── 이벤트 ────────────────────────────────────────────────────────────────

export interface EngineEvents {
    /** 엘리먼트 변경 (추가·수정·삭제) */
    "change": (doc: CanvasDocument) => void;
    /** 선택 변경 */
    "select": (selectedIds: string[]) => void;
    /** 도구 모드 변경 */
    "tool-change": (tool: ToolMode) => void;
    /** 뷰포트 변경 (줌·팬) */
    "viewport-change": (viewport: Viewport) => void;
}

// ─── 유틸 ──────────────────────────────────────────────────────────────────

/** 빈 문서 생성 */
export function createEmptyDocument(): CanvasDocument {
    return {
        version: 1,
        elements: [],
        background: "blank",
    };
}

/** 엘리먼트 ID 생성 — nanoid 대신 가벼운 자체 구현 (외부 의존 없음) */
export function createElementId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}
