// 인공지능 호출 실패 문구 — 화면마다 제각각이던 것을 한 곳에서 (2026-10-15 Planner's QA)
// ❌ 'API 키'·'AI 호출 실패' 같은 운영 정보나 원인이 틀린 문구를 사용자에게 보이지 않는다
export const AI_BETA_ONLY_TEXT = "인공지능 기능은 지금 베타 테스터에게만 열려 있습니다.";

export function aiErrorText(status: number, body?: { error?: string } | null): string {
    if (status === 402) return AI_BETA_ONLY_TEXT;
    if (status === 401) return "로그인이 필요합니다.";
    if (status === 429) return "잠깐 너무 많이 불렀어요. 조금 뒤 다시 해 주세요.";
    if (body?.error === "ai_disabled") return "인공지능이 잠시 쉬고 있어요. 잠시 뒤 다시 해 주세요.";
    return "인공지능이 답하지 못했어요. 잠시 뒤 다시 해 주세요.";
}
