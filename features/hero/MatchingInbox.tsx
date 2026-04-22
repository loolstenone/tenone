"use client";

/**
 * 매칭 인박스 컴포넌트 — 기업/인재 공용
 * - side='talent': 내 매칭 (기업명 공개 · for_talent 서술)
 * - side='company': 기업 매칭 (인재 익명 ID · for_company 서술)
 *
 * 비공개 원칙: 점수·순위·벡터 노출 금지
 */

import { useEffect, useState } from "react";
import { Sparkles, Loader2, Building2, User, AlertTriangle, ChevronRight, Handshake, X as XIcon } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
    proposed: "검토 중",
    curated: "새 매칭",
    contacted: "연락 진행",
    interviewing: "면접 중",
    trial: "트라이얼",
    hired: "성사",
    declined: "거절",
    withdrawn: "철회",
};

const STATUS_COLOR: Record<string, string> = {
    proposed: "bg-neutral-100 text-neutral-500",
    curated: "bg-rose-50 text-rose-700 border border-rose-200",
    contacted: "bg-indigo-50 text-indigo-700",
    interviewing: "bg-violet-50 text-violet-700",
    trial: "bg-amber-50 text-amber-700",
    hired: "bg-emerald-50 text-emerald-700",
    declined: "bg-neutral-50 text-neutral-400",
    withdrawn: "bg-neutral-50 text-neutral-400",
};

interface InboxItem {
    id: string;
    status: string;
    statusChangedAt: string | null;
    createdAt: string;
    curation: string | null;
    signalNotes: string[];
    companyName?: string | null;
    industry?: string | null;
    talentAnonymousId?: string;
}

export default function MatchingInbox({
    side,
    memberId,
    companyId,
    accentColor = "#E53935",
}: {
    side: "talent" | "company";
    memberId: string;
    companyId?: string;
    accentColor?: string;
}) {
    const [items, setItems] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<InboxItem | null>(null);
    const [acting, setActing] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        const qs = new URLSearchParams({ side, memberId });
        if (companyId) qs.set("companyId", companyId);
        try {
            const res = await fetch(`/api/hero/matching/inbox?${qs.toString()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setItems(data.items ?? []);
        } catch {
            setItems([]);
        }
        setLoading(false);
    }

    useEffect(() => { if (memberId) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [memberId, companyId, side]);

    async function react(id: string, action: "interested" | "pass") {
        setActing(id);
        try {
            const next = action === "interested" ? "contacted" : "declined";
            const res = await fetch(`/api/hero/matching/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: next }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            setSelected(null);
            await load();
        } catch (e) {
            alert(e instanceof Error ? e.message : "처리 실패");
        } finally {
            setActing(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-xs text-neutral-400 py-4">
                <Loader2 className="h-4 w-4 animate-spin" /> 매칭 확인 중...
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="border border-dashed border-neutral-300 rounded-lg p-6 text-center">
                <Sparkles className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">
                    아직 도착한 매칭이 없습니다
                </p>
                <p className="text-[11px] text-neutral-400 mt-1">
                    {side === "talent"
                        ? "JH · HIT를 완성하면 매칭 풀에 진입합니다"
                        : "TIH · JD 발행 후 HeRo가 조용히 매칭을 찾습니다"}
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                {items.map(it => {
                    const st = STATUS_COLOR[it.status] ?? STATUS_COLOR.proposed;
                    const primaryLabel = side === "talent"
                        ? (it.companyName || "기업 정보 준비 중")
                        : `영웅 #${it.talentAnonymousId}`;
                    const subLabel = side === "talent"
                        ? (it.industry || "-")
                        : "HeRo 인재 풀";
                    return (
                        <button key={it.id} onClick={() => setSelected(it)}
                            className="w-full text-left bg-white border border-neutral-200 rounded-lg p-4 hover:border-rose-300 hover:shadow-sm transition-all">
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                    {side === "talent"
                                        ? <Building2 className="h-4 w-4 text-neutral-400 shrink-0" />
                                        : <User className="h-4 w-4 text-neutral-400 shrink-0" />
                                    }
                                    <p className="text-sm font-semibold truncate">{primaryLabel}</p>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st}`}>
                                    {STATUS_LABEL[it.status] ?? it.status}
                                </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mb-2">{subLabel}</p>
                            {it.curation && (
                                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                                    {it.curation}
                                </p>
                            )}
                            <div className="flex items-center justify-between mt-2">
                                {it.signalNotes.length > 0 ? (
                                    <span className="text-[10px] text-amber-600 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> 주의 신호 {it.signalNotes.length}
                                    </span>
                                ) : <span />}
                                <span className="text-[10px] text-neutral-300 flex items-center gap-0.5">
                                    자세히 <ChevronRight className="h-3 w-3" />
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 상세 모달 */}
            {selected && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-neutral-200 flex items-start justify-between">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                                    <Sparkles className="h-3 w-3" /> HeRo Matching
                                </div>
                                <h3 className="text-base font-bold">
                                    {side === "talent" ? selected.companyName : `영웅 #${selected.talentAnonymousId}`}
                                </h3>
                                {side === "talent" && selected.industry && (
                                    <p className="text-xs text-neutral-500 mt-0.5">{selected.industry}</p>
                                )}
                            </div>
                            <button onClick={() => setSelected(null)} className="text-neutral-400 hover:text-neutral-700">
                                <XIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {selected.curation ? (
                                <div className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">
                                    {selected.curation}
                                </div>
                            ) : (
                                <p className="text-xs text-neutral-400 text-center py-6">
                                    큐레이션이 아직 생성되지 않았습니다. HeRo가 곧 준비할게요.
                                </p>
                            )}

                            {selected.signalNotes.length > 0 && (
                                <div className="pt-4 border-t border-neutral-100">
                                    <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1">
                                        <AlertTriangle className="h-3.5 w-3.5" /> 확인해볼 지점
                                    </p>
                                    <ul className="space-y-1 text-xs text-amber-900 list-disc ml-5">
                                        {selected.signalNotes.map((n, i) => <li key={i}>{n}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* 액션 버튼 — curated 상태에서만 */}
                        {selected.status === "curated" && (
                            <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center gap-2">
                                <button onClick={() => react(selected.id, "pass")} disabled={acting === selected.id}
                                    className="flex-1 text-xs font-semibold text-neutral-600 border border-neutral-300 rounded-lg py-2 hover:bg-neutral-100 disabled:opacity-40">
                                    {acting === selected.id ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : "지금은 아니에요"}
                                </button>
                                <button onClick={() => react(selected.id, "interested")} disabled={acting === selected.id}
                                    className="flex-1 text-xs font-bold text-white rounded-lg py-2 flex items-center justify-center gap-1 disabled:opacity-40"
                                    style={{ backgroundColor: accentColor }}>
                                    {acting === selected.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Handshake className="h-3 w-3" /> 관심 있어요</>}
                                </button>
                            </div>
                        )}

                        <div className="px-5 py-2 border-t border-neutral-100 text-[10px] text-neutral-400 text-center">
                            ⚠️ 매칭 점수·순위는 양쪽에 공개되지 않습니다 (Tetrad 원칙)
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
