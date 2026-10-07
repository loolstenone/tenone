// 유니버스 공통 신청 폼 (sql/forms-module.sql) — forms · form_responses

export type FormQuestionType =
    | "short" | "long" | "email" | "phone" | "number" | "date" | "url"
    | "radio" | "checkbox" | "select"
    | "file" | "agree" | "section";

export interface FormQuestion {
    id: string;
    type: FormQuestionType;
    label: string;
    help?: string;
    required?: boolean;
    /** radio·checkbox·select 선택지 */
    options?: string[];
    /** radio·checkbox에 "기타: 직접 입력" 추가 */
    allowOther?: boolean;
    /** file: 최대 파일 수 (기본 1, 최대 3) */
    maxFiles?: number;
}

export interface FormSettings {
    /** Ten:One ID 로그인한 사람만 응답 */
    require_login?: boolean;
    /** 제출 후 본인이 수정 가능 (로그인 필수) */
    allow_edit?: boolean;
    /** 1인 1회 응답 (로그인 필수) */
    one_per_user?: boolean;
    /** 선착순 정원 — 다 차면 마감 */
    max_responses?: number | null;
    /** 제출 완료 문구 */
    confirmation?: string;
    /** 새 응답 알림 받을 직원 이메일 */
    notify_emails?: string[];
}

export interface FormPrivacy {
    /** 수집·이용 목적 */
    purpose?: string;
    /** 보관 기간 */
    retention?: string;
}

export type FormStatus = "draft" | "open" | "closed";

export interface FormDef {
    id: string;
    brand_id: string;
    slug: string;
    program: string | null;
    title: string;
    description: string | null;
    status: FormStatus;
    opens_at: string | null;
    closes_at: string | null;
    questions: FormQuestion[];
    settings: FormSettings;
    privacy: FormPrivacy;
    created_at: string;
    updated_at: string;
}

export type FormAnswerValue = string | string[] | boolean | null;
export type FormAnswers = Record<string, FormAnswerValue>;

export interface FormAttachment {
    questionId: string;
    name: string;
    size: number;
    type: string;
    path: string;
}

export type FormResponseStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface FormResponse {
    id: string;
    form_id: string;
    brand_id: string;
    member_id: string | null;
    respondent_email: string | null;
    answers: FormAnswers;
    attachments: FormAttachment[];
    consent: { version: string; agreed_at: string; purpose: string; items: string[]; retention: string };
    status: FormResponseStatus;
    staff_note: string | null;
    created_at: string;
    updated_at: string;
}

/** 응답 화면 상태 — 지금 제출 가능한지 */
export type FormAvailability = "open" | "draft" | "upcoming" | "closed" | "full";
