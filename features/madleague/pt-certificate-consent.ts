/**
 * 경쟁 PT 인증서 받기 — 계정 연결 동의 문구 (개인정보보호법 제15조: 목적·항목·보관기간·거부권)
 * 문구가 바뀌면 버전을 올린다. 기록: member_brand_joins(brand 'madleague', origin 'certificate', terms_version)
 */
export const PT_CERT_CONSENT_VERSION = "pt-cert-2026-10-09";

export const PT_CERT_CONSENT = {
    purpose: "경쟁 PT 참가·수상 인증서를 찾아 내 계정에 연결하고 발급, 진위 확인",
    items: "인증서 기재 사항(이름·생년월일·출신 대학·전공·소속 동아리·기수·출전 팀·결과) · 매드리거 등록 정보로 찾을 때는 등록한 이름·전화번호(대장과 대조에만 사용, 저장하지 않음)",
    retention: "인증서 발급 기록(코드·구분·대회·결과·발급일·이름·생년월일)은 진위 확인을 위해 영구 보관합니다. 대학·전공과 계정 연결은 회원·MADLeague 탈퇴 시 지웁니다. 본인이 삭제를 요청하면 인증서를 폐기하고 지웁니다",
    refusal: "동의하지 않을 수 있으며, 이 경우 인증서를 계정에 연결해 받을 수 없습니다",
};
