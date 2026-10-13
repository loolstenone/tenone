/**
 * HeRo 기업 서비스 — 헤더 오른쪽(기업) 메뉴 중 신청형 서비스 3종 (2026-10-13)
 * 신청 = hero_business_inquiries.service (sql/hero-business-services-2026-10.sql) · 처리 = /intra/hero/business-requests
 * ❌ 가격 문구 (통신판매업 신고 전) · 헤드헌팅은 유료직업소개사업 등록 전제
 */
export type BusinessServiceKey = "team_diagnosis" | "talent_report" | "headhunting";

export interface BusinessService {
    key: BusinessServiceKey;
    label: string;         // 헤더 메뉴명 = lib/brand-site-menus.ts label 과 같게
    path: string;
    /** 신청 폼 추가 항목 */
    fields: { key: string; label: string; placeholder?: string; type?: "text" | "textarea" | "number" }[];
}

export const BUSINESS_SERVICES: Record<BusinessServiceKey, BusinessService> = {
    team_diagnosis: {
        key: "team_diagnosis",
        label: "팀 진단",
        path: "/hero/team",
        fields: [
            { key: "team_name", label: "진단할 팀", placeholder: "예: 마케팅팀" },
            { key: "team_size", label: "팀 인원 (명)", type: "number", placeholder: "8" },
            { key: "concern", label: "요즘 팀의 고민", type: "textarea", placeholder: "예: 새로 합류한 사람이 자리를 잡지 못한다, 회의에서 결정이 늦다" },
        ],
    },
    talent_report: {
        key: "talent_report",
        label: "인재 풀 리포트",
        path: "/hero/talent-report",
        fields: [
            { key: "job_functions", label: "보고 싶은 직무", placeholder: "예: 퍼포먼스 마케팅, 브랜딩" },
            { key: "career_range", label: "경력 구간", placeholder: "예: 주니어~미들 (3~9년)" },
            { key: "purpose", label: "어디에 쓰실 건가요", type: "textarea", placeholder: "예: 하반기 채용 계획, 처우 기준 정리" },
        ],
    },
    headhunting: {
        key: "headhunting",
        label: "헤드헌팅",
        path: "/hero/headhunting",
        fields: [
            { key: "position", label: "포지션", placeholder: "예: 브랜드 마케팅 리드" },
            { key: "career_range", label: "경력", placeholder: "예: 7년 이상" },
            { key: "timeline", label: "희망 합류 시기", placeholder: "예: 3개월 안" },
            { key: "requirements", label: "꼭 필요한 조건과 팀 상황", type: "textarea", placeholder: "맡을 일, 필요한 역량, 팀 구성, 일하는 방식" },
        ],
    },
};

export const BUSINESS_REQUEST_STATUS: Record<string, string> = {
    pending: "접수", reviewing: "상담 중", in_progress: "진행 중", done: "완료", closed: "종료",
};
