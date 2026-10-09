/**
 * 경쟁 PT 인증서 받기 — 계정 연결 동의 문구 (개인정보보호법 제15조: 목적·항목·보관기간·거부권)
 * 문구가 바뀌면 버전을 올린다. 기록: member_brand_joins(brand 'madleague', origin 'certificate', terms_version)
 */
export const PT_CERT_CONSENT_VERSION = "pt-cert-2026-10-09";

export const PT_CERT_CONSENT = {
    purpose: "경쟁 PT 참가·수상 인증서 발급, 내 계정에서 다시 받기, 진위 확인",
    items: "이름 · 생년월일 · 출신 대학 · 전공 · 소속 동아리·기수 · 출전 팀 · 결과 (참가 신청 때 제출한 정보)",
    retention: "회원 탈퇴 또는 MADLeague 서비스 탈퇴 시까지. 탈퇴 후에는 진위 확인용 코드·구분·결과·발급일만 남기고 이름 등은 지웁니다",
    refusal: "동의하지 않을 수 있으며, 이 경우 인증서를 계정에 연결해 받을 수 없습니다",
};
