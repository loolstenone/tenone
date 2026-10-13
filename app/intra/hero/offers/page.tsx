"use client";

/**
 * 인트라 — HeRo 인재 제안 검토 (2026-10-13)
 * 기업이 요청한 제안을 확인 → 결제 확인 후 발송 / 반려(사유는 기업에 보임)
 * 발송은 HERO_OFFERS_LIVE=true 일 때만 (유료직업소개사업 등록·통신판매업 신고 후)
 */
import { useCallback, useEffect, useState } from "react";
import { adminTitle } from "@/lib/brand-site-menus";
import { OFFER_STATUS_LABEL, OFFER_TYPES, labelOf, LOCATIONS, WORK_MODES, type OfferCriteria } from "@/lib/hero/offers";

interface Offer {
    id: string; offer_type: string; title: string; message: string; status: string; target_count: number;
    criteria: OfferCriteria; respond_by: string | null; review_note: string | null; created_at: string; sent_at: string | null;
    hero_companies: { company_name: string; industry: string | null; size_category: string | null } | null;
    hero_jd: { position_title: string } | null;
}

const FILTERS = ["requested", "sent", "rejected", "closed", "canceled", "all"] as const;

export default function IntraHeroOffersPage() {
    const [items, setItems] = useState<Offer[]>([]);
    const [live, setLive] = useState(false);
    const [filter, setFilter] = useState<(typeof FILTERS)[number]>("requested");
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [paid, setPaid] = useState(false);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/intra/hero/offers?status=${filter}`);
        const d = await res.json();
        setItems(d.items ?? []);
        setLive(!!d.live);
        setLoading(false);
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    async function act(id: string, action: "approve" | "reject") {
        setBusy(true);
        setMsg(null);
        try {
            const res = await fetch(`/api/intra/hero/offers/${id}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, note, paid }),
            });
            const d = await res.json();
            if (!res.ok) throw new Error(d.error || "처리하지 못했습니다.");
            setMsg(action === "approve" ? `${d.sent}명에게 발송했습니다.` : "반려했습니다.");
            setOpenId(null);
            setNote("");
            setPaid(false);
            await load();
        } catch (e) {
            setMsg(e instanceof Error ? e.message : "처리하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }

    const criteriaText = (c: OfferCriteria) => [
        c.job_functions?.join("·"),
        c.career_levels?.length ? c.career_levels.join("·") : null,
        c.industries?.length ? c.industries.join("·") : null,
        c.work_mode ? labelOf(WORK_MODES, c.work_mode) : null,
        c.locations?.length ? c.locations.map(l => labelOf(LOCATIONS, l)).join("·") : null,
        c.require_hit_a ? "HIT 완료자" : null,
    ].filter(Boolean).join(" / ");

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">{adminTitle("/intra/hero/offers", "인재 찾기")} — 제안 검토</h1>
                <p className="text-neutral-400 text-sm mt-1">기업이 요청한 면접·인터뷰 제안을 확인하고 발송합니다. 제안 내용이 채용 목적에 맞는지, 차별·허위 내용이 없는지 확인하세요.</p>
            </div>

            <div className={`rounded-lg p-4 text-sm border ${live ? "border-emerald-700 bg-emerald-950/40 text-emerald-300" : "border-amber-700 bg-amber-950/40 text-amber-300"}`}>
                {live
                    ? "발송 켜짐 — 승인하면 조건에 맞는 인재에게 바로 알림이 갑니다."
                    : "발송 꺼짐 — 유료직업소개사업 등록·통신판매업 신고 후 Vercel 환경변수 HERO_OFFERS_LIVE=true로 켭니다. 지금은 반려만 할 수 있습니다."}
            </div>

            <div className="flex gap-2 flex-wrap">
                {FILTERS.map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === f ? "bg-white text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}>
                        {f === "all" ? "전체" : OFFER_STATUS_LABEL[f]}
                    </button>
                ))}
            </div>

            {msg && <p className="text-sm text-neutral-300">{msg}</p>}

            {loading ? (
                <div className="text-neutral-500 text-sm py-12 text-center">불러오는 중...</div>
            ) : items.length === 0 ? (
                <div className="text-neutral-500 text-sm py-12 text-center">제안이 없습니다.</div>
            ) : (
                <div className="space-y-2">
                    {items.map(o => (
                        <div key={o.id} className="bg-neutral-900 border border-neutral-800 rounded-lg">
                            <button onClick={() => setOpenId(openId === o.id ? null : o.id)} className="w-full text-left p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-xs text-neutral-500">
                                            {o.hero_companies?.company_name} · {labelOf(OFFER_TYPES, o.offer_type)} · {OFFER_STATUS_LABEL[o.status] ?? o.status}
                                        </p>
                                        <p className="font-medium text-white truncate">{o.title}</p>
                                    </div>
                                    <div className="text-right text-xs text-neutral-400 shrink-0">
                                        <p>대상 {o.target_count}명</p>
                                        <p>{new Date(o.created_at).toLocaleDateString("ko-KR")}</p>
                                    </div>
                                </div>
                            </button>
                            {openId === o.id && (
                                <div className="px-4 pb-4 space-y-4 border-t border-neutral-800 pt-4 text-sm">
                                    <p className="text-neutral-400">조건: <span className="text-neutral-200">{criteriaText(o.criteria)}</span></p>
                                    {o.hero_jd && <p className="text-neutral-400">채용 공고: <span className="text-neutral-200">{o.hero_jd.position_title}</span></p>}
                                    <p className="text-neutral-400">응답 기한: <span className="text-neutral-200">{o.respond_by ?? "-"}</span></p>
                                    <p className="whitespace-pre-line text-neutral-200 bg-neutral-950 rounded p-3">{o.message}</p>
                                    {o.review_note && <p className="text-neutral-400">검토 메모: <span className="text-neutral-200">{o.review_note}</span></p>}
                                    {o.status === "requested" && (
                                        <div className="space-y-3">
                                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                                                placeholder="반려 사유 (기업에 보입니다) / 승인 메모"
                                                className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white text-sm" />
                                            <label className="flex items-center gap-2 text-neutral-300">
                                                <input type="checkbox" checked={paid} onChange={e => setPaid(e.target.checked)} />
                                                결제를 확인했습니다
                                            </label>
                                            <div className="flex gap-2">
                                                <button onClick={() => act(o.id, "approve")} disabled={busy || !live || !paid}
                                                    className="px-4 py-2 bg-[#E53935] text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-40">
                                                    발송
                                                </button>
                                                <button onClick={() => act(o.id, "reject")} disabled={busy || !note.trim()}
                                                    className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded text-sm hover:bg-neutral-700 disabled:opacity-40">
                                                    반려
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
