"use client";

/**
 * 팀 진단 참여 (팀장·팀원) — 초대 링크로 들어와 동의 → 팀 설문(16문항 + 서술 2) → HIT 기본 성향 검사(없으면 안내)
 * 동의 기록: hero_team_participants.consent (TEAM_CONSENT_VERSION) · 나가기 = 통계·서술에서 빠짐
 * 개인 응답은 누구에게도 보이지 않는다 — 팀원 5명 이상일 때 평균·이름 없는 서술로만 리포트
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { TEAM_CONSENT } from "@/lib/hero/team-report";
import { SURVEY_ITEMS, SURVEY_OPEN, SURVEY_SCALE } from "@/lib/hero/team-survey";
import { hitStagePath } from "@/lib/hit/stages";

interface Info { id: string; team: string; company: string; status: string; joined: boolean; role: "leader" | "member"; surveyed: boolean; hasHitA: boolean }

export default function TeamJoinPage() {
    const { code } = useParams<{ code: string }>();
    const { isLoading, isAuthenticated } = useAuth();
    const [info, setInfo] = useState<Info | null>(null);
    const [missing, setMissing] = useState(false);
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [open, setOpen] = useState<Record<string, string>>({});

    const load = useCallback(async () => {
        const res = await fetch(`/api/hero/team/join/${code}`);
        if (!res.ok) { setMissing(true); return; }
        setInfo(await res.json());
    }, [code]);

    useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

    async function call(method: "POST" | "PUT" | "DELETE", body?: unknown) {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/api/hero/team/join/${code}`, {
                method, headers: { "Content-Type": "application/json" },
                body: body === undefined ? undefined : JSON.stringify(body),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "처리하지 못했습니다.");
            await load();
            return true;
        } catch (e) {
            setError(e instanceof Error ? e.message : "처리하지 못했습니다.");
            return false;
        } finally {
            setBusy(false);
        }
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor="#E53935" /></div>;
    if (missing) return <div className="min-h-screen pt-32 text-center text-sm text-neutral-500">초대 링크가 올바르지 않습니다.</div>;
    if (!info) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;

    const leader = info.role === "leader";
    const showSurvey = info.joined && info.status === "open" && (!info.surveyed || editing);
    const allAnswered = SURVEY_ITEMS.every(i => answers[i.id]);

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-2xl mx-auto px-6 space-y-5">
                <div>
                    <p className="text-sm font-bold text-[#E53935] mb-2">팀 진단 · {info.company}{leader && " · 팀장"}</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">{info.team} 팀 진단</h1>
                    <p className="text-sm text-neutral-600 break-keep">
                        팀장과 팀원이 같은 설문에 함께 답합니다. 평소 말하기 어려웠던 것을 이름 없이 꺼내 팀이 더 잘 일하는 방법을 찾는 진단입니다.
                        누가 어떻게 답했는지는 아무도 볼 수 없습니다.
                    </p>
                </div>

                {!info.joined && info.status !== "open" && (
                    <p className="bg-white border border-neutral-200 rounded-xl p-6 text-sm text-neutral-600">참여가 마감된 팀 진단입니다.</p>
                )}

                {!info.joined && info.status === "open" && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                        <dl className="text-sm space-y-2">
                            <div><dt className="font-semibold">이용 목적</dt><dd className="text-neutral-600">{TEAM_CONSENT.purpose}</dd></div>
                            <div><dt className="font-semibold">이용 항목</dt><dd className="text-neutral-600">{TEAM_CONSENT.items}</dd></div>
                            <div><dt className="font-semibold">보관 기간</dt><dd className="text-neutral-600">{TEAM_CONSENT.retention}</dd></div>
                        </dl>
                        <p className="text-xs text-neutral-500 leading-relaxed break-keep">{TEAM_CONSENT.note}</p>
                        <label className="flex items-start gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} className="mt-0.5" />
                            위 내용에 동의하고 팀 진단에 참여합니다
                        </label>
                        <button onClick={() => call("POST", { consent: true })} disabled={!agree || busy}
                            className="w-full py-3 rounded-lg bg-[#E53935] text-white text-sm font-bold disabled:opacity-40">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "참여하기"}
                        </button>
                    </div>
                )}

                {showSurvey && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
                        <div>
                            <p className="font-bold">팀 설문 · 약 5분</p>
                            <p className="text-xs text-neutral-500 mt-1">{leader ? "팀장으로서 우리 팀을 어떻게 보는지 답해 주세요. 팀원 평균과 나란히 보입니다." : "요즘 우리 팀에서 느끼는 그대로 답해 주세요."}</p>
                        </div>
                        <ol className="space-y-5">
                            {SURVEY_ITEMS.map((it, idx) => (
                                <li key={it.id}>
                                    <p className="text-sm font-semibold mb-2">{idx + 1}. {leader && it.leaderText ? it.leaderText : it.text}</p>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {SURVEY_SCALE.map((label, i) => (
                                            <button key={label} type="button" onClick={() => setAnswers(a => ({ ...a, [it.id]: i + 1 }))}
                                                className={clsx("py-2 rounded-lg border text-[11px] leading-tight transition-colors",
                                                    answers[it.id] === i + 1 ? "bg-red-50 border-[#E53935] text-[#E53935] font-semibold" : "border-neutral-200 text-neutral-600 hover:border-neutral-400")}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ol>
                        {SURVEY_OPEN.map(q => (
                            <div key={q.id}>
                                <p className="text-sm font-semibold mb-2">{q.text} <span className="text-xs font-normal text-neutral-500">(선택)</span></p>
                                <textarea value={open[q.id] ?? ""} onChange={e => setOpen(o => ({ ...o, [q.id]: e.target.value }))} maxLength={500} rows={3}
                                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" />
                            </div>
                        ))}
                        <p className="text-xs text-neutral-500 break-keep">서술은 이름 없이 무작위 순서로 보이지만, 인원이 적으면 문체로 짐작될 수 있습니다. 원하는 만큼만 써 주세요.</p>
                        <button onClick={async () => { if (await call("PUT", { survey: { answers, ...open } })) setEditing(false); }}
                            disabled={!allAnswered || busy}
                            className="w-full py-3 rounded-lg bg-[#E53935] text-white text-sm font-bold disabled:opacity-40">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : allAnswered ? "제출하기" : `${SURVEY_ITEMS.filter(i => answers[i.id]).length} / ${SURVEY_ITEMS.length}`}
                        </button>
                    </div>
                )}

                {info.joined && !showSurvey && (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                        <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5 text-neutral-700" /> {info.surveyed ? "설문을 마쳤습니다" : "참여하고 있습니다"}</p>
                        {!info.hasHitA && (
                            <Link href={hitStagePath("a")} className="flex items-center justify-between px-4 py-3 rounded-lg border border-neutral-200 text-sm font-semibold hover:bg-neutral-50">
                                HIT 기본 성향 검사도 받으면 팀의 성향 구성까지 볼 수 있습니다 <ArrowRight className="h-4 w-4 text-neutral-400" />
                            </Link>
                        )}
                        <Link href={`/hero/team/${info.id}`} className="flex items-center justify-between px-4 py-3 rounded-lg bg-neutral-900 text-white text-sm font-semibold">
                            팀 리포트 보기 <ArrowRight className="h-4 w-4" />
                        </Link>
                        <div className="flex gap-4 text-xs text-neutral-500">
                            {info.status === "open" && info.surveyed && <button onClick={() => setEditing(true)} className="underline">설문 다시 하기</button>}
                            <button onClick={() => call("DELETE")} disabled={busy} className="underline disabled:opacity-40">팀 진단에서 나가기</button>
                        </div>
                    </div>
                )}
                {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
        </div>
    );
}
