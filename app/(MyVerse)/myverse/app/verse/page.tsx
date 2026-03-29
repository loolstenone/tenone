"use client";

import { useState, useEffect } from "react";
import { Orbit, TrendingUp, Tag, Calendar, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { fetchVerseTimeline, fetchLogs, fetchDreams, fetchProjects, fetchTasks } from "@/lib/myverse-supabase";
import type { VerseEvent } from "@/lib/myverse-supabase";

/* ── 타입 스타일 ── */
const TYPE_STYLE: Record<string, { color: string; label: string }> = {
    log: { color: "bg-indigo-500", label: "기록" },
    dream: { color: "bg-purple-500", label: "목표" },
    task: { color: "bg-emerald-500", label: "할일" },
    project: { color: "bg-amber-500", label: "프로젝트" },
    ai: { color: "bg-cyan-500", label: "AI" },
};

/* ── 날짜 포맷 ── */
function formatEventDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "어제";
    if (diffDays < 7) return `${diffDays}일 전`;

    return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

/* ── 그룹핑 (연도별) ── */
function groupByYear(events: VerseEvent[]): Record<string, VerseEvent[]> {
    const groups: Record<string, VerseEvent[]> = {};
    for (const e of events) {
        const year = new Date(e.created_at).getFullYear().toString();
        if (!groups[year]) groups[year] = [];
        groups[year].push(e);
    }
    return groups;
}

export default function VersePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [view, setView] = useState<"timeline" | "keywords" | "stats">("timeline");
    const [events, setEvents] = useState<VerseEvent[]>([]);
    const [stats, setStats] = useState({ totalLogs: 0, totalDays: 0, goalsCompleted: 0, projectsDone: 0 });
    const [loading, setLoading] = useState(true);

    // 초기 데이터 로드
    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUserId(user.id);

            // 타임라인 + 통계 병렬 로드
            const [timeline, logsRes, dreamsRes, projectsRes, tasksRes] = await Promise.all([
                fetchVerseTimeline(user.id, 50),
                fetchLogs(user.id, 500),
                fetchDreams(user.id),
                fetchProjects(user.id),
                fetchTasks(user.id),
            ]);

            setEvents(timeline);

            // 통계 계산
            const uniqueDays = new Set(logsRes.logs.map(l => l.created_at.slice(0, 10))).size;
            setStats({
                totalLogs: logsRes.logs.length,
                totalDays: uniqueDays,
                goalsCompleted: dreamsRes.dreams.filter(d => d.status === 'completed').length,
                projectsDone: projectsRes.projects.filter(p => p.status === 'completed').length,
            });

            setLoading(false);
        };
        load();
    }, []);

    // 키워드 추출 (간이 — 로그 내용에서 빈도수 높은 단어)
    const extractKeywords = () => {
        const logEvents = events.filter(e => e.type === 'log');
        if (logEvents.length === 0) return [];

        const wordCount: Record<string, number> = {};
        logEvents.forEach(e => {
            const words = e.title.split(/\s+/).filter(w => w.length > 1);
            words.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });
        });

        return Object.entries(wordCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([text, count]) => ({
                text,
                size: count >= 3 ? "lg" : count >= 2 ? "md" : "sm",
            }));
    };

    if (loading) {
        return (
            <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-center min-h-[60vh]">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const yearGroups = groupByYear(events);
    const keywords = extractKeywords();

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
                    {Object.keys(yearGroups).length > 0 ? (
                        Object.entries(yearGroups)
                            .sort(([a], [b]) => Number(b) - Number(a))
                            .map(([year, yearEvents]) => (
                                <div key={year}>
                                    <h2 className="text-lg font-bold text-indigo-400 mb-3">{year}</h2>
                                    <div className="space-y-3 border-l-2 border-white/10 ml-2 pl-4">
                                        {yearEvents.map((e, i) => {
                                            const style = TYPE_STYLE[e.type] || TYPE_STYLE.log;
                                            return (
                                                <div key={i} className="relative">
                                                    <div className={`absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full ${style.color}`} />
                                                    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] text-slate-500">{formatEventDate(e.created_at)}</span>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full text-white ${style.color}`}>{style.label}</span>
                                                        </div>
                                                        <p className="text-sm font-medium">{e.title}</p>
                                                        {e.description && <p className="text-xs text-slate-400 mt-0.5">{e.description}</p>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p className="text-sm text-slate-500 bg-white/[0.03] border border-white/5 rounded-xl p-6 text-center">
                            아직 타임라인이 비어 있어요. LOG, DREAM, WORK 탭에서 데이터를 쌓아보세요.
                        </p>
                    )}
                </div>
            )}

            {/* 키워드 뷰 */}
            {view === "keywords" && (
                <div className="space-y-6">
                    {keywords.length > 0 ? (
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 mb-3">내 키워드</h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords.map(w => (
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
                    ) : null}
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
                            { label: "기록", value: stats.totalLogs, unit: "개", icon: "\ud83d\udcdd" },
                            { label: "활동 일수", value: stats.totalDays, unit: "일", icon: "\ud83d\udcc5" },
                            { label: "달성한 목표", value: stats.goalsCompleted, unit: "개", icon: "\ud83c\udfaf" },
                            { label: "완료 프로젝트", value: stats.projectsDone, unit: "개", icon: "\ud83d\udcbc" },
                        ].map(s => (
                            <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                                <span className="text-xl">{s.icon}</span>
                                <p className="text-2xl font-bold mt-1">{s.value}<span className="text-xs text-slate-500 ml-1">{s.unit}</span></p>
                                <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                            </div>
                        ))}
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
