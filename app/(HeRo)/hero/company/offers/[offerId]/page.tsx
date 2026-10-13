"use client";

/**
 * 기업 — 보낸 제안 상세 (2026-10-13)
 * 응한 인재만 이름·연락처·이력서·(동의 시) HIT 요약. 열람 기한(응답일 + 180일)이 지나면 비공개 (채용절차법)
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft, Mail, Phone, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { COMPANY_STATUS, OFFER_STATUS_LABEL, OFFER_TYPES, countLabel, labelOf } from "@/lib/hero/offers";
import { ResumeReadView } from "@/features/hero/offers/OfferUI";
import type { ResumeContent } from "@/types/resume";

const HERO_RED = "#E53935";

interface Applicant {
    id: string; expired: boolean;
    name?: string | null; email?: string | null; phone?: string | null; message?: string | null;
    respondedAt: string | null; destroyDue?: string | null;
    companyStatus: string; companyNote: string | null;
    resume?: { title: string | null; content: ResumeContent | null } | null;
    hit?: { typeCode: string | null; typeName: string | null; characterName: string | null; strengths: string[]; interest: string | null } | null;
}

interface OfferDetail {
    offer: {
        id: string; company_id: string; offer_type: string; title: string; message: string; status: string;
        respond_by: string | null; review_note: string | null; created_at: string; sent_at: string | null;
        hero_companies: { company_name: string } | null; hero_jd: { position_title: string } | null;
    };
    stats: { sent: number; viewed: number; accepted: number; declined: number };
    applicants: Applicant[];
}

export default function CompanyOfferDetailPage() {
    const { offerId } = useParams<{ offerId: string }>();
    const { isLoading, isAuthenticated } = useAuth();
    const [d, setD] = useState<OfferDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const res = await fetch(`/api/hero/offers/${offerId}`);
        setD(res.ok ? await res.json() : null);
        setLoading(false);
    }, [offerId]);

    useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-neutral-300" /></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor={HERO_RED} /></div>;

    async function patch(body: Record<string, unknown>) {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/api/hero/offers/${offerId}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
            });
            const r = await res.json();
            if (!res.ok) throw new Error(r.error || "저장하지 못했습니다.");
            await load();
        } catch (e) {
            setError(e instanceof Error ? e.message : "저장하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }

    const o = d?.offer;

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6 space-y-5">
                <Link href={o ? `/hero/company/${o.company_id}/talent` : "/hero/company"} className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 인재 찾기
                </Link>

                {loading ? (
                    <div className="py-16 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-neutral-300" /></div>
                ) : !d || !o ? (
                    <p className="py-16 text-center text-sm text-neutral-500">제안을 찾을 수 없습니다.</p>
                ) : (
                    <>
                        <div className="bg-white border border-neutral-200 rounded-xl p-6">
                            <p className="text-sm font-bold text-[#E53935] mb-2">{labelOf(OFFER_TYPES, o.offer_type)} · {OFFER_STATUS_LABEL[o.status] ?? o.status}</p>
                            <h1 className="text-2xl font-extrabold tracking-tight mb-1 break-keep">{o.title}</h1>
                            <p className="text-xs text-neutral-500 mb-4">
                                {o.hero_companies?.company_name}{o.hero_jd && ` · ${o.hero_jd.position_title}`}{o.respond_by && ` · 응답 기한 ${o.respond_by}`}
                            </p>
                            <p className="text-sm text-neutral-700 whitespace-pre-line">{o.message}</p>
                            {o.status === "rejected" && o.review_note && <p className="mt-4 text-sm text-red-600">반려 사유: {o.review_note}</p>}
                            {o.status === "requested" && <p className="mt-4 text-sm text-neutral-500">HeRo 운영자가 확인하고 있습니다.</p>}
                            <div className="mt-5 flex gap-3">
                                {o.status === "requested" && (
                                    <button onClick={() => patch({ action: "cancel" })} disabled={busy}
                                        className="px-5 py-2.5 rounded-full border border-neutral-300 text-sm font-semibold hover:border-neutral-500">요청 취소</button>
                                )}
                                {o.status === "sent" && (
                                    <button onClick={() => patch({ action: "close" })} disabled={busy}
                                        className="px-5 py-2.5 rounded-full border border-neutral-300 text-sm font-semibold hover:border-neutral-500">제안 마감</button>
                                )}
                            </div>
                        </div>

                        {(o.status === "sent" || o.status === "closed") && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { l: "보냄", v: countLabel(d.stats.sent) },
                                    { l: "확인", v: countLabel(d.stats.viewed) },
                                    { l: "응함", v: `${d.stats.accepted}명` },
                                    { l: "거절", v: countLabel(d.stats.declined) },
                                ].map(s => (
                                    <div key={s.l} className="bg-white border border-neutral-200 rounded-xl p-4">
                                        <p className="text-xs text-neutral-500">{s.l}</p>
                                        <p className="text-lg font-extrabold">{s.v}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        {d.applicants.length > 0 && (
                            <section className="space-y-3">
                                <h2 className="text-lg font-extrabold tracking-tight">응한 인재</h2>
                                {d.applicants.map(a => <ApplicantCard key={a.id} a={a} busy={busy} onPatch={patch} />)}
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function ApplicantCard({ a, busy, onPatch }: { a: Applicant; busy: boolean; onPatch: (b: Record<string, unknown>) => void }) {
    const [note, setNote] = useState(a.companyNote ?? "");
    if (a.expired) {
        return (
            <div className="bg-white border border-neutral-200 rounded-xl p-5 text-sm text-neutral-500">
                열람 기한이 지나 지원자 정보를 볼 수 없습니다 (응답일 {a.respondedAt?.slice(0, 10)})
            </div>
        );
    }
    return (
        <details className="group bg-white border border-neutral-200 rounded-xl">
            <summary className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none">
                <div className="min-w-0">
                    <p className="font-bold">{a.name ?? "이름 없음"}</p>
                    <p className="text-xs text-neutral-500 truncate">
                        {a.resume?.content?.headline ?? a.resume?.title ?? "이력서"} · 응답 {a.respondedAt?.slice(0, 10)}
                    </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">{labelOf(COMPANY_STATUS, a.companyStatus)}</span>
                    <ChevronDown className="h-4 w-4 text-neutral-400 transition-transform group-open:rotate-180" />
                </div>
            </summary>
            <div className="px-5 pb-5 space-y-5 border-t border-neutral-100 pt-5">
                <div className="flex flex-wrap gap-4 text-sm">
                    {a.email && <a href={`mailto:${a.email}`} className="inline-flex items-center gap-1.5 underline"><Mail className="h-4 w-4 text-neutral-400" />{a.email}</a>}
                    {a.phone && <span className="inline-flex items-center gap-1.5"><Phone className="h-4 w-4 text-neutral-400" />{a.phone}</span>}
                </div>
                {a.message && <p className="text-sm bg-neutral-50 rounded-lg p-3 whitespace-pre-line">{a.message}</p>}
                {a.hit && (
                    <div className="border border-neutral-200 rounded-lg p-4 text-sm">
                        <p className="text-xs font-bold text-neutral-500 mb-1">기본 성향 검사 요약</p>
                        <p className="font-semibold">{a.hit.typeCode} {a.hit.typeName}</p>
                        {a.hit.strengths.length > 0 && (
                            <ul className="mt-2 space-y-1 text-neutral-600 list-disc pl-4">
                                {a.hit.strengths.map(s => <li key={s}>{s}</li>)}
                            </ul>
                        )}
                        {a.hit.interest && <p className="text-neutral-600">흥미 유형: {a.hit.interest}</p>}
                    </div>
                )}
                <ResumeReadView title={a.resume?.title} content={a.resume?.content ?? null} />
                <div className="border-t border-neutral-100 pt-4 space-y-3">
                    <p className="text-xs font-bold text-neutral-500">진행 상태 (기업 내부용 — 인재에게 보이지 않음)</p>
                    <div className="flex flex-wrap gap-2">
                        {COMPANY_STATUS.map(s => (
                            <button key={s.v} disabled={busy} onClick={() => onPatch({ recipientId: a.id, companyStatus: s.v })}
                                className={a.companyStatus === s.v
                                    ? "px-3 py-1.5 rounded-full text-sm bg-red-50 border border-[#E53935] text-[#E53935] font-semibold"
                                    : "px-3 py-1.5 rounded-full text-sm border border-neutral-200 hover:border-neutral-400"}>
                                {s.l}
                            </button>
                        ))}
                    </div>
                    <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={1000} placeholder="메모"
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg" />
                    <button disabled={busy} onClick={() => onPatch({ recipientId: a.id, companyNote: note })}
                        className="px-4 py-2 rounded-full border border-neutral-300 text-sm font-semibold hover:border-neutral-500">메모 저장</button>
                    {a.destroyDue && <p className="text-xs text-neutral-500">이 지원자 정보는 {a.destroyDue}까지 볼 수 있습니다.</p>}
                </div>
            </div>
        </details>
    );
}
