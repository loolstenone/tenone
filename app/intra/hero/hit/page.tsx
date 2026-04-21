"use client";

/**
 * HIT 이용자 관리
 *
 * HIT(Hero Identification Test) 응시자 · 세션 · 결과 현황.
 * 이 페이지는 "이용자" 관점이다 (누가 언제 어떤 테스트를 했는지).
 * 테스트 구성·질문·답변 관리는 각각 /structure /questions /answers 페이지로 분리.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ClipboardCheck, Loader2, Clock, CheckCircle2, PauseCircle, Users, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface Session {
    id: string;
    member_id: string | null;
    test_type: string;
    status: string;
    current_module: string | null;
    current_index: number | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

interface Stats {
    total: number;
    completed: number;
    inProgress: number;
    byType: Record<string, number>;
    responses: number;
}

function rel(dateStr: string | null): string {
    if (!dateStr) return "-";
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 1) return "방금 전";
    if (d < 60) return `${d}분 전`;
    const h = Math.floor(d / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

function duration(started: string | null, completed: string | null): string {
    if (!started) return "-";
    const end = completed ? new Date(completed).getTime() : Date.now();
    const mins = Math.floor((end - new Date(started).getTime()) / 60000);
    if (mins < 1) return "<1분";
    if (mins < 60) return `${mins}분`;
    return `${Math.floor(mins / 60)}시간 ${mins % 60}분`;
}

export default function HitUsersPage() {
    const [loading, setLoading] = useState(true);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [filter, setFilter] = useState<"all" | "completed" | "in_progress">("all");

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const [sessRes, respCount] = await Promise.all([
                sb.from("hit_sessions").select("*").order("created_at", { ascending: false }).limit(200),
                sb.from("hit_responses").select("*", { count: "exact", head: true }),
            ]);
            const all = sessRes.data ?? [];
            setSessions(all);
            const byType: Record<string, number> = {};
            all.forEach(s => { byType[s.test_type] = (byType[s.test_type] ?? 0) + 1; });
            setStats({
                total: all.length,
                completed: all.filter(s => s.status === "completed").length,
                inProgress: all.filter(s => s.status === "in_progress" || s.status === "active").length,
                byType,
                responses: respCount.count ?? 0,
            });
            setLoading(false);
        }
        load();
    }, []);

    const filteredSessions = sessions.filter(s => {
        if (filter === "completed") return s.status === "completed";
        if (filter === "in_progress") return s.status === "in_progress" || s.status === "active";
        return true;
    });

    if (loading || !stats) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader
                title="HIT 이용자"
                description="Hero Identification Test 응시자 · 세션 · 결과 현황 (이용자 관점)"
            />

            {/* 구분 안내 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-900">
                <strong>이용자 관점 페이지입니다.</strong> 테스트 자체의 구성·질문·답변 관리는 각 전용 페이지로 이동하세요 —
                <Link href="/intra/hero/hit/structure" className="underline font-semibold mx-1">HIT 구성</Link> ·
                <Link href="/intra/hero/hit/questions" className="underline font-semibold mx-1">질문 관리</Link> ·
                <Link href="/intra/hero/hit/answers" className="underline font-semibold mx-1">답변 구성</Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ClipboardCheck className="h-4 w-4 text-rose-600" />
                        <span className="text-[11px] text-neutral-500">전체 세션</span>
                    </div>
                    <p className="text-xl font-bold">{stats.total.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] text-neutral-500">완료</span>
                    </div>
                    <p className="text-xl font-bold">{stats.completed.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <PauseCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-[11px] text-neutral-500">진행 중</span>
                    </div>
                    <p className="text-xl font-bold">{stats.inProgress.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-violet-600" />
                        <span className="text-[11px] text-neutral-500">총 응답 수</span>
                    </div>
                    <p className="text-xl font-bold">{stats.responses.toLocaleString()}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-neutral-500" />
                        <span className="text-[11px] text-neutral-500">테스트 타입</span>
                    </div>
                    <p className="text-xl font-bold">{Object.keys(stats.byType).length}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{Object.keys(stats.byType).slice(0, 4).join(", ")}</p>
                </div>
            </div>

            {/* Filter + List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-neutral-900">세션 목록 ({filteredSessions.length})</h2>
                    <div className="flex gap-1">
                        {(["all", "completed", "in_progress"] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-2.5 py-1 text-[11px] rounded ${filter === f ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"}`}>
                                {f === "all" ? "전체" : f === "completed" ? "완료만" : "진행 중"}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredSessions.length === 0 ? (
                    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-6 text-center text-xs text-neutral-400">
                        해당 조건의 세션이 없습니다.
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">member_id</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">테스트</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    <th className="text-left px-3 py-2 font-semibold text-neutral-600">현재 모듈</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">소요</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">시작</th>
                                    <th className="text-right px-3 py-2 font-semibold text-neutral-600">완료</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSessions.map(s => (
                                    <tr key={s.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                        <td className="px-3 py-1.5 font-mono text-[10px] text-neutral-700">
                                            {s.member_id ? s.member_id.substring(0, 8) + "…" : "-"}
                                        </td>
                                        <td className="px-3 py-1.5">
                                            <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-semibold">{s.test_type}</span>
                                        </td>
                                        <td className="px-3 py-1.5">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                                                s.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                                                s.status === "in_progress" || s.status === "active" ? "bg-amber-100 text-amber-700" :
                                                "bg-neutral-100 text-neutral-500"
                                            }`}>{s.status}</span>
                                        </td>
                                        <td className="px-3 py-1.5 text-neutral-600 font-mono text-[10px]">
                                            {s.current_module ? `${s.current_module}[${s.current_index ?? 0}]` : "-"}
                                        </td>
                                        <td className="px-3 py-1.5 text-right text-neutral-500">{duration(s.started_at, s.completed_at)}</td>
                                        <td className="px-3 py-1.5 text-right text-neutral-500">{rel(s.started_at)}</td>
                                        <td className="px-3 py-1.5 text-right text-neutral-500">{rel(s.completed_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 테스트 타입 분포 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">테스트 타입별 세션 분포</h2>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                    {Object.entries(stats.byType).sort(([, a], [, b]) => b - a).map(([type, count]) => (
                        <div key={type} className="bg-white border border-neutral-200 rounded p-2 text-center">
                            <p className="text-[10px] font-mono text-neutral-500">{type}</p>
                            <p className="text-lg font-bold text-neutral-900">{count}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 관리 링크 */}
            <div className="grid grid-cols-3 gap-3">
                <Link href="/intra/hero/hit/structure" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">HIT 구성 (15 모듈)</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">모듈 × 테스트 타입 매트릭스 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/hero/hit/questions" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">질문 관리 (2,034)</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">hit_questions · 필터·검색 <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
                <Link href="/intra/hero/hit/answers" className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-900">
                    <p className="text-xs font-semibold">답변 구성</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">response_type · scoring_key <ArrowRight className="inline h-3 w-3" /></p>
                </Link>
            </div>
        </div>
    );
}
