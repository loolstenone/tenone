"use client";

// @handle 등록 모달 — 사용자가 처음으로 콘텐츠를 공개하려 할 때 호출
// 권장 트리거: 첫 visibility=public 토글 시점 (가입 즉시 강제하지 않음)

import { useEffect, useState } from "react";
import { Loader2, Check, X, AtSign } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    onRegistered: (handle: string) => void;
    /** 등록 직후 띄울 안내 메시지 — 무엇을 공개하려는 흐름인지 설명 */
    contextNote?: string;
}

const HANDLE_RE = /^[a-z0-9_]{3,20}$/;

export function HandleRegisterModal({ open, onClose, onRegistered, contextNote }: Props) {
    const [handle, setHandle] = useState("");
    const [checking, setChecking] = useState(false);
    const [available, setAvailable] = useState<boolean | null>(null);
    const [reason, setReason] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // debounced 가용성 체크
    useEffect(() => {
        if (!handle) { setAvailable(null); setReason(null); return; }
        if (!HANDLE_RE.test(handle)) {
            setAvailable(false); setReason("형식이 맞지 않습니다 (영문 소문자·숫자·언더스코어 3~20자)");
            return;
        }
        const timer = setTimeout(async () => {
            setChecking(true);
            try {
                const res = await fetch(`/api/myverse/handle?check=${handle}`);
                const json = await res.json();
                setAvailable(json.available);
                setReason(json.reason === "reserved" ? "예약된 핸들입니다"
                    : json.reason === "taken" ? "이미 사용 중인 핸들입니다"
                    : json.reason === "invalid_format" ? "형식이 맞지 않습니다"
                    : null);
            } catch {
                setAvailable(null); setReason("확인 중 오류");
            } finally {
                setChecking(false);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [handle]);

    async function submit() {
        if (!available) return;
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/myverse/handle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ handle }),
            });
            const json = await res.json();
            if (!res.ok) {
                setError(json.error === "taken" ? "방금 다른 사용자가 가져갔습니다"
                    : json.error === "reserved" ? "예약된 핸들입니다"
                    : json.hint ?? json.error ?? "등록 실패");
                return;
            }
            onRegistered(json.handle);
            onClose();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setSubmitting(false);
        }
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9200] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900">@핸들 정하기</h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                            myverse.kr/@<span className="font-mono">{handle || "yourhandle"}</span> 에서 본인이 공개한 콘텐츠가 보입니다.
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {contextNote && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mb-3">
                        {contextNote}
                    </p>
                )}

                <div className="relative mb-2">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                        placeholder="cheonse"
                        autoFocus
                        maxLength={20}
                        className="w-full pl-9 pr-9 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-[#6366F1] font-mono"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checking && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
                        {!checking && available === true && <Check className="h-4 w-4 text-emerald-500" />}
                        {!checking && available === false && <X className="h-4 w-4 text-rose-500" />}
                    </div>
                </div>

                <p className="text-[11px] text-neutral-500 mb-4 min-h-[16px]">
                    {reason ?? "영문 소문자·숫자·언더스코어 3~20자"}
                </p>

                {error && <p className="text-xs text-rose-500 mb-3">{error}</p>}

                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-800"
                    >
                        나중에
                    </button>
                    <button
                        onClick={submit}
                        disabled={!available || submitting}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] disabled:opacity-50 transition-colors"
                    >
                        {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        등록
                    </button>
                </div>

                <p className="text-[10px] text-neutral-400 mt-3 text-center">
                    핸들은 나중에 변경할 수 있어요. 다른 SNS에서 본인을 알리는 주소로 사용됩니다.
                </p>
            </div>
        </div>
    );
}
