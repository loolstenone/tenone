"use client";

import { useAuth } from "@/lib/auth-context";
import { Activity, Database, Zap, TrendingUp, FileText, BarChart3, Settings, Eye, CheckCircle, Clock, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

const crawlerStatus = [
    { name: "바닥쇠 (카카오)", status: "active", lastRun: "3분 전", todayCount: 847, icon: "🔩" },
    { name: "웹크롤러 (네이버)", status: "active", lastRun: "1시간 전", todayCount: 124, icon: "🌐" },
    { name: "디스코드 봇", status: "active", lastRun: "실시간", todayCount: 356, icon: "💬" },
    { name: "RSS/뉴스레터", status: "active", lastRun: "2시간 전", todayCount: 67, icon: "📰" },
    { name: "SmarComm 크롤러", status: "paused", lastRun: "어제", todayCount: 0, icon: "🏛" },
];

const contentDrafts = [
    { id: "d1", title: "에이전트 AI 실무 활용 가이드", brand: "RooK", format: "article", status: "draft" },
    { id: "d2", title: "이번 주 핫 키워드: 슬로우 콘텐츠", brand: "Badak", format: "newsletter", status: "reviewed" },
    { id: "d3", title: "AI 영상 편집 툴 TOP 5", brand: "RooK", format: "sns", status: "draft" },
    { id: "d4", title: "대학생이 알아야 할 AI 영상 편집", brand: "MADLeague", format: "article", status: "published" },
];

const opportunities = [
    { type: "AI 수요", title: "AI 영상 편집 자동화 니즈", brand: "RooK", status: "new", time: "2시간 전" },
    { type: "인재 수요", title: "퍼포먼스 마케터 인력 수요", brand: "HeRo", status: "new", time: "5시간 전" },
    { type: "컨설팅", title: "리브랜딩 니즈", brand: "Brand Gravity", status: "reviewed", time: "1일 전" },
    { type: "교육", title: "Claude API 교육 수요", brand: "Evo School", status: "acted", time: "1일 전" },
];

const draftStatusMap: Record<string, { label: string; color: string }> = {
    draft: { label: "초안", color: "text-neutral-400 bg-neutral-800" },
    reviewed: { label: "검수완료", color: "text-[#F5C518] bg-[#F5C518]/10" },
    published: { label: "발행", color: "text-green-400 bg-green-400/10" },
};

const oppStatusMap: Record<string, { label: string; color: string }> = {
    new: { label: "신규", color: "text-red-400 bg-red-400/10" },
    reviewed: { label: "검토중", color: "text-[#F5C518] bg-[#F5C518]/10" },
    acted: { label: "대응완료", color: "text-green-400 bg-green-400/10" },
};

export default function MindleAdminPage() {
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user?.role === "Admin" || user?.accountType === "staff";

    if (!isAuthenticated || !isAdmin) {
        return (
            <div className="bg-[#0A0A0A] min-h-[60vh] flex items-center justify-center px-6">
                <div className="text-center">
                    <Settings className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h2 className="text-white text-xl font-bold mb-2">관리자 전용</h2>
                    <p className="text-neutral-400 text-sm">이 페이지는 관리자만 접근할 수 있습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#0A0A0A]">
            <section className="py-12 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Settings className="w-5 h-5 text-[#F5C518]" />
                        <h1 className="text-2xl font-bold text-white">Mindle Admin</h1>
                    </div>

                    {/* 요약 카드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Database className="w-4 h-4 text-blue-400 mb-2" />
                            <p className="text-2xl font-bold text-white">1,394</p>
                            <p className="text-neutral-500 text-xs">오늘 수집</p>
                        </div>
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Zap className="w-4 h-4 text-[#F5C518] mb-2" />
                            <p className="text-2xl font-bold text-white">4</p>
                            <p className="text-neutral-500 text-xs">기회 감지</p>
                        </div>
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <FileText className="w-4 h-4 text-green-400 mb-2" />
                            <p className="text-2xl font-bold text-white">3</p>
                            <p className="text-neutral-500 text-xs">콘텐츠 초안</p>
                        </div>
                        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Activity className="w-4 h-4 text-purple-400 mb-2" />
                            <p className="text-2xl font-bold text-white">5</p>
                            <p className="text-neutral-500 text-xs">크롤러 활성</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 크롤러 상태 */}
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
                            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-400" /> 크롤러 상태
                            </h2>
                            <div className="space-y-2">
                                {crawlerStatus.map((c) => (
                                    <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50">
                                        <div className="flex items-center gap-2">
                                            <span>{c.icon}</span>
                                            <div>
                                                <p className="text-white text-sm">{c.name}</p>
                                                <p className="text-neutral-600 text-[10px]">{c.lastRun}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-mono ${c.status === "active" ? "text-green-400" : "text-[#F5C518]"}`}>
                                                {c.status === "active" ? "● 활성" : "⏸ 정지"}
                                            </p>
                                            <p className="text-neutral-400 text-xs">{c.todayCount}건</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 콘텐츠 초안 */}
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5">
                            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-green-400" /> 콘텐츠 워크플로우
                            </h2>
                            <div className="space-y-2">
                                {contentDrafts.map((d) => (
                                    <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50">
                                        <div className="min-w-0">
                                            <p className="text-white text-sm truncate">{d.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-neutral-500">{d.brand}</span>
                                                <span className="text-[10px] text-neutral-600">{d.format}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded ${draftStatusMap[d.status].color}`}>
                                            {draftStatusMap[d.status].label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 기회 감지 */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-5 mt-6">
                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#F5C518]" /> 기회 레이더
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {opportunities.map((o, i) => (
                                <div key={i} className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] text-[#F5C518]">{o.type}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${oppStatusMap[o.status].color}`}>
                                            {oppStatusMap[o.status].label}
                                        </span>
                                    </div>
                                    <p className="text-white text-sm font-medium">{o.title}</p>
                                    <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500">
                                        <span>→ {o.brand}</span>
                                        <span>{o.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
