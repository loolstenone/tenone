"use client";

/**
 * 인재 — 받은 제안 상세·응답 (2026-10-13)
 * 응하기 = 이력서 선택 + 제3자 제공 동의(제17조, 문안 SSOT lib/hero/offers.ts) · HIT 검사 내용은 기업에 주지 않는다
 */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { LoginRequired } from "@/components/LoginRequired";
import { OFFER_TYPES, RECIPIENT_STATUS_LABEL, labelOf, provisionConsentText } from "@/lib/hero/offers";

const HERO_RED = "#E53935";

interface Detail {
    id: string;
    status: string;
    resume_id: string | null;
    share_hit: boolean;
    responded_at: string | null;
    hero_offers: {
        offer_type: string; title: string; message: string; respond_by: string | null; status: string;
        hero_companies: { company_name: string; industry: string | null; size_category: string | null; employee_count: number | null; founded_year: number | null } | null;
        hero_jd: { position_title: string; summary: string | null; employment_type: string | null; experience_range: string | null } | null;
    };
}

export default function OfferDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { isLoading, isAuthenticated } = useAuth();
    const [item, setItem] = useState<Detail | null>(null);
    const [resumes, setResumes] = useState<{ id: string; title: string | null; is_primary: boolean }[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [resumeId, setResumeId] = useState("");
    const [message, setMessage] = useState("");
    const [consent, setConsent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const res = await fetch(`/api/hero/offers/inbox/${id}`);
        if (!res.ok) { setNotFound(true); setLoading(false); return; }
        const d = await res.json();
        setItem(d.item);
        setResumes(d.resumes ?? []);
        setResumeId((d.resumes ?? []).find((r: { is_primary: boolean }) => r.is_primary)?.id ?? d.resumes?.[0]?.id ?? "");
        setLoading(false);
    }, [id]);

    useEffect(() => { if (isAuthenticated) load(); }, [isAuthenticated, load]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><span className="text-sm text-mute">불러오는 중</span></div>;
    if (!isAuthenticated) return <div className="min-h-screen bg-neutral-50"><LoginRequired accentColor={HERO_RED} /></div>;

    async function respond(action: "accept" | "decline" | "withdraw") {
        setBusy(true);
        setError(null);
        try {
            const res = await fetch(`/api/hero/offers/inbox/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, resumeId, message, consent }),
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

    const o = item?.hero_offers;
    const company = o?.hero_companies;
    const today = new Date().toISOString().slice(0, 10);
    const canRespond = !!item && ["sent", "viewed"].includes(item.status) && o?.status === "sent" && (!o.respond_by || o.respond_by >= today);
    const consentText = provisionConsentText(company?.company_name ?? "기업");

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20">
            <div className="max-w-2xl mx-auto px-6">
                <Link href="/hero/offers" className="inline-flex items-center gap-1 text-xs text-neutral-500 mb-4 hover:text-neutral-700">
                    <ArrowLeft className="h-3.5 w-3.5" /> 받은 제안
                </Link>

                {loading ? (
                    <div className="py-16 flex justify-center"><span className="text-sm text-mute">불러오는 중</span></div>
                ) : notFound || !item || !o ? (
                    <p className="py-16 text-center text-sm text-neutral-500">제안을 찾을 수 없습니다.</p>
                ) : (
                    <div className="space-y-5">
                        <div className="bg-white border border-neutral-200 rounded-xs p-6">
                            <p className="text-sm font-bold text-[#E53935] mb-2">{labelOf(OFFER_TYPES, o.offer_type)}</p>
                            <h1 className="text-2xl font-bold tracking-tight mb-1 break-keep">{o.title}</h1>
                            <p className="text-xs text-neutral-500 mb-5">
                                {RECIPIENT_STATUS_LABEL[item.status]}{o.respond_by && ` · 응답 기한 ${o.respond_by}`}
                            </p>
                            <p className="text-sm text-neutral-700 whitespace-pre-line leading-relaxed">{o.message}</p>
                        </div>

                        <div className="bg-white border border-neutral-200 rounded-xs p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Building2 className="h-5 w-5 text-neutral-400" />
                                <p className="font-bold">{company?.company_name}</p>
                            </div>
                            <p className="text-sm text-neutral-600">
                                {[company?.industry, company?.size_category, company?.employee_count ? `${company.employee_count}명` : null, company?.founded_year ? `${company.founded_year}년 설립` : null].filter(Boolean).join(" · ") || "기업 정보 없음"}
                            </p>
                            {o.hero_jd && (
                                <div className="mt-4 pt-4 border-t border-neutral-100 text-sm">
                                    <p className="font-bold">{o.hero_jd.position_title}</p>
                                    <p className="text-xs text-neutral-500">{[o.hero_jd.employment_type, o.hero_jd.experience_range].filter(Boolean).join(" · ")}</p>
                                    {o.hero_jd.summary && <p className="mt-2 text-neutral-700 whitespace-pre-line">{o.hero_jd.summary}</p>}
                                </div>
                            )}
                        </div>

                        {item.status === "accepted" && (
                            <div className="bg-white border border-neutral-200 rounded-xs p-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="h-5 w-5 text-neutral-600" />
                                    <p className="font-bold">이 제안에 응했습니다</p>
                                </div>
                                <p className="text-sm text-neutral-600 mb-4">{company?.company_name}에서 이력서를 보고 연락드립니다. 철회하면 기업은 더 이상 내 정보를 볼 수 없습니다.</p>
                                <button onClick={() => respond("withdraw")} disabled={busy}
                                    className="px-5 py-2.5 rounded-none border border-neutral-300 text-neutral-700 text-sm font-bold hover:border-neutral-500">
                                    응답 철회
                                </button>
                            </div>
                        )}

                        {canRespond && (
                            <div className="bg-white border border-neutral-200 rounded-xs p-6 space-y-5">
                                <h2 className="font-bold text-lg">응하기</h2>
                                {resumes.length === 0 ? (
                                    <p className="text-sm text-neutral-600">응하려면 이력서가 필요합니다. <Link href="/hero/resume/workspace" className="underline font-bold">이력서 쓰기</Link></p>
                                ) : (
                                    <div>
                                        <p className="text-sm font-bold mb-2">보낼 이력서</p>
                                        <select value={resumeId} onChange={e => setResumeId(e.target.value)}
                                            className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs bg-white">
                                            {resumes.map(r => <option key={r.id} value={r.id}>{r.title || "제목 없는 이력서"}{r.is_primary ? " (대표)" : ""}</option>)}
                                        </select>
                                    </div>
                                )}
                                <p className="text-xs text-neutral-500">HIT 검사 내용은 기업에 보내지 않습니다. 이력서와 연락처만 전달됩니다.</p>
                                <div>
                                    <p className="text-sm font-bold mb-2">한마디 (선택)</p>
                                    <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} maxLength={1000}
                                        placeholder="면접 가능한 시간이나 전하고 싶은 말을 적어 주세요"
                                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-xs" />
                                </div>

                                <div className="border border-neutral-200 rounded-xs p-4 text-xs text-neutral-600 space-y-1.5">
                                    <p className="font-bold text-neutral-900 text-sm">개인정보 제3자 제공 동의 (필수)</p>
                                    <p>• 제공받는 자: {consentText.recipient}</p>
                                    <p>• 목적: {consentText.purpose}</p>
                                    <p>• 항목: {consentText.items.join(", ")}</p>
                                    <p>• 보유 기간: {consentText.retention}</p>
                                    <p className="text-neutral-500">{consentText.note}</p>
                                    <label className="flex items-center gap-2 pt-1 text-sm text-neutral-900 cursor-pointer">
                                        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                                        위 내용에 동의합니다
                                    </label>
                                </div>

                                {error && <p className="text-sm text-red-600">{error}</p>}
                                <div className="flex flex-wrap gap-3">
                                    <button onClick={() => respond("accept")} disabled={busy || !consent || !resumeId}
                                        className="px-6 py-3 rounded-none bg-[#E53935] text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                                        {busy ? "보내는 중..." : "이력서 보내고 응하기"}
                                    </button>
                                    <button onClick={() => respond("decline")} disabled={busy}
                                        className="px-6 py-3 rounded-none border border-neutral-300 text-neutral-700 text-sm font-bold hover:border-neutral-500 transition-colors">
                                        거절
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
