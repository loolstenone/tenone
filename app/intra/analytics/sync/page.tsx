"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/intra/IntraUI";
import { RefreshCw, CheckCircle2, AlertCircle, Info, ExternalLink, Clock } from "lucide-react";

interface SyncResult {
    brand_id: string;
    status: "ok" | "error";
    rows?: number;
    error?: string;
}

interface EnvCheck {
    propertyId: boolean;
    serviceAccount: boolean;
    cronSecret: boolean;
    gtmId: boolean;
    gaId: boolean;
    clarityId: boolean;
    serviceRoleKey: boolean;
}

const SETUP_STEPS = [
    {
        n: 1,
        title: "GA4 속성 생성 · 속성 ID 확보",
        desc: "analytics.google.com → 관리 → 속성 설정 → 속성 ID (숫자)",
        envKey: "GA4_PROPERTY_ID" as const,
        envLabel: "propertyId" as keyof EnvCheck,
        external: "https://analytics.google.com/analytics/web/#/a/p",
    },
    {
        n: 2,
        title: "GCP 서비스 계정 생성",
        desc: "console.cloud.google.com → IAM → 서비스 계정 생성 → JSON 키 다운로드",
        envKey: "GA4_SERVICE_ACCOUNT_JSON" as const,
        envLabel: "serviceAccount" as keyof EnvCheck,
        external: "https://console.cloud.google.com/iam-admin/serviceaccounts",
    },
    {
        n: 3,
        title: "GA4에 서비스 계정 뷰어 권한 부여",
        desc: "GA4 → 관리 → 계정 액세스 관리 → 서비스 계정 이메일 추가 (뷰어)",
        external: "https://support.google.com/analytics/answer/9305788",
    },
    {
        n: 4,
        title: "Custom Dimension 등록: brand_id",
        desc: "GA4 → 관리 → 맞춤 정의 → 맞춤 측정기준 생성 → 이벤트 범위 brand_id",
        external: "https://support.google.com/analytics/answer/10075209",
    },
    {
        n: 5,
        title: "GTM 변수 + 태그 설정",
        desc: "dataLayer 변수 brand_id → GA4 Configuration에 custom_parameter로 전달",
        external: "https://tagmanager.google.com",
    },
    {
        n: 6,
        title: "Vercel 환경변수 설정",
        desc: "GA4_PROPERTY_ID · GA4_SERVICE_ACCOUNT_JSON · CRON_SECRET (Production)",
        external: "https://vercel.com/loolstenone/tenone/settings/environment-variables",
    },
];

export default function AnalyticsSyncPage() {
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<SyncResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [days, setDays] = useState(7);
    const [env, setEnv] = useState<EnvCheck | null>(null);

    useEffect(() => {
        fetch("/api/analytics/env-check").then(r => r.json()).then(setEnv).catch(() => { });
    }, []);

    async function runSync() {
        setRunning(true);
        setResults([]);
        setError(null);
        try {
            const res = await fetch(`/api/analytics/sync?days=${days}`, { method: "POST" });
            const json = await res.json();
            if (!res.ok) setError(json.error || "동기화 실패");
            else setResults(json.results || []);
        } catch {
            setError("네트워크 오류");
        } finally {
            setRunning(false);
        }
    }

    const ok = results.filter(r => r.status === "ok");
    const errs = results.filter(r => r.status === "error");
    const ready = env?.propertyId && env?.serviceAccount;

    const setupCompleted = env ? [
        { label: "GA4 속성 ID", done: env.propertyId },
        { label: "Service Account", done: env.serviceAccount },
        { label: "Cron Secret", done: env.cronSecret },
        { label: "GTM ID", done: env.gtmId },
        { label: "GA Measurement", done: env.gaId },
        { label: "Clarity ID", done: env.clarityId },
        { label: "Service Role Key", done: env.serviceRoleKey },
    ] : [];
    const doneCount = setupCompleted.filter(s => s.done).length;

    return (
        <div className="space-y-6">
            <PageHeader title="GA4 동기화" description="Google Analytics 4 → Supabase 자동 집계 파이프라인" />

            {/* 환경변수 상태 */}
            {env && (
                <div className="bg-white border border-neutral-200 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-neutral-900">환경변수 상태 ({doneCount}/{setupCompleted.length})</h3>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${ready ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {ready ? "동기화 준비 완료" : "GA4 설정 필요"}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {setupCompleted.map(s => (
                            <div key={s.label} className="flex items-center gap-2 text-[11px]">
                                {s.done ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <AlertCircle className="h-3 w-3 text-amber-500" />}
                                <span className={s.done ? "text-neutral-700" : "text-neutral-400"}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 6단계 셋업 가이드 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Info className="h-4 w-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-900">GA4 ↔ Supabase 파이프라인 셋업 (6단계)</h3>
                </div>
                <div className="space-y-2">
                    {SETUP_STEPS.map(step => {
                        const checkField = step.envLabel;
                        const done = checkField && env ? env[checkField] : undefined;
                        return (
                            <div key={step.n} className="flex items-start gap-3 bg-white rounded p-3">
                                <div className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    done === true ? "bg-emerald-500 text-white" :
                                    done === false ? "bg-amber-500 text-white" :
                                    "bg-neutral-200 text-neutral-600"
                                }`}>
                                    {done === true ? "✓" : step.n}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-neutral-900">{step.title}</p>
                                        <a href={step.external} target="_blank" rel="noopener noreferrer"
                                            className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                                            열기 <ExternalLink className="h-2.5 w-2.5" />
                                        </a>
                                    </div>
                                    <p className="text-[11px] text-neutral-600 mt-0.5">{step.desc}</p>
                                    {step.envKey && (
                                        <code className="text-[10px] bg-neutral-100 text-neutral-700 px-1 rounded font-mono mt-1 inline-block">{step.envKey}</code>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 수동 동기화 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-4">
                <h3 className="text-sm font-semibold">수동 동기화</h3>
                <div className="flex items-center gap-4">
                    <div>
                        <label className="text-xs text-neutral-500 block mb-1">기간</label>
                        <select value={days} onChange={e => setDays(Number(e.target.value))}
                            className="text-sm border border-neutral-200 rounded px-3 py-1.5 bg-white">
                            <option value={1}>어제 (1일)</option>
                            <option value={7}>최근 7일</option>
                            <option value={30}>최근 30일</option>
                            <option value={90}>최근 90일</option>
                        </select>
                    </div>
                    <button onClick={runSync} disabled={running || !ready}
                        className="flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-5">
                        <RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
                        {running ? "동기화 중..." : "동기화 실행"}
                    </button>
                </div>
                {!ready && env && (
                    <p className="text-[11px] text-amber-700">GA4_PROPERTY_ID · GA4_SERVICE_ACCOUNT_JSON을 Vercel에 설정한 뒤 재배포하세요.</p>
                )}
            </div>

            {/* 오류 */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-2 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            {/* 결과 */}
            {results.length > 0 && (
                <div className="bg-white border border-neutral-200 rounded-lg p-5 space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-green-600"><CheckCircle2 className="h-4 w-4" /> {ok.length} 성공</span>
                        {errs.length > 0 && <span className="flex items-center gap-1.5 text-red-500"><AlertCircle className="h-4 w-4" /> {errs.length} 실패</span>}
                    </div>
                    <div className="space-y-1.5">
                        {results.map(r => (
                            <div key={r.brand_id} className="flex items-center gap-3 text-xs">
                                {r.status === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                                <span className="w-24 text-neutral-700 font-medium">{r.brand_id}</span>
                                <span className="text-neutral-500">{r.status === "ok" ? `${r.rows}행 저장` : r.error}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 자동 동기화 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-violet-500" />
                    <h3 className="text-sm font-semibold">자동 동기화 (Vercel Cron)</h3>
                </div>
                <div className="space-y-2 text-xs text-neutral-600">
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                        <span>엔드포인트</span>
                        <code className="text-[11px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded">/api/cron/analytics-sync</code>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                        <span>스케줄</span>
                        <span className="text-neutral-900 font-semibold">0 18 * * * (매일 03:00 KST)</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                        <span>수집 기간</span>
                        <span>어제 + 그제 (days=2, 지표 재확정)</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                        <span>인증</span>
                        <span>Bearer ${"{"}CRON_SECRET{"}"} 헤더 (Vercel 자동 부여)</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span>대상 브랜드</span>
                        <span>GA4 dimension:brand_id 기반 자동 인식 (24개+)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
