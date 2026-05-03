// PP Canvas Engine — 공개 API
//
// wrapper 컴포넌트 (HandNote, PpCanvas)는 이 파일에서만 import 한다.
// 내부 구조는 자유롭게 리팩토링 가능 — 공개 API만 안정적으로 유지.

export { CanvasEngine } from "./engine";
export { HistoryStack } from "./history";

export type {
    CanvasDocument,
    CanvasElement,
    BaseElement,
    ElementType,
    StrokeElement,
    RectElement,
    EllipseElement,
    DiamondElement,
    ArrowElement,
    LineElement,
    TextElement,
    ImageElement,
    ToolMode,
    Viewport,
    BackgroundTemplate,
    PenKind,
    EngineEvents,
} from "./types";

export { createEmptyDocument, createElementId } from "./types";

// 레이어 유틸
export { strokeToPath, resolveStrokeStyle, getPenProfile } from "./layers/strokes";
export { getBackgroundStyle, getBackgroundLabel, BACKGROUND_TEMPLATES } from "./layers/background";

// 렌더 (Canvas 2D 라이브 stroke)
export { renderLiveStroke, clearLiveStroke, makeLiveContext } from "./render";
export type { LiveStrokeContext, LiveStrokeStyle } from "./render";

// 인터랙션 유틸
export { PalmRejection } from "./interaction/palm-rejection";
export { PanZoomController, screenToCanvas, canvasToScreen } from "./interaction/pan-zoom";

// 직렬화
export { serialize, deserialize } from "./serialize";

// 레거시 포맷 어댑터
export { toCanvasDocument, toHandNoteData } from "./adapters/handnote";
export type { LegacyHandNoteData, LegacyHandStroke, LegacyHandImage } from "./adapters/handnote";

// 레거시 직렬화 헬퍼 (HandNote __HW__ 마커 형식)
export {
    isHandwritingContent,
    parseHandwriting,
    serializeHandwriting,
    extractTextPart,
    setTextPart,
    setHandPart,
} from "./adapters/handnote-storage";
