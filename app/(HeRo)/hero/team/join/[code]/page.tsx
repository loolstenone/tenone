"use client";

/**
 * 팀 진단 참여 (팀원) — 초대 링크로 들어와 동의 → 참여. HIT 기본 성향 검사가 없으면 먼저 받도록 안내
 * 동의 기록: hero_team_participants.consent (TEAM_CONSENT_VERSION) · 나가기 = 통계에서 빠짐
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { TEAM_CONSENT } from "@/lib/hero/team-report";
import { hitStagePath } from "@/lib/hit/stages";

interface Info { team: string; company: string; status: string; joined: boolean; hasHitA: boolean }

export default function TeamJoinPage() {
    const { code } = useParams<{ code: string }>();
    const { isLoading, isAuthenticated } = useAuth();
    const [info, setInfo] = useState<Info | null>(null);
    const [missing, setMissing] = useState(false);
    const [agree, setAgree] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const res = await fetch(`/api/hero/team/join/${code}`);
        if (!res.ok) { setMissing(true); return; }
        setInfo(await res.json());
    }, [code]);

    useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

    async function act(method: "POST" | "DELETE") {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/api/hero/team/join/${code}`, {
                method, headers: { "Content-Type": "application/json" },
                body: method === "POST" ? JSON.stringify({ consent: true }) : undefined,
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "처리하지 못했습니다.");
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "처리하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor="#E53935" /></div>;
    if (missing) return <div className="min-h-screen pt-32 text-center text-sm text-neutral-500">초대 링크가 올바르지 않습니다.</div>;
    if (!info) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-xl mx-auto px-6 space-y-5">
                <div>
                    <p className="text-sm font-bold text-[#E53935] mb-2">팀 진단 · {info.company}</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">{info.team} 팀 진단에 초대받았습니다</h1>
                    <p className="text-sm text-neutral-600 break-keep">
                        HIT 기본 성향 검사 결과를 모아 팀의 역할 분포와 일하는 방식을 보여 주는 리포트입니다. 회사에는 팀 전체의 비율만 보입니다.
                    </p>
                </div>

                {info.joined ? (
                    <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
                        <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5 text-neutral-700" /> 참여하고 있습니다</p>
                        {!info.hasHitA && (
                            <Link href={hitStagePath("a")} className="flex items-center justify-between px-4 py-3 rounded-lg bg-[#E53935] text-white text-sm font-bold">
                                HIT 기본 성향 검사 받기 <ArrowRight className="h-4 w-4" />
                            </Link>
                        )}
                        <p className="text-xs text-neutral-500 break-keep">
                            {info.hasHitA ? "가장 최근 기본 성향 검사 결과가 팀 통계에 들어갑니다." : "검사를 마쳐야 팀 통계에 들어갑니다."}
                        </p>
                        <button onClick={() => act("DELETE")} disabled={busy} className="text-xs text-neutral-500 underline disabled:opacity-40">
                            팀 진단에서 나가기 (통계에서 빠집니다)
                        </button>
                    </div>
                ) : info.status !== "open" ? (
                    <p className="bg-white border border-neutral-200 rounded-xl p-6 text-sm text-neutral-600">참여가 마감된 팀 진단입니다.</p>
                ) : (
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
                        <button onClick={() => act("POST")} disabled={!agree || busy}
                            className="w-full py-3 rounded-lg bg-[#E53935] text-white text-sm font-bold disabled:opacity-40">
                            {busy ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "참여하기"}
                        </button>
                    </div>
                )}
                {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
        </div>
    );
}
