/**
 * 운영사 정보 SSOT — 푸터·개인정보처리방침·이용약관이 모두 이 값을 쓴다.
 * 통신판매업 신고 후 mailOrderNumber를 채우면 푸터에 자동 표시된다 (전자상거래법 제10조).
 */
export const COMPANY_INFO = {
    legalName: "열시일분",
    brandName: "Ten:One™",
    businessNumber: "222-22-01839",
    representative: "전천일",
    privacyOfficerEmail: "lools@tenone.biz",
    /** 통신판매업 신고번호 — 미신고 (2026-10-05). 신고 전 결제 기능 출시 금지 */
    mailOrderNumber: null as string | null,
} as const;

/** 약관·방침 문서 버전 레지스트리 — 동의 기록(member_brand_joins.terms_version 등)이 이 버전 문자열을 남긴다 */
export const LEGAL_DOCUMENTS = {
    /** ① Ten:One 통합 이용약관 (계정 약관) — 가입 시 동의 */
    terms: { version: "2026-10-05", effectiveDate: "2026년 10월 5일", path: "/terms" },
    /** 유니버스 공통 개인정보처리방침 — 고지 (동의 대상 아님) */
    privacy: { version: "2026-10-05", effectiveDate: "2026년 10월 5일", path: "/privacy" },
    // ② 서비스별 추가 약관 — 해당 서비스 기능을 실제 출시할 때 추가 (예: hero: { version, effectiveDate, path: "/terms/hero" })
} as const;
