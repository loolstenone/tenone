/**
 * hit_hero_types.fit_direction = "지금은 … 첫 직무로는 … 길게는 …" 세 문장 (2026-10-13 문장화).
 * 결과 카드의 '커리어 방향'은 첫 직무 문장만 — 전체 문단은 '강점·주의점' 섹션의 '잘 맞는 방향'에 나간다 (중복 방지).
 * 옛 형식("A → B → C 방향.")이면 그대로 돌려준다. 클라이언트·서버 공용 (DB 접근 없음).
 */
export function firstJobLine(fitDirection: string | null | undefined): string | null {
  if (!fitDirection) return null;
  const line = fitDirection.split(/(?<=[.!?])\s+/).find(s => s.startsWith('첫 직무'));
  return line ?? fitDirection;
}
