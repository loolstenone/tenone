// PP Canvas Engine — 직렬화
//
// CanvasDocument ↔ JSON. 버전 관리 + 마이그레이션 훅.
// 외부 저장소(Supabase, IndexedDB)는 이 결과를 그대로 string으로 저장 가능.

import type { CanvasDocument } from "./types";
import { createEmptyDocument } from "./types";

const CURRENT_VERSION = 1;

interface SerializedDocV1 extends CanvasDocument {
    version: 1;
}

type AnySerialized = { version?: number } & Record<string, unknown>;

/** CanvasDocument → JSON 문자열 */
export function serialize(doc: CanvasDocument): string {
    const payload: SerializedDocV1 = { ...doc, version: CURRENT_VERSION } as SerializedDocV1;
    return JSON.stringify(payload);
}

/** JSON 문자열 → CanvasDocument. 파싱 실패 또는 알 수 없는 버전이면 빈 문서. */
export function deserialize(json: string | null | undefined): CanvasDocument {
    if (!json) return createEmptyDocument();
    let raw: AnySerialized;
    try {
        raw = JSON.parse(json);
    } catch {
        return createEmptyDocument();
    }
    return migrate(raw);
}

/** 미래 버전 대비 — 현재는 v1만 지원, 누락 필드만 보완. */
function migrate(raw: AnySerialized): CanvasDocument {
    const empty = createEmptyDocument();
    const version = (raw.version as number | undefined) ?? 1;
    if (version > CURRENT_VERSION) {
        console.warn(`[canvas-engine] unknown version ${version}, treating as v${CURRENT_VERSION}`);
    }
    return {
        ...empty,
        ...raw,
        version: CURRENT_VERSION,
        elements: Array.isArray(raw.elements) ? (raw.elements as CanvasDocument["elements"]) : [],
        viewport: (raw.viewport as CanvasDocument["viewport"]) ?? empty.viewport,
        background: (raw.background as CanvasDocument["background"]) ?? empty.background,
    };
}

/** 외부 데이터(legacy HandNote, Excalidraw 등)를 받아 import할 때 사용할 자리. Phase 6에서 구현. */
export interface ImportResult {
    doc: CanvasDocument;
    warnings: string[];
}
