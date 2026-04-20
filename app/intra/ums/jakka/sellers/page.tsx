"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Check, X, Clock, AlertCircle, ExternalLink, Store } from "lucide-react";

interface SellerApp {
    id: string;
    creator_id: string;
    intro: string;
    primary_category: string;
    portfolio_urls: string[];
    sample_image_urls: string[];
    seller_type: string;
    business_name: string | null;
    business_number: string | null;
    tax_invoice_email: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_holder: string | null;
    status: string;
    reviewer_note: string | null;
    reviewed_at: string | null;
    created_at: string;
    creator: {
        id: string;
        handle: string;
        display_name: string;
        email: string;
        seller_status: string;
    } | null;
}

export default function IntraJakkaSellersPage() {
    const { user } = useAuth();
    const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");
    const [apps, setApps] = useState<SellerApp[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<SellerApp | null>(null);
    const [note, setNote] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const r = await fetch(`/api/intra/jakka/sellers?status=${tab}`);
        const j = await r.json();
        setApps(j.applications ?? []);
        setLoading(false);
    }, [tab]);

    useEffect(() => { load(); }, [load]);

    async function handleReview(action: "approve" | "reject") {
        if (!selected || !user?.id) return;
        if (action === "reject" && !note.trim()) { alert("반려 사유를 입력해주세요."); return; }
        setSubmitting(true);
        const r = await fetch("/api/intra/jakka/sellers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                applicationId: selected.id,
                action,
                note: note.trim() || undefined,
                reviewerId: user.id,
            }),
        });
        setSubmitting(false);
        if (r.ok) {
            setSelected(null);
            setNote("");
            await load();
        } else {
            const j = await r.json().catch(() => ({}));
            alert(`처리 실패: ${j.error ?? r.statusText}`);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-2 mb-2">
                    <Store className="w-5 h-5 text-neutral-900" />
                    <h1 className="text-[20px] font-black text-neutral-900">Jakka 마켓 판매자 심사</h1>
                </div>
                <p className="text-[12px] text-neutral-600 mb-6">입점 신청 접수·승인·반려 관리</p>

                {/* 탭 */}
                <div className="flex gap-1 mb-4 border-b border-neutral-200">
                    {(["pending", "approved", "rejected"] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`text-[12px] font-bold px-4 py-2.5 border-b-2 -mb-px transition-colors ${
                                tab === t
                                    ? "border-neutral-900 text-neutral-900"
                                    : "border-transparent text-neutral-500 hover:text-neutral-700"
                            }`}
                        >
                            {t === "pending" && "심사 대기"}
                            {t === "approved" && "승인"}
                            {t === "rejected" && "반려"}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12 text-[12px] text-neutral-500">로딩 중…</div>
                ) : apps.length === 0 ? (
                    <div className="text-center py-12 text-[12px] text-neutral-500">
                        {tab === "pending" ? "심사 대기 중인 신청이 없습니다." : `${tab === "approved" ? "승인" : "반려"}된 신청이 없습니다.`}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {apps.map((app) => (
                            <button
                                key={app.id}
                                onClick={() => { setSelected(app); setNote(""); }}
                                className="text-left border border-neutral-200 bg-white p-4 hover:border-neutral-900 transition-colors"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-[11px] font-bold text-neutral-700">
                                        {app.creator?.display_name?.charAt(0) ?? "?"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-neutral-900 truncate">{app.creator?.display_name}</p>
                                        <p className="text-[11px] font-mono text-neutral-500 truncate">{app.creator?.handle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 mb-2 text-[11px]">
                                    <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700">{app.primary_category}</span>
                                    <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700">
                                        {app.seller_type === "business" ? "사업자" : "개인"}
                                    </span>
                                </div>
                                <p className="text-[12px] text-neutral-700 line-clamp-2 mb-2">{app.intro}</p>
                                <p className="text-[10px] text-neutral-500">
                                    신청 {app.created_at.substring(0, 10)}
                                    {app.reviewed_at && ` · 검토 ${app.reviewed_at.substring(0, 10)}`}
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                {/* 상세 모달 */}
                {selected && (
                    <div className="fixed inset-0 z-50 bg-black/50 flex items-start md:items-center justify-center overflow-y-auto p-4">
                        <div className="relative w-full max-w-2xl bg-white">
                            <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-3 border-b border-neutral-200">
                                <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em]">입점 신청 상세</p>
                                <button onClick={() => setSelected(null)} className="text-neutral-500 hover:text-neutral-900">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="px-5 py-4 space-y-5">
                                {/* 작가 */}
                                <div className="flex items-center gap-3 pb-3 border-b border-neutral-100">
                                    <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-[16px] font-bold text-neutral-700">
                                        {selected.creator?.display_name?.charAt(0) ?? "?"}
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-bold text-neutral-900">{selected.creator?.display_name}</p>
                                        <p className="text-[12px] font-mono text-neutral-500">{selected.creator?.handle}</p>
                                        <p className="text-[11px] text-neutral-500">{selected.creator?.email}</p>
                                    </div>
                                    <a
                                        href={`/jakka/${selected.creator?.handle?.replace("@", "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-auto text-[11px] text-neutral-700 hover:text-neutral-900 inline-flex items-center gap-1"
                                    >
                                        포트폴리오
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>

                                {/* 소개 */}
                                <div>
                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-1.5">작가 소개</p>
                                    <p className="text-[13px] text-neutral-900 whitespace-pre-line">{selected.intro}</p>
                                </div>

                                {/* 카테고리 & 유형 */}
                                <div className="grid grid-cols-2 gap-4 text-[12px]">
                                    <div>
                                        <p className="text-neutral-500 mb-1">주력 카테고리</p>
                                        <p className="text-neutral-900 font-bold">{selected.primary_category}</p>
                                    </div>
                                    <div>
                                        <p className="text-neutral-500 mb-1">회원 유형</p>
                                        <p className="text-neutral-900 font-bold">{selected.seller_type === "business" ? "사업자" : "개인"}</p>
                                    </div>
                                </div>

                                {/* 포트폴리오 */}
                                {selected.portfolio_urls.length > 0 && (
                                    <div>
                                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-1.5">외부 포트폴리오</p>
                                        <ul className="space-y-1">
                                            {selected.portfolio_urls.map((url, i) => (
                                                <li key={i}>
                                                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-neutral-700 hover:text-neutral-900 underline inline-flex items-center gap-1">
                                                        {url}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* 사업자 정보 */}
                                {selected.seller_type === "business" && (
                                    <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-1.5 text-[12px]">
                                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">사업자 정보</p>
                                        <div className="flex justify-between"><span className="text-neutral-500">상호</span><span className="text-neutral-900">{selected.business_name}</span></div>
                                        <div className="flex justify-between"><span className="text-neutral-500">사업자번호</span><span className="text-neutral-900 font-mono">{selected.business_number}</span></div>
                                        <div className="flex justify-between"><span className="text-neutral-500">세금계산서 이메일</span><span className="text-neutral-900">{selected.tax_invoice_email}</span></div>
                                    </div>
                                )}

                                {/* 정산 계좌 */}
                                <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-1.5 text-[12px]">
                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-2">정산 계좌</p>
                                    <div className="flex justify-between"><span className="text-neutral-500">은행</span><span className="text-neutral-900">{selected.bank_name}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-500">계좌번호</span><span className="text-neutral-900 font-mono">{selected.bank_account_number}</span></div>
                                    <div className="flex justify-between"><span className="text-neutral-500">예금주</span><span className="text-neutral-900">{selected.bank_account_holder}</span></div>
                                </div>

                                {/* 이미 검토된 경우 */}
                                {selected.status !== "pending" ? (
                                    <div className={`border-l-4 p-3 ${selected.status === "approved" ? "border-green-600 bg-green-50" : "border-red-600 bg-red-50"}`}>
                                        <p className="text-[11px] font-bold mb-1 flex items-center gap-1">
                                            {selected.status === "approved" ? <><Check className="w-3 h-3 text-green-700" /><span className="text-green-900">승인됨</span></> : <><X className="w-3 h-3 text-red-700" /><span className="text-red-900">반려됨</span></>}
                                            {selected.reviewed_at && <span className="font-normal text-neutral-500 ml-2">{selected.reviewed_at.substring(0, 10)}</span>}
                                        </p>
                                        {selected.reviewer_note && <p className="text-[12px] text-neutral-900 whitespace-pre-line">{selected.reviewer_note}</p>}
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.15em] mb-1.5">
                                                검토 메모 <span className="font-normal">(반려 시 필수)</span>
                                            </p>
                                            <textarea
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                rows={3}
                                                placeholder="승인/반려 사유를 작성하세요. 반려 시 작가에게 노출됩니다."
                                                className="w-full text-[13px] text-neutral-900 border border-neutral-300 px-3 py-2 focus:outline-none focus:border-neutral-900 resize-none"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <button
                                                onClick={() => handleReview("approve")}
                                                disabled={submitting}
                                                className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-bold bg-green-700 text-white py-3 hover:bg-green-800 transition-colors disabled:opacity-50"
                                            >
                                                <Check className="w-4 h-4" />
                                                승인
                                            </button>
                                            <button
                                                onClick={() => handleReview("reject")}
                                                disabled={submitting}
                                                className="flex-1 flex items-center justify-center gap-1.5 text-[13px] font-bold bg-red-700 text-white py-3 hover:bg-red-800 transition-colors disabled:opacity-50"
                                            >
                                                <X className="w-4 h-4" />
                                                반려
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
