"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, UserPlus, Briefcase, MessageCircle, Handshake, ArrowRight, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

type TabType = 'partner' | 'business';

function OffOniceToggle() {
    const [isOn, setIsOn] = useState(true);

    return (
        <button
            onClick={() => setIsOn(!isOn)}
            className="relative inline-flex items-center h-8 rounded-full transition-all duration-500 cursor-pointer select-none overflow-hidden"
            style={{
                width: 160,
                background: isOn
                    ? "linear-gradient(135deg, #1a1a1a 0%, #333 100%)"
                    : "linear-gradient(135deg, #e0e0e0 0%, #ccc 100%)",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1)",
            }}
        >
            {/* 슬라이딩 원 */}
            <div
                className="absolute rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                    width: 24,
                    height: 24,
                    top: 4,
                    left: isOn ? 108 : 4,
                    background: isOn
                        ? "radial-gradient(circle at 35% 35%, #fff 0%, #ddd 60%, #bbb 100%)"
                        : "radial-gradient(circle at 35% 35%, #999 0%, #777 60%, #555 100%)",
                    boxShadow: isOn
                        ? "0 2px 6px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(0,0,0,0.1)"
                        : "0 2px 6px rgba(0,0,0,0.15), inset 0 -1px 2px rgba(0,0,0,0.05)",
                }}
            />
            {/* Offline 텍스트 */}
            <span
                className="absolute text-xs font-bold tracking-wider transition-opacity duration-300"
                style={{
                    left: 12,
                    opacity: isOn ? 0.3 : 0.8,
                    color: isOn ? "#666" : "#444",
                }}
            >
                Offline
            </span>
            {/* Online 텍스트 */}
            <span
                className="absolute text-xs font-bold tracking-wider transition-opacity duration-300"
                style={{
                    left: 58,
                    opacity: isOn ? 1 : 0.3,
                    color: isOn ? "#fff" : "#999",
                }}
            >
                Online
            </span>
        </button>
    );
}

const inputClass = "w-full border tn-border px-4 py-3 text-sm tn-text focus:border-neutral-900 focus:outline-none placeholder:tn-text-sub tn-surface";
const labelClass = "text-sm font-medium text-neutral-700 block mb-1.5";

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState<TabType>('partner');
    const { isAuthenticated } = useAuth();
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (formType: string, form: HTMLFormElement) => {
        setSubmitting(true);
        const fd = new FormData(form);
        const body: Record<string, string> = { formType };
        fd.forEach((v, k) => { body[k] = v as string; });
        try {
            const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (res.ok) setSubmitted(true);
            else alert('제출에 실패했습니다. 다시 시도해주세요.');
        } catch { alert('네트워크 오류가 발생했습니다.'); }
        setSubmitting(false);
    };

    return (
        <div className="tn-surface tn-text">
            {/* Hero */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase tn-text-sub mb-4">Contact</p>
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-light leading-tight">
                        함께 <span className="font-bold">시작하기</span>
                    </h1>
                    <div className="mt-6 text-lg tn-text-sub max-w-2xl space-y-1">
                        <p>Ten:One™ Universe는 언제나 열려있습니다.</p>
                        <p>새로운 동료가 되거나, 프로젝트를 의뢰해주세요.</p>
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 pb-32 grid lg:grid-cols-12 gap-8 md:gap-16">
                {/* Left — Contact Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="border tn-border p-6">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium mb-4" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>C</div>
                        <h3 className="text-lg font-bold">전천일 <span className="tn-text-sub font-normal text-sm">Cheonil Jeon</span></h3>
                        <p className="text-sm tn-text-sub mt-1">Founder / Value Connector</p>
                        <p className="text-sm tn-text-sub mt-4">Planning, Business, Marketing, Advertising, Communication, HR</p>

                        <div className="mt-6 space-y-3">
                            <a href="https://tenone.biz/contact" className="flex items-center gap-3 text-sm text-neutral-600 hover:tn-text transition-colors">
                                <Mail className="h-4 w-4 tn-text-sub" /> tenone.biz/contact
                            </a>
                            <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm text-neutral-600 hover:tn-text transition-colors">
                                <MessageCircle className="h-4 w-4 tn-text-sub" /> Kakao Open Chat
                            </a>
                        </div>
                    </div>

                    <div className="border tn-border p-6">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 tn-text-sub mt-0.5" />
                            <div>
                                <OffOniceToggle />
                                <p className="text-sm tn-text-sub mt-1">tenone.biz</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Forms */}
                <div className="lg:col-span-8">
                    {/* Tabs */}
                    <div className="flex border-b tn-border mb-8">
                        <button onClick={() => setActiveTab('partner')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-colors border-b-2",
                                activeTab === 'partner' ? "border-neutral-900 tn-text font-medium" : "border-transparent tn-text-sub hover:text-neutral-700"
                            )}>
                            <Handshake className="h-4 w-4" /> 파트너 신청
                        </button>
                        <button onClick={() => setActiveTab('business')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-colors border-b-2",
                                activeTab === 'business' ? "border-neutral-900 tn-text font-medium" : "border-transparent tn-text-sub hover:text-neutral-700"
                            )}>
                            <Briefcase className="h-4 w-4" /> 프로젝트 의뢰
                        </button>
                    </div>

                    {submitted && (
                        <div className="py-16 text-center">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--tn-accent)" }} />
                            <h3 className="text-xl font-bold mb-2">제출 완료!</h3>
                            <p className="tn-text-sub">빠른 시간 내에 연락드리겠습니다.</p>
                            <button onClick={() => setSubmitted(false)} className="mt-6 text-sm tn-text-sub hover:tn-text underline">다른 문의하기</button>
                        </div>
                    )}

                    {/* 파트너 신청 */}
                    {!submitted && activeTab === 'partner' && (
                        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit('partner', e.currentTarget); }}>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Partner with Us</h3>
                                <p className="text-sm tn-text-sub mt-1">Ten:One™의 파트너가 되어 함께 문제를 해결해요.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>이름</label><input name="name" type="text" required className={inputClass} placeholder="홍길동" /></div>
                                <div><label className={labelClass}>이메일</label><input name="email" type="email" required className={inputClass} placeholder="hello@example.com" /></div>
                            </div>
                            <div>
                                <label className={labelClass}>지원 분야</label>
                                <select name="company" className={inputClass}>
                                    <option>기획자 (Planner)</option>
                                    <option>디자이너 (Designer)</option>
                                    <option>개발자 (Developer)</option>
                                    <option>마케터 (Marketer)</option>
                                    <option>크리에이터 (Creator)</option>
                                    <option>기타 (Other)</option>
                                </select>
                            </div>
                            <div><label className={labelClass}>포트폴리오/이력서 링크</label><input name="portfolioUrl" type="url" className={inputClass} placeholder="https://..." /></div>
                            <div><label className={labelClass}>자기소개 및 지원동기</label><textarea name="message" rows={5} className={inputClass + " resize-none"} placeholder="간단한 자기소개와 함께하고 싶은 이유를 자유롭게 적어주세요." /></div>
                            <button type="submit" disabled={submitting} className="w-full py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                <Handshake className="h-4 w-4" /> {submitting ? '제출 중...' : '파트너 신청하기'}
                            </button>
                        </form>
                    )}

                    {/* 프로젝트 의뢰 */}
                    {!submitted && activeTab === 'business' && (
                        <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSubmit('business', e.currentTarget); }}>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Business Inquiry</h3>
                                <p className="text-sm tn-text-sub mt-1">프로젝트 의뢰 및 파트너십 제안을 보내주세요.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>담당자명</label><input name="name" type="text" required className={inputClass} placeholder="홍길동 팀장" /></div>
                                <div><label className={labelClass}>회사/단체명</label><input name="company" type="text" className={inputClass} placeholder="회사명" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>이메일</label><input name="email" type="email" required className={inputClass} placeholder="work@company.com" /></div>
                                <div><label className={labelClass}>연락처</label><input name="phone" type="tel" className={inputClass} placeholder="010-0000-0000" /></div>
                            </div>
                            <div>
                                <label className={labelClass}>의뢰 분야</label>
                                <select name="extra" className={inputClass}>
                                    <option>브랜딩/디자인</option>
                                    <option>마케팅/광고</option>
                                    <option>콘텐츠 제작</option>
                                    <option>IT/개발</option>
                                    <option>기타 파트너십</option>
                                </select>
                            </div>
                            <div><label className={labelClass}>프로젝트 내용</label><textarea name="message" rows={5} className={inputClass + " resize-none"} placeholder="프로젝트의 목적, 예산, 일정 등 구체적인 내용을 적어주세요." /></div>
                            <button type="submit" disabled={submitting} className="w-full py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: "var(--tn-accent)", color: "var(--tn-bg)" }}>
                                <Briefcase className="h-4 w-4" /> {submitting ? '제출 중...' : '의뢰하기'}
                            </button>
                        </form>
                    )}

                </div>
            </section>
        </div>
    );
}
