"use client";

import { useEffect, useState } from "react";
import { UtensilsCrossed, Flame, Dumbbell, BookOpen } from "lucide-react";

interface RawMoment {
    date: string;
    nutrition?: { total: { calories: number } } | null;
    exercise?: { calories_burned: number } | null;
    study?: { duration_min: number } | null;
}

interface HealthStats {
    intakeKcal: number;
    burnKcal: number;
    streak: number;
    studyMin: number;
    studyStreak: number;
}

export function DailyHealthStats({ date, version }: { date: string; version?: number }) {
    const [stats, setStats] = useState<HealthStats | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const todayRes = await fetch(`/api/myverse/moments?date=${date}`);
            if (!todayRes.ok || cancelled) return;
            const { moments: todayMoments } = await todayRes.json() as { moments: RawMoment[] };

            const fromDate = new Date(date);
            fromDate.setDate(fromDate.getDate() - 29);
            const from = fromDate.toISOString().slice(0, 10);
            const rangeRes = await fetch(`/api/myverse/moments?from=${from}&to=${date}`);
            if (!rangeRes.ok || cancelled) return;
            const { moments: rangeMoments } = await rangeRes.json() as { moments: RawMoment[] };

            const intakeKcal = todayMoments.reduce((s, m) => s + (m.nutrition?.total.calories ?? 0), 0);
            const burnKcal = todayMoments.reduce((s, m) => s + (m.exercise?.calories_burned ?? 0), 0);
            const studyMin = todayMoments.reduce((s, m) => s + (m.study?.duration_min ?? 0), 0);

            // 연속 운동일
            const exerciseDays = new Set(rangeMoments.filter(m => m.exercise).map(m => m.date));
            let streak = 0;
            const cur = new Date(date);
            while (true) {
                const ds = cur.toISOString().slice(0, 10);
                if (!exerciseDays.has(ds)) break;
                streak++;
                cur.setDate(cur.getDate() - 1);
            }

            // 연속 공부일
            const studyDays = new Set(rangeMoments.filter(m => m.study).map(m => m.date));
            let studyStreak = 0;
            const cur2 = new Date(date);
            while (true) {
                const ds = cur2.toISOString().slice(0, 10);
                if (!studyDays.has(ds)) break;
                studyStreak++;
                cur2.setDate(cur2.getDate() - 1);
            }

            if (!cancelled) setStats({ intakeKcal, burnKcal, streak, studyMin, studyStreak });
        }

        load();
        return () => { cancelled = true; };
    }, [date, version]);

    if (!stats || (stats.intakeKcal === 0 && stats.burnKcal === 0 && stats.streak === 0 && stats.studyMin === 0 && stats.studyStreak === 0)) return null;

    function fmtMin(min: number) {
        if (min < 60) return `${min}분`;
        return `${Math.floor(min / 60)}시간${min % 60 > 0 ? ` ${min % 60}분` : ""}`;
    }

    return (
        <div className="flex items-center gap-4 px-5 py-2 bg-neutral-50 myverse-dark:bg-[#1A1A1A] border-b border-neutral-100 myverse-dark:border-[#2A2A2A] flex-wrap">
            {stats.intakeKcal > 0 && (
                <span className="flex items-center gap-1 text-xs">
                    <UtensilsCrossed className="h-3 w-3 text-orange-400" />
                    <span className="font-medium text-neutral-700 myverse-dark:text-neutral-200">
                        {stats.intakeKcal.toLocaleString()}
                    </span>
                    <span className="text-neutral-400">kcal 섭취</span>
                </span>
            )}
            {stats.burnKcal > 0 && (
                <span className="flex items-center gap-1 text-xs">
                    <Flame className="h-3 w-3 text-rose-400" />
                    <span className="font-medium text-neutral-700 myverse-dark:text-neutral-200">
                        {stats.burnKcal.toLocaleString()}
                    </span>
                    <span className="text-neutral-400">kcal 소모</span>
                </span>
            )}
            {stats.streak >= 2 && (
                <span className="flex items-center gap-1 text-xs">
                    <Dumbbell className="h-3 w-3 text-blue-400" />
                    <span className="font-medium text-neutral-700 myverse-dark:text-neutral-200">
                        {stats.streak}일
                    </span>
                    <span className="text-neutral-400">연속 운동</span>
                </span>
            )}
            {stats.studyMin > 0 && (
                <span className="flex items-center gap-1 text-xs">
                    <BookOpen className="h-3 w-3 text-emerald-500" />
                    <span className="font-medium text-neutral-700 myverse-dark:text-neutral-200">
                        {fmtMin(stats.studyMin)}
                    </span>
                    <span className="text-neutral-400">공부</span>
                </span>
            )}
            {stats.studyStreak >= 2 && (
                <span className="flex items-center gap-1 text-xs">
                    <BookOpen className="h-3 w-3 text-teal-500" />
                    <span className="font-medium text-neutral-700 myverse-dark:text-neutral-200">
                        {stats.studyStreak}일
                    </span>
                    <span className="text-neutral-400">연속 공부</span>
                </span>
            )}
        </div>
    );
}
