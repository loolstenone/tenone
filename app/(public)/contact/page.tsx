"use client";

import { useState } from "react";
import { Mail, MapPin, UserPlus, Briefcase, MessageCircle } from "lucide-react";
import clsx from "clsx";

type TabType = 'join' | 'business';

const inputClass = "w-full border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none placeholder:text-neutral-400 bg-white";
const labelClass = "text-sm font-medium text-neutral-700 block mb-1.5";

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState<TabType>('join');

    return (
        <div className="bg-white text-neutral-900">
            {/* Hero */}
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">Contact</p>
                    <h1 className="text-4xl md:text-6xl font-light leading-tight">
                        함께 <span className="font-bold">시작하기</span>
                    </h1>
                    <p className="mt-6 text-lg text-neutral-500 max-w-2xl">
                        Ten:One™ Universe는 언제나 열려있습니다. 새로운 동료가 되거나, 프로젝트를 의뢰해주세요.
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Left — Contact Info */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="border border-neutral-200 p-6">
                        <div className="w-14 h-14 bg-neutral-900 rounded-full flex items-center justify-center text-xl text-white font-medium mb-4">C</div>
                        <h3 className="text-lg font-bold">전천일 <span className="text-neutral-400 font-normal text-sm">Cheonil Jeon</span></h3>
                        <p className="text-sm text-neutral-500 mt-1">Founder / Value Connector</p>
                        <p className="text-sm text-neutral-400 mt-4">Advertising, Marketing, Communication, Planning</p>

                        <div className="mt-6 space-y-3">
                            <a href="mailto:lools@tenone.biz" className="flex items-center gap-3 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                                <Mail className="h-4 w-4 text-neutral-400" /> lools@tenone.biz
                            </a>
                            <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                                <MessageCircle className="h-4 w-4 text-neutral-400" /> Kakao Open Chat
                            </a>
                        </div>
                    </div>

                    <div className="border border-neutral-200 p-6">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-neutral-400 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium">Office</h4>
                                <p className="text-sm text-neutral-500 mt-1">Gangnam-gu, Seoul, Republic of Korea</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — Forms */}
                <div className="lg:col-span-8">
                    {/* Tabs */}
                    <div className="flex border-b border-neutral-200 mb-8">
                        <button onClick={() => setActiveTab('join')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-colors border-b-2",
                                activeTab === 'join' ? "border-neutral-900 text-neutral-900 font-medium" : "border-transparent text-neutral-400 hover:text-neutral-700"
                            )}>
                            <UserPlus className="h-4 w-4" /> 멤버 신청
                        </button>
                        <button onClick={() => setActiveTab('business')}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 text-sm tracking-wide transition-colors border-b-2",
                                activeTab === 'business' ? "border-neutral-900 text-neutral-900 font-medium" : "border-transparent text-neutral-400 hover:text-neutral-700"
                            )}>
                            <Briefcase className="h-4 w-4" /> 프로젝트 의뢰
                        </button>
                    </div>

                    {activeTab === 'join' ? (
                        <form className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Join the Universe</h3>
                                <p className="text-sm text-neutral-500 mt-1">Ten:One™의 동료가 되어 함께 문제를 해결해요.</p>
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
                                <UserPlus className="h-4 w-4" /> 지원하기
                            </button>
                        </form>
                    ) : (
                        <form className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Business Inquiry</h3>
                                <p className="text-sm text-neutral-500 mt-1">프로젝트 의뢰 및 파트너십 제안을 보내주세요.</p>
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
                </div>
            </section>
        </div>
    );
}
