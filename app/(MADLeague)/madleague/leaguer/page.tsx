"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { GraduationCap, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Leaguer {
    name: string;
    school: string;
    cohort: number;
    activityYear: number | null;
}

// Mock fallback
const mockLeaguers: Leaguer[] = [
    { name: "김서연", school: "서울대학교", cohort: 8, activityYear: 2024 },
    { name: "이준호", school: "연세대학교", cohort: 8, activityYear: 2024 },
    { name: "박하늘", school: "고려대학교", cohort: 8, activityYear: 2024 },
    { name: "최민지", school: "성균관대학교", cohort: 8, activityYear: 2024 },
    { name: "정도현", school: "한양대학교", cohort: 8, activityYear: 2024 },
    { name: "한소희", school: "이화여자대학교", cohort: 8, activityYear: 2024 },
    { name: "윤태영", school: "중앙대학교", cohort: 7, activityYear: 2023 },
    { name: "강나영", school: "경희대학교", cohort: 7, activityYear: 2023 },
    { name: "임재혁", school: "서강대학교", cohort: 7, activityYear: 2023 },
    { name: "오지은", school: "숙명여자대학교", cohort: 7, activityYear: 2023 },
    { name: "배성민", school: "건국대학교", cohort: 7, activityYear: 2023 },
    { name: "신우진", school: "부산대학교", cohort: 6, activityYear: 2022 },
    { name: "황예린", school: "전남대학교", cohort: 6, activityYear: 2022 },
    { name: "양지훈", school: "전북대학교", cohort: 5, activityYear: 2021 },
];

export default function LeaguerPage() {
    const [activeCohort, setActiveCohort] = useState<number>(8);
    const [leaguers, setLeaguers] = useState<Leaguer[]>(mockLeaguers);
    const [cohorts, setCohorts] = useState<number[]>([8, 7, 6, 5]);

    useEffect(() => {
        async function loadFromDB() {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('mad_applications')
                    .select('name, university, cohort, activity_year')
                    .eq('status', 'approved')
                    .order('cohort', { ascending: false });
                if (data && data.length > 0) {
                    setLeaguers(data.map((m: { name: string; university: string; cohort: number; activity_year: number | null }) => ({
                        name: m.name || '이름 없음',
                        school: m.university || '',
                        cohort: m.cohort || 0,
                        activityYear: m.activity_year,
                    })));
                    const uniqueCohorts = [...new Set(data.map((m: { cohort: number }) => m.cohort).filter(Boolean))].sort((a, b) => (b as number) - (a as number));
                    if (uniqueCohorts.length > 0) {
                        setCohorts(uniqueCohorts as number[]);
                        setActiveCohort(uniqueCohorts[0] as number);
                    }
                }
            } catch { /* Mock fallback 유지 */ }
        }
        loadFromDB();
    }, []);

    const filtered = leaguers.filter((l) => l.cohort === activeCohort);

    return (
        <div className="bg-[var(--mad-black,#000)] text-white">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-neutral-900">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(236,29,37,0.12),transparent_60%)]" aria-hidden />
                <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
                    <div className="text-xs font-bold tracking-widest text-[#EC1D25]">MAD LEAGUER</div>
                    <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">매드리거</h1>
                    <p className="mt-8 max-w-2xl text-xl text-neutral-300 leading-relaxed">
                        MADLeague와 함께 성장한 매드리거들을 소개합니다.
                    </p>
                </div>
            </section>

            {/* Cohort Tabs + Members */}
            <section className="mx-auto max-w-7xl px-6 py-20">
                {/* Cohort Tabs */}
                <div className="flex items-center gap-2 mb-12 flex-wrap">
                    {cohorts.map((cohort) => (
                        <button
                            key={cohort}
                            onClick={() => setActiveCohort(cohort)}
                            className={clsx(
                                "px-6 py-2 text-sm font-bold tracking-wide transition",
                                activeCohort === cohort
                                    ? "bg-[#EC1D25] text-white"
                                    : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                            )}
                        >
                            {cohort}기
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 mb-10 text-sm text-neutral-500">
                    <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {filtered.length}명
                    </span>
                    {filtered[0]?.activityYear && (
                        <span>{filtered[0].activityYear}년 활동</span>
                    )}
                </div>

                {/* Member Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map((leaguer) => (
                        <div
                            key={`${leaguer.cohort}-${leaguer.name}`}
                            className="bg-neutral-950 border border-neutral-900 p-6 text-center"
                        >
                            <div className="w-12 h-12 mx-auto mb-4 bg-neutral-800 flex items-center justify-center">
                                <span className="text-lg font-black text-[#EC1D25]">
                                    {leaguer.name.charAt(0)}
                                </span>
                            </div>
                            <div className="font-black text-white text-sm mb-1">{leaguer.name}</div>
                            <div className="flex items-center justify-center gap-1 text-xs text-neutral-500">
                                <GraduationCap className="h-3 w-3" />
                                <span>{leaguer.school}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <p className="text-center text-neutral-600 py-16">해당 기수의 매드리거 정보가 없습니다.</p>
                )}
            </section>
        </div>
    );
}
