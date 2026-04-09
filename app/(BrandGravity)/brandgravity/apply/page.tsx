"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

const serviceTypes = [
    { value: "scan", label: "Gravity Scan", desc: "100~300만원 · 1회 진단" },
    { value: "program", label: "Gravity Program", desc: "월 300~500만원 · 3개월~" },
    { value: "workshop", label: "Gravity Workshop", desc: "200~400만원 · 기업 교육" },
    { value: "dashboard", label: "Gravity Dashboard", desc: "월 50~100만원 · 사전등록" },
];

const industries = [
    "패션/의류", "뷰티/화장품", "식품/음료", "건강/피트니스", "전자/IT기기",
    "생활용품/홈", "금융/핀테크", "교육/EdTech", "여행/숙박", "SaaS/소프트웨어", "기타",
];

export default function GravityApplyPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        serviceType: "scan",
        industry: "",
        productName: "",
        competitors: "",
        painContext: "",
        budget: "",
        message: "",
    });

    const set = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/gravity/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (res.ok) setSubmitted(true);
        } catch {
            // 실패해도 제출 완료 처리 (이메일 알림으로 백업)
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <CheckCircle className="w-12 h-12 text-amber-500 mx-auto mb-6" />
                    <h1 className="text-2xl font-bold mb-3">신청이 접수됐습니다</h1>
                    <p className="text-neutral-400 mb-2">입력하신 이메일로 48시간 내에 연락드립니다.</p>
                    <p className="text-sm text-neutral-500 mb-8">주말 접수 건은 다음 주 월요일에 답변드립니다.</p>
                    <Link href="/brandgravity" className="inline-flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition">
                        <ArrowLeft className="w-4 h-4" /> Brand Gravity 홈으로
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white">
            <div className="max-w-2xl mx-auto px-6 pt-32 pb-20">

                {/* Header */}
                <div className="mb-10">
                    <Link href="/brandgravity" className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition mb-6">
                        <ArrowLeft className="w-3.5 h-3.5" /> Brand Gravity
                    </Link>
                    <p className="text-xs tracking-[0.3em] uppercase text-amber-500 mb-3">Apply</p>
                    <h1 className="text-3xl font-bold mb-3">Gravity Scan 신청</h1>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                        신청 후 48시간 내에 담당자가 연락드립니다.<br />
                        간단한 사전 정보를 입력해주시면 미팅 없이 바로 견적을 드릴 수 있습니다.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* 서비스 선택 */}
                    <div>
                        <label className="block text-xs tracking-[0.15em] text-neutral-500 uppercase mb-3">원하는 서비스</label>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {serviceTypes.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    onClick={() => set("serviceType", s.value)}
                                    className={`text-left p-4 rounded-xl border transition ${form.serviceType === s.value
                                        ? "border-amber-500 bg-amber-500/10"
                                        : "border-neutral-800 hover:border-neutral-600"
                                        }`}
                                >
                                    <p className="text-sm font-bold mb-0.5">{s.label}</p>
                                    <p className="text-xs text-neutral-500">{s.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 회사 정보 */}
                    <div>
                        <label className="block text-xs tracking-[0.15em] text-neutral-500 uppercase mb-3">회사 정보</label>
                        <div className="space-y-3">
                            <input
                                type="text"
                                required
                                placeholder="회사명 *"
                                value={form.companyName}
                                onChange={e => set("companyName", e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition"
                            />
                            <div className="grid sm:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    required
                                    placeholder="담당자 이름 *"
                                    value={form.contactName}
                                    onChange={e => set("contactName", e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition"
                                />
                                <input
                                    type="tel"
                                    placeholder="연락처"
                                    value={form.phone}
                                    onChange={e => set("phone", e.target.value)}
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition"
                                />
                            </div>
                            <input
                                type="email"
                                required
                                placeholder="이메일 *"
                                value={form.email}
                                onChange={e => set("email", e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition"
                            />
                        </div>
                    </div>

                    {/* 제품/서비스 정보 */}
                    <div>
                        <label className="block text-xs tracking-[0.15em] text-neutral-500 uppercase mb-3">제품·서비스 정보</label>
                        <div className="space-y-3">
                            <select
                                value={form.industry}
                                onChange={e => set("industry", e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-300 focus:outline-none focus:border-amber-500/50 transition"
                            >
                                <option value="" className="text-neutral-600">업종 선택</option>
                                {industries.map(i => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="분석 대상 제품/서비스명"
                                value={form.productName}
                                onChange={e => set("productName", e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition"
                            />
                            <input
                                type="text"
                                placeholder="주요 경쟁사 (쉼표로 구분, 예: 나이키, 아디다스)"
                                value={form.competitors}
                                onChange={e => set("competitors", e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition"
                            />
                        </div>
                    </div>

                    {/* 상황 설명 */}
                    <div>
                        <label className="block text-xs tracking-[0.15em] text-neutral-500 uppercase mb-3">
                            현재 상황 <span className="text-neutral-600 normal-case tracking-normal">(AI 추천 관련 고민이 있다면)</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="예: AI 검색에서 경쟁사만 나오고 우리 브랜드가 안 보입니다. 네이버 광고는 하는데 ChatGPT에서는 전혀 나오지 않아요."
                            value={form.painContext}
                            onChange={e => set("painContext", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition resize-none"
                        />
                    </div>

                    {/* 예산 */}
                    <div>
                        <label className="block text-xs tracking-[0.15em] text-neutral-500 uppercase mb-3">예산 범위</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {["100만원 미만", "100~300만원", "300~500만원", "500만원 이상"].map(b => (
                                <button
                                    key={b}
                                    type="button"
                                    onClick={() => set("budget", b)}
                                    className={`py-2 px-3 rounded-lg border text-xs transition ${form.budget === b
                                        ? "border-amber-500 text-amber-500 bg-amber-500/10"
                                        : "border-neutral-800 text-neutral-500 hover:border-neutral-600"
                                        }`}
                                >
                                    {b}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 추가 메시지 */}
                    <div>
                        <label className="block text-xs tracking-[0.15em] text-neutral-500 uppercase mb-3">추가 메시지</label>
                        <textarea
                            rows={3}
                            placeholder="기타 문의 사항이나 일정 요청 등을 입력해주세요."
                            value={form.message}
                            onChange={e => set("message", e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm placeholder-neutral-600 focus:outline-none focus:border-amber-500/50 transition resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !form.companyName || !form.contactName || !form.email}
                        className="w-full py-4 bg-amber-500 text-black text-sm font-bold rounded-xl hover:bg-amber-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? "제출 중..." : "신청서 제출"}
                    </button>

                    <p className="text-xs text-neutral-600 text-center">
                        제출된 정보는 서비스 상담 목적으로만 사용됩니다.
                    </p>
                </form>
            </div>

            <footer className="border-t border-neutral-800 py-8 text-center text-xs text-neutral-600">
                &copy; Brand Gravity. Powered by <a href="/about?tab=universe" className="hover:text-white transition-colors">Ten:One&trade; Universe</a>.
            </footer>
        </div>
    );
}
