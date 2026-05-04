// PP Canvas Engine — HandNote 직렬화 헬퍼
//
// HandNoteData(__HW__ 마커 JSON)를 텍스트 콘텐츠와 공존시키는 포맷 헬퍼.
// HandNote.tsx에서 추출 — Phase 1.9 본체 재작성을 위해 데이터 레이어를 분리.
// 외부 API는 유지(HandNote.tsx에서 re-export).

import type { LegacyHandNoteData } from "./handnote";

const HW_MARKER = "<!-- planners:handwriting -->";

export function isHandwritingContent(content: string | null | undefined): boolean {
    return !!content && content.startsWith(HW_MARKER);
}

export function parseHandwriting(content: string | null | undefined): LegacyHandNoteData | null {
    if (!content?.startsWith(HW_MARKER)) return null;
    try {
        const parsed = JSON.parse(content.slice(HW_MARKER.length).trim());
        return Array.isArray(parsed?.strokes) ? (parsed as LegacyHandNoteData) : null;
    } catch { return null; }
}

export function serializeHandwriting(data: LegacyHandNoteData): string {
    return `${HW_MARKER}\n${JSON.stringify(data)}`;
}

/** content에서 텍스트 본문만 꺼내기 — 손글씨 모드에서도 .text가 있으면 그걸 반환 */
export function extractTextPart(content: string | null | undefined): string {
    if (!content) return "";
    if (content.startsWith(HW_MARKER)) {
        return parseHandwriting(content)?.text ?? "";
    }
    return content;
}

/** 텍스트 본문만 갱신 — 기존 손글씨가 있으면 보존, 없으면 평문 저장 */
export function setTextPart(content: string | null | undefined, newText: string): string {
    if (content?.startsWith(HW_MARKER)) {
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

export { HW_MARKER };
