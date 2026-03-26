"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { GraduationCap, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Leaguer {
    name: string;
    school: string;
    generation: number;
    role: string;
}

// Mock fallback — DB에 데이터 들어오면 자동으로 대체됨
const mockLeaguers: Leaguer[] = [
    { name: "김서연", school: "서울대학교", generation: 8, role: "회장" },
    { name: "이준호", school: "연세대학교", generation: 8, role: "부회장" },
    { name: "박하늘", school: "고려대학교", generation: 8, role: "기획팀장" },
    { name: "최민지", school: "성균관대학교", generation: 8, role: "마케팅팀원" },
    { name: "정도현", school: "한양대학교", generation: 8, role: "디자인팀원" },
    { name: "한소희", school: "이화여자대학교", generation: 8, role: "콘텐츠팀원" },
    { name: "윤태영", school: "중앙대학교", generation: 7, role: "회장" },
    { name: "강나영", school: "경희대학교", generation: 7, role: "부회장" },
    { name: "임재혁", school: "서강대학교", generation: 7, role: "기획팀장" },
    { name: "오지은", school: "숙명여자대학교", generation: 7, role: "마케팅팀원" },
    { name: "배성민", school: "건국대학교", generation: 7, role: "디자인팀원" },
    { name: "조아라", school: "동국대학교", generation: 7, role: "콘텐츠팀원" },
    { name: "신우진", school: "부산대학교", generation: 6, role: "회장" },
    { name: "황예린", school: "전남대학교", generation: 6, role: "부회장" },
    { name: "문기훈", school: "경북대학교", generation: 6, role: "기획팀장" },
    { name: "서다은", school: "충남대학교", generation: 6, role: "마케팅팀원" },
    { name: "양지훈", school: "전북대학교", generation: 5, role: "회장" },
    { name: "노유진", school: "강원대학교", generation: 5, role: "부회장" },
];

const generations = [8, 7, 6, 5];

const roleColors: Record<string, string> = {
    "회장": "bg-[#D32F2F] text-white",
    "부회장": "bg-[#D32F2F]/80 text-white",
    "기획팀장": "bg-[#D32F2F]/10 text-[#D32F2F]",
    "마케팅팀원": "bg-neutral-100 text-neutral-600",
    "디자인팀원": "bg-neutral-100 text-neutral-600",
    "콘텐츠팀원": "bg-neutral-100 text-neutral-600",
};

export default function LeaguerPage() {
    const [activeGen, setActiveGen] = useState<number>(8);
    const [leaguers, setLeaguers] = useState<Leaguer[]>(mockLeaguers);

    // DB 우선: members 테이블에서 MADLeague 소속 멤버 조회
    useEffect(() => {
        async function loadFromDB() {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from('members')
                    .select('name, company, department, position, affiliations')
                    .contains('affiliations', ['madleague']);
                if (data && data.length > 0) {
                    setLeaguers(data.map((m: any) => ({
                        name: m.name || '이름 없음',
                        school: m.company || m.department || '',
                        generation: parseInt(m.position) || 8, // position에 기수 저장
                        role: m.department || '멤버',
                    })));
                }
            } catch { /* Mock fallback 유지 */ }
        }
        loadFromDB();
    }, []);

    const filtered = leaguers.filter((l) => l.generation === activeGen);

    return (
        <div>
            {/* Hero */}
            <section className="bg-[#212121] text-white py-16 md:py-24 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-[#D32F2F] font-bold text-sm tracking-widest uppercase mb-3 block">
                        MAD Leaguer
                    </span>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold mb-6">매드 리거</h1>
                    <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        MAD League와 함께 성장한 리거들을 소개합니다.
                    </p>
                </div>
            </section>

            {/* Generation Tabs + Members */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Generation Tabs */}
                    <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
                        {generations.map((gen) => (
                            <button
                                key={gen}
                                onClick={() => setActiveGen(gen)}
                                className={clsx(
                                    "px-5 py-2 rounded-full text-sm font-medium transition-colors",
                                    activeGen === gen
                                        ? "bg-[#D32F2F] text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                )}
                            >
                                {gen}기
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 mb-10 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            {filtered.length}명
                        </span>
                    </div>

                    {/* Member Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filtered.map((leaguer) => (
                            <div
                                key={`${leaguer.generation}-${leaguer.name}`}
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
                                <span
                                    className={clsx(
                                        "inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full",
                                        roleColors[leaguer.role] || "bg-neutral-100 text-neutral-600"
                                    )}
                                >
                                    {leaguer.role}
                                </span>
                            </div>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <p className="text-center text-neutral-400 py-10">해당 기수의 멤버 정보가 없습니다.</p>
                    )}
                </div>
            </section>
        </div>
    );
}
