"use client";

/**
 * Whole See — 크롤링 상태 (2026-10-10 현실화)
 *   실제 실행 기록으로 보여준다: Edge Function trend-crawl(매시간)이 남기는 agent_messages(type=trend_crawl) + collected_data 상태별 건수
 *   ※ crawler_status 테이블은 아무도 갱신하지 않아 2026-03-26 값에 멈춰 있었다 — 더 이상 읽지 않는다
 */

import { useEffect, useState } from "react";
import { Activity, Loader2, CheckCircle2, AlertCircle, Clock, Inbox } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

interface RunPayload {
    crawl?: { sources?: number; collected?: number; errors?: string[] };
    process?: { total?: number; processed?: number; skipped?: number; errors?: string[] };
    elapsedMs?: number;
}
interface Run { created_at: string; payload: RunPayload }

const STATUSES = [
    { key: "raw", label: "처리 대기", tone: "text-neutral-700" },
    { key: "processed", label: "트렌드 카드 생성", tone: "text-emerald-700" },
    { key: "rejected", label: "관련성 낮음 (제외)", tone: "text-neutral-500" },
    { key: "error", label: "처리 오류", tone: "text-rose-600" },
] as const;

function rel(dateStr: string | null): string {
    if (!dateStr) return "-";
    const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (d < 1) return "방금 전";
    if (d < 60) return `${d}분 전`;
    const h = Math.floor(d / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
}

/** 같은 원인의 오류를 묶는다 (기사 제목 앞부분은 떼고 원인만) */
function groupErrors(errors: string[]): { reason: string; count: number }[] {
    const map = new Map<string, number>();
    for (const e of errors) {
        const credit = /credit balance is too low/i.test(e) ? "Anthropic API 크레딧 부족 — Plans & Billing에서 충전 필요" : null;
        const reason = credit ?? e.slice(0, 160);
        map.set(reason, (map.get(reason) ?? 0) + 1);
    }
    return [...map.entries()].map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count);
}

export default function CrawlingPage() {
    const [runs, setRuns] = useState<Run[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [lastCard, setLastCard] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const sb = createClient();
            const since = new Date(Date.now() - 7 * 86400000).toISOString();
            const [{ data: runRows }, last, ...statusCounts] = await Promise.all([
                sb.from("agent_messages").select("created_at, payload").eq("payload->>type", "trend_crawl").order("created_at", { ascending: false }).limit(24),
                sb.from("mindle_trends").select("created_at").order("created_at", { ascending: false }).limit(1),
                ...STATUSES.map(s => sb.from("collected_data").select("id", { count: "exact", head: true }).eq("status", s.key).gte("collected_at", since)),
            ]);
            setRuns((runRows ?? []) as Run[]);
            setLastCard(last.data?.[0]?.created_at ?? null);
            setCounts(Object.fromEntries(STATUSES.map((s, i) => [s.key, statusCounts[i].count ?? 0])));
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    const latest = runs[0];
    const collected24 = runs.reduce((n, r) => n + (r.payload.crawl?.collected ?? 0), 0);
    const processed24 = runs.reduce((n, r) => n + (r.payload.process?.processed ?? 0), 0);
    const processErrors = groupErrors(runs.flatMap(r => r.payload.process?.errors ?? []));
    const sourceErrors = groupErrors(latest?.payload.crawl?.errors ?? []);
    const stale = !latest || Date.now() - new Date(latest.created_at).getTime() > 2 * 3600000;

    return (
        <div className="space-y-6">
            <PageHeader title="크롤링" description="Whole See 수집 → 분류 → 트렌드 카드 — 매시간 실행 기록 (Edge Function trend-crawl)" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat icon={stale ? AlertCircle : CheckCircle2} tone={stale ? "text-rose-600" : "text-emerald-600"} label="마지막 실행" value={rel(latest?.created_at ?? null)} />
                <Stat icon={Inbox} tone="text-neutral-500" label={`수집 (최근 ${runs.length}회)`} value={collected24.toLocaleString()} />
                <Stat icon={Activity} tone={processed24 ? "text-emerald-600" : "text-rose-600"} label={`카드 생성 (최근 ${runs.length}회)`} value={processed24.toLocaleString()} />
                <Stat icon={Clock} tone="text-neutral-500" label="마지막 트렌드 카드" value={rel(lastCard)} />
            </div>

            {processErrors.length > 0 && (
                <section className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <h2 className="mb-2 text-sm font-semibold text-rose-700">분류·카드 생성 오류 (최근 {runs.length}회)</h2>
                    <ul className="space-y-1 text-xs text-rose-700">
                        {processErrors.map(e => <li key={e.reason}>{e.count}건 · {e.reason}</li>)}
                    </ul>
                </section>
            )}

            <section>
                <h2 className="mb-3 text-sm font-semibold text-neutral-900">최근 7일 수집 기사 상태</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {STATUSES.map(s => (
                        <div key={s.key} className="rounded-lg border border-neutral-200 bg-white p-4">
                            <p className="text-[11px] text-neutral-500">{s.label}</p>
                            <p className={`text-xl font-bold ${s.tone}`}>{(counts[s.key] ?? 0).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-semibold text-neutral-900">
                    수집 실패 소스 (마지막 실행 · 소스 {latest?.payload.crawl?.sources ?? 0}개 중 {sourceErrors.length}개)
                </h2>
                {sourceErrors.length === 0 ? (
                    <p className="text-xs text-neutral-400">실패한 소스 없음</p>
                ) : (
                    <ul className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white text-xs">
                        {sourceErrors.map(e => <li key={e.reason} className="px-3 py-2 text-neutral-700">{e.reason}</li>)}
                    </ul>
                )}
                <p className="mt-2 text-[11px] text-neutral-400">소스 주소 수정은 Whole See › 소스 관리</p>
            </section>

            <section>
                <h2 className="mb-3 text-sm font-semibold text-neutral-900">실행 기록</h2>
                <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
                    <table className="w-full text-xs">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-600">
                            <tr><th className="px-3 py-2">실행</th><th className="px-3 py-2 text-right">수집</th><th className="px-3 py-2 text-right">처리</th><th className="px-3 py-2 text-right">카드</th><th className="px-3 py-2 text-right">오류</th><th className="px-3 py-2 text-right">소요</th></tr>
                        </thead>
                        <tbody>
                            {runs.map(r => {
                                const errs = (r.payload.process?.errors?.length ?? 0) + (r.payload.crawl?.errors?.length ?? 0);
                                return (
                                    <tr key={r.created_at} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-3 py-2 text-neutral-700">{new Date(r.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                                        <td className="px-3 py-2 text-right">{r.payload.crawl?.collected ?? 0}</td>
                                        <td className="px-3 py-2 text-right">{r.payload.process?.total ?? 0}</td>
                                        <td className={`px-3 py-2 text-right font-semibold ${r.payload.process?.processed ? "text-emerald-700" : "text-neutral-400"}`}>{r.payload.process?.processed ?? 0}</td>
                                        <td className={`px-3 py-2 text-right ${errs ? "text-rose-600" : "text-neutral-400"}`}>{errs}</td>
                                        <td className="px-3 py-2 text-right text-neutral-500">{r.payload.elapsedMs ? `${Math.round(r.payload.elapsedMs / 1000)}초` : "-"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {runs.length === 0 && <p className="p-6 text-center text-xs text-neutral-400">실행 기록이 없습니다 — pg_cron trend-crawl-hourly 확인</p>}
                </div>
            </section>
        </div>
    );
}

function Stat({ icon: Icon, tone, label, value }: { icon: typeof Activity; tone: string; label: string; value: string }) {
    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="mb-1 flex items-center gap-2"><Icon className={`h-4 w-4 ${tone}`} /><span className="text-[11px] text-neutral-500">{label}</span></div>
            <p className="text-xl font-bold text-neutral-900">{value}</p>
        </div>
    );
}
