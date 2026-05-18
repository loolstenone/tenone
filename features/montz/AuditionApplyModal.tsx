"use client";

/**
 * MoNTZ 오디션 응시 모달
 *
 * 인증된 모델·배우가 오디션 공고에 응시한다.
 * - 비로그인이면 안내 후 차단
 * - 본인 montz_creators가 없으면 프로필 등록 유도
 * - 제출 → /api/montz/applications → DB INSERT + 캐스팅 디렉터에게 이메일
 */

import { useState } from "react";
import Link from "next/link";
import { X, Loader2, Send, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

interface AuditionApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    auditionId: string;
    auditionTitle: string;        // "company · role" 같이 한 줄 요약
}

export function AuditionApplyModal({ isOpen, onClose, auditionId, auditionTitle }: AuditionApplyModalProps) {
    const { isAuthenticated, user } = useAuth();
    const [message, setMessage] = useState("");
    const [contactEmail, setContactEmail] = useState(user?.email ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
            setError("올바른 이메일을 입력하세요.");
            return;
        }

        setSubmitting(true);
        try {
            const sb = createClient();
            const { data: { session } } = await sb.auth.getSession();
            if (!session?.access_token) throw new Error("로그인 세션이 만료되었습니다.");

            const res = await fetch("/api/montz/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    auditionId,
                    message: message.trim() || undefined,
                    applicantEmail: contactEmail.trim(),
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "응시 실패");
            setSuccess(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "응시 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (success) { setMessage(""); setSuccess(false); }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative w-full max-w-md bg-white border border-neutral-200 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between flex-shrink-0">
                    <div>
                        <p className="text-[#c8a97e] text-[11px] tracking-[0.2em] uppercase">APPLY</p>
                        <p className="text-[15px] font-bold text-neutral-900 line-clamp-1">{auditionTitle}</p>
                    </div>
                    <button onClick={handleClose} className="h-9 w-9 flex items-center justify-center text-neutral-400 hover:text-neutral-900">
                        <X size={20} />
                    </button>
                </div>

                {/* 본문 */}
                {!isAuthenticated ? (
                    <div className="px-5 py-10 text-center">
                        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                        <p className="text-[15px] font-bold text-neutral-900 mb-2">로그인이 필요합니다</p>
                        <p className="text-[13px] text-neutral-600 mb-5">응시하려면 MoNTZ 크리에이터로 로그인해 주세요.</p>
                        <button onClick={handleClose} className="bg-neutral-900 text-white text-[13px] font-bold px-6 py-2.5 hover:bg-neutral-700 transition-colors">
                            닫기
                        </button>
                    </div>
                ) : success ? (
                    <div className="px-5 py-12 text-center">
                        <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                            <Send className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-[18px] font-bold text-neutral-900 mb-2">응시가 접수되었습니다</p>
                        <p className="text-[13px] text-neutral-700 mb-6 leading-relaxed">
                            캐스팅 디렉터에게 이메일로 알림이 전달되었습니다.<br />
                            결과는 마이페이지에서 확인할 수 있습니다.
                        </p>
                        <div className="flex gap-2">
                            <button onClick={handleClose}
                                className="flex-1 border border-neutral-300 text-neutral-700 text-[13px] font-bold py-2.5 hover:bg-neutral-50 transition-colors">
                                닫기
                            </button>
                            <Link href="/montz/my"
                                className="flex-1 bg-neutral-900 text-white text-[13px] font-bold py-2.5 hover:bg-neutral-700 transition-colors flex items-center justify-center">
                                마이페이지
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
                        <div className="bg-[#c8a97e]/10 border border-[#c8a97e]/30 text-neutral-800 text-[12px] px-3 py-2">
                            제출 시 캐스팅 디렉터에게 자동 이메일 발송. 같은 공고에 중복 응시는 불가합니다.
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 block">
                                답장 받을 이메일 <span className="text-red-500">*</span>
                            </label>
                            <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} maxLength={120}
                                placeholder="you@example.com" disabled={submitting}
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 block">
                                자기소개·메시지 (선택)
                            </label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={6}
                                placeholder="경력·강점·일정 가능 여부 등을 알려주세요." disabled={submitting}
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400 resize-none" />
                            <p className="text-[11px] text-neutral-500 mt-1 text-right">{message.length}/1000</p>
                        </div>
                        {error && (
                            <div className="bg-red-50 border border-red-300 text-red-700 text-[12px] px-3 py-2">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={handleClose} disabled={submitting}
                                className="flex-1 border border-neutral-300 text-neutral-700 text-[13px] font-bold py-2.5 hover:bg-neutral-50 disabled:opacity-40 transition-colors">
                                취소
                            </button>
                            <button type="submit" disabled={submitting || !contactEmail.trim()}
                                className="flex-1 bg-[#c8a97e] text-neutral-900 text-[13px] font-bold py-2.5 hover:bg-[#d4b88c] disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5">
                                {submitting ? (<><Loader2 size={14} className="animate-spin" /> 응시 중</>) : (<><Send size={14} /> 응시하기</>)}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
