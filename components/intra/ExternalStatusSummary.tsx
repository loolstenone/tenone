"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useExternalStatus, formatKst } from "@/lib/intra/use-external-status";

/** 외부 리소스 자동 점검 요약 — 환경변수·배포·크론·에이전트·토큰 */
export function ExternalStatusSummary() {
    const { data, error, loading } = useExternalStatus();

    if (loading) {
        return (
            <div className="bg-white border border-neutral-200 rounded-lg p-4 flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> 실시간 현황 불러오는 중...
            </div>
        );
    }
    if (error || !data) {
        return <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-xs text-rose-800">{error ?? "현황을 불러오지 못했습니다"}</div>;
    }

    const now = Date.now();
    const gmailExpired = data.gmail.filter(g => g.is_active && g.expiresAt && new Date(g.expiresAt).getTime() < now);
    const activeAgents = data.agents.filter(a => a.is_active);
    const runningAgents = activeAgents.filter(a => a.count30 > 0);

    const alerts: string[] = [
        ...data.envForbiddenSet.map(f => `금지 변수 설정됨: ${f.key} — ${f.reason}`),
        ...data.envMissingRequired.map(k => `필수 환경변수 미설정: ${k}`),
        ...gmailExpired.map(g => `Gmail 토큰 만료: ${g.email}`),
    ];

    const stats = [
        { label: "배포", value: data.deployment.commit ?? data.deployment.env, sub: data.deployment.commitMessage ?? data.deployment.env },
        { label: "필수 환경변수", value: `${data.env.filter(e => e.required && e.set).length}/${data.env.filter(e => e.required).length}`, sub: "설정 여부만 표시 (값 비공개)" },
        { label: "크론", value: `${data.crons.length}개`, sub: "vercel.json 기준" },
        { label: "에이전트", value: `${runningAgents.length}/${activeAgents.length}`, sub: "최근 30일 가동 / 등록" },
        { label: "수집 소스", value: `${data.sources.active}/${data.sources.total}`, sub: `마지막 수집 ${formatKst(data.sources.lastCrawl)}` },
    ];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {stats.map(s => (
                    <div key={s.label} className="bg-white border border-neutral-200 rounded-lg p-3">
                        <p className="text-[10px] text-neutral-500">{s.label}</p>
                        <p className="text-sm font-semibold text-neutral-900 font-mono truncate">{s.value}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{s.sub}</p>
                    </div>
                ))}
            </div>
            {alerts.length > 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                    {alerts.map(a => (
                        <p key={a} className="text-[11px] text-amber-900 flex items-center gap-1.5">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> {a}
                        </p>
                    ))}
                </div>
            ) : (
                <p className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3" /> 자동 점검 이상 없음 · {formatKst(data.generatedAt)} 기준
                </p>
            )}
        </div>
    );
}
