// Myverse Canvas Engine — HandNote 직렬화 헬퍼
//
// HandNoteData(__HW__ 마커 JSON)를 텍스트 콘텐츠와 공존시키는 포맷 헬퍼.
// HandNote.tsx에서 추출 — Phase 1.9 본체 재작성을 위해 데이터 레이어를 분리.
// 외부 API는 유지(HandNote.tsx에서 re-export).

import type { LegacyHandNoteData } from "./handnote";

// 신규 작성에 사용하는 마커 (myverse:)
const HW_MARKER = "<!-- myverse:handwriting -->";
// DB에 저장된 레거시 콘텐츠 읽기용
const LEGACY_HW_MARKER = "<!-- planners:handwriting -->";

function startsWithHwMarker(content: string): boolean {
    return content.startsWith(HW_MARKER) || content.startsWith(LEGACY_HW_MARKER);
}

function getHwMarkerLength(content: string): number {
    return content.startsWith(LEGACY_HW_MARKER) ? LEGACY_HW_MARKER.length : HW_MARKER.length;
}

export function isHandwritingContent(content: string | null | undefined): boolean {
    return !!content && startsWithHwMarker(content);
}

export function parseHandwriting(content: string | null | undefined): LegacyHandNoteData | null {
    if (!content || !startsWithHwMarker(content)) return null;
    try {
        const parsed = JSON.parse(content.slice(getHwMarkerLength(content)).trim());
        return Array.isArray(parsed?.strokes) ? (parsed as LegacyHandNoteData) : null;
    } catch { return null; }
}

export function serializeHandwriting(data: LegacyHandNoteData): string {
    return `${HW_MARKER}\n${JSON.stringify(data)}`;
}

/** content에서 텍스트 본문만 꺼내기 — 손글씨 모드에서도 .text가 있으면 그걸 반환 */
export function extractTextPart(content: string | null | undefined): string {
    if (!content) return "";
    if (startsWithHwMarker(content)) {
        return parseHandwriting(content)?.text ?? "";
    }
    return content;
}

/** 텍스트 본문만 갱신 — 기존 손글씨가 있으면 보존, 없으면 평문 저장 */
export function setTextPart(content: string | null | undefined, newText: string): string {
    if (content && startsWithHwMarker(content)) {
        const data = parseHandwriting(content) ?? { strokes: [], width: 600, height: 240 };
        return serializeHandwriting({ ...data, text: newText });
    }
    return newText;
}

/** content를 손글씨 모드로 전환(또는 갱신) — 기존 텍스트는 .text 로 보존 */
export function setHandPart(content: string | null | undefined, hand: LegacyHandNoteData): string {
    const prevText = extractTextPart(content);
    return serializeHandwriting({ ...hand, text: hand.text ?? prevText });
}

export { HW_MARKER, LEGACY_HW_MARKER };
