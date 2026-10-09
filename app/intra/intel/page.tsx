"use client";

/**
 * Intelligence › 이번 주 유니버스 (2026-10-10) — 30초 안에 "유니버스가 잘 되고 있나"
 *   숫자는 직접 세지 않고 두 화면의 SSOT를 그대로 쓴다: 운영 상태(lib/intel/ops-health.ts) · 브랜드 성과(lib/intel/brand-performance.ts)
 *   방문 규모만 analytics_snapshots `_all`(유니버스 전체, 중복 없는 GA4 값)에서 읽는다
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/intra/IntraUI";
import { createClient } from "@/lib/supabase/client";

type Metric = "joins" | "inquiries" | "applications" | "certificates";
interface BrandPerf { slug: string; name: string; tier: string | null; is_open: boolean; users: number; cur: Record<Metric, number>; prev: Record<Metric, number>; members_total: number }
interface OpsItem { key: string; label: string; status: "ok" | "warn" | "fail" | "idle"; detail: string }
interface Health { items: OpsItem[]; summary: Record<OpsItem["status"], number> }

const METRICS: { key: Metric; label: string }[] = [
    { key: "joins", label: "브랜드 가입" },
    { key: "inquiries", label: "문의" },
    { key: "applications", label: "신청" },
    { key: "certificates", label: "수료증" },
];
const FOCUS = ["core", "focus"];
const ymd = (d: number) => new Date(d + 9 * 3600000).toISOString().slice(0, 10);

function Kpi({ label, cur, prev, note }: { label: string; cur: number; prev: number | null; note?: string }) {
    const diff = prev === null ? 0 : cur - prev;
    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-[11px] text-neutral-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-neutral-900">{cur.toLocaleString()}</p>
            <p className={`mt-0.5 text-[11px] ${diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-500" : "text-neutral-400"}`}>
                {prev === null ? note ?? "지난주 비교 없음" : diff === 0 ? "지난주와 같음" : `지난주 대비 ${diff > 0 ? "+" : ""}${diff.toLocaleString()}`}
            </p>
        </div>
    );
}

export default function WeeklyUniversePage() {
    const [health, setHealth] = useState<Health | null>(null);
    const [brands, setBrands] = useState<BrandPerf[]>([]);
    const [sessions, setSessions] = useState<{ cur: number; prev: number | null }>({ cur: 0, prev: null });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const now = Date.now();
        Promise.all([
            fetch("/api/intra/ops-health").then(r => (r.ok ? r.json() : null)).catch(() => null),
            fetch("/api/intra/brand-performance?days=7").then(r => (r.ok ? r.json() : null)).catch(() => null),
            createClient().from("analytics_snapshots").select("date, sessions").eq("brand_id", "_all").gt("date", ymd(now - 14 * 86400000)),
        ]).then(([h, p, { data }]) => {
            setHealth(h);
            setBrands(p?.brands ?? []);
            const cut = ymd(now - 7 * 86400000);
            const rows = (data ?? []) as { date: string; sessions: number }[];
            const prevRows = rows.filter(r => r.date <= cut);
            setSessions({
                cur: rows.filter(r => r.date > cut).reduce((n, r) => n + r.sessions, 0),
                prev: prevRows.length ? prevRows.reduce((n, r) => n + r.sessions, 0) : null,
            });
            setLoading(false);
        });
    }, []);

    const sum = (m: Metric, k: "cur" | "prev") => brands.reduce((n, b) => n + b[k][m], 0);
    const problems = (health?.items ?? []).filter(i => i.status === "fail" || i.status === "warn");
    const focus = brands.filter(b => FOCUS.includes(b.tier ?? ""))
        .sort((a, b) => FOCUS.indexOf(a.tier ?? "") - FOCUS.indexOf(b.tier ?? "") || b.users - a.users);

    if (loading) return <div className="flex h-60 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-400" /></div>;

    return (
        <div className="space-y-6">
            <PageHeader title="이번 주 유니버스" description="최근 7일 — 방문 · 가입 · 문의 · 신청, 그리고 멈춘 자동화" />

            {health && (
                <Link href="/intra/intel/health"
                    className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${problems.length ? "border-rose-200 bg-rose-50 hover:border-rose-300" : "border-emerald-200 bg-emerald-50 hover:border-emerald-300"}`}>
                    {problems.length ? <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900">{problems.length ? `자동화 확인 필요 ${problems.length}건` : "모든 자동화 정상"}</p>
                        {problems.map(i => (
                            <p key={i.key} className="mt-1 flex items-center gap-1.5 text-xs text-neutral-700">
                                {i.status === "fail" ? <XCircle className="h-3.5 w-3.5 text-rose-500" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-500" />}
                                <span className="font-medium">{i.label}</span><span className="truncate text-neutral-500">— {i.detail}</span>
                            </p>
                        ))}
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                </Link>
            )}

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Kpi label="방문 (세션, GA4)" cur={sessions.cur} prev={sessions.prev} note="지난주 GA4 수집 공백" />
                {METRICS.map(m => <Kpi key={m.key} label={m.label} cur={sum(m.key, "cur")} prev={sum(m.key, "prev")} />)}
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-900">핵심 · 집중 브랜드</h2>
                    <Link href="/intra/analytics/brands" className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900">브랜드 성과 <ArrowRight className="h-3 w-3" /></Link>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {focus.map(b => (
                        <Link key={b.slug} href={`/intra/analytics/brands/${b.slug}`} className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-400">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-neutral-900">{b.name}</p>
                                {!b.is_open && <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">비공개</span>}
                            </div>
                            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                                {[["방문자", b.users], ["가입", b.cur.joins], ["문의", b.cur.inquiries], ["신청", b.cur.applications]].map(([l, v]) => (
                                    <div key={l as string}>
                                        <p className="text-[10px] text-neutral-400">{l}</p>
                                        <p className={`text-sm font-medium tabular-nums ${v ? "text-neutral-900" : "text-neutral-300"}`}>{(v as number).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-[10px] text-neutral-400">누적 회원 {b.members_total.toLocaleString()}</p>
                        </Link>
                    ))}
                </div>
            </div>

            <p className="text-[11px] text-neutral-400">집계 수만 표시합니다 (데이터 계약 4). 정보 수집(Whole See)은 UMS › Mindle, 에이전트 설정은 Universe › 에이전트 설정에서 관리합니다.</p>
        </div>
    );
}
