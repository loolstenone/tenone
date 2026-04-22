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
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-3 block">
                        MADLeaguer
                    </span>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-6">매드리거</h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        MADLeague와 함께 성장한 매드리거들을 소개합니다.
                    </p>
                </div>
            </section>

            {/* Cohort Tabs + Members */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Cohort Tabs */}
                    <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
                        {cohorts.map((cohort) => (
                            <button
                                key={cohort}
                                onClick={() => setActiveCohort(cohort)}
                                className={clsx(
                                    "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                                    activeCohort === cohort
                                        ? "bg-[#D32F2F] text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                )}
                            >
                                {cohort}기
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 mb-10 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            {filtered.length}명
                        </span>
                        {filtered[0]?.activityYear && (
                            <span className="text-neutral-400">{filtered[0].activityYear}년 활동</span>
                        )}
                    </div>

                    {/* Member Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filtered.map((leaguer) => (
                            <div
                                key={`${leaguer.cohort}-${leaguer.name}`}
                                className="p-5 bg-white border border-neutral-200 rounded-xl text-center hover:shadow-md transition-shadow"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
                                    <span className="text-xl font-bold text-neutral-400">
                                        {leaguer.name.charAt(0)}
                                    </span>
                                </div>
                                <h3 className="font-bold text-neutral-900 mb-1">{leaguer.name}</h3>
                                <div className="flex items-center justify-center gap-1 text-xs text-neutral-500 mb-3">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    <span>{leaguer.school}</span>
                                </div>
                                <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#D32F2F]/10 text-[#D32F2F]">
                                    {leaguer.cohort}기 매드리거
                                </span>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <p className="text-center text-neutral-400 py-10">해당 기수의 매드리거 정보가 없습니다.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
