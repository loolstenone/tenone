"use client";

// 모먼트의 신고/차단 메뉴 — 본인이 아닌 모먼트에서만 노출.

import { useState } from "react";
import { Flag, UserX, X, Check, Loader2 } from "lucide-react";

interface Props {
    momentId: string;
    authorId: string;
    authorName?: string | null;
    isMine: boolean;
    onBlocked?: () => void;
}

const REASONS: { key: string; label: string }[] = [
    { key: "spam",      label: "스팸·광고" },
    { key: "sexual",    label: "성적인 콘텐츠" },
    { key: "violence",  label: "폭력적인 콘텐츠" },
    { key: "hate",      label: "혐오·차별" },
    { key: "self_harm", label: "자해·자살" },
    { key: "illegal",   label: "불법 콘텐츠" },
    { key: "other",     label: "기타" },
];

export function ReportBlockMenu({ momentId, authorId, authorName, isMine, onBlocked }: Props) {
    const [open, setOpen] = useState<"none" | "menu" | "report" | "block">("none");
    const [reason, setReason] = useState<string>("spam");
    const [detail, setDetail] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState<"reported" | "blocked" | null>(null);

    if (isMine) return null;

    async function submitReport() {
        setSubmitting(true);
        try {
            const r = await fetch(`/api/myverse/moments/${momentId}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason, detail: detail.slice(0, 1000) || undefined }),
            });
            if (r.ok) { setDone("reported"); setTimeout(() => setOpen("none"), 1500); }
        } finally { setSubmitting(false); }
    }

    async function submitBlock() {
        setSubmitting(true);
        try {
            const r = await fetch("/api/myverse/blocks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blocked_id: authorId }),
            });
            if (r.ok) {
                setDone("blocked");
                setTimeout(() => { setOpen("none"); onBlocked?.(); }, 1200);
            }
        } finally { setSubmitting(false); }
    }

    return (
        <>
            <button
                onClick={() => { setOpen("menu"); setDone(null); }}
                className="text-[11px] text-neutral-400 hover:text-rose-500 underline-offset-2 hover:underline"
            >
                신고·차단
            </button>

            {open !== "none" && (
                <div className="fixed inset-0 z-[9100] bg-black/70 flex items-center justify-center p-4" onClick={() => !submitting && setOpen("none")}>
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        {open === "menu" && (
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-neutral-900">관리</h3>
                                    <button onClick={() => setOpen("none")} className="p-1 text-neutral-400 hover:text-neutral-700">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setOpen("report")}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-50 text-left"
                                >
                                    <Flag className="h-4 w-4 text-rose-500 shrink-0" />
                                    <div>
                                        <p className="text-sm text-neutral-900">이 흔적 신고하기</p>
                                        <p className="text-[11px] text-neutral-500">검토팀에 전달됩니다.</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setOpen("block")}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neutral-50 text-left"
                                >
                                    <UserX className="h-4 w-4 text-neutral-700 shrink-0" />
                                    <div>
                                        <p className="text-sm text-neutral-900">{authorName ? `${authorName} 차단` : "이 사용자 차단"}</p>
                                        <p className="text-[11px] text-neutral-500">서로의 흔적·메시지가 보이지 않게 됩니다.</p>
                                    </div>
                                </button>
                            </div>
                        )}

                        {open === "report" && (
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-neutral-900 mb-3">신고 사유</h3>
                                {done === "reported" ? (
                                    <div className="py-6 text-center">
                                        <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-sm text-neutral-700">신고가 접수되었어요.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-1 mb-3">
                                            {REASONS.map(r => (
                                                <label key={r.key} className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
                                                    <input type="radio" name="reason" value={r.key}
                                                        checked={reason === r.key}
                                                        onChange={() => setReason(r.key)}
                                                        className="text-rose-500" />
                                                    <span className="text-sm text-neutral-800">{r.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <textarea
                                            value={detail}
                                            onChange={e => setDetail(e.target.value.slice(0, 1000))}
                                            rows={2}
                                            placeholder="추가 설명 (선택)"
                                            className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 placeholder:text-neutral-300 focus:outline-none focus:border-rose-400 resize-none mb-3"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => setOpen("menu")} disabled={submitting}
                                                className="flex-1 px-3 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50">
                                                뒤로
                                            </button>
                                            <button onClick={submitReport} disabled={submitting}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50">
                                                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Flag className="h-3.5 w-3.5" />}
                                                신고
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {open === "block" && (
                            <div className="p-4">
                                <h3 className="text-sm font-semibold text-neutral-900 mb-2">차단할까요?</h3>
                                {done === "blocked" ? (
                                    <div className="py-6 text-center">
                                        <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-sm text-neutral-700">차단했어요.</p>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                                            <span className="font-medium">{authorName ?? "이 사용자"}</span>의 공개 흔적이 피드에서 보이지 않고, 서로 메시지를 주고받을 수 없어요. 언제든 설정에서 해제할 수 있어요.
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={() => setOpen("menu")} disabled={submitting}
                                                className="flex-1 px-3 py-2 text-sm text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 disabled:opacity-50">
                                                뒤로
                                            </button>
                                            <button onClick={submitBlock} disabled={submitting}
                                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-black disabled:opacity-50">
                                                {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserX className="h-3.5 w-3.5" />}
                                                차단
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
