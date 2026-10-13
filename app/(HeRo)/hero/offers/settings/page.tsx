"use client";

/**
 * 인재 — 제안 받기 설정 (2026-10-13)
 * 켤 때 개인정보 수집·이용 동의(제15조) — 문안 SSOT lib/hero/offers.ts SETTINGS_CONSENT
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import {
    EMPTY_SETTINGS, LOCATIONS, OFFER_CAREER_LEVELS, OFFER_INDUSTRIES, OFFER_JOB_FUNCTIONS,
    SETTINGS_CONSENT, TRAITS_CONSENT, WORK_MODES, type OfferSettings,
} from "@/lib/hero/offers";
import { ChipPick, ChipSingle, Field } from "@/features/hero/offers/OfferUI";

const HERO_RED = "#E53935";

export default function OfferSettingsPage() {
    const router = useRouter();
    const { isLoading, isAuthenticated } = useAuth();
    const [s, setS] = useState<OfferSettings>(EMPTY_SETTINGS);
    const [hasResume, setHasResume] = useState(true);
    const [hasHitA, setHasHitA] = useState(true);
    const [consent, setConsent] = useState(false);
    const [traitsConsent, setTraitsConsent] = useState(false);
    const [traitsSaved, setTraitsSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetch("/api/hero/offers/settings").then(r => r.json()).then(d => {
            if (d.settings) { setS(d.settings); setTraitsSaved(!!d.settings.share_traits); }
            setHasResume(!!d.hasResume);
            setHasHitA(!!d.hasHitA);
        }).catch(() => undefined).finally(() => setLoading(false));
    }, [isAuthenticated]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-sm text-mute">불러오는 중</span></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor={HERO_RED} /></div>;

    const needConsent = !s.consented_at;
    const set = <K extends keyof OfferSettings>(k: K, v: OfferSettings[K]) => setS(prev => ({ ...prev, [k]: v }));

    async function save(open: boolean) {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch("/api/hero/offers/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...s, is_open: open, consent, traitsConsent }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "저장하지 못했습니다.");
            router.push("/hero/offers");
        } catch (e) {
            setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
            setSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-2xl mx-auto px-6">
                <Link href="/hero/offers" className="inline-flex items-center gap-1 text-xs text-neutral-500 mb-4 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 받은 제안
                </Link>
                <p className="text-sm font-bold text-[#E53935] mb-2">제안 받기 설정</p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">어떤 제안을 받고 싶으세요?</h1>
                <p className="text-sm text-neutral-600 mb-8 break-keep">
                    아래 조건에 맞는 기업만 나에게 면접·인터뷰를 제안할 수 있습니다. 기업에는 조건에 맞는 인원수만 익명으로 보입니다.
                </p>

                {loading ? (
                    <div className="py-16 flex justify-center"><span className="text-sm text-mute">불러오는 중</span></div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-xs p-6 space-y-7">
                        <Field label="희망 직무 (최대 3개)">
                            <ChipPick options={OFFER_JOB_FUNCTIONS} values={s.job_functions} onChange={v => set("job_functions", v)} max={3} />
                        </Field>
                        <Field label="경력 구간">
                            <ChipSingle options={OFFER_CAREER_LEVELS} value={s.career_level} onChange={v => set("career_level", v)} />
                        </Field>
                        <Field label="희망 산업 (선택, 최대 5개)" hint="고르지 않으면 산업 무관으로 봅니다">
                            <ChipPick options={OFFER_INDUSTRIES} values={s.industries} onChange={v => set("industries", v)} max={5} />
                        </Field>
                        <Field label="근무 형태">
                            <ChipSingle options={WORK_MODES} value={s.work_mode} onChange={v => set("work_mode", v)} />
                        </Field>
                        <Field label="지역" hint="고르지 않으면 지역 무관으로 봅니다">
                            <ChipPick options={LOCATIONS} values={s.locations} onChange={v => set("locations", v)} />
                        </Field>

                        {(!hasResume || !hasHitA) && (
                            <div className="text-xs text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xs p-3 space-y-1">
                                {!hasResume && <p>• 제안에 응하려면 이력서가 있어야 합니다. <Link href="/hero/resume/workspace" className="underline font-bold">이력서 쓰기</Link></p>}
                                {!hasHitA && <p>• 기본 성향 검사를 마친 인재만 찾는 기업도 있습니다 (검사 결과는 보이지 않습니다). <Link href="/hero/hit" className="underline font-bold">검사 받기</Link></p>}
                            </div>
                        )}

                        {/* [선택] 성향 통계 — 개인 HIT 결과는 나만 본다. 기업엔 묶음 통계만, 동의한 경우에만 */}
                        <div className="border border-neutral-200 rounded-xs p-4 text-xs text-neutral-600 space-y-2">
                            <label className="flex items-start gap-2 text-sm text-neutral-900 cursor-pointer">
                                <input type="checkbox" className="mt-0.5" checked={s.share_traits}
                                    onChange={e => { set("share_traits", e.target.checked); if (!e.target.checked) setTraitsConsent(false); }} />
                                <span><b>[선택]</b> 내 성향을 익명 통계에 포함하기</span>
                            </label>
                            <p>HIT 검사 결과는 나만 봅니다. 켜면 &lsquo;기업이 원하는 성향의 인재가 HeRo에 어느 정도 있는지&rsquo;를 보여 주는 묶음 통계에만 들어갑니다.</p>
                            {s.share_traits && !traitsSaved && (
                                <div className="pt-2 space-y-1">
                                    <p>• 목적: {TRAITS_CONSENT.purpose}</p>
                                    <p>• 항목: {TRAITS_CONSENT.items}</p>
                                    <p>• 보유 기간: {TRAITS_CONSENT.retention}</p>
                                    <p className="text-neutral-500">{TRAITS_CONSENT.note}</p>
                                    <label className="flex items-center gap-2 pt-1 text-sm text-neutral-900 cursor-pointer">
                                        <input type="checkbox" checked={traitsConsent} onChange={e => setTraitsConsent(e.target.checked)} />
                                        위 내용에 동의합니다
                                    </label>
                                </div>
                            )}
                        </div>

                        {needConsent && (
                            <div className="border border-neutral-200 rounded-xs p-4 text-xs text-neutral-600 space-y-2">
                                <p className="font-bold text-neutral-900 text-sm">개인정보 수집·이용 동의 (필수)</p>
                                <p>• 목적: {SETTINGS_CONSENT.purpose}</p>
                                <p>• 항목: {SETTINGS_CONSENT.items}</p>
                                <p>• 보유 기간: {SETTINGS_CONSENT.retention}</p>
                                <p className="text-neutral-500">{SETTINGS_CONSENT.note}</p>
                                <label className="flex items-center gap-2 pt-1 text-sm text-neutral-900 cursor-pointer">
                                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                                    위 내용에 동의합니다
                                </label>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button onClick={() => save(true)} disabled={saving || (needConsent && !consent) || (s.share_traits && !traitsSaved && !traitsConsent)}
                                className="px-6 py-3 rounded-none bg-[#E53935] text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                {saving ? "저장 중..." : s.is_open ? "저장" : "제안 받기 켜기"}
                            </button>
                            {s.is_open && (
                                <button onClick={() => save(false)} disabled={saving}
                                    className="px-6 py-3 rounded-none border border-neutral-300 text-neutral-700 text-sm font-bold hover:border-neutral-500 transition-colors">
                                    제안 받기 끄기
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
