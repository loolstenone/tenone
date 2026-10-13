"use client";

/**
 * 써치 라이트 — 기업이 좋은 사람을 찾는 화면 (2026-10-13, 옛 /hero/company/[id]/talent)
 * ① 인재상 조건 → 조건에 맞고 '제안 받기'를 켠 인원(익명, 5명 미만은 '5명 미만') + 인재 풀 리포트(자동 묶음 통계)
 * ② 제안 작성 → 요청(운영자 검토·결제 확인 후 발송) ③ 보낸 제안 목록
 * ⛔ 개인 HIT 결과는 본인만 (2026-10-13 원칙) — 기업에는 '원하는 성향의 사람이 어느 정도 있나'만 (TraitWishCard)
 * ❌ 가격 문구 · '연결해 드립니다' 표현
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Loader2, ArrowLeft, Users, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import {
    EMPTY_CRITERIA, LOCATIONS, countLabel, OFFER_CAREER_LEVELS, OFFER_INDUSTRIES, OFFER_JOB_FUNCTIONS, OFFER_STATUS_LABEL,
    OFFER_TYPES, WORK_MODES, labelOf, type OfferCriteria,
} from "@/lib/hero/offers";
import { ChipPick, ChipSingle, Field } from "@/features/hero/offers/OfferUI";
import { TalentPoolReport, TraitWishCard, type TalentPoolReportData } from "@/features/hero/report/TalentPoolReport";
import { EMPTY_TRAIT_WISH, type TraitWish } from "@/lib/hero/group-stats";

const HERO_RED = "#E53935";

interface SentOffer {
    id: string; offer_type: string; title: string; status: string; target_count: number;
    respond_by: string | null; review_note: string | null; created_at: string;
    stats: { sent: number; accepted: number };
}

const plusDays = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
};

export default function SearchLightPeoplePage() {
    const { user, isLoading, isAuthenticated } = useAuth();
    const [companies, setCompanies] = useState<{ id: string; name: string }[] | null>(null);
    const [companyId, setCompanyId] = useState("");
    const [report, setReport] = useState<TalentPoolReportData | null>(null);
    const [traits, setTraits] = useState<TraitWish>(EMPTY_TRAIT_WISH);
    const [criteria, setCriteria] = useState<OfferCriteria>(EMPTY_CRITERIA);
    const [count, setCount] = useState<{ label: string; enough: boolean } | null>(null);
    const [counting, setCounting] = useState(false);
    const [jds, setJds] = useState<{ id: string; position_title: string }[]>([]);
    const [offers, setOffers] = useState<SentOffer[]>([]);
    const [forbidden, setForbidden] = useState(false);
    const [form, setForm] = useState({ offerType: "interview", title: "", message: "", respondBy: plusDays(14), jdId: "" });
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 내가 담당하는 기업 (활성) — 여러 곳이면 고른다
    useEffect(() => {
        if (!isAuthenticated) return;
        fetch("/api/hero/company/mine").then(r => r.json()).then(d => {
            const list = (d.companies ?? []) as { id: string; name: string }[];
            setCompanies(list);
            const q = new URLSearchParams(window.location.search).get("company");
            setCompanyId(list.find(c => c.id === q)?.id ?? list[0]?.id ?? "");
        }).catch(() => setCompanies([]));
    }, [isAuthenticated]);

    const loadOffers = useCallback(async () => {
        if (!companyId) return;
        const res = await fetch(`/api/hero/offers?companyId=${companyId}`);
        if (res.status === 403) { setForbidden(true); return; }
        const d = await res.json();
        setOffers(d.items ?? []);
    }, [companyId]);

    useEffect(() => {
        if (!user?.id || !companyId) return;
        loadOffers();
        fetch(`/api/hero/jd?companyId=${companyId}&memberId=${user.id}`).then(r => r.json())
            .then(d => setJds((d.jds ?? []).map((j: { id: string; position_title: string }) => ({ id: j.id, position_title: j.position_title }))))
            .catch(() => undefined);
    }, [user?.id, companyId, loadOffers]);

    // 조건이 바뀌면 0.4초 뒤 인원 다시 세기
    useEffect(() => {
        if (!isAuthenticated || !companyId) return;
        if (timer.current) clearTimeout(timer.current);
        if (criteria.job_functions.length === 0) { setCount(null); setReport(null); return; }
        timer.current = setTimeout(async () => {
            setCounting(true);
            try {
                const res = await fetch("/api/hero/talent-pool", {
                    method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ companyId, criteria, traits }),
                });
                const d = await res.json();
                if (res.status === 403) setForbidden(true);
                else { setCount({ label: d.label, enough: !!d.enough }); setReport(d.report ?? null); }
            } finally {
                setCounting(false);
            }
        }, 400);
        return () => { if (timer.current) clearTimeout(timer.current); };
    }, [criteria, traits, companyId, isAuthenticated]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor={HERO_RED} /></div>;
    if (companies === null) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (forbidden || companies.length === 0) return (
        <div className="min-h-screen pt-32 px-6 text-center">
            <p className="text-sm text-neutral-600 mb-4">기업 회원으로 등록하면 원하는 인재상을 찾을 수 있습니다.</p>
            <Link href="/hero/company/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#E53935] text-white text-sm font-bold hover:bg-red-700">기업 등록하기 <ArrowRight className="h-4 w-4" /></Link>
        </div>
    );

    const set = <K extends keyof OfferCriteria>(k: K, v: OfferCriteria[K]) => { setCriteria(c => ({ ...c, [k]: v })); setDone(false); };

    async function submit() {
        setSending(true);
        setError(null);
        try {
            const res = await fetch("/api/hero/offers", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ companyId, criteria, ...form, jdId: form.jdId || undefined }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "요청하지 못했습니다.");
            setDone(true);
            setForm(f => ({ ...f, title: "", message: "" }));
            await loadOffers();
        } catch (e) {
            setError(e instanceof Error ? e.message : "요청하지 못했습니다.");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6 space-y-6">
                <Link href="/hero/search-light" className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 써치 라이트
                </Link>
                <div>
                    <p className="text-sm font-bold text-[#E53935] mb-2">써치 라이트 · 기업</p>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">좋은 사람을 찾습니다</h1>
                    <p className="text-sm text-neutral-600 break-keep">
                        원하는 인재상을 고르면 조건에 맞는 HeRo 인재가 몇 명인지, 원하는 성향의 사람이 어느 정도 있는지 바로 보여 드립니다.
                        개인의 검사 결과는 본인만 보며, 이름·연락처는 인재가 제안에 응할 때만 이력서와 함께 전달됩니다.
                    </p>
                </div>

                {companies.length > 1 && (
                    <select value={companyId} onChange={e => { setCompanyId(e.target.value); setOffers([]); }}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white">
                        {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                )}

                {/* ① 조건 */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-7">
                    <Field label="직무 (필수)">
                        <ChipPick options={OFFER_JOB_FUNCTIONS} values={criteria.job_functions} onChange={v => set("job_functions", v)} />
                    </Field>
                    <Field label="경력 구간" hint="고르지 않으면 전체">
                        <ChipPick options={OFFER_CAREER_LEVELS} values={criteria.career_levels} onChange={v => set("career_levels", v)} />
                    </Field>
                    <Field label="산업 경험·관심" hint="고르지 않으면 전체 (산업을 정하지 않은 인재도 포함)">
                        <ChipPick options={OFFER_INDUSTRIES} values={criteria.industries} onChange={v => set("industries", v)} />
                    </Field>
                    <Field label="근무 형태">
                        <ChipSingle options={WORK_MODES} value={criteria.work_mode} onChange={v => set("work_mode", v)} />
                    </Field>
                    <Field label="근무 지역" hint="고르지 않으면 전체">
                        <ChipPick options={LOCATIONS.filter(l => l.v !== "any")} values={criteria.locations} onChange={v => set("locations", v)} />
                    </Field>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={criteria.require_hit_a} onChange={e => set("require_hit_a", e.target.checked)} />
                        기본 성향 검사(HIT)를 마친 인재만
                    </label>
                </div>

                {/* 인원 */}
                <div className="bg-white border border-neutral-200 rounded-xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-neutral-500" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500">조건에 맞는 인재</p>
                        <p className="text-2xl font-extrabold tracking-tight">
                            {counting ? <Loader2 className="h-5 w-5 animate-spin text-neutral-300" /> : count ? count.label : "직무를 골라 주세요"}
                        </p>
                    </div>
                </div>

                {/* 인재 풀 리포트 — 자동 묶음 통계 */}
                {report && <TalentPoolReport report={report} />}
                {report && <TraitWishCard value={traits} onChange={setTraits} result={report.traits} />}

                {/* ② 제안 작성 */}
                <div className={clsx("bg-white border border-neutral-200 rounded-xl p-6 space-y-5", !count?.enough && "opacity-60")}>
                    <h2 className="font-bold text-lg">이 인재들에게 제안하기</h2>
                    <Field label="제안 종류">
                        <ChipSingle options={OFFER_TYPES} value={form.offerType} onChange={v => setForm(f => ({ ...f, offerType: v || "interview" }))} />
                    </Field>
                    {jds.length > 0 && (
                        <Field label="연결할 채용 공고 (선택)">
                            <select value={form.jdId} onChange={e => setForm(f => ({ ...f, jdId: e.target.value }))}
                                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white">
                                <option value="">선택 안 함</option>
                                {jds.map(j => <option key={j.id} value={j.id}>{j.position_title}</option>)}
                            </select>
                        </Field>
                    )}
                    <Field label="제목">
                        <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={100}
                            placeholder="예: 브랜드 마케터 1차 면접 제안" className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" />
                    </Field>
                    <Field label="제안 내용 (30자 이상)" hint="맡을 일, 왜 이 조건의 인재를 찾는지, 면접 방식과 일정을 적어 주세요">
                        <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={6} maxLength={2000}
                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" />
                    </Field>
                    <Field label="응답 기한">
                        <input type="date" value={form.respondBy} min={plusDays(3)} onChange={e => setForm(f => ({ ...f, respondBy: e.target.value }))}
                            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg" />
                    </Field>
                    <p className="text-xs text-neutral-500 break-keep">
                        보내기 전에 HeRo 운영자가 내용을 확인합니다. 확인이 끝나면 조건에 맞는 인재에게 알림이 가고, 응한 인재의 이력서는 응답일로부터 180일 동안 볼 수 있습니다.
                    </p>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    {done && <p className="text-sm text-emerald-700">제안을 요청했습니다. 운영자 확인 후 발송됩니다.</p>}
                    <button onClick={submit} disabled={sending || !count?.enough || !form.title.trim() || form.message.trim().length < 30}
                        className="px-6 py-3 rounded-full bg-[#E53935] text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {sending ? "요청 중..." : "제안 요청하기"}
                    </button>
                </div>

                {/* ③ 보낸 제안 */}
                <div>
                    <h2 className="text-lg font-extrabold tracking-tight mb-3">보낸 제안</h2>
                    {offers.length === 0 ? (
                        <p className="text-sm text-neutral-500 py-8 text-center border border-dashed border-neutral-200 rounded-xl bg-white">아직 보낸 제안이 없습니다.</p>
                    ) : (
                        <ul className="space-y-3">
                            {offers.map(o => (
                                <li key={o.id}>
                                    <Link href={`/hero/company/offers/${o.id}`}
                                        className="flex items-center justify-between gap-4 p-5 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-shadow">
                                        <div className="min-w-0">
                                            <p className="text-xs text-neutral-500">{labelOf(OFFER_TYPES, o.offer_type)} · {OFFER_STATUS_LABEL[o.status] ?? o.status}{o.respond_by && ` · ${o.respond_by}까지`}</p>
                                            <p className="font-semibold truncate">{o.title}</p>
                                            {o.status === "rejected" && o.review_note && <p className="text-xs text-red-600 mt-1">반려 사유: {o.review_note}</p>}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xs text-neutral-500">{o.status === "sent" || o.status === "closed" ? `${countLabel(o.stats.sent)}에게 보냄` : `대상 ${countLabel(o.target_count)}`}</p>
                                            <p className="text-sm font-bold">응답 {o.stats.accepted}명</p>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-neutral-400 shrink-0" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
