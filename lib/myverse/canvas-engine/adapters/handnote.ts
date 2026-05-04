// PP Canvas Engine — HandNote 어댑터
//
// 기존 HandNoteData 포맷(__HW__ 마커 JSON)은 사용자 노트가 이미 저장된 형태이므로
// 디스크 호환성을 위해 보존한다. 이 어댑터는 HandNote 컴포넌트 경계에서만
// HandNoteData ↔ CanvasDocument 변환을 수행한다.
//
// 매핑:
//   HandStroke[] → StrokeElement[]
//   HandImage[]  → ImageElement[]
//   width/height → 문서 메타 (CanvasDocument에 저장 안 함, wrapper에서 보관)
//   text         → 문서 외부에 보존 (어댑터가 손대지 않음)
//   _pages       → 페이지 단위로 별도 처리 (각 페이지 = 별도 CanvasDocument)

import type { CanvasDocument, StrokeElement, ImageElement, PenKind } from "../types";
import { createElementId, createEmptyDocument } from "../types";

// HandNote 측 타입 — 의존성 역전을 위해 인라인 정의 (HandNote.tsx와 일치 유지)
export interface LegacyHandStroke {
    points: number[][];                  // [[x, y, pressure?]]
    color: string;
    size: number;
    penType?: "pen" | "fountain" | "marker" | "highlighter" | "pencil" | "brush";
    streamline?: number;
}

export interface LegacyHandImage {
    id: string;
    src: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface LegacyHandNoteData {
    strokes: LegacyHandStroke[];
    width: number;
    height: number;
    images?: LegacyHandImage[];
    text?: string;
    _pages?: LegacyHandNoteData[];
}

/** HandNoteData → CanvasDocument (한 페이지) */
export function toCanvasDocument(data: LegacyHandNoteData | null | undefined): CanvasDocument {
    if (!data) return createEmptyDocument();
    const now = Date.now();
    const elements: (StrokeElement | ImageElement)[] = [];

    // 이미지 먼저 (z-index 낮음)
    (data.images ?? []).forEach((img, idx) => {
        elements.push({
            id: img.id || createElementId(),
            type: "image",
            x: img.x,
            y: img.y,
            width: img.w,
            height: img.h,
            src: img.src,
            rotation: 0,
            opacity: 100,
            zIndex: idx,
            createdAt: now,
            updatedAt: now,
        });
    });

    // stroke (z-index 위에)
    const baseZ = elements.length;
    data.strokes.forEach((s, idx) => {
        elements.push({
            id: createElementId(),
            type: "stroke",
            x: 0,
            y: 0,
            points: normalizePoints(s.points),
            color: s.color,
            size: s.size,
            pen: (s.penType ?? "pen") as PenKind,
            streamline: s.streamline ?? 0.5,
            rotation: 0,
            opacity: 100,
            zIndex: baseZ + idx,
            createdAt: now,
            updatedAt: now,
        });
    });

    return {
        version: 1,
        elements,
        background: "blank",
    };
}

/** CanvasDocument → HandNoteData (한 페이지). width/height는 caller가 보관해 전달. */
export function toHandNoteData(
    doc: CanvasDocument,
    meta: { width: number; height: number; text?: string },
): LegacyHandNoteData {
    const strokes: LegacyHandStroke[] = [];
    const images: LegacyHandImage[] = [];

    // zIndex 오름차순으로 정렬 후 추출 (저장 시 일관성)
    const ordered = [...doc.elements].sort((a, b) => a.zIndex - b.zIndex);
    for (const el of ordered) {
        if (el.type === "stroke") {
            strokes.push({
                points: el.points.map(p => [p[0], p[1], p[2]]),
                color: el.color,
                size: el.size,
                penType: el.pen,
                streamline: el.streamline,
            });
        } else if (el.type === "image") {
            images.push({
                id: el.id,
                src: el.src,
                x: el.x,
                y: el.y,
                w: el.width,
                h: el.height,
            });
        }
        // 그 외 엘리먼트(rect/ellipse/text 등)는 HandNote 포맷에 없음 — Phase 6에서 신규 포맷 도입 시 처리
    }

    return {
        strokes,
        width: meta.width,
        height: meta.height,
        ...(images.length > 0 && { images }),
        ...(meta.text !== undefined && { text: meta.text }),
    };
}

function normalizePoints(pts: number[][]): [number, number, number][] {
    return pts.map(p => [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0.5]);
}
