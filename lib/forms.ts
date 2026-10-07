/**
 * 유니버스 공통 신청 폼 규칙 — 브라우저(응답·빌더)·서버(API) 공용
 * 테이블: sql/forms-module.sql · 타입: types/forms.ts
 */
import type { FormAnswers, FormAvailability, FormDef, FormQuestion, FormQuestionType } from "@/types/forms";

export const FORM_QUESTION_TYPES: { type: FormQuestionType; label: string; hint: string }[] = [
    { type: "short", label: "단답형", hint: "한 줄 텍스트" },
    { type: "long", label: "장문형", hint: "여러 줄 텍스트" },
    { type: "email", label: "이메일", hint: "이메일 형식 검사" },
    { type: "phone", label: "전화번호", hint: "숫자·하이픈" },
    { type: "number", label: "숫자", hint: "숫자만" },
    { type: "date", label: "날짜", hint: "날짜 선택" },
    { type: "url", label: "링크", hint: "https:// 주소" },
    { type: "radio", label: "객관식 (하나)", hint: "선택지 중 하나" },
    { type: "checkbox", label: "체크박스 (여러 개)", hint: "선택지 중 여러 개" },
    { type: "select", label: "드롭다운", hint: "목록에서 하나" },
    { type: "file", label: "파일 업로드", hint: "PDF·PPT·이미지 등 10MB" },
    { type: "agree", label: "확인 체크", hint: "\"네, 약속합니다\" 같은 동의" },
    { type: "section", label: "구분 제목", hint: "질문 묶음 제목·안내문" },
];

export const CHOICE_TYPES: FormQuestionType[] = ["radio", "checkbox", "select"];
export const FORM_FILE_MAX = 3;
export const OTHER_PREFIX = "기타: ";

/** 개인정보 동의서에 적을 수집 항목 — 실제 답을 받는 질문 라벨 */
export function consentItems(questions: FormQuestion[]): string[] {
    return questions.filter(q => q.type !== "section" && q.type !== "agree").map(q => q.label);
}

/** 동의 버전 = 폼 마지막 수정 시각 (질문이 바뀌면 동의도 새 버전) */
export function consentVersion(form: Pick<FormDef, "updated_at">): string {
    return form.updated_at;
}

/** 지금 제출할 수 있는지 (응답 수는 서버가 넘겨줌) */
export function formAvailability(form: Pick<FormDef, "status" | "opens_at" | "closes_at" | "settings">, responseCount = 0, now = new Date()): FormAvailability {
    if (form.status === "draft") return "draft";
    if (form.status === "closed") return "closed";
    if (form.opens_at && new Date(form.opens_at) > now) return "upcoming";
    if (form.closes_at && new Date(form.closes_at) < now) return "closed";
    const max = form.settings?.max_responses;
    if (max && responseCount >= max) return "full";
    return "open";
}

export const AVAILABILITY_LABEL: Record<FormAvailability, string> = {
    open: "신청 받는 중",
    draft: "준비 중",
    upcoming: "신청 예정",
    closed: "신청 마감",
    full: "정원 마감",
};

/** 로그인 필요 여부 — 수정 허용·1인 1회는 로그인이 있어야 성립 */
export function formNeedsLogin(form: Pick<FormDef, "settings">): boolean {
    const s = form.settings ?? {};
    return !!(s.require_login || s.allow_edit || s.one_per_user);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 답 검증 — 문제 있으면 {질문id: 메시지}. 파일 질문은 fileCounts로 개수만 확인 */
export function validateFormAnswers(questions: FormQuestion[], answers: FormAnswers, fileCounts: Record<string, number> = {}): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const q of questions) {
        if (q.type === "section") continue;
        const v = answers[q.id];
        const empty = v === undefined || v === null || v === "" || v === false || (Array.isArray(v) && v.length === 0);

        if (q.type === "file") {
            const n = fileCounts[q.id] ?? 0;
            if (q.required && n === 0) errors[q.id] = "파일을 올려 주세요.";
            if (n > Math.min(q.maxFiles ?? 1, FORM_FILE_MAX)) errors[q.id] = `최대 ${Math.min(q.maxFiles ?? 1, FORM_FILE_MAX)}개까지 올릴 수 있습니다.`;
            continue;
        }
        if (empty) {
            if (q.required) errors[q.id] = q.type === "agree" ? "확인에 체크해 주세요." : "필수 항목입니다.";
            continue;
        }
        if (typeof v === "string" && v.length > 5000) { errors[q.id] = "5,000자 이내로 입력해 주세요."; continue; }
        switch (q.type) {
            case "email": if (typeof v !== "string" || !EMAIL_RE.test(v.trim())) errors[q.id] = "이메일 형식이 아닙니다."; break;
            case "phone": if (typeof v !== "string" || !/^[0-9+\-\s()]{8,20}$/.test(v.trim())) errors[q.id] = "전화번호를 확인해 주세요."; break;
            case "number": if (typeof v !== "string" || isNaN(Number(v))) errors[q.id] = "숫자만 입력해 주세요."; break;
            case "url": if (typeof v !== "string" || !/^https?:\/\/\S+\.\S+/.test(v.trim())) errors[q.id] = "https:// 로 시작하는 주소를 넣어 주세요."; break;
            case "radio": case "select": {
                const ok = typeof v === "string" && ((q.options ?? []).includes(v) || (q.allowOther && v.startsWith(OTHER_PREFIX) && v.length > OTHER_PREFIX.length));
                if (!ok) errors[q.id] = "선택지를 골라 주세요.";
                break;
            }
            case "checkbox": {
                const ok = Array.isArray(v) && v.every(x => typeof x === "string" && ((q.options ?? []).includes(x) || (q.allowOther && x.startsWith(OTHER_PREFIX))));
                if (!ok) errors[q.id] = "선택지를 확인해 주세요.";
                break;
            }
            case "agree": if (v !== true) errors[q.id] = "확인에 체크해 주세요."; break;
        }
    }
    return errors;
}

/** 저장할 답만 남김 — 정의에 없는 키·파일·구분 제목 제거 */
export function pickFormAnswers(questions: FormQuestion[], answers: FormAnswers): FormAnswers {
    const out: FormAnswers = {};
    for (const q of questions) {
        if (q.type === "section" || q.type === "file") continue;
        const v = answers[q.id];
        if (v === undefined) continue;
        out[q.id] = typeof v === "string" ? v.trim() : v;
    }
    return out;
}

/** 응답의 연락 이메일 — 첫 email 질문 값 (비회원 식별용) */
export function responseEmail(questions: FormQuestion[], answers: FormAnswers): string | null {
    const q = questions.find(x => x.type === "email");
    const v = q ? answers[q.id] : null;
    return typeof v === "string" && EMAIL_RE.test(v.trim()) ? v.trim().toLowerCase() : null;
}

/** 답을 사람이 읽는 문자열로 (인트라 표·CSV) */
export function formatAnswer(v: unknown): string {
    if (v === true) return "예";
    if (v === false || v === null || v === undefined) return "";
    if (Array.isArray(v)) return v.join(", ");
    return String(v);
}

/** 새 질문 id — 기존과 겹치지 않게 */
export function newQuestionId(existing: FormQuestion[]): string {
    let i = existing.length + 1;
    while (existing.some(q => q.id === `q${i}`)) i++;
    return `q${i}`;
}

/** slug 정규화 — 영문 소문자·숫자·하이픈 */
export function normalizeFormSlug(raw: string): string {
    return raw.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}
