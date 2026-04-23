"use client";

/**
 * 매칭 인박스 컴포넌트 — 기업/인재 공용 (티저 모드)
 *
 * 원칙: 매칭 결과물(큐레이션 본문·기업명·인재 식별자·주의 신호)은
 *       HeRo의 유료 수익원이므로 사용자에게 직접 노출하지 않는다.
 *       카운트와 진행 단계만 보여주고, "매칭 의뢰하기" CTA로 안내.
 *       단, contacted/interviewing/trial 상태의 진행 중 매칭은
 *       참여자 자율 상태 보고 버튼을 제공한다.
 */

import { useEffect, useState } from "react";
import { Sparkles, Loader2, Building2, Users, Handshake, MessageCircle, ChevronDown, CheckCircle2 } from "lucide-react";

interface InboxItem {
    id: string;
    status: string;
    createdAt: string;
    statusChangedAt?: string;
    // talent side
    companyName?: string | null;
    industry?: string | null;
    // company side
    talentAnonymousId?: string;
}

const STATUS_LABEL: Record<string, string> = {
    curated:      "추천 준비",
    contacted:    "연락 중",
    interviewing: "면접 진행",
    trial:        "트라이얼",
    hired:        "채용 완료",
    declined:     "거절",
    withdrawn:    "철회",
};

// 사용자가 직접 보고할 수 있는 다음 상태
const NEXT_ACTION: Record<string, { label: string; toStatus: string }[]> = {
    contacted:    [{ label: "면접 일정 확정 →", toStatus: "interviewing" }],
    interviewing: [
        { label: "면접 완료, 트라이얼 시작 →", toStatus: "trial" },
        { label: "면접 후 진행 안 함",          toStatus: "declined"    },
    ],
    trial: [
        { label: "트라이얼 통과, 채용 확정 →", toStatus: "hired"    },
        { label: "트라이얼 탈락",               toStatus: "declined" },
    ],
};

export default function MatchingInbox({
    side,
    memberId,
    companyId,
    accentColor = "#E53935",
    theme = "light",
}: {
    side: "talent" | "company";
    memberId: string;
    companyId?: string;
    accentColor?: string;
    theme?: "light" | "dark";
}) {
    const [items, setItems] = useState<InboxItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [reporting, setReporting] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);

    const isDark = theme === "dark";
    const primaryText   = isDark ? "text-neutral-100" : "text-neutral-900";
    const secondaryText = isDark ? "text-neutral-400" : "text-neutral-500";
    const mutedText     = isDark ? "text-neutral-500" : "text-neutral-400";
    const cardBg        = isDark ? "bg-neutral-800/60 border-neutral-700" : "bg-white border-neutral-200";
    const innerBg       = isDark ? "bg-neutral-800 border-neutral-700" : "bg-neutral-50 border-neutral-200";

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

    async function requestMatching() {
        setRequesting(true);
        try {
            const res = await fetch("/api/hero/matching/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ side, memberId, companyId }),
            });
            if (!res.ok) throw new Error("요청 실패");
            alert("매칭 의뢰가 접수되었습니다. 담당자가 곧 연락드립니다.");
        } catch (e) {
            alert(e instanceof Error ? e.message : "요청 실패");
        } finally {
            setRequesting(false);
        }
    }

    async function report(matchId: string, toStatus: string) {
        setReporting(matchId + toStatus);
        try {
            const res = await fetch(`/api/hero/matching/${matchId}/report`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toStatus }),
            });
            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.error ?? "보고 실패");
            }
            await load();
        } catch (e) {
            alert(e instanceof Error ? e.message : "보고 실패");
        } finally {
            setReporting(null);
        }
    }

    if (loading) {
        return (
            <div className={`flex items-center gap-2 text-xs py-4 ${secondaryText}`}>
                <Loader2 className="h-4 w-4 animate-spin" /> 매칭 준비 현황 확인 중
            </div>
        );
    }

    const visibleCount = items.filter(i =>
        ["curated", "contacted", "interviewing", "trial", "hired"].includes(i.status)
    ).length;
    const activeItems = items.filter(i =>
        ["contacted", "interviewing", "trial"].includes(i.status)
    );
    const activeCount = activeItems.length;

    const headline = side === "talent"
        ? visibleCount > 0 ? `당신을 찾는 회사 ${visibleCount}곳이 준비됐습니다` : "아직 준비된 추천이 없습니다"
        : visibleCount > 0 ? `조건에 맞는 인재 ${visibleCount}명이 준비됐습니다` : "아직 매칭된 인재가 없습니다";

    const sub = side === "talent"
        ? visibleCount > 0
            ? "HeRo가 정리한 추천 내용은 매칭 의뢰를 접수하시면 전달드립니다."
            : "희망 직무(JH)와 HIT 검사를 완성하시면 적합한 회사와 이어드립니다."
        : visibleCount > 0
            ? "추천 인재의 상세 내용은 매칭 의뢰를 접수하시면 전달드립니다."
            : "TIH 응답과 직무 설명(JD)이 올라오면 조건에 맞는 분을 찾기 시작합니다.";

    return (
        <div className={`border rounded-xl p-5 ${cardBg}`}>
            {/* 헤더 */}
            <div className="flex items-start gap-3 mb-4">
                <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accentColor}15` }}
                >
                    {side === "talent"
                        ? <Building2 className="h-5 w-5" style={{ color: accentColor }} />
                        : <Users className="h-5 w-5" style={{ color: accentColor }} />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${primaryText}`}>{headline}</p>
                    <p className={`text-xs mt-1 leading-relaxed ${secondaryText}`}>{sub}</p>
                </div>
            </div>

            {/* 단계 요약 */}
            {items.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <StageBadge label="큐레이션" count={visibleCount} theme={theme} />
                    <StageBadge label="진행 중"  count={activeCount}  theme={theme} />
                    <StageBadge label="누적"     count={items.length} theme={theme} />
                </div>
            )}

            {/* 진행 중 매칭 — 자율 보고 */}
            {activeCount > 0 && (
                <div className={`border rounded-lg mb-4 overflow-hidden ${innerBg}`}>
                    <button
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold ${primaryText}`}
                        onClick={() => setExpanded(v => !v)}
                    >
                        <span>진행 중 매칭 {activeCount}건 — 상황 보고</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded && (
                        <div className="divide-y divide-neutral-700/30">
                            {activeItems.map(item => {
                                const actions = NEXT_ACTION[item.status] ?? [];
                                const displayName = side === "talent"
                                    ? item.companyName ?? "기업 미공개"
                                    : `인재 #${item.talentAnonymousId ?? "??"}`;
                                return (
                                    <div key={item.id} className="px-3 py-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-xs font-medium ${primaryText}`}>{displayName}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium`}
                                                style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
                                                {STATUS_LABEL[item.status] ?? item.status}
                                            </span>
                                        </div>
                                        {actions.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {actions.map(action => (
                                                    <button
                                                        key={action.toStatus}
                                                        disabled={!!reporting}
                                                        onClick={() => report(item.id, action.toStatus)}
                                                        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md border transition-colors disabled:opacity-50 ${
                                                            action.toStatus === "declined" || action.toStatus === "withdrawn"
                                                                ? isDark
                                                                    ? "border-neutral-600 text-neutral-400 hover:bg-neutral-700"
                                                                    : "border-neutral-300 text-neutral-500 hover:bg-neutral-100"
                                                                : "border-transparent text-white"
                                                        }`}
                                                        style={
                                                            action.toStatus !== "declined" && action.toStatus !== "withdrawn"
                                                                ? { backgroundColor: accentColor }
                                                                : {}
                                                        }
                                                    >
                                                        {reporting === item.id + action.toStatus
                                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                                            : action.toStatus === "hired"
                                                                ? <CheckCircle2 className="h-3 w-3" />
                                                                : null
                                                        }
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* CTA */}
            {visibleCount > 0 ? (
                <button
                    onClick={requestMatching}
                    disabled={requesting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                >
                    {requesting
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <><Handshake className="h-4 w-4" /> 매칭 의뢰하기</>
                    }
                </button>
            ) : (
                <div className={`text-center py-3 text-[11px] ${mutedText}`}>
                    <Sparkles className="h-5 w-5 mx-auto mb-1 opacity-50" />
                    준비가 완료되면 알려드립니다
                </div>
            )}

            <p className={`text-[10px] mt-3 text-center ${mutedText}`}>
                <MessageCircle className="inline h-3 w-3 mr-0.5" />
                상세 큐레이션은 HeRo 담당자가 유료 서비스로 전달드립니다
            </p>
        </div>
    );
}

function StageBadge({ label, count, theme }: { label: string; count: number; theme: "light" | "dark" }) {
    const isDark = theme === "dark";
    return (
        <div className={`py-2 rounded-lg border ${isDark ? "bg-neutral-800 border-neutral-700" : "bg-neutral-50 border-neutral-200"}`}>
            <p className={`text-[10px] ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>{label}</p>
            <p className={`text-sm font-bold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>{count}</p>
        </div>
    );
}
