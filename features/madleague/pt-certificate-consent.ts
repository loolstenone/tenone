/**
 * 경쟁 PT 인증서 받기 — 계정 연결 동의 문구 (개인정보보호법 제15조: 목적·항목·보관기간·거부권)
 * 문구가 바뀌면 버전을 올린다. 기록: member_brand_joins(brand 'madleague', origin 'certificate', terms_version)
 */
export const PT_CERT_CONSENT_VERSION = "pt-cert-2026-10-09";

export const PT_CERT_CONSENT = {
    purpose: "경쟁 PT 참가·수상 인증서를 찾아 내 계정에 연결하고 발급, 진위 확인",
    items: "인증서 기재 사항(이름·생년월일·출신 대학·전공·소속 동아리·기수·출전 팀·결과) · 매드리거 등록 정보로 찾을 때는 등록한 이름·전화번호(대장과 대조에만 사용, 저장하지 않음)",
    retention: "회원·MADLeague 탈퇴 시까지. 탈퇴하면 진위 확인에 필요한 이름·발급일·인증서 코드(와 인증서 구분·대회·결과)만 남기고 생년월일·대학·전공·소속과 계정 연결은 지웁니다",
    refusal: "동의하지 않을 수 있으며, 이 경우 인증서를 계정에 연결해 받을 수 없습니다",
};
