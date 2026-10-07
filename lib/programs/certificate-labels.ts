/** 인증서 구분 표기 — 클라이언트·서버 공용. 회차 유형(kind)에 따라 이름이 달라진다 (RooK 프로젝트 = 참여 확인서) */
export const CERT_TYPE_LABEL: Record<string, (kind: string) => string> = {
    participation: kind => (kind === "competition" ? "참가 확인서" : "참여 확인서"),
    award: () => "수상 확인서",
    activity: () => "활동 인증서",
    completion: () => "수료증",
};

/** 인쇄용 영문 부제 */
export const CERT_TYPE_EN: Record<string, string> = {
    participation: "CERTIFICATE OF PARTICIPATION",
    award: "CERTIFICATE OF AWARD",
    activity: "CERTIFICATE OF ACTIVITY",
    completion: "CERTIFICATE OF COMPLETION",
};
