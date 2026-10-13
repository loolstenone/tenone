/**
 * HeRo 인재 제안 — 공용 상수·정규화·동의 문안 (클라이언트·서버 공용, DB 접근 없음)
 * 스키마: sql/hero-offers-2026-10.sql · 서버 로직: lib/hero/offers-server.ts
 *
 * 법적 전제 (2026-10-13 사용자 결정): 유료직업소개사업 등록 · 통신판매업 신고 후 공개.
 *  - 제안 발송은 서버 스위치 HERO_OFFERS_LIVE=true 일 때만 (offers-server `offersLive()`)
 *  - ❌ 가격·요금 문구를 화면·소스에 두지 않는다 (결제는 운영자 확인 → 사업 시작 시 PG)
 *  - 인원수는 익명 숫자만, 5명 미만은 '5명 미만'으로 (특정 방지)
 *  - ❌ 개인의 HIT 검사 내용은 기업에 제공하지 않는다 (2026-10-13 사용자 결정) — 기업은 인원수·묶음 통계만
 */
import { JOB_FUNCTIONS, INDUSTRIES, JOB_LEVELS } from "@/lib/badak-constants";

export const OFFER_JOB_FUNCTIONS = JOB_FUNCTIONS.filter(f => !["학생", "취업 준비", "기타"].includes(f));
export const OFFER_INDUSTRIES = INDUSTRIES;
export const OFFER_CAREER_LEVELS = JOB_LEVELS;

export const WORK_MODES = [
    { v: "onsite", l: "출근" },
    { v: "hybrid", l: "하이브리드" },
    { v: "remote", l: "재택" },
    { v: "any", l: "무관" },
] as const;

export const LOCATIONS = [
    { v: "seoul", l: "서울" },
    { v: "gyeonggi", l: "경기" },
    { v: "incheon", l: "인천" },
    { v: "busan", l: "부산" },
    { v: "daegu", l: "대구" },
    { v: "other", l: "기타 지역" },
    { v: "any", l: "지역 무관" },
] as const;

export const OFFER_TYPES = [
    { v: "interview", l: "면접 제안" },
    { v: "coffee_chat", l: "인터뷰(커피챗) 제안" },
] as const;

export const labelOf = (list: readonly { v: string; l: string }[], v: string | null | undefined) =>
    list.find(x => x.v === v)?.l ?? (v || "-");

/** 익명 인원 표시 최소 단위 — 이보다 적으면 정확한 수를 알려 주지 않는다 */
export const COUNT_FLOOR = 5;
export const countLabel = (n: number) => (n < COUNT_FLOOR ? `${COUNT_FLOOR}명 미만` : `${n.toLocaleString()}명`);

/** 기업 열람 기한 — 응답일로부터 (채용절차법: 채용 여부 확정 후 반환 청구 기간 14~180일 범위) */
export const COMPANY_VIEW_DAYS = 180;

/* ── 기업 인재상 조건 ── */
export interface OfferCriteria {
    job_functions: string[];
    industries: string[];
    career_levels: string[];
    work_mode: string;
    locations: string[];
    require_hit_a: boolean;
}

export const EMPTY_CRITERIA: OfferCriteria = {
    job_functions: [], industries: [], career_levels: [], work_mode: "", locations: [], require_hit_a: false,
};

const pickList = (v: unknown, allowed: readonly string[]) =>
    Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && allowed.includes(x)))] : [];

export function normalizeCriteria(raw: unknown): OfferCriteria {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const wm = typeof r.work_mode === "string" && WORK_MODES.some(w => w.v === r.work_mode) ? r.work_mode : "";
    return {
        job_functions: pickList(r.job_functions, OFFER_JOB_FUNCTIONS),
        industries: pickList(r.industries, OFFER_INDUSTRIES),
        career_levels: pickList(r.career_levels, OFFER_CAREER_LEVELS),
        work_mode: wm,
        locations: pickList(r.locations, LOCATIONS.map(l => l.v)),
        require_hit_a: r.require_hit_a === true,
    };
}

/* ── 인재 제안 받기 설정 ── */
export interface OfferSettings {
    is_open: boolean;
    job_functions: string[];
    industries: string[];
    career_level: string;
    work_mode: string;
    locations: string[];
    consented_at: string | null;
}

export const EMPTY_SETTINGS: OfferSettings = {
    is_open: false, job_functions: [], industries: [], career_level: "", work_mode: "", locations: [], consented_at: null,
};

export function normalizeSettings(raw: unknown): OfferSettings {
    const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    return {
        is_open: r.is_open === true,
        job_functions: pickList(r.job_functions, OFFER_JOB_FUNCTIONS).slice(0, 3),
        industries: pickList(r.industries, OFFER_INDUSTRIES).slice(0, 5),
        career_level: typeof r.career_level === "string" && (OFFER_CAREER_LEVELS as readonly string[]).includes(r.career_level) ? r.career_level : "",
        work_mode: typeof r.work_mode === "string" && WORK_MODES.some(w => w.v === r.work_mode) ? r.work_mode : "",
        locations: pickList(r.locations, LOCATIONS.map(l => l.v)),
        consented_at: typeof r.consented_at === "string" ? r.consented_at : null,
    };
}

/* ── 동의 문안 (개인정보보호법) — 문안을 바꾸면 버전을 올린다 ── */

/** 제안 받기 — 수집·이용 동의 (제15조) */
export const SETTINGS_CONSENT_VERSION = "2026-10-13b"; // b: 인재 풀 리포트(익명 통계) 목적 추가
export const SETTINGS_CONSENT = {
    purpose: "기업의 면접·인터뷰 제안 알림, 인재 풀 리포트(직무별 익명 통계) 작성",
    items: "희망 직무·산업·경력 구간·근무 형태·지역, HIT 기본 성향 검사 완료 여부",
    retention: "제안 받기를 끄거나 탈퇴할 때까지",
    note: "기업에는 조건에 맞는 인원수와 묶음 통계만 익명으로 보이며, 이름·연락처·이력서는 내가 제안에 응할 때만 그 기업에 제공됩니다. HIT 검사 내용은 어떤 경우에도 기업에 제공하지 않습니다. 동의하지 않으면 제안을 받을 수 없을 뿐 다른 서비스 이용에는 영향이 없습니다.",
};

/** 제안에 응할 때 — 제3자 제공 동의 (제17조) */
export const PROVISION_CONSENT_VERSION = "2026-10-13";
export function provisionConsentText(companyName: string) {
    return {
        recipient: companyName,
        purpose: "채용 면접·인터뷰 검토 및 연락",
        items: ["이름", "이메일", "연락처", "선택한 이력서"],
        retention: `채용 절차 종료 시까지 (응답일로부터 최대 ${COMPANY_VIEW_DAYS}일)`,
        note: "동의하지 않으면 이 제안에 응할 수 없습니다. 응답 후에도 철회할 수 있으며, 철회하면 기업은 더 이상 내 정보를 볼 수 없습니다.",
    };
}

/* ── 상태 표기 ── */
export const OFFER_STATUS_LABEL: Record<string, string> = {
    requested: "검토 중", sent: "발송됨", rejected: "반려", closed: "마감", canceled: "취소",
};
export const RECIPIENT_STATUS_LABEL: Record<string, string> = {
    sent: "새 제안", viewed: "확인함", accepted: "응함", declined: "거절", expired: "마감",
};
export const COMPANY_STATUS = [
    { v: "new", l: "새 응답" },
    { v: "reviewing", l: "검토 중" },
    { v: "interview", l: "면접 진행" },
    { v: "passed", l: "합격" },
    { v: "hold", l: "보류" },
    { v: "closed", l: "종료" },
] as const;
