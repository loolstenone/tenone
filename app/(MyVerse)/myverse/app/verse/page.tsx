"use client";

import { useState } from "react";
import { Orbit, TrendingUp, Users, Tag, Calendar, ChevronRight, Star } from "lucide-react";

// Mock 타임라인 데이터
const TIMELINE = [
    { year: "2026", events: [
        { month: "3월", title: "Myverse 시작", desc: "나의 우주를 만들기 시작했다", type: "milestone" },
        { month: "3월", title: "MADLeague 5기 합류", desc: "경쟁PT 전략 파트 리드", type: "orbi" },
        { month: "2월", title: "기획 공부 시작", desc: "Vrief 프레임워크 3회 수행", type: "growth" },
        { month: "1월", title: "올해 목표 수립", desc: "마케팅 업계 취업", type: "dream" },
    ]},
    { year: "2025", events: [
        { month: "12월", title: "포트폴리오 완성", desc: "브랜드 기획 3건", type: "growth" },
        { month: "9월", title: "MADLeague 4기", desc: "최우수팀 수상", type: "orbi" },
        { month: "3월", title: "대학교 3학년", desc: "전공: 미디어커뮤니케이션", type: "milestone" },
    ]},
];

const KEYWORDS = [
    { period: "이번 달", words: [{ text: "기획", size: "lg" }, { text: "Vrief", size: "md" }, { text: "매드리그", size: "md" }, { text: "포트폴리오", size: "sm" }, { text: "트렌드", size: "sm" }] },
    { period: "지난 달", words: [{ text: "공부", size: "lg" }, { text: "책", size: "md" }, { text: "AI", size: "md" }, { text: "마케팅", size: "sm" }] },
];

const STATS = {
    totalLogs: 147,
    totalDays: 45,
    goalsCompleted: 3,
    projectsDone: 2,
    topPeople: ["수진", "홍균", "준호"],
};

const TYPE_STYLE: Record<string, { color: string; label: string }> = {
    milestone: { color: "bg-indigo-500", label: "이정표" },
    orbi: { color: "bg-amber-500", label: "Orbi" },
    growth: { color: "bg-emerald-500", label: "성장" },
    dream: { color: "bg-purple-500", label: "목표" },
};

export default function VersePage() {
    const [view, setView] = useState<"timeline" | "keywords" | "stats">("timeline");

    return (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
            {/* 헤더 */}
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Orbit size={20} className="text-indigo-400" /> 내 우주
                </h1>
                <p className="text-xs text-slate-500 mt-1">내 인생을 한눈에</p>
            </div>

            {/* 뷰 전환 */}
            <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                {[
                    { id: "timeline" as const, label: "타임라인", icon: Calendar },
                    { id: "keywords" as const, label: "키워드", icon: Tag },
                    { id: "stats" as const, label: "성장", icon: TrendingUp },
                ].map(v => (
                    <button key={v.id} onClick={() => setView(v.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                            view === v.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                        }`}>
                        <v.icon size={13} /> {v.label}
                    </button>
                ))}
            </div>

            {/* 타임라인 뷰 */}
            {view === "timeline" && (
                <div className="space-y-6">
                    {TIMELINE.map(year => (
                        <div key={year.year}>
                            <h2 className="text-lg font-bold text-indigo-400 mb-3">{year.year}</h2>
                            <div className="space-y-3 border-l-2 border-white/10 ml-2 pl-4">
                                {year.events.map((e, i) => {
                                    const style = TYPE_STYLE[e.type];
                                    return (
                                        <div key={i} className="relative">
                                            <div className={`absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full ${style.color}`} />
                                            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] text-slate-500">{e.month}</span>
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full text-white ${style.color}`}>{style.label}</span>
                                                </div>
                                                <p className="text-sm font-medium">{e.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5">{e.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 키워드 뷰 */}
            {view === "keywords" && (
                <div className="space-y-6">
                    {KEYWORDS.map(kw => (
                        <div key={kw.period}>
                            <h3 className="text-sm font-semibold text-slate-400 mb-3">{kw.period}</h3>
                            <div className="flex flex-wrap gap-2">
                                {kw.words.map(w => (
                                    <span key={w.text}
                                        className={`px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] ${
                                            w.size === "lg" ? "text-base font-bold text-indigo-400" :
                                            w.size === "md" ? "text-sm font-medium text-slate-300" :
                                            "text-xs text-slate-500"
                                        }`}>
                                        {w.text}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-500">데이터가 더 쌓이면 키워드 변화 추이를 볼 수 있어요</p>
                    </div>
                </div>
            )}

            {/* 성장 뷰 */}
            {view === "stats" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "기록", value: STATS.totalLogs, unit: "개", icon: "📝" },
                            { label: "활동 일수", value: STATS.totalDays, unit: "일", icon: "📅" },
                            { label: "달성한 목표", value: STATS.goalsCompleted, unit: "개", icon: "🎯" },
                            { label: "완료 프로젝트", value: STATS.projectsDone, unit: "개", icon: "💼" },
                        ].map(s => (
                            <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                                <span className="text-xl">{s.icon}</span>
                                <p className="text-2xl font-bold mt-1">{s.value}<span className="text-xs text-slate-500 ml-1">{s.unit}</span></p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Users size={14} className="text-slate-400" /> 가장 많이 만난 사람
                        </h3>
                        <div className="flex gap-3">
                            {STATS.topPeople.map((name, i) => (
                                <div key={name} className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                        {name[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{name}</p>
                                        <p className="text-[10px] text-slate-500">#{i + 1}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 text-center">
                        <Star size={20} className="text-indigo-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-indigo-300">3개월 뒤 더 자세한 분석이 열려요</p>
                        <p className="text-xs text-slate-400 mt-1">패턴 분석, 성장 그래프, 인생 키워드 변화</p>
                    </div>
                </div>
            )}
        </div>
    );
}
