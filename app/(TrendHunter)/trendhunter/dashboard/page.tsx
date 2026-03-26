"use client";

import { BarChart3, Activity, TrendingUp, Users, Database, Zap, Clock, AlertCircle, CheckCircle } from "lucide-react";

const crawlerStatus = [
    { name: "바닥쇠 (카카오)", status: "active" as const, lastRun: "3분 전", todayCount: 847, icon: "🔩" },
    { name: "웹크롤러 (네이버)", status: "active" as const, lastRun: "1시간 전", todayCount: 124, icon: "🌐" },
    { name: "디스코드 봇", status: "active" as const, lastRun: "실시간", todayCount: 356, icon: "💬" },
    { name: "RSS/뉴스레터", status: "active" as const, lastRun: "2시간 전", todayCount: 67, icon: "📰" },
    { name: "SmarComm 크롤러", status: "paused" as const, lastRun: "어제", todayCount: 0, icon: "🏛" },
];

const todayStats = {
    totalCollected: 1394,
    uniqueSources: 28,
    detectedOpportunities: 4,
    contentDrafts: 3,
    topKeywords: ["에이전트 AI", "숏폼 피로", "하이퍼로컬", "AI 영상", "마이크로 SaaS"],
};

const platformBreakdown = [
    { platform: "카카오 오픈채팅", count: 847, pct: 60.8 },
    { platform: "디스코드", count: 356, pct: 25.5 },
    { platform: "웹 커뮤니티", count: 124, pct: 8.9 },
    { platform: "뉴스/RSS", count: 67, pct: 4.8 },
];

const recentOpportunities = [
    { type: "AI 수요", title: "AI 영상 편집 자동화", brand: "RooK", time: "2시간 전" },
    { type: "인재 수요", title: "퍼포먼스 마케터", brand: "HeRo", time: "5시간 전" },
    { type: "컨설팅", title: "리브랜딩 니즈", brand: "Brand Gravity", time: "1일 전" },
    { type: "교육", title: "Claude API 교육", brand: "Evo School", time: "1일 전" },
];

const statusColor = {
    active: "text-[#00C853]",
    paused: "text-[#FFB800]",
    error: "text-[#E50000]",
};

export default function TrendHunterDashboardPage() {
    return (
        <div className="bg-[#0A0A0A]">
            {/* Hero */}
            <section className="py-16 px-6">
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-[#2196F3]" />
                        <span className="text-[#2196F3] text-xs font-mono tracking-widest">DASHBOARD</span>
                        <span className="text-neutral-600 text-[10px] font-mono ml-2">(내부용)</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">TrendHunter 대시보드</h1>
                    <p className="text-neutral-500 text-sm">크롤러 상태 · 수집 현황 · 키워드 · 기회 감지</p>
                </div>
            </section>

            <section className="px-6 pb-24">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* 오늘의 요약 카드 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Database className="w-5 h-5 text-[#2196F3] mb-2" />
                            <p className="text-2xl font-bold text-white">{todayStats.totalCollected.toLocaleString()}</p>
                            <p className="text-neutral-500 text-xs mt-1">오늘 수집</p>
                        </div>
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Activity className="w-5 h-5 text-[#00C853] mb-2" />
                            <p className="text-2xl font-bold text-white">{todayStats.uniqueSources}</p>
                            <p className="text-neutral-500 text-xs mt-1">활성 소스</p>
                        </div>
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <Zap className="w-5 h-5 text-[#FFB800] mb-2" />
                            <p className="text-2xl font-bold text-white">{todayStats.detectedOpportunities}</p>
                            <p className="text-neutral-500 text-xs mt-1">기회 감지</p>
                        </div>
                        <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                            <TrendingUp className="w-5 h-5 text-[#E50000] mb-2" />
                            <p className="text-2xl font-bold text-white">{todayStats.contentDrafts}</p>
                            <p className="text-neutral-500 text-xs mt-1">콘텐츠 초안</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 크롤러 상태 */}
                        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
                            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#2196F3]" /> 크롤러 상태
                            </h2>
                            <div className="space-y-3">
                                {crawlerStatus.map((c) => (
                                    <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{c.icon}</span>
                                            <div>
                                                <p className="text-white text-sm font-medium">{c.name}</p>
                                                <p className="text-neutral-500 text-[10px]">마지막: {c.lastRun}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-mono ${statusColor[c.status]}`}>
                                                {c.status === "active" ? "● 활성" : c.status === "paused" ? "⏸ 일시정지" : "✕ 오류"}
                                            </p>
                                            <p className="text-neutral-400 text-xs">{c.todayCount}건</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 플랫폼별 수집량 */}
                        <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
                            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-[#2196F3]" /> 플랫폼별 수집량
                            </h2>
                            <div className="space-y-4">
                                {platformBreakdown.map((p) => (
                                    <div key={p.platform}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-neutral-300 text-sm">{p.platform}</span>
                                            <span className="text-neutral-400 text-xs font-mono">{p.count}건 ({p.pct}%)</span>
                                        </div>
                                        <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-[#2196F3] rounded-full transition-all"
                                                style={{ width: `${p.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 핫 키워드 */}
                            <div className="mt-6 pt-4 border-t border-neutral-800">
                                <h3 className="text-neutral-400 text-xs font-mono mb-2">오늘의 핫 키워드</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {todayStats.topKeywords.map((kw, i) => (
                                        <span
                                            key={kw}
                                            className={`text-xs px-2.5 py-1 rounded-full font-mono ${
                                                i === 0 ? "bg-[#E50000]/20 text-[#E50000]" : "bg-neutral-800 text-neutral-400"
                                            }`}
                                        >
                                            {i + 1}. {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 최근 감지 기회 */}
                    <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
                        <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-[#FFB800]" /> 최근 감지 기회
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {recentOpportunities.map((opp, i) => (
                                <div key={i} className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800/50">
                                    <span className="text-[10px] font-mono text-[#FFB800]">{opp.type}</span>
                                    <p className="text-white text-sm font-medium mt-1">{opp.title}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-neutral-500 text-[10px]">→ {opp.brand}</span>
                                        <span className="text-neutral-600 text-[10px]">{opp.time}</span>
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
