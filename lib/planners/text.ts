// 화면 문장 다듬기 — 사이트·앱 문장에 긴 줄표(—)를 쓰지 않는다 (2026-10-14 사용자 지시). AI가 만든 문장도 저장 전에 거른다
export function noDash(s: string): string {
    return s.replace(/\s*[—―]\s*/g, ", ").replace(/,\s*,/g, ",").replace(/^,\s*/, "").trim();
}
