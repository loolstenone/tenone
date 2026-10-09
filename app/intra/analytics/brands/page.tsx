"use client";

/**
 * Intelligence › 브랜드 성과 (2026-10-10) — 방문이 가입·문의·신청·수료로 이어지나
 *   계산 SSOT = lib/intel/brand-performance.ts. DB가 1차, GA4는 방문 규모 보조
 *   집계 수만 — 개인 단위 교차 분석 금지 (§0.1 데이터 계약 4)
 */
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";

type Metric = "joins" | "inquiries" | "applications" | "certificates";
interface BrandPerf {
    slug: string; name: string; tier: string | null; is_open: boolean;
    users: number; sessions: number; prev_users: number;
    cur: Record<Metric, number>; prev: Record<Metric, number>; members_total: number;
}
interface Perf { brands: BrandPerf[]; days: number; since: string; ga4_prev: boolean }

const METRICS: { key: Metric; label: string }[] = [
    { key: "joins", label: "브랜드 가입" },
    { key: "inquiries", label: "문의" },
    { key: "applications", label: "신청" },
    { key: "certificates", label: "수료증" },
];
const TIER_ORDER = ["core", "focus"];
const activity = (b: BrandPerf) => b.users + METRICS.reduce((n, m) => n + b.cur[m.key], 0);

function Delta({ cur, prev }: { cur: number; prev: number }) {
    if (cur === prev) return null;
    const up = cur > prev;
    return <span className={`ml-1 text-[10px] ${up ? "text-emerald-600" : "text-rose-500"}`}>{up ? "▲" : "▼"}{Math.abs(cur - prev)}</span>;
}

function Row({ b, ga4Prev }: { b: BrandPerf; ga4Prev: boolean }) {
    const rate = b.users ? (b.cur.joins / b.users) * 100 : null;
    return (
        <tr className="hover:bg-neutral-50">
            <td className="px-4 py-3">
                <Link href={`/intra/analytics/brands/${b.slug}`} className="font-medium text-neutral-900 hover:underline">{b.name}</Link>
                {!b.is_open && <span className="ml-2 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">비공개</span>}
            </td>
            <td className="px-4 py-3 text-right tabular-nums">{b.users.toLocaleString()}{ga4Prev && <Delta cur={b.users} prev={b.prev_users} />}</td>
            {METRICS.map(m => (
                <td key={m.key} className={`px-4 py-3 text-right tabular-nums ${b.cur[m.key] ? "text-neutral-900" : "text-neutral-300"}`}>
                    {b.cur[m.key]}<Delta cur={b.cur[m.key]} prev={b.prev[m.key]} />
                </td>
            ))}
            <td className="px-4 py-3 text-right tabular-nums text-neutral-700">{rate === null ? "-" : `${rate.toFixed(1)}%`}</td>
            <td className="px-4 py-3 text-right tabular-nums text-neutral-500">{b.members_total.toLocaleString()}</td>
        </tr>
    );
}

export default function BrandPerformancePage() {
    const [days, setDays] = useState(30);
    const [data, setData] = useState<Perf | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRest, setShowRest] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true); setError("");
        fetch(`/api/intra/brand-performance?days=${days}`)
            .then(r => (r.ok ? r.json() : Promise.reject()))
            .then((d: Perf) => { if (!cancelled) setData(d); })
            .catch(() => { if (!cancelled) setError("성과를 불러오지 못했습니다."); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [days]);

    const brands = data?.brands ?? [];
    const focus = brands.filter(b => TIER_ORDER.includes(b.tier ?? ""))
        .sort((a, b) => TIER_ORDER.indexOf(a.tier ?? "") - TIER_ORDER.indexOf(b.tier ?? "") || activity(b) - activity(a));
    const rest = brands.filter(b => !TIER_ORDER.includes(b.tier ?? "") && activity(b) > 0).sort((a, b) => activity(b) - activity(a));
    const total = (m: Metric) => focus.concat(rest).reduce((n, b) => n + b.cur[m], 0);

    return (
        <div className="space-y-6">
            <PageHeader title="브랜드 성과" description="방문이 가입·문의·신청·수료로 이어지는지 — 전환은 DB, 방문자는 GA4(보조)">
                <div className="flex items-center gap-1 rounded border border-neutral-200 p-0.5">
                    {[7, 30, 90].map(d => (
                        <button key={d} onClick={() => setDays(d)}
                            className={`rounded px-3 py-1 text-xs transition-colors ${days === d ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-neutral-900"}`}>
                            {d}일
                        </button>
                    ))}
                </div>
            </PageHeader>

            {data && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {METRICS.map(m => (
                        <div key={m.key} className="rounded-lg border border-neutral-200 bg-white p-4">
                            <p className="text-[11px] text-neutral-500">{m.label} · 최근 {days}일</p>
                            <p className="mt-1 text-xl font-semibold text-neutral-900">{total(m.key)}</p>
                        </div>
                    ))}
                </div>
            )}

            {loading && !data ? (
                <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>
            ) : error ? (
                <p className="text-sm text-rose-600">{error}</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
                    <table className="w-full min-w-[760px] text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
                            <tr>
                                <th className="px-4 py-2.5 text-left">브랜드</th>
                                <th className="px-4 py-2.5 text-right">방문자 (GA4)</th>
                                {METRICS.map(m => <th key={m.key} className="px-4 py-2.5 text-right">{m.label}</th>)}
                                <th className="px-4 py-2.5 text-right">가입 전환</th>
                                <th className="px-4 py-2.5 text-right">누적 회원</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            <tr><td colSpan={8} className="bg-neutral-50/60 px-4 py-1.5 text-[11px] font-semibold text-neutral-500">핵심 · 집중</td></tr>
                            {focus.map(b => <Row key={b.slug} b={b} ga4Prev={!!data?.ga4_prev} />)}
                            {rest.length > 0 && (
                                <Fragment>
                                    <tr>
                                        <td colSpan={8} className="bg-neutral-50/60 px-4 py-1.5">
                                            <button onClick={() => setShowRest(v => !v)} className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900">
                                                {showRest ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                                실험 · 보관 — 활동 있는 {rest.length}곳
                                            </button>
                                        </td>
                                    </tr>
                                    {showRest && rest.map(b => <Row key={b.slug} b={b} ga4Prev={!!data?.ga4_prev} />)}
                                </Fragment>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="space-y-1 text-[11px] text-neutral-400">
                <p>▲▼ = 바로 앞 {days}일 대비{data && !data.ga4_prev ? " (앞 기간 GA4 수집 공백 — 방문자 증감 생략)" : ""}. 가입 전환 = 브랜드 가입 ÷ 방문자 (GA4 사용자 수는 추정치라 방향만 참고).</p>
                <p>누적 회원 = 새 사이트에서 Ten:One ID로 브랜드에 가입한 수 (탈퇴 제외). Badak·MADLeap 외부 서버 회원은 이전하지 않으므로 이 숫자가 재가입 현황입니다.</p>
                <p>집계 수만 표시합니다 — 브랜드 간 회원 대조·개인 단위 분석은 별도 동의 없이 하지 않습니다 (데이터 계약 4).</p>
            </div>
        </div>
    );
}
