"use client";

/**
 * 팀 진단 리포트 (팀장·기업 담당자 + 참여한 팀원)
 * ① 팀 설문 — 팀원 응답 5명 이상: 영역별 팀원 평균 vs 팀장, 인식 차이, 문제점·팀 빌딩 방법, 이름 없는 서술(무작위)
 * ② 성향 구성(케미) — 검사 완료 5명 이상: 역할 분포·빈자리·일하는 방식·흥미
 * 원천: GET /api/hero/team/:id — 개인 단위 값 없음
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { BalanceBars, ReportCard, ShareBars } from "@/features/hero/report/StatBars";
import type { TeamReport } from "@/lib/hero/team-report";
import type { SurveyReport } from "@/lib/hero/team-survey";

interface Data {
    diagnosis: { id: string; name: string; status: string; invite_code?: string; hero_companies: { company_name: string } | null };
    canManage: boolean;
    participants: number;
    surveyed: number;
    leaderSurveyed: boolean;
    tested: number;
    floor: number;
    survey: SurveyReport | null;
    report: TeamReport | null;
}

export default function TeamReportPage() {
    const { id } = useParams<{ id: string }>();
    const { isLoading, isAuthenticated } = useAuth();
    const [d, setD] = useState<Data | null>(null);
    const [missing, setMissing] = useState(false);
    const [busy, setBusy] = useState(false);
    const [copied, setCopied] = useState(false);

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

    async function copy(code: string) {
        const link = `${window.location.origin}/hero/team/join/${code}`;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            window.prompt("초대 링크를 복사해 팀원에게 보내 주세요", link);
        }
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-sm text-mute">불러오는 중</span></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor="#E53935" /></div>;
    if (missing) return <div className="min-h-screen pt-32 text-center text-sm text-neutral-500">팀 진단을 찾을 수 없습니다. <Link href="/hero/team" className="underline">팀 진단</Link></div>;
    if (!d) return <div className="min-h-screen flex items-center justify-center"><span className="text-sm text-mute">불러오는 중</span></div>;

    const s = d.survey;
    const r = d.report;

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6 space-y-5">
                <Link href="/hero/team" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 팀 진단
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-bold text-[#E53935] mb-2">팀 진단 · {d.diagnosis.hero_companies?.company_name}</p>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{d.diagnosis.name}</h1>
                        <p className="text-sm text-neutral-500 mt-2">
                            참여 {d.participants}명 · 팀원 설문 {d.surveyed}명 · 팀장 설문 {d.leaderSurveyed ? "완료" : "전"} · 검사 완료 {d.tested}명
                            {d.diagnosis.status !== "open" && " · 참여 마감"}
                        </p>
                    </div>
                    {d.canManage && (
                        <div className="flex gap-2 shrink-0">
                            {d.diagnosis.status === "open" && d.diagnosis.invite_code && (
                                <button onClick={() => copy(d.diagnosis.invite_code!)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xs border border-neutral-200 bg-white text-sm hover:bg-neutral-50">
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "복사됨" : "초대 링크"}
                                </button>
                            )}
                            <button onClick={toggle} disabled={busy} className="px-3 py-2 rounded-xs border border-neutral-200 bg-white text-sm hover:bg-neutral-50 disabled:opacity-40">
                                {d.diagnosis.status === "open" ? "참여 마감" : "참여 다시 열기"}
                            </button>
                        </div>
                    )}
                </div>

                {/* ① 팀 설문 */}
                {!s ? (
                    <Waiting title={`팀원 ${d.floor}명이 설문을 마치면 단합·문제점 리포트가 열립니다`} now={`지금 ${d.surveyed}명 · ${Math.max(0, d.floor - d.surveyed)}명 더`} />
                ) : (
                    <>
                        <ReportCard title="우리 팀은 지금" desc={`팀원 ${s.respondents}명의 평균과 팀장의 응답 (100점 기준, 높을수록 좋음)`}>
                            <ul className="space-y-4">
                                {s.dims.map(x => (
                                    <li key={x.key}>
                                        <div className="flex items-baseline justify-between text-sm mb-1">
                                            <span className="font-bold">{x.label}</span>
                                            <span className="text-neutral-600 tabular-nums">팀원 {x.team}{x.leader !== null && <span className="text-neutral-400"> · 팀장 {x.leader}</span>}</span>
                                        </div>
                                        <div className="relative h-2 rounded-none bg-neutral-100">
                                            <div className="absolute inset-y-0 left-0 rounded-none bg-neutral-800" style={{ width: `${x.team}%` }} />
                                            {x.leader !== null && <div className="absolute -inset-y-1 w-0.5 bg-[#E53935]" style={{ left: `${x.leader}%` }} title="팀장" />}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-xs text-neutral-500 mt-4">검은 막대 = 팀원 평균 · 빨간 선 = 팀장</p>
                        </ReportCard>

                        {s.blindSpots.length > 0 && (
                            <ReportCard title="서로 보는 눈이 다른 곳" desc="팀장과 팀원 평균이 20점 이상 차이 나는 영역 — 서로 말하기 어려웠던 부분일 수 있습니다">
                                <ul className="space-y-3">
                                    {s.blindSpots.map(b => (
                                        <li key={b.label} className="text-sm"><p className="font-bold mb-1">{b.label}</p><p className="text-neutral-600 break-keep">{b.text}</p></li>
                                    ))}
                                </ul>
                            </ReportCard>
                        )}

                        <ReportCard title="문제점과 팀 빌딩" desc="팀원 평균이 50점 아래인 영역">
                            {s.issues.length === 0 ? (
                                <p className="text-sm text-neutral-600">눈에 띄게 낮은 영역이 없습니다.{s.strengths.length > 0 && ` 특히 ${s.strengths.join("·")}이(가) 잘 되고 있습니다.`}</p>
                            ) : (
                                <ul className="space-y-5">
                                    {s.issues.map(i => (
                                        <li key={i.label} className="text-sm">
                                            <p className="font-bold mb-1">{i.label}</p>
                                            <p className="text-neutral-600 break-keep mb-2">{i.text}</p>
                                            <p className="bg-neutral-50 rounded-xs px-3 py-2 break-keep"><span className="font-bold">해 볼 것 · </span>{i.tip}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </ReportCard>

                        {(s.hardToSay.length > 0 || s.doingWell.length > 0) && (
                            <ReportCard title="팀원들의 이야기" desc="이름 없이, 무작위 순서로 보여 드립니다">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <Quotes title="바뀌었으면 하는 것" items={s.hardToSay} />
                                    <Quotes title="잘하고 있는 것" items={s.doingWell} />
                                </div>
                            </ReportCard>
                        )}
                    </>
                )}

                {/* ② 성향 구성 (케미) */}
                {!r ? (
                    <Waiting title={`HIT 기본 성향 검사를 마친 참여자가 ${d.floor}명이 되면 팀의 성향 구성(케미)이 열립니다`} now={`지금 ${d.tested}명`} />
                ) : (
                    <>
                        {r.dominant && (
                            <ReportCard title={`${r.dominant.role}형이 많은 팀`} desc={`검사를 마친 참여자 ${r.respondents}명 기준`}>
                                <p className="text-sm text-neutral-700 leading-relaxed break-keep">{r.dominant.guide}</p>
                            </ReportCard>
                        )}
                        <ReportCard title="역할 분포" desc="팀에서 주로 맡는 역할 (행동 유형)">
                            <ShareBars items={r.roles.map(x => ({ label: x.role, sub: x.desc, pct: x.pct }))} />
                            {r.gaps.length > 0 && (
                                <ul className="mt-6 space-y-3">
                                    {r.gaps.map(g => (
                                        <li key={g.key} className="text-sm"><p className="font-bold mb-1">{g.role}이(가) 적습니다</p><p className="text-neutral-600 break-keep">{g.text}</p></li>
                                    ))}
                                </ul>
                            )}
                            <p className="mt-5 text-sm font-bold bg-neutral-50 rounded-xs px-4 py-3 break-keep">{r.hireSuggestion}</p>
                        </ReportCard>
                        <ReportCard title="일하는 방식" desc="양쪽 성향의 팀 평균">
                            <BalanceBars items={r.axes} />
                            {r.skews.length > 0 && (
                                <ul className="mt-6 space-y-3">
                                    {r.skews.map(x => (
                                        <li key={x.axis} className="text-sm"><p className="font-bold mb-1">{x.axis}으로 쏠림</p><p className="text-neutral-600 break-keep">{x.text}</p></li>
                                    ))}
                                </ul>
                            )}
                        </ReportCard>
                        {r.interests.length > 0 && (
                            <ReportCard title="흥미 유형" desc="팀원들이 가장 끌리는 일의 종류">
                                <ShareBars items={r.interests.map(x => ({ label: x.label, sub: x.desc, pct: x.pct }))} />
                            </ReportCard>
                        )}
                    </>
                )}

                <p className="text-xs text-neutral-500 break-keep">
                    팀 전체의 비율·평균과 이름 없는 이야기만 보입니다. 누가 어떻게 답했는지 찾으려 하지 말고, 인사 평가의 근거로 쓰지 말아 주세요.
                </p>
            </div>
        </div>
    );
}

function Waiting({ title, now }: { title: string; now: string }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xs p-6 text-center">
            <p className="font-bold mb-1 break-keep">{title}</p>
            <p className="text-sm text-neutral-500">{now} · 결과가 특정인으로 짐작되지 않도록 정한 기준입니다</p>
        </div>
    );
}

function Quotes({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <p className="text-sm font-bold mb-3">{title}</p>
            {items.length === 0 ? <p className="text-sm text-neutral-400">아직 없습니다</p> : (
                <ul className="space-y-2">
                    {items.map((t, i) => <li key={`${i}:${t}`} className="text-sm text-neutral-700 bg-neutral-50 rounded-xs px-3 py-2 break-keep whitespace-pre-line">{t}</li>)}
                </ul>
            )}
        </div>
    );
}
