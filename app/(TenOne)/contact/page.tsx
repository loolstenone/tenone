"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, UserPlus, Briefcase, MessageCircle, Handshake, ArrowRight, CheckCircle } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth-context";

type TabType = 'partner' | 'business' | 'signup';

const inputClass = "w-full border tn-border px-4 py-3 text-sm tn-text focus:border-neutral-900 focus:outline-none placeholder:tn-text-sub tn-surface";
const labelClass = "text-sm font-medium text-neutral-700 block mb-1.5";

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState<TabType>('partner');
    const { isAuthenticated } = useAuth();

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
                        <div className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center text-xl text-white font-medium mb-4">C</div>
                        <h3 className="text-lg font-bold">전천일 <span className="tn-text-sub font-normal text-sm">Cheonil Jeon</span></h3>
                        <p className="text-sm tn-text-sub mt-1">Founder / Value Connector</p>
                        <p className="text-sm tn-text-sub mt-4">Planning, Business, Marketing, Advertising, Communication, HR</p>

                        <div className="mt-6 space-y-3">
                            <a href="mailto:lools@tenone.biz" className="flex items-center gap-3 text-sm text-neutral-600 hover:tn-text transition-colors">
                                <Mail className="h-4 w-4 tn-text-sub" /> lools@tenone.biz
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
                                <h4 className="text-sm font-medium">
                                    <span className="line-through tn-text-sub">Office</span>{" "}
                                    <span className="font-bold tn-text">Onice</span>
                                </h4>
                                <p className="text-sm tn-text-sub mt-1">Tenone.biz</p>
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
                        <button onClick={() => setActiveTab('signup')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-colors border-b-2",
                                activeTab === 'signup' ? "border-neutral-900 tn-text font-medium" : "border-transparent tn-text-sub hover:text-neutral-700"
                            )}>
                            <UserPlus className="h-4 w-4" /> 멤버 가입
                        </button>
                    </div>

                    {/* 파트너 신청 */}
                    {activeTab === 'partner' && (
                        <form className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Partner with Us</h3>
                                <p className="text-sm tn-text-sub mt-1">Ten:One™의 파트너가 되어 함께 문제를 해결해요.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>이름</label><input type="text" className={inputClass} placeholder="홍길동" /></div>
                                <div><label className={labelClass}>이메일</label><input type="email" className={inputClass} placeholder="hello@example.com" /></div>
                            </div>
                            <div>
                                <label className={labelClass}>지원 분야</label>
                                <select className={inputClass}>
                                    <option>기획자 (Planner)</option>
                                    <option>디자이너 (Designer)</option>
                                    <option>개발자 (Developer)</option>
                                    <option>마케터 (Marketer)</option>
                                    <option>크리에이터 (Creator)</option>
                                    <option>기타 (Other)</option>
                                </select>
                            </div>
                            <div><label className={labelClass}>포트폴리오/이력서 링크</label><input type="url" className={inputClass} placeholder="https://..." /></div>
                            <div><label className={labelClass}>자기소개 및 지원동기</label><textarea rows={5} className={inputClass + " resize-none"} placeholder="간단한 자기소개와 함께하고 싶은 이유를 자유롭게 적어주세요." /></div>
                            <button type="button" className="w-full py-3.5 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                                <Handshake className="h-4 w-4" /> 파트너 신청하기
                            </button>
                        </form>
                    )}

                    {/* 프로젝트 의뢰 */}
                    {activeTab === 'business' && (
                        <form className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Business Inquiry</h3>
                                <p className="text-sm tn-text-sub mt-1">프로젝트 의뢰 및 파트너십 제안을 보내주세요.</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>담당자명</label><input type="text" className={inputClass} placeholder="홍길동 팀장" /></div>
                                <div><label className={labelClass}>회사/단체명</label><input type="text" className={inputClass} placeholder="회사명" /></div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div><label className={labelClass}>이메일</label><input type="email" className={inputClass} placeholder="work@company.com" /></div>
                                <div><label className={labelClass}>연락처</label><input type="tel" className={inputClass} placeholder="010-0000-0000" /></div>
                            </div>
                            <div>
                                <label className={labelClass}>의뢰 분야</label>
                                <select className={inputClass}>
                                    <option>브랜딩/디자인</option>
                                    <option>마케팅/광고</option>
                                    <option>콘텐츠 제작</option>
                                    <option>IT/개발</option>
                                    <option>기타 파트너십</option>
                                </select>
                            </div>
                            <div><label className={labelClass}>프로젝트 내용</label><textarea rows={5} className={inputClass + " resize-none"} placeholder="프로젝트의 목적, 예산, 일정 등 구체적인 내용을 적어주세요." /></div>
                            <button type="button" className="w-full py-3.5 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2">
                                <Briefcase className="h-4 w-4" /> 의뢰하기
                            </button>
                        </form>
                    )}

                    {/* 멤버 가입 */}
                    {activeTab === 'signup' && (
                        <div className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Become a Member</h3>
                                <p className="text-sm tn-text-sub mt-1">Ten:One™ 사이트의 멤버로 가입하고 다양한 소식을 받아보세요.</p>
                            </div>

                            <div className="border tn-border p-8 text-center">
                                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    {isAuthenticated ? <CheckCircle className="h-7 w-7 text-green-500" /> : <UserPlus className="h-7 w-7 tn-text-sub" />}
                                </div>
                                {isAuthenticated ? (
                                    <>
                                        <h4 className="text-lg font-bold mb-2">이미 멤버입니다</h4>
                                        <p className="text-sm tn-text-sub leading-relaxed mb-6">
                                            이미 Ten:One™ Universe의 멤버로 가입되어 있습니다.<br />
                                            파트너 신청이나 프로젝트 의뢰를 진행해보세요.
                                        </p>
                                        <button type="button" onClick={() => setActiveTab('partner')}
                                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
                                            파트너 신청하기 <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h4 className="text-lg font-bold mb-2">멤버 가입</h4>
                                        <p className="text-sm tn-text-sub leading-relaxed mb-6">
                                            멤버로 가입하면 Ten:One™ Universe의 최신 소식,<br />
                                            Works 업데이트, 이벤트 초대 등을 받아볼 수 있습니다.
                                        </p>
                                        <Link href="/signup"
                                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors">
                                            가입 페이지로 이동 <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="tn-bg-alt border tn-border p-6">
                                <p className="text-sm font-medium text-neutral-700 mb-3">멤버 혜택</p>
                                <ul className="space-y-2 text-sm tn-text-sub">
                                    <li className="flex items-start gap-2"><span className="tn-text-muted mt-0.5">·</span> Newsroom 및 Works 최신 소식 알림</li>
                                    <li className="flex items-start gap-2"><span className="tn-text-muted mt-0.5">·</span> MAD League, Badak 등 이벤트 우선 초대</li>
                                    <li className="flex items-start gap-2"><span className="tn-text-muted mt-0.5">·</span> Ten:One™ 뉴스레터 구독</li>
                                    <li className="flex items-start gap-2"><span className="tn-text-muted mt-0.5">·</span> 파트너 전환 시 우대</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
