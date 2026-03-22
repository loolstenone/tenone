"use client";

import { FileCheck, CheckCircle, Clock, AlertCircle } from "lucide-react";

const criteria = [
    { label: "기수 활동 완료", desc: "해당 기수 전체 활동 기간을 완료한 멤버" },
    { label: "경쟁 PT 참가", desc: "1회 이상 경쟁 PT에 팀원으로 참가한 경험" },
    { label: "출석률 80% 이상", desc: "정기 모임 및 프로그램 출석률 80% 이상" },
    { label: "팀 활동 기여", desc: "팀 프로젝트에 실질적으로 기여한 것을 확인" },
];

const steps = [
    { step: 1, title: "신청", desc: "활동인증서 발급 신청서를 온라인으로 제출합니다." },
    { step: 2, title: "검토", desc: "활동 기록을 바탕으로 발급 자격을 검토합니다." },
    { step: 3, title: "발급", desc: "검토 완료 후 디지털 인증서를 발급합니다." },
    { step: 4, title: "수령", desc: "이메일 또는 마이페이지에서 인증서를 다운로드합니다." },
];

export default function CertificatePage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-3 block">
                        Certificate
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">활동인증서</h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        MAD League 활동을 공식적으로 인증하는 활동인증서를 발급받으세요.
                    </p>
                </div>
            </section>

            {/* 인증서 샘플 */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        {/* 샘플 placeholder */}
                        <div className="aspect-[3/4] bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center p-8">
                            <FileCheck className="h-16 w-16 text-[#D32F2F]/30 mb-4" />
                            <p className="text-sm text-neutral-400 text-center font-medium">활동인증서 샘플</p>
                            <div className="mt-6 space-y-2 text-center">
                                <p className="text-lg font-bold text-neutral-700">활 동 인 증 서</p>
                                <p className="text-xs text-neutral-400">MAD League 제 8기</p>
                                <div className="mt-4 pt-4 border-t border-neutral-200">
                                    <p className="text-sm text-neutral-500">성명: 홍길동</p>
                                    <p className="text-sm text-neutral-500">소속: OO대학교</p>
                                    <p className="text-sm text-neutral-500">활동기간: 2026.03 ~ 2026.08</p>
                                </div>
                                <div className="mt-4">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D32F2F]/10 text-[#D32F2F] text-xs rounded-full font-medium">
                                        <span className="bg-[#D32F2F] text-white text-[8px] px-1 py-px font-bold">MAD</span>
                                        LEAGUE
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 설명 */}
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-900 mb-4">활동인증서란?</h2>
                            <p className="text-neutral-600 leading-relaxed mb-6">
                                MAD League 활동인증서는 기수별 활동을 공식적으로 인증하는 문서입니다.
                                경쟁 PT 참가, 프로그램 수료, 팀 활동 등 MAD League에서의 경험을
                                취업이나 대외활동 증빙에 활용할 수 있습니다.
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>인증서는 디지털(PDF) 형태로 발급되며, 고유번호로 진위 확인이 가능합니다.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 발급 기준 */}
            <section className="py-20 px-6 bg-neutral-50">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-8 text-center">발급 기준</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {criteria.map((c) => (
                            <div key={c.label} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-neutral-200">
                                <CheckCircle className="h-5 w-5 text-[#D32F2F] shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-neutral-900 text-sm">{c.label}</h3>
                                    <p className="text-xs text-neutral-500 mt-0.5">{c.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 발급 절차 */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl font-bold text-neutral-900 mb-12 text-center">발급 절차</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((s) => (
                            <div key={s.step} className="text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D32F2F] text-white font-bold text-lg mb-3">
                                    {s.step}
                                </div>
                                <h3 className="font-bold text-neutral-900 mb-1">{s.title}</h3>
                                <p className="text-sm text-neutral-500">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 flex items-center justify-center gap-2 text-sm text-neutral-400">
                        <Clock className="h-4 w-4" />
                        <span>신청 후 약 5~7일 이내 발급 완료</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
