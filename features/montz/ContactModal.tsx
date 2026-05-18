"use client";

/**
 * MoNTZ 캐스팅 컨택 모달
 *
 * 캐스팅 디렉터(또는 임의 방문자)가 모델·배우 프로필 페이지에서
 * "캐스팅 제안" 버튼을 눌러 메시지를 보낸다.
 * - 비로그인도 가능 (이메일 필수)
 * - 로그인 사용자면 자동으로 sender_user_id 첨부 (서버에서 인증 검증)
 * - 제출 → /api/montz/contact → DB INSERT + Resend 이메일 발송
 */

import { useState } from "react";
import { X, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetCreatorId: string;
    targetDisplayName: string;
}

export function ContactModal({ isOpen, onClose, targetCreatorId, targetDisplayName }: ContactModalProps) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [roleTitle, setRoleTitle] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !email.trim() || !message.trim()) {
            setError("이름·이메일·메시지는 필수입니다.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("올바른 이메일 형식이 아닙니다.");
            return;
        }

        setSubmitting(true);
        try {
            // 인증 헤더 — 로그인 사용자면 access_token 첨부 → 서버에서 sender_user_id 자동 매핑
            const sb = createClient();
            const { data: { session } } = await sb.auth.getSession();
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

            const res = await fetch("/api/montz/contact", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    targetCreatorId,
                    senderName: name.trim(),
                    senderEmail: email.trim(),
                    senderCompany: company.trim() || undefined,
                    roleTitle: roleTitle.trim() || undefined,
                    message: message.trim(),
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "전송 실패");
            setSuccess(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "전송 중 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (success) {
            // 초기화
            setName(""); setEmail(""); setCompany(""); setRoleTitle(""); setMessage("");
            setSuccess(false);
        }
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
                        <p className="text-[#c8a97e] text-[11px] tracking-[0.2em] uppercase">CASTING</p>
                        <p className="text-[16px] font-bold text-neutral-900">{targetDisplayName}에게 캐스팅 제안</p>
                    </div>
                    <button onClick={handleClose} className="h-9 w-9 flex items-center justify-center text-neutral-400 hover:text-neutral-900">
                        <X size={20} />
                    </button>
                </div>

                {success ? (
                    <div className="px-5 py-12 text-center">
                        <div className="h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                            <Send className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-[18px] font-bold text-neutral-900 mb-2">제안이 전송되었습니다</p>
                        <p className="text-[13px] text-neutral-700 mb-6 leading-relaxed">
                            {targetDisplayName}님께 이메일로 알림이 전달되었습니다.<br />
                            답장은 입력하신 이메일로 직접 받게 됩니다.
                        </p>
                        <button onClick={handleClose}
                            className="bg-neutral-900 text-white text-[13px] font-bold px-6 py-2.5 hover:bg-neutral-700 transition-colors">
                            닫기
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5">
                        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[12px] px-3 py-2">
                            제출 시 모델·배우에게 이메일로 즉시 알림이 발송됩니다.
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 block">
                                이름 <span className="text-red-500">*</span>
                            </label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={40}
                                placeholder="홍길동" disabled={submitting}
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400" />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 block">
                                답장 받을 이메일 <span className="text-red-500">*</span>
                            </label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120}
                                placeholder="director@studio.com" disabled={submitting}
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 block">
                                    소속 (선택)
                                </label>
                                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={60}
                                    placeholder="OO 스튜디오" disabled={submitting}
                                    className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 block">
                                    역할 (선택)
                                </label>
                                <input type="text" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} maxLength={60}
                                    placeholder="여주인공·CF 메인 등" disabled={submitting}
                                    className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] text-neutral-900 focus:outline-none focus:border-neutral-900 placeholder:text-neutral-400" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1 block">
                                메시지 <span className="text-red-500">*</span>
                            </label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={5}
                                placeholder="프로젝트 개요·일정·예산·문의 내용을 알려주세요." disabled={submitting}
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
                            <button type="submit" disabled={submitting || !name.trim() || !email.trim() || !message.trim()}
                                className="flex-1 bg-neutral-900 text-white text-[13px] font-bold py-2.5 hover:bg-neutral-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5">
                                {submitting ? (<><Loader2 size={14} className="animate-spin" /> 전송 중</>) : (<><Send size={14} /> 제안 보내기</>)}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
