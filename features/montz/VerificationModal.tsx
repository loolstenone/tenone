"use client";

import { useState } from "react";
import { X, ChevronDown, ShieldCheck, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface Props {
    onClose: () => void;
}

const TYPE_OPTIONS = ["모델", "배우", "모델·배우"];

export function VerificationModal({ onClose }: Props) {
    const { user } = useAuth();
    const [form, setForm] = useState({
        real_name: "",
        phone: "",
        type: "모델",
        agency: "",
        sns_link: "",
        consent_privacy: false,
        consent_truth: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const set = (k: string, v: string | boolean) =>
        setForm((prev) => ({ ...prev, [k]: v }));

    const canSubmit =
        form.real_name.trim() &&
        form.phone.trim() &&
        form.consent_privacy &&
        form.consent_truth;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setSubmitting(true);
        const supabase = createClient();
        await supabase.from("montz_verification_requests").insert({
            user_id: user?.id ?? null,
            email: user?.email ?? null,
            real_name: form.real_name,
            phone: form.phone,
            creator_type: form.type,
            agency: form.agency || null,
            sns_link: form.sns_link || null,
            status: "pending",
        });
        setSubmitting(false);
        setDone(true);
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-none max-h-[92vh] overflow-y-auto">

                {/* 헤더 */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" style={{ color: "#FFC000" }} />
                        <div>
                            <p className="text-[11px] font-mono text-neutral-500 tracking-widest uppercase leading-none">MoNTZ</p>
                            <p className="text-[15px] font-black text-neutral-900 leading-tight">공식 인증 신청</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-neutral-500 hover:text-neutral-900">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {done ? (
                    <div className="px-5 py-14 text-center">
                        <ShieldCheck className="h-10 w-10 mx-auto mb-3" style={{ color: "#FFC000" }} />
                        <p className="text-[18px] font-black text-neutral-900 mb-1">신청이 접수됐습니다</p>
                        <p className="text-[13px] text-neutral-700 mb-1">서류 검토 후 3~5 영업일 내 결과를 안내드립니다.</p>
                        <p className="text-[12px] text-neutral-500 mb-7">승인 시 프로필에 인증 마크가 표시됩니다.</p>
                        <button onClick={onClose} className="text-[13px] font-bold border border-neutral-900 px-6 py-2.5 hover:bg-neutral-900 hover:text-white transition-colors">
                            닫기
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">

                        {/* 안내 */}
                        <div className="flex items-start gap-2.5 bg-neutral-50 px-3.5 py-3 border border-neutral-100">
                            <Lock className="h-4 w-4 text-neutral-400 shrink-0 mt-0.5" />
                            <p className="text-[12px] text-neutral-600 leading-relaxed">
                                실명 및 연락처는 <strong className="text-neutral-900">본인 확인 목적으로만</strong> 사용되며, 공개 프로필에는 절대 표시되지 않습니다.
                            </p>
                        </div>

                        {/* 실명 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">
                                실명 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.real_name}
                                onChange={(e) => set("real_name", e.target.value)}
                                placeholder="주민등록상 이름"
                                required
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-900"
                            />
                        </div>

                        {/* 연락처 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">
                                연락처 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => set("phone", e.target.value)}
                                placeholder="010-0000-0000"
                                required
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-900"
                            />
                        </div>

                        {/* 이메일 (읽기 전용) */}
                        {user?.email && (
                            <div>
                                <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">이메일</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className="w-full border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-[14px] text-neutral-500 cursor-not-allowed"
                                />
                            </div>
                        )}

                        {/* 직종 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">직종 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <select
                                    value={form.type}
                                    onChange={(e) => set("type", e.target.value)}
                                    className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] font-semibold appearance-none focus:outline-none focus:border-neutral-900 bg-white pr-8"
                                >
                                    {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* 소속사 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">
                                소속사 / 에이전시
                                <span className="ml-1 font-normal text-neutral-500">(선택)</span>
                            </label>
                            <input
                                type="text"
                                value={form.agency}
                                onChange={(e) => set("agency", e.target.value)}
                                placeholder="프리랜서인 경우 비워두세요"
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-900"
                            />
                        </div>

                        {/* SNS / 포트폴리오 */}
                        <div>
                            <label className="block text-[13px] font-bold text-neutral-900 mb-1.5">
                                SNS 또는 포트폴리오 링크
                                <span className="ml-1 font-normal text-neutral-500">(선택)</span>
                            </label>
                            <input
                                type="url"
                                value={form.sns_link}
                                onChange={(e) => set("sns_link", e.target.value)}
                                placeholder="https://instagram.com/..."
                                className="w-full border border-neutral-300 px-3 py-2.5 text-[14px] focus:outline-none focus:border-neutral-900"
                            />
                        </div>

                        {/* 동의 */}
                        <div className="space-y-3 pt-1">
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.consent_privacy}
                                    onChange={(e) => set("consent_privacy", e.target.checked)}
                                    className="mt-0.5 shrink-0 accent-neutral-900"
                                />
                                <span className="text-[12px] text-neutral-700 leading-relaxed">
                                    <strong className="text-neutral-900">[필수]</strong> 개인정보(실명·연락처)를 인증 심사 목적으로 수집·이용하는 것에 동의합니다. 심사 완료 후 즉시 파기됩니다.
                                </span>
                            </label>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.consent_truth}
                                    onChange={(e) => set("consent_truth", e.target.checked)}
                                    className="mt-0.5 shrink-0 accent-neutral-900"
                                />
                                <span className="text-[12px] text-neutral-700 leading-relaxed">
                                    <strong className="text-neutral-900">[필수]</strong> 제출한 모든 정보가 사실임을 확인합니다. 허위 정보 제출 시 인증 취소 및 계정 이용이 제한될 수 있습니다.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit || submitting}
                            className="w-full py-3 text-[14px] font-black bg-neutral-900 text-white hover:bg-neutral-700 transition-colors disabled:opacity-40 mt-1"
                        >
                            {submitting ? "신청 중…" : "인증 신청하기"}
                        </button>

                        <p className="text-[11px] text-neutral-400 text-center pb-2">
                            문의: <a href="mailto:hello@tenone.biz" className="underline hover:text-neutral-700">hello@tenone.biz</a>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
