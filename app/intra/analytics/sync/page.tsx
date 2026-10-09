"use client";

/**
 * GA4 동기화 — 운영 상태 화면 (2026-10-10 현실화)
 *   맨 위 = 실제 상태(마지막 동기화·데이터 보유 기간·공백) — 키가 있어도 동기화가 실패할 수 있다
 *   (날짜 형식 버그로 반년간 0건이었는데 예전 화면은 "동기화 준비 완료"였다)
 *   구조·절차 SSOT = CLAUDE.md 부록 G.1
 */
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/intra/IntraUI";
import { RefreshCw, CheckCircle2, AlertCircle, ExternalLink, Clock, ChevronDown, ChevronUp, MinusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SyncResult { brand_id: string; status: "ok" | "error"; rows?: number; error?: string }
interface EnvCheck { propertyId: boolean; serviceAccount: boolean; cronSecret: boolean; gtmId: boolean; gaId: boolean; clarityId: boolean; serviceRoleKey: boolean }
interface Status { lastSync: string | null; dates: string[]; brandCount: number }

/** 연속 날짜 구간으로 묶기 — ["04-13","04-14","05-01"] → [[04-13,04-14],[05-01,05-01]] */
function ranges(dates: string[]): [string, string][] {
    const out: [string, string][] = [];
    const day = (d: string) => Date.parse(`${d}T00:00:00Z`) / 86400000;
    for (const d of dates) {
        const last = out[out.length - 1];
        if (last && day(d) - day(last[1]) === 1) last[1] = d; else out.push([d, d]);
    }
    return out;
}
const kst = (iso: string) => new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
const shift = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const yesterday = () => { const d = new Date(Date.now() + 9 * 3600000 - 86400000); return d.toISOString().slice(0, 10); };

const SETUP_STEPS = [
    { title: "GA4 속성 ID", desc: "GA4 관리 › 속성 설정 › 속성 세부정보의 숫자 ID → Vercel GA4_PROPERTY_ID (측정 ID G-…가 아님)", href: "https://analytics.google.com" },
    { title: "서비스 계정 키", desc: "GCP TenOne Universe(smarcomm) › 서비스 계정 ga4-sync › JSON 키 → Vercel GA4_SERVICE_ACCOUNT_JSON (파일은 PC에서 삭제)", href: "https://console.cloud.google.com/iam-admin/serviceaccounts?project=smarcomm" },
    { title: "GA4 뷰어 권한", desc: "GA4 관리 › 속성 액세스 관리 › ga4-sync@smarcomm.iam.gserviceaccount.com = 뷰어", href: "https://analytics.google.com" },
    { title: "맞춤 측정기준 brand_id", desc: "GA4 관리 › 맞춤 정의 › brand_id (범위 이벤트, 매개변수 brand_id) — 2026-04-13 등록됨", href: "https://analytics.google.com" },
    { title: "GTM", desc: "TenOne_Tag(GA4 이벤트 page_view + brand_id, 트리거 CE - page_view) · Google 태그 send_page_view=false (버전 5)", href: "https://tagmanager.google.com/#/container/accounts/6349483070/containers/249197853/workspaces" },
    { title: "사이트 코드", desc: "components/Analytics.tsx → 이동할 때마다 detectSiteId()로 brand_id 판정 · 도메인은 lib/domain-registry.ts에 등록", href: "" },
];

export default function AnalyticsSyncPage() {
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<SyncResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"days" | "start">("days");
    const [days, setDays] = useState(7);
    const [start, setStart] = useState("2026-04-13");
    const [env, setEnv] = useState<EnvCheck | null>(null);
    const [status, setStatus] = useState<Status | null>(null);
    const [showSetup, setShowSetup] = useState(false);

    const loadStatus = useCallback(async () => {
        const sb = createClient();
        const [all, brands] = await Promise.all([
            sb.from("analytics_snapshots").select("date, synced_at").eq("brand_id", "_all").order("date", { ascending: true }).limit(1000),
            sb.from("analytics_snapshots").select("synced_at").neq("brand_id", "_all").order("synced_at", { ascending: false }).limit(1),
        ]);
        const rows = (all.data ?? []) as { date: string; synced_at: string }[];
        const lastSync = [rows.reduce<string | null>((m, r) => (!m || r.synced_at > m ? r.synced_at : m), null), brands.data?.[0]?.synced_at ?? null]
            .filter(Boolean).sort().pop() ?? null;
        const { count } = await sb.from("analytics_snapshots").select("brand_id", { count: "exact", head: true }).neq("brand_id", "_all").gte("date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
        setStatus({ lastSync, dates: rows.map(r => r.date), brandCount: count ?? 0 });
    }, []);

    useEffect(() => {
        fetch("/api/analytics/env-check").then(r => r.json()).then(setEnv).catch(() => { });
        loadStatus();
    }, [loadStatus]);

    async function runSync() {
        setRunning(true); setResults([]); setError(null);
        try {
            const q = mode === "start" ? `start=${start}` : `days=${days}`;
            const res = await fetch(`/api/analytics/sync?${q}`, { method: "POST" });
            const json = await res.json();
            if (!res.ok) setError(json.error || "동기화 실패");
            else { setResults(json.results || []); loadStatus(); }
        } catch {
            setError("네트워크 오류");
        } finally {
            setRunning(false);
        }
    }

    const ready = env?.propertyId && env?.serviceAccount;
    const okResults = results.filter(r => r.status === "ok");
    const errResults = results.filter(r => r.status === "error");

    // 상태 판정 — 매일 03:00 KST 동기화 → 마지막 동기화가 30시간 넘으면 멈춘 것, 어제 데이터가 없으면 수집·동기화 중 하나가 빠진 것
    const hoursSince = status?.lastSync ? (Date.now() - new Date(status.lastSync).getTime()) / 3600000 : null;
    const latest = status?.dates[status.dates.length - 1] ?? null;
    const stale = hoursSince === null || hoursSince > 30;
    const missingYesterday = !!latest && latest < yesterday();
    const spans = status ? ranges(status.dates) : [];
    const gaps = spans.slice(1).map((s, i) => [spans[i][1], s[0]] as const);
    const healthy = ready && !stale && !missingYesterday;

    const required = env ? [
        { label: "GA4 속성 ID", done: env.propertyId },
        { label: "서비스 계정", done: env.serviceAccount },
        { label: "Cron Secret", done: env.cronSecret },
        { label: "GTM ID", done: env.gtmId },
        { label: "Service Role Key", done: env.serviceRoleKey },
    ] : [];

    return (
        <div className="space-y-6">
            <PageHeader title="GA4 동기화" description="GA4 → analytics_snapshots (매일 03:00 KST 자동) — 구조·절차는 CLAUDE.md 부록 G.1" />

            {/* 운영 상태 */}
            <div className={`rounded-lg border p-5 ${healthy ? "border-emerald-200 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                <div className="mb-4 flex items-center gap-2">
                    {healthy ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-amber-600" />}
                    <h3 className="text-sm font-semibold text-neutral-900">
                        {!status ? "확인 중…" : healthy ? "정상 — 매일 쌓이는 중" : !ready ? "GA4 키 미설정" : stale ? "동기화가 멈췄습니다" : "어제 데이터가 비어 있습니다"}
                    </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Cell label="마지막 동기화" value={status?.lastSync ? kst(status.lastSync) : "없음"} warn={stale} />
                    <Cell label="최신 데이터" value={latest ? md(latest) : "없음"} warn={missingYesterday} />
                    <Cell label="보유 일수" value={`${status?.dates.length ?? 0}일`} />
                    <Cell label="최근 30일 브랜드 행" value={`${status?.brandCount ?? 0}`} />
                </div>
                {spans.length > 0 && (
                    <div className="mt-4 space-y-1 text-xs text-neutral-700">
                        <p><span className="text-neutral-500">데이터 기간</span> · {spans.map(([a, b]) => (a === b ? md(a) : `${md(a)}~${md(b)}`)).join(" · ")}</p>
                        {gaps.length > 0 && (
                            <p className="text-amber-700"><span className="text-neutral-500">수집 공백</span> · {gaps.map(([a, b]) => `${md(shift(a, 1))}~${md(shift(b, -1))}`).join(" · ")} (GA4에 기록 없음 — 2026-06~10-03은 GTM 스크립트 오류 기간)</p>
                        )}
                    </div>
                )}
                {!healthy && status && ready && (
                    <p className="mt-3 text-xs text-amber-800">
                        아래 수동 동기화를 실행해 오류 메시지를 확인하세요. GA4 API 오류(권한·속성 ID·날짜 형식)는 그대로 표시됩니다.
                    </p>
                )}
            </div>

            {/* 수동 동기화 */}
            <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
                <h3 className="text-sm font-semibold">수동 동기화</h3>
                <div className="flex flex-wrap items-end gap-3">
                    <div>
                        <label className="mb-1 block text-xs text-neutral-500">범위</label>
                        <select value={mode} onChange={e => setMode(e.target.value as "days" | "start")} className="rounded border border-neutral-200 bg-white px-3 py-1.5 text-sm">
                            <option value="days">최근 N일</option>
                            <option value="start">시작일부터 (백필)</option>
                        </select>
                    </div>
                    {mode === "days" ? (
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">기간</label>
                            <select value={days} onChange={e => setDays(Number(e.target.value))} className="rounded border border-neutral-200 bg-white px-3 py-1.5 text-sm">
                                <option value={2}>어제 + 그제</option>
                                <option value={7}>최근 7일</option>
                                <option value={30}>최근 30일</option>
                                <option value={90}>최근 90일</option>
                            </select>
                        </div>
                    ) : (
                        <div>
                            <label className="mb-1 block text-xs text-neutral-500">시작일 (어제까지, 최대 400일)</label>
                            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="rounded border border-neutral-200 px-3 py-1.5 text-sm" />
                        </div>
                    )}
                    <button onClick={runSync} disabled={running || !ready}
                        className="flex items-center gap-2 rounded bg-neutral-900 px-5 py-2 text-sm text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40">
                        <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
                        {running ? "동기화 중…" : "동기화 실행"}
                    </button>
                </div>
                <p className="text-[11px] text-neutral-400">이미 있는 날짜는 덮어씁니다 (중복 없음). 브랜드 구분 없는 (not set)은 저장하지 않고, 유니버스 전체는 _all 행으로 따로 받습니다.</p>
                {error && (
                    <div className="flex gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                    </div>
                )}
                {results.length > 0 && (
                    <div className="space-y-2 border-t border-neutral-100 pt-3">
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1.5 text-green-600"><CheckCircle2 className="h-4 w-4" /> {okResults.length} 성공</span>
                            {errResults.length > 0 && <span className="flex items-center gap-1.5 text-red-500"><AlertCircle className="h-4 w-4" /> {errResults.length} 실패</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-1 md:grid-cols-4">
                            {results.map(r => (
                                <div key={r.brand_id} className="flex items-center gap-2 text-xs">
                                    {r.status === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />}
                                    <span className="font-medium text-neutral-700">{r.brand_id === "_all" ? "유니버스 전체" : r.brand_id}</span>
                                    <span className="text-neutral-500">{r.status === "ok" ? `${r.rows}일` : r.error}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 설정 */}
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-neutral-900">설정</h3>
                    <span className="flex items-center gap-1 text-[11px] text-neutral-500"><Clock className="h-3 w-3" /> 자동: Vercel Cron /api/cron/analytics-sync · 매일 03:00 KST · 어제+그제 재확정</span>
                </div>
                <p className="mb-1 text-[11px] text-neutral-500">필수 키 (Vercel 운영 환경)</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                    {required.map(s => (
                        <div key={s.label} className="flex items-center gap-2 text-xs">
                            {s.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                            <span className={s.done ? "text-neutral-700" : "text-red-600"}>{s.label}</span>
                        </div>
                    ))}
                </div>
                {env && (
                    <p className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500">
                        <MinusCircle className="h-3 w-3" /> 선택: Microsoft Clarity {env.clarityId ? "켜짐" : "꺼짐"} (히트맵·세션 녹화, 없어도 GA4와 무관) · GA 측정 ID 변수는 쓰지 않음 (GTM이 연결)
                    </p>
                )}

                <button onClick={() => setShowSetup(v => !v)} className="mt-4 flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900">
                    {showSetup ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />} 연결 구성 (처음 설정·재설정 시)
                </button>
                {showSetup && (
                    <ol className="mt-3 space-y-2">
                        {SETUP_STEPS.map((s, i) => (
                            <li key={s.title} className="flex items-start gap-3 rounded bg-neutral-50 p-3">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-bold text-neutral-600">{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-neutral-900">{s.title}</p>
                                        {s.href && (
                                            <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-[10px] text-blue-600 hover:text-blue-800">
                                                열기 <ExternalLink className="h-2.5 w-2.5" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-neutral-600">{s.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                )}
            </div>
        </div>
    );
}

function Cell({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
    return (
        <div className="rounded border border-white/60 bg-white p-3">
            <p className="text-[11px] text-neutral-500">{label}</p>
            <p className={`text-base font-bold ${warn ? "text-amber-700" : "text-neutral-900"}`}>{value}</p>
        </div>
    );
}
