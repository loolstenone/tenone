/**
 * 문의(contact_submissions) 상태·응대 기록 규칙 — 인트라 공용
 * 답변/미답변 판단 근거 = handling_log. 이메일·전화 등 인트라 밖에서 응대해도 여기에 기록한다.
 */

export const INQUIRY_STATUSES = ["pending", "in_progress", "resolved", "closed"] as const;
export type InquiryStatus = typeof INQUIRY_STATUSES[number];

export const INQUIRY_STATUS: Record<InquiryStatus, { label: string; cls: string }> = {
    pending: { label: "미답변", cls: "bg-amber-50 text-amber-700" },
    in_progress: { label: "처리 중", cls: "bg-sky-50 text-sky-700" },
    resolved: { label: "답변 완료", cls: "bg-emerald-50 text-emerald-700" },
    closed: { label: "종료", cls: "bg-neutral-100 text-neutral-500" },
};

/** 미답변으로 셀 상태 (구 값 new 포함) */
export const OPEN_INQUIRY_STATUSES = new Set(["pending", "new", "in_progress"]);

export const REPLY_CHANNELS = ["email", "phone", "kakao", "meeting", "other"] as const;
export type ReplyChannel = typeof REPLY_CHANNELS[number];

export const REPLY_CHANNEL_LABEL: Record<ReplyChannel, string> = {
    email: "이메일",
    phone: "전화",
    kakao: "카카오톡·문자",
    meeting: "미팅",
    other: "기타",
};

export interface HandlingLogEntry {
    at: string;
    by: string;          // members.id (데이터 계약 1조 — 이름 복사 금지, 표시할 때 조회)
    by_name?: string;    // API 응답에서만 채움
    channel: ReplyChannel;
    status: InquiryStatus;
    note: string;
}

export function inquiryStatusOf(status: string | null | undefined) {
    return INQUIRY_STATUS[(status === "new" ? "pending" : status) as InquiryStatus]
        ?? { label: status ?? "-", cls: "bg-neutral-100 text-neutral-500" };
}
