"use client";

/**
 * Intelligence > 데이터 헬스 (Pipeline Health)
 *
 * 유니버스 전체 데이터 유입·분석 파이프라인의 실시간 건강성 모니터링.
 * 새 파이프라인 추가는 /api/intra/pipeline-health/route.ts PIPELINE_REGISTRY에.
 */

import { useEffect, useState } from "react";
import {
    Activity, Loader2, CheckCircle2, AlertTriangle, Clock, Zap, RefreshCw, Play,
} from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

type Status = "healthy" | "stale" | "empty" | "error";
type Category = "intake" | "analysis" | "activity" | "revenue" | "cs";

interface Pipeline {
    key: string;
    label: string;
    category: Category;
    table: string;
    time_column: string;
    expected_interval_hours: number;
    critical?: boolean;
    filter?: { col: string; val: string };
    total: number;
    last24h: number;
    last7d: number;
    last_activity: string | null;
    age_hours: number | null;
    status: Status;
    error?: string;
}

interface HealthResponse {
    summary: { total: number; healthy: number; stale: number; empty: number; error: number; critical_issues: number };
    pipelines: Pipeline[];
    checked_at: string;
}

const CATEGORY_META: Record<Category, { label: string; color: string }> = {
    intake: { label: "수집 (Intake)", color: "text-blue-700" },
    analysis: { label: "분석 (Analysis)", color: "text-violet-700" },
    activity: { label: "활동 (Activity)", color: "text-emerald-700" },
    revenue: { label: "매출", color: "text-amber-700" },
    cs: { label: "CS", color: "text-rose-700" },
};

const STATUS_META: Record<Status, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
    healthy: { label: "정상", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    stale: { label: "정체", color: "bg-amber-100 text-amber-700", icon: Clock },
    empty: { label: "비어있음", color: "bg-neutral-200 text-neutral-600", icon: AlertTriangle },
    error: { label: "에러", color: "bg-rose-100 text-rose-700", icon: AlertTriangle },
};

function rel(dateStr: string | null): string {
    if (!dateStr) return "없음";
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "방금 전";
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

export default function PipelineHealthPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<HealthResponse | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [triggering, setTriggering] = useState<string | null>(null);
    const [triggerLog, setTriggerLog] = useState<{ action: string; ts: string; result: string }[]>([]);

    async function trigger(action: string) {
        setTriggering(action);
        try {
            const res = await fetch("/api/intra/pipeline-trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const j = await res.json();
            setTriggerLog(prev => [{
                action,
                ts: new Date().toLocaleTimeString(),
                result: JSON.stringify(j.result ?? j, null, 0).slice(0, 200),
            }, ...prev].slice(0, 10));
        } catch (e) {
            setTriggerLog(prev => [{ action, ts: new Date().toLocaleTimeString(), result: String(e) }, ...prev].slice(0, 10));
        } finally {
            setTriggering(null);
            setTimeout(load, 2000);
        }
    }

    async function load() {
        setRefreshing(true);
        const res = await fetch("/api/intra/pipeline-health");
        const j = await res.json();
        setData(j);
        setLoading(false);
        setRefreshing(false);
    }
    useEffect(() => { load(); }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;
    if (!data) return null;

    const { summary, pipelines } = data;
    const byCategory = new Map<Category, Pipeline[]>();
    pipelines.forEach(p => {
        if (!byCategory.has(p.category)) byCategory.set(p.category, []);
        byCategory.get(p.category)!.push(p);
    });

    return (
        <div className="space-y-6">
            <PageHeader title="데이터 헬스" description="유니버스 파이프라인 실시간 건강성 · 자동 stale 감지" />

            {/* 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-white border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="h-4 w-4 text-neutral-500" />
                        <span className="text-[11px] text-neutral-500">전체 파이프라인</span>
                    </div>
                    <p className="text-xl font-bold">{summary.total}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-[11px] text-emerald-700">정상</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-700">{summary.healthy}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-[11px] text-amber-700">정체</span>
                    </div>
                    <p className="text-xl font-bold text-amber-700">{summary.stale}</p>
                </div>
                <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-neutral-500" />
                        <span className="text-[11px] text-neutral-500">비어있음</span>
                    </div>
                    <p className="text-xl font-bold text-neutral-600">{summary.empty}</p>
                </div>
                <div className={`${summary.critical_issues > 0 ? "bg-rose-50 border-rose-300" : "bg-white border-neutral-200"} border rounded-lg p-4`}>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className={`h-4 w-4 ${summary.critical_issues > 0 ? "text-rose-600" : "text-neutral-400"}`} />
                        <span className={`text-[11px] ${summary.critical_issues > 0 ? "text-rose-700 font-semibold" : "text-neutral-500"}`}>Critical 이슈</span>
                    </div>
                    <p className={`text-xl font-bold ${summary.critical_issues > 0 ? "text-rose-700" : "text-neutral-400"}`}>{summary.critical_issues}</p>
                </div>
            </div>

            {/* 새로고침 · 갱신 시각 */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] text-neutral-500">최근 확인: {new Date(data.checked_at).toLocaleString()}</p>
                <button onClick={load} disabled={refreshing}
                    className="flex items-center gap-1 px-3 py-1 text-[11px] border border-neutral-200 rounded hover:bg-neutral-50">
                    <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} /> 새로고침
                </button>
            </div>

            {/* 카테고리별 파이프라인 */}
            {Array.from(byCategory.entries()).map(([cat, list]) => {
                const meta = CATEGORY_META[cat];
                return (
                    <div key={cat}>
                        <h2 className={`text-sm font-semibold mb-2 ${meta.color}`}>
                            {meta.label} <span className="text-[11px] text-neutral-400 font-normal">({list.length})</span>
                        </h2>
                        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                    <tr>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">파이프라인</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">테이블</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">전체</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">24h</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">7d</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">최근 활동</th>
                                        <th className="text-right px-3 py-2 font-semibold text-neutral-600">예상 주기</th>
                                        <th className="text-left px-3 py-2 font-semibold text-neutral-600">상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {list.map(p => {
                                        const sm = STATUS_META[p.status];
                                        const SIcon = sm.icon;
                                        const intervalLabel = p.expected_interval_hours < 30 ? `${p.expected_interval_hours}h` :
                                                              p.expected_interval_hours < 168 ? `${Math.round(p.expected_interval_hours / 24)}일` :
                                                              `${Math.round(p.expected_interval_hours / 168)}주`;
                                        return (
                                            <tr key={p.key} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                                                <td className="px-3 py-1.5 font-medium text-neutral-900">
                                                    {p.label}
                                                    {p.critical && <span className="ml-1 text-[9px] bg-rose-100 text-rose-700 px-1 py-0.5 rounded font-bold">CRIT</span>}
                                                </td>
                                                <td className="px-3 py-1.5 font-mono text-[10px] text-neutral-500">
                                                    {p.table}
                                                    {p.filter && <span className="text-neutral-400"> · {p.filter.col}={p.filter.val}</span>}
                                                </td>
                                                <td className="px-3 py-1.5 text-right text-neutral-700">{p.total.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-right text-neutral-700">{p.last24h.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-right text-neutral-700">{p.last7d.toLocaleString()}</td>
                                                <td className="px-3 py-1.5 text-right text-neutral-500">
                                                    {rel(p.last_activity)}
                                                    {p.age_hours !== null && p.age_hours > p.expected_interval_hours && (
                                                        <span className="ml-1 text-[9px] text-amber-600 font-semibold">
                                                            ({p.age_hours.toFixed(0)}h)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-1.5 text-right text-neutral-400">{intervalLabel}</td>
                                                <td className="px-3 py-1.5">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-semibold ${sm.color}`}>
                                                        <SIcon className="h-3 w-3" /> {sm.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            {/* 수동 트리거 */}
            <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-3">수동 실행</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                    {([
                        { action: "crawl", label: "RSS 크롤", color: "border-blue-300 hover:bg-blue-50 text-blue-700" },
                        { action: "process", label: "트렌드 처리", color: "border-violet-300 hover:bg-violet-50 text-violet-700" },
                        { action: "opportunity_crawl", label: "기회 크롤", color: "border-emerald-300 hover:bg-emerald-50 text-emerald-700" },
                        { action: "opportunity_process", label: "기회 처리", color: "border-teal-300 hover:bg-teal-50 text-teal-700" },
                        { action: "newsletter", label: "뉴스레터 수집", color: "border-amber-300 hover:bg-amber-50 text-amber-700" },
                    ] as const).map(({ action, label, color }) => (
                        <button key={action} onClick={() => trigger(action)} disabled={!!triggering}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold border rounded-lg transition-colors ${color} disabled:opacity-40`}>
                            {triggering === action
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Play className="h-3 w-3" />}
                            {label}
                        </button>
                    ))}
                </div>
                {triggerLog.length > 0 && (
                    <div className="bg-neutral-900 rounded-lg p-3 font-mono text-[10px] text-neutral-300 space-y-1 max-h-40 overflow-y-auto">
                        {triggerLog.map((l, i) => (
                            <div key={i}><span className="text-neutral-500">[{l.ts}]</span> <span className="text-emerald-400">{l.action}</span> → {l.result}</div>
                        ))}
                    </div>
                )}
            </div>

            {/* 설명 */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-[11px] text-neutral-700 leading-relaxed">
                <p className="font-semibold mb-1">판정 기준</p>
                <ul className="list-disc ml-4 space-y-0.5">
                    <li><strong>정상</strong>: 예상 주기 내에 최근 데이터 있음</li>
                    <li><strong>정체</strong>: 예상 주기를 초과했는데 데이터 없음 — <span className="text-amber-700">Cron·저장 로직 점검 필요</span></li>
                    <li><strong>비어있음</strong>: 테이블 자체에 데이터 한 건도 없음 (설계만 된 상태)</li>
                    <li><strong>CRIT</strong> 배지: 유니버스 운영 핵심 파이프라인 (끊기면 전체 영향)</li>
                </ul>
                <p className="mt-2">새 파이프라인 추가: <code className="font-mono bg-neutral-100 px-1 rounded">app/api/intra/pipeline-health/route.ts</code> <code className="font-mono bg-neutral-100 px-1 rounded">PIPELINE_REGISTRY</code> 배열에 entry 한 줄.</p>
            </div>
        </div>
    );
}
