"use client";

/**
 * 팀 진단 리포트 (기업 담당자) — 검사를 마친 참여자 5명 이상이면 자동 리포트, 아니면 현황
 * 원천: GET /api/hero/team/:id (lib/hero/team-report.ts buildTeamReport) — 개인 단위 값 없음
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { BalanceBars, ReportCard, ShareBars } from "@/features/hero/report/StatBars";

interface Report {
    respondents: number;
    roles: { key: string; role: string; desc: string; pct: number }[];
    axes: { left: string; right: string; leftDesc: string; rightDesc: string; leftPct: number }[];
    interests: { key: string; label: string; desc: string; pct: number }[];
    dominant: { role: string; guide: string } | null;
    gaps: { key: string; role: string; text: string; hire: string }[];
    skews: { axis: string; text: string }[];
    hireSuggestion: string;
}

interface Data {
    diagnosis: { id: string; name: string; status: string; hero_companies: { company_name: string } | null };
    participants: number;
    tested: number;
    floor: number;
    report: Report | null;
}

export default function TeamReportPage() {
    const { id } = useParams<{ id: string }>();
    const { isLoading, isAuthenticated } = useAuth();
    const [d, setD] = useState<Data | null>(null);
    const [missing, setMissing] = useState(false);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        const res = await fetch(`/api/hero/team/${id}`);
        if (!res.ok) { setMissing(true); return; }
        setD(await res.json());
    }, [id]);

    useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

    async function toggle() {
        if (!d) return;
        setBusy(true);
        await fetch(`/api/hero/team/${id}`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: d.diagnosis.status === "open" ? "close" : "reopen" }),
        });
        await load();
        setBusy(false);
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor="#E53935" /></div>;
    if (missing) return <div className="min-h-screen pt-32 text-center text-sm text-neutral-500">팀 진단을 찾을 수 없습니다. <Link href="/hero/team" className="underline">팀 진단</Link></div>;
    if (!d) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;

    const r = d.report;

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6 space-y-5">
                <Link href="/hero/team" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 팀 진단
                </Link>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#E53935] mb-2">팀 진단 · {d.diagnosis.hero_companies?.company_name}</p>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{d.diagnosis.name}</h1>
                        <p className="text-sm text-neutral-500 mt-2">참여 {d.participants}명 · 검사 완료 {d.tested}명{d.diagnosis.status !== "open" && " · 참여 마감"}</p>
                    </div>
                    <button onClick={toggle} disabled={busy} className="shrink-0 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm hover:bg-neutral-50 disabled:opacity-40">
                        {d.diagnosis.status === "open" ? "참여 마감" : "참여 다시 열기"}
                    </button>
                </div>

                {!r ? (
                    <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
                        <p className="font-bold mb-2">검사를 마친 팀원이 {d.floor}명이 되면 리포트가 열립니다</p>
                        <p className="text-sm text-neutral-500 break-keep">지금 {d.tested}명 · {Math.max(0, d.floor - d.tested)}명 더 필요합니다. 결과가 특정인으로 짐작되지 않도록 정한 기준입니다.</p>
                    </div>
                ) : (
                    <>
                        {r.dominant && (
                            <ReportCard title={`${r.dominant.role}형이 많은 팀`} desc={`검사를 마친 팀원 ${r.respondents}명 기준`}>
                                <p className="text-sm text-neutral-700 leading-relaxed break-keep">{r.dominant.guide}</p>
                            </ReportCard>
                        )}
                        <ReportCard title="역할 분포" desc="팀에서 주로 맡는 역할 (행동 유형)">
                            <ShareBars items={r.roles.map(x => ({ label: x.role, sub: x.desc, pct: x.pct }))} />
                        </ReportCard>
                        <ReportCard title="비어 있는 역할" desc="비율이 15% 미만인 역할">
                            {r.gaps.length === 0 ? (
                                <p className="text-sm text-neutral-600">네 가지 역할이 고르게 있습니다.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {r.gaps.map(g => (
                                        <li key={g.key} className="text-sm">
                                            <p className="font-semibold mb-1">{g.role}</p>
                                            <p className="text-neutral-600 break-keep">{g.text}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <p className="mt-5 text-sm font-semibold bg-neutral-50 rounded-lg px-4 py-3 break-keep">{r.hireSuggestion}</p>
                        </ReportCard>
                        <ReportCard title="일하는 방식" desc="양쪽 성향의 팀 평균">
                            <BalanceBars items={r.axes} />
                            {r.skews.length > 0 && (
                                <ul className="mt-6 space-y-3">
                                    {r.skews.map(s => (
                                        <li key={s.axis} className="text-sm">
                                            <p className="font-semibold mb-1">{s.axis}으로 쏠림</p>
                                            <p className="text-neutral-600 break-keep">{s.text}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ReportCard>
                        {r.interests.length > 0 && (
                            <ReportCard title="흥미 유형" desc="팀원들이 가장 끌리는 일의 종류">
                                <ShareBars items={r.interests.map(x => ({ label: x.label, sub: x.desc, pct: x.pct }))} />
                            </ReportCard>
                        )}
                        <p className="text-xs text-neutral-500 break-keep">
                            팀 전체의 비율과 평균입니다. 누가 어떤 결과인지는 보이지 않으며, 인사 평가의 근거로 쓰지 않아 주세요.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
