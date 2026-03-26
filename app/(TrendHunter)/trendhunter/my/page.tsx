"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { User, FileText, Bookmark, Bell, Settings, LogOut, ArrowRight } from "lucide-react";

const savedReports = [
    { id: "r1", title: "2026 상반기 AI 산업 트렌드 리포트", date: "2026.03", category: "기술 트렌드" },
    { id: "r3", title: "숏폼 콘텐츠 마케팅 효과 분석 2026", date: "2026.02", category: "마케팅" },
];

const savedInsights = [
    { id: "i1", title: "에이전트 AI가 바꾸는 일하는 방식", date: "2026.03.24" },
    { id: "i3", title: "숏폼 피로도와 '슬로우 콘텐츠'의 역습", date: "2026.03.15" },
];

export default function TrendHunterMyPage() {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="bg-[#0A0A0A] min-h-[60vh] flex items-center justify-center px-6">
                <div className="text-center">
                    <User className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h2 className="text-white text-xl font-bold mb-2">로그인이 필요합니다</h2>
                    <p className="text-neutral-400 text-sm mb-6">마이페이지를 이용하려면 로그인해 주세요.</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF88] text-black font-semibold rounded-lg hover:bg-[#00DD77] transition-colors"
                    >
                        로그인 <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-20 px-6">
                <div className="mx-auto max-w-4xl">
                    {/* 프로필 */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-16 h-16 rounded-full bg-[#00FF88]/10 flex items-center justify-center">
                            <User className="w-8 h-8 text-[#00FF88]" />
                        </div>
                        <div>
                            <h1 className="text-white text-2xl font-bold">{user?.name || "사용자"}</h1>
                            <p className="text-neutral-400 text-sm">{user?.email || ""}</p>
                        </div>
                    </div>

                    {/* 저장한 리포트 */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-4 h-4 text-[#00FF88]" />
                            <h2 className="text-white font-semibold text-lg">저장한 리포트</h2>
                        </div>
                        <div className="space-y-3">
                            {savedReports.map((r) => (
                                <div key={r.id} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 flex items-center justify-between hover:border-[#00FF88]/20 transition-colors">
                                    <div>
                                        <span className="text-[#00FF88] text-[10px] font-mono">{r.category}</span>
                                        <h3 className="text-white text-sm font-medium mt-1">{r.title}</h3>
                                        <p className="text-neutral-500 text-xs mt-1">{r.date}</p>
                                    </div>
                                    <Link href="/trendhunter/reports" className="text-neutral-500 hover:text-[#00FF88] transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 저장한 인사이트 */}
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Bookmark className="w-4 h-4 text-[#00FF88]" />
                            <h2 className="text-white font-semibold text-lg">저장한 인사이트</h2>
                        </div>
                        <div className="space-y-3">
                            {savedInsights.map((item) => (
                                <div key={item.id} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 flex items-center justify-between hover:border-[#00FF88]/20 transition-colors">
                                    <div>
                                        <h3 className="text-white text-sm font-medium">{item.title}</h3>
                                        <p className="text-neutral-500 text-xs mt-1">{item.date}</p>
                                    </div>
                                    <Link href="/trendhunter/insights" className="text-neutral-500 hover:text-[#00FF88] transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 퀵 메뉴 */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/20 transition-colors text-left">
                            <Bell className="w-5 h-5 text-neutral-400 mb-2" />
                            <p className="text-white text-sm font-medium">알림 설정</p>
                            <p className="text-neutral-500 text-xs mt-1">새 리포트 알림 받기</p>
                        </button>
                        <button className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/20 transition-colors text-left">
                            <Settings className="w-5 h-5 text-neutral-400 mb-2" />
                            <p className="text-white text-sm font-medium">관심 분야 설정</p>
                            <p className="text-neutral-500 text-xs mt-1">맞춤 트렌드 추천</p>
                        </button>
                        <button className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:border-[#00FF88]/20 transition-colors text-left">
                            <LogOut className="w-5 h-5 text-neutral-400 mb-2" />
                            <p className="text-white text-sm font-medium">로그아웃</p>
                            <p className="text-neutral-500 text-xs mt-1">계정에서 로그아웃</p>
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
