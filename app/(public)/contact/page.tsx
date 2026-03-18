"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, UserPlus, Briefcase, CheckCircle2, MessageCircle } from "lucide-react";
import clsx from "clsx";

type TabType = 'join' | 'business';

export default function ContactPage() {
    const [activeTab, setActiveTab] = useState<TabType>('join');

    return (
        <div className="bg-black text-white min-h-screen">
            <section className="py-24 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    Contact Us
                </h1>
                <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    Ten:One™ 유니버스는 언제나 열려있습니다.<br />
                    새로운 동료가 되거나, 비즈니스 파트너가 되어주세요.
                </p>
            </section>

            <section className="max-w-7xl mx-auto px-6 pb-24 grid lg:grid-cols-12 gap-16">
                {/* Contact Info (Left Side) - Span 4 */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Manager Profile Card */}
                    <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full group-hover:from-indigo-500/30 group-hover:to-purple-500/30 transition-all duration-500"></div>

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-2xl mb-4 border border-zinc-700 text-indigo-400 font-bold">
                                C
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">
                                전천일 <span className="text-zinc-500 font-normal text-base">Cheonil Jeon</span>
                            </h3>
                            <p className="text-indigo-400 text-sm font-medium mb-4">Founder / Value Connector</p>

                            <div className="text-zinc-400 text-sm space-y-1 mb-6">
                                <p>Advertising, Marketing, Communication, Planning</p>
                                <p className="text-zinc-500">Trend, Branding, IT Interest</p>
                            </div>

                            <div className="space-y-4">
                                <a href="mailto:lools@tenone.biz" className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors group/link p-2 -mx-2 rounded-lg hover:bg-zinc-800/50">
                                    <div className="p-2 bg-zinc-800 rounded-md text-indigo-400 group-hover/link:bg-indigo-500 group-hover/link:text-white transition-all">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm">lools@tenone.biz</span>
                                </a>

                                <a href="https://open.kakao.com/me/tenone" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-zinc-300 hover:text-white transition-colors group/link p-2 -mx-2 rounded-lg hover:bg-zinc-800/50">
                                    <div className="p-2 bg-zinc-800 rounded-md text-yellow-400 group-hover/link:bg-yellow-400 group-hover/link:text-black transition-all">
                                        <MessageCircle className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm">open.kakao.com/me/tenone</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/20">
                        <div className="flex items-start gap-4">
                            <div className="mt-1">
                                <MapPin className="h-5 w-5 text-zinc-500" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm">Office</h4>
                                <p className="text-zinc-400 mt-1 text-sm">Gangnam-gu, Seoul, Republic of Korea</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Forms (Right Side) - Span 8 */}
                <div className="lg:col-span-8">
                    {/* Tab Navigation */}
                    <div className="flex p-1 bg-zinc-900/50 rounded-xl mb-8 border border-zinc-800">
                        <button
                            onClick={() => setActiveTab('join')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                                activeTab === 'join'
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                            )}
                        >
                            <UserPlus className="h-4 w-4" />
                            프로젝트 멤버 신청 (Join Team)
                        </button>
                        <button
                            onClick={() => setActiveTab('business')}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all",
                                activeTab === 'business'
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                            )}
                        >
                            <Briefcase className="h-4 w-4" />
                            프로젝트 의뢰 (Business)
                        </button>
                    </div>

                    {/* Form Container */}
                    <div className="bg-zinc-900/20 p-8 md:p-10 rounded-3xl border border-zinc-800/50 relative overflow-hidden">
                        {/* Background Decor */}
                        <div className={clsx(
                            "absolute top-0 right-0 p-32 blur-3xl rounded-full transition-colors duration-500 opacity-20",
                            activeTab === 'join' ? "bg-indigo-600" : "bg-purple-600"
                        )}></div>

                        {activeTab === 'join' ? (
                            /* JOIN FORM */
                            <form className="space-y-6 relative z-10 animate-fade-in">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold mb-2">Join the Universe</h3>
                                    <p className="text-zinc-400">Ten:One™의 동료가 되어 새로운 세계를 함께 만들어가요.</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">이름 (Name)</label>
                                        <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="홍길동" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">이메일 (Email)</label>
                                        <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="hello@example.com" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">지원 분야 (Role)</label>
                                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
                                        <option>기획자 (Planner)</option>
                                        <option>디자이너 (Designer)</option>
                                        <option>개발자 (Developer)</option>
                                        <option>마케터 (Marketer)</option>
                                        <option>크리에이터 (Creator)</option>
                                        <option>기타 (Other)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">포트폴리오/이력서 링크 (URL)</label>
                                    <input type="url" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" placeholder="https://..." />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">자기소개 및 지원동기</label>
                                    <textarea rows={5} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none" placeholder="간단한 자기소개와 함께하고 싶은 이유를 자유롭게 적어주세요."></textarea>
                                </div>

                                <button type="button" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                                    <UserPlus className="h-5 w-5" />
                                    지원하기 (Apply)
                                </button>
                            </form>
                        ) : (
                            /* BUSINESS FORM */
                            <form className="space-y-6 relative z-10 animate-fade-in">
                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold mb-2">Business Inquiry</h3>
                                    <p className="text-zinc-400">프로젝트 의뢰 및 파트너십 제안을 보내주세요.</p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">담당자명</label>
                                        <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="홍길동 팀장" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">회사/단체명</label>
                                        <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="TenOne Corp." />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">이메일</label>
                                        <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="work@company.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">연락처</label>
                                        <input type="tel" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors" placeholder="010-0000-0000" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">의뢰 분야</label>
                                    <select className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors">
                                        <option>브랜딩/디자인 (Branding)</option>
                                        <option>마케팅/광고 (Marketing)</option>
                                        <option>콘텐츠 제작 (Content)</option>
                                        <option>IT/개발 (Development)</option>
                                        <option>기타 파트너십 (Partnership)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">프로젝트 내용</label>
                                    <textarea rows={5} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none" placeholder="프로젝트의 목적, 예산, 일정 등 구체적인 내용을 적어주세요."></textarea>
                                </div>

                                <button type="button" className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2">
                                    <Briefcase className="h-5 w-5" />
                                    의뢰하기 (Send Request)
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
