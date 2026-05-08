"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { getISOWeek } from "@/lib/myverse/types";
import type { MyverseWeekly } from "@/lib/myverse/types";

export function ThisWeekCard({ date }: { date: string }) {
    const [weekly, setWeekly] = useState<MyverseWeekly | null>(null);
    const [loading, setLoading] = useState(true);

    const { year, week } = getISOWeek(new Date(date + "T00:00:00"));

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            const res = await fetch(`/api/myverse/weekly?year=${year}&week=${week}`);
            if (cancelled) return;
            if (res.ok) {
                const d = await res.json();
                setWeekly(d.weekly);
            }
            setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [year, week]);

    const hasContent = weekly?.vrief_what || weekly?.vrief_why || weekly?.vrief_how;

    return (
        <section className="bg-gradient-to-br from-[#6366F1]/5 to-[#6366F1]/10 border border-[#6366F1]/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-[#6366F1]" />
                    <h2 className="text-xs uppercase tracking-widest text-[#6366F1] font-semibold">
                        W{String(week).padStart(2, "0")} Vrief
                    </h2>
                </div>
                <Link
                    href={`/myverse/app/weekly?year=${year}&week=${week}`}
                    className="text-[10px] text-[#6366F1] hover:underline inline-flex items-center gap-0.5"
                >
                    열기 <ArrowRight className="h-3 w-3" />
                </Link>
            </div>

            {loading ? (
                <div className="py-2 text-xs text-neutral-400">로딩 중…</div>
            ) : hasContent ? (
                <div className="space-y-2">
                    {weekly?.vrief_what && (
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">What</p>
                            <p className="text-xs text-neutral-800 leading-relaxed line-clamp-2">{weekly.vrief_what}</p>
                        </div>
                    )}
                    {weekly?.vrief_why && (
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">Why</p>
                            <p className="text-xs text-neutral-800 leading-relaxed line-clamp-2">{weekly.vrief_why}</p>
                        </div>
                    )}
                    {weekly?.vrief_how && (
                        <div>
                            <p className="text-[9px] uppercase tracking-widest text-neutral-400 mb-0.5">How</p>
                            <p className="text-xs text-neutral-800 leading-relaxed line-clamp-2">{weekly.vrief_how}</p>
                        </div>
                    )}
                </div>
            ) : (
                <Link
                    href={`/myverse/app/weekly?year=${year}&week=${week}`}
                    className="block text-xs text-neutral-600 leading-relaxed hover:text-[#6366F1] transition-colors"
                >
                    이번 주의 핵심을 아직 쓰지 않았어요.<br />
                    <span className="text-[#6366F1] font-medium">Weekly로 가서 What·Why·How 채우기 →</span>
                </Link>
            )}
        </section>
    );
}
