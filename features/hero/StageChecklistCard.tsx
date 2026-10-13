"use client";

/**
 * 준비 체크리스트 카드 — Journey 목표·성취 탭 + 생애주기 검사 결과 페이지 공용
 * 검사에서 분리한 상태형 항목(이력서·면접·재정 …)을 예/아니오로 두고 언제든 갱신한다 (2026-10-12)
 */
import { useCallback, useEffect, useState } from "react";
import { CheckSquare, Square, ListChecks } from "lucide-react";
import { HIT_STAGES } from "@/lib/hit/stages";
import type { ChecklistStage } from "@/lib/hero/journey-checklists";

const RED = "#E53935";
const STAGE_KEYS: ChecklistStage[] = ["c", "d", "e", "f", "gap"];

interface Item { key: string; group: string; text: string; checkedAt: string | null }

export function StageChecklistCard({ stage: initialStage, compact = false }: { stage?: ChecklistStage; compact?: boolean }) {
    const [stage, setStage] = useState<ChecklistStage>(initialStage ?? "c");
    const [items, setItems] = useState<Item[]>([]);
    const [percent, setPercent] = useState(0);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/hero/journey/checklist?stage=${stage}`);
            if (r.ok) {
                const d = await r.json();
                setItems(d.items ?? []);
                setPercent(d.percent ?? 0);
            }
        } finally {
            setLoading(false);
        }
    }, [stage]);

    useEffect(() => { load(); }, [load]);

    const toggle = async (item: Item) => {
        const next = !item.checkedAt;
        setItems(prev => prev.map(i => (i.key === item.key ? { ...i, checkedAt: next ? new Date().toISOString() : null } : i)));
        const r = await fetch("/api/hero/journey/checklist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stage, itemKey: item.key, checked: next }),
        });
        if (r.ok) load();
    };

    const groups = Array.from(new Set(items.map(i => i.group)));

    return (
        <div className="bg-white border border-neutral-200 rounded-xs p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                        <ListChecks className="w-5 h-5" style={{ color: RED }} /> 준비 체크리스트
                    </h3>
                    {!compact && <p className="text-sm text-neutral-500 mt-1">검사가 아니라 할 일입니다. 완료할수록 준비도가 올라갑니다.</p>}
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-neutral-900">{percent}%</p>
                    <p className="text-[11px] text-neutral-400">완료</p>
                </div>
            </div>

            {!initialStage && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {STAGE_KEYS.map(k => (
                        <button key={k} type="button" onClick={() => setStage(k)}
                            className={`px-3 py-1.5 rounded-none text-xs font-bold border transition-colors ${stage === k ? "bg-neutral-900 text-white border-neutral-900" : "border-neutral-200 text-neutral-600 hover:border-neutral-400"}`}>
                            {HIT_STAGES[k].code} · {HIT_STAGES[k].name}
                        </button>
                    ))}
                </div>
            )}

            <div className="h-1.5 bg-neutral-100 rounded-none overflow-hidden mb-5">
                <div className="h-full rounded-none transition-all" style={{ width: `${percent}%`, backgroundColor: RED }} />
            </div>

            {loading ? (
                <div className="h-24 bg-neutral-50 rounded-xs animate-pulse" />
            ) : (
                <div className="space-y-4">
                    {groups.map(g => (
                        <div key={g}>
                            <p className="text-[11px] font-bold text-neutral-400 tracking-wide mb-1.5">{g}</p>
                            <ul className="space-y-1">
                                {items.filter(i => i.group === g).map(i => (
                                    <li key={i.key}>
                                        <button type="button" onClick={() => toggle(i)} className="w-full flex items-start gap-2.5 text-left px-2 py-1.5 rounded-xs hover:bg-neutral-50 transition-colors">
                                            {i.checkedAt ? <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: RED }} /> : <Square className="w-4 h-4 mt-0.5 shrink-0 text-neutral-300" />}
                                            <span className={`text-sm ${i.checkedAt ? "text-neutral-400 line-through" : "text-neutral-700"}`}>{i.text}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
