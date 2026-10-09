"use client";

/**
 * Action Hub — 전 브랜드 "처리 대기" 집계 (SSOT: lib/action-hub-registry.ts)
 * 인트라 첫 화면(My 대시보드)과 Universe 대시보드 상단에 표시.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSiteTiers } from "@/lib/use-site-tiers";
import { ACTION_HUB_REGISTRY, CATEGORY_LABEL, PRIORITY_COLOR, type ActionCategory } from "@/lib/action-hub-registry";

interface PendingAction {
    label: string;
    count: number;
    href: string;
    category: ActionCategory;
    priority: "critical" | "high" | "normal";
    brand_id: string;
}

async function loadPending(): Promise<PendingAction[]> {
    const supabase = createClient();
    return Promise.all(
        ACTION_HUB_REGISTRY.map(async (entry) => {
            let query = supabase.from(entry.table).select("*", { count: "exact", head: true });
            query = entry.filter.value === null
                ? query.is(entry.filter.column, null)
                : query.eq(entry.filter.column, entry.filter.value);
            for (const ef of entry.extraFilters ?? []) query = query.eq(ef.column, ef.value);
            for (const nf of entry.notFilters ?? []) query = query.neq(nf.column, nf.value);
            const { count, error } = await query;
            if (error) console.error(`[action-hub] ${entry.key}:`, error.message);
            return {
                label: entry.label,
                count: error ? 0 : (count ?? 0),
                href: entry.href,
                category: entry.category,
                priority: entry.priority ?? "normal",
                brand_id: entry.brand_id,
            };
        })
    );
}

const FOCUS_TIERS = ["core", "focus"];

/**
 * scope="focus" — Workspace(개인 대시보드)용: 공통(global) + 핵심·집중 브랜드만. 나머지는 건수만 알리고 Universe 대시보드로 (2026-10-10)
 * scope="all"   — Universe 대시보드: 전 유니버스
 */
export function ActionHubPanel({ scope = "all" }: { scope?: "focus" | "all" }) {
    const [pending, setPending] = useState<PendingAction[] | null>(null);
    const tiers = useSiteTiers();

    useEffect(() => {
        let cancelled = false;
        loadPending().then(p => { if (!cancelled) setPending(p); });
        return () => { cancelled = true; };
    }, []);

    if (!pending || (scope === "focus" && !tiers)) {
        return <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-4 text-center text-[11px] text-neutral-400">Action Hub 불러오는 중...</div>;
    }
    if (scope === "all") return <ActionHub pending={pending} />;
    const inFocus = (p: PendingAction) => p.brand_id === "global" || FOCUS_TIERS.includes(tiers?.[p.brand_id] ?? "");
    const others = pending.filter(p => !inFocus(p)).reduce((n, p) => n + p.count, 0);
    return <ActionHub pending={pending.filter(inFocus)} others={others} />;
}

function ActionHub({ pending, others = 0 }: { pending: PendingAction[]; others?: number }) {
    const active = pending.filter(p => p.count > 0);
    const total = active.reduce((s, p) => s + p.count, 0);

    // category별 그룹핑
    const byCategory = new Map<ActionCategory, PendingAction[]>();
    active.forEach(p => {
        if (!byCategory.has(p.category)) byCategory.set(p.category, []);
        byCategory.get(p.category)!.push(p);
    });
    // priority 기준 정렬 (critical > high > normal)
    const prioRank = { critical: 0, high: 1, normal: 2 };
    byCategory.forEach(list => list.sort((a, b) => prioRank[a.priority] - prioRank[b.priority]));

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                    <Inbox className="h-4 w-4 text-rose-500" />
                    Action Hub
                    {total > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">{total}</span>
                    )}
                </h2>
                {others > 0 ? (
                    <Link href="/intra/ums" className="text-[10px] text-neutral-400 hover:text-neutral-900">
                        실험·보관 브랜드 {others.toLocaleString()}건 → Universe 대시보드
                    </Link>
                ) : (
                    <span className="text-[10px] text-neutral-400">
                        레지스트리 {ACTION_HUB_REGISTRY.length}건 · 활성 {active.length}
                    </span>
                )}
            </div>
            {total === 0 ? (
                <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-4 text-center text-[11px] text-neutral-400">
                    처리할 승인·요청이 없습니다. <span className="text-neutral-300">({ACTION_HUB_REGISTRY.length}개 소스 모니터링 중)</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {Array.from(byCategory.entries()).map(([cat, list]) => (
                        <div key={cat}>
                            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold mb-1.5">
                                {CATEGORY_LABEL[cat]} <span className="text-neutral-300">({list.length})</span>
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {list.map(p => (
                                    <Link key={p.label} href={p.href}
                                        className="bg-white border border-neutral-200 rounded-lg p-3 hover:border-rose-300 hover:bg-rose-50/30 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[11px] text-neutral-500 truncate">{p.label}</p>
                                            {p.priority !== "normal" && (
                                                <span className={`text-[9px] px-1 rounded font-semibold ${PRIORITY_COLOR[p.priority]}`}>
                                                    {p.priority === "critical" ? "!" : "↑"}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xl font-bold text-neutral-900">{p.count}<span className="text-[11px] text-neutral-500 font-normal ml-1">건</span></p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

