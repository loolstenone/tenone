"use client";

import { useState, useEffect } from "react";
import { BarChart3, Zap, Target, BookOpen } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import * as heroDb from "@/lib/supabase/hero";
import { useAuth } from "@/lib/auth-context";

const competencies = [
    { name: "전략", value: 92 },
    { name: "기획", value: 88 },
    { name: "마케팅", value: 75 },
    { name: "디자인", value: 45 },
    { name: "개발", value: 40 },
    { name: "리더십", value: 90 },
    { name: "커뮤니케이션", value: 82 },
    { name: "데이터", value: 55 },
];

const topStrengths = [
    { name: "전략적 사고", score: 92, desc: "시장 분석, 경쟁 전략, 장기 비전 설계에서 탁월한 역량을 보여줍니다. 복잡한 문제를 구조화하고 핵심을 파악하는 능력이 뛰어납니다." },
    { name: "리더십", score: 90, desc: "팀을 이끄는 추진력과 비전 공유 능력이 강합니다. 구성원의 동기 부여와 목표 정렬에 뛰어난 역량을 발휘합니다." },
    { name: "기획력", score: 88, desc: "아이디어를 체계적인 실행 계획으로 전환하는 능력이 우수합니다. 브랜드 기획과 사업 설계에서 강점을 보입니다." },
];

const developAreas = [
    { name: "개발 역량", score: 40, action: "코딩 기초 과정 수강, AI 도구 활용 실습", course: "프로그래밍 기초 (Python/JS)" },
    { name: "디자인 감각", score: 45, action: "UX/UI 기본 원리 학습, 디자인 시스템 이해", course: "UX 디자인 기초" },
    { name: "데이터 분석", score: 55, action: "데이터 리터러시 향상, 대시보드 활용법", course: "데이터 분석 입문" },
];

export default function CareerDiagnosisPage() {
    const { user } = useAuth();
    const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);

    // DB에서 커리어 프로필 로드
    useEffect(() => {
        if (!user?.id) return;
        heroDb.fetchCareerProfile(user.id)
            .then(data => { if (data) setProfileData(data); })
            .catch(() => { /* Mock fallback */ });
    }, [user?.id]);

    // DB 데이터가 있으면 사용, 없으면 Mock 유지
    const activeCompetencies = profileData?.competencies
        ? (profileData.competencies as typeof competencies)
        : competencies;
    const activeStrengths = profileData?.top_strengths
        ? (profileData.top_strengths as typeof topStrengths)
        : topStrengths;
    const activeDevelopAreas = profileData?.develop_areas
        ? (profileData.develop_areas as typeof developAreas)
        : developAreas;

    const maxVal = Math.max(...activeCompetencies.map(c => c.value));

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">역량 진단</h1>
                <p className="text-sm text-neutral-500">HIT 결과 기반 강점/약점 분석</p>
            </div>

            {/* Competency Chart */}
            <div className="border border-neutral-200 bg-white p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="h-4 w-4 text-neutral-900" />
                    <h3 className="text-sm font-semibold">역량 레이더</h3>
                </div>
                <div className="space-y-3">
                    {activeCompetencies.map(c => (
                        <div key={c.name} className="flex items-center gap-3">
                            <span className="text-xs w-20 text-right text-neutral-600">{c.name}</span>
                            <div className="flex-1 h-5 bg-neutral-100 relative">
                                <div
                                    className={clsx(
                                        "h-full transition-all duration-500",
                                        c.value >= 80 ? "bg-neutral-900" : c.value >= 60 ? "bg-neutral-600" : "bg-neutral-300"
                                    )}
                                    style={{ width: `${c.value}%` }}
                                />
                            </div>
                            <span className={clsx(
                                "text-xs w-10 text-right font-medium",
                                c.value >= 80 ? "text-neutral-900" : "text-neutral-400"
                            )}>
                                {c.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Strengths */}
            <div className="border border-neutral-200 bg-white p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <Zap className="h-4 w-4 text-neutral-900" />
                    <h3 className="text-sm font-semibold">강점 TOP 3</h3>
                </div>
                <div className="space-y-4">
                    {activeStrengths.map((s, i) => (
                        <div key={s.name} className="flex gap-4">
                            <span className="text-lg font-bold text-neutral-200 w-8 text-right flex-shrink-0">
                                {i + 1}
                            </span>
                            <div className="flex-1 border-l border-neutral-200 pl-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-semibold">{s.name}</h4>
                                    <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white">{s.score}점</span>
                                </div>
                                <p className="text-xs text-neutral-500">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Development Areas */}
            <div className="border border-neutral-200 bg-white p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <Target className="h-4 w-4 text-neutral-400" />
                    <h3 className="text-sm font-semibold">개발 필요 역량</h3>
                </div>
                <div className="space-y-4">
                    {activeDevelopAreas.map(d => (
                        <div key={d.name} className="border border-neutral-100 p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium">{d.name}</h4>
                                <span className="text-xs text-neutral-400">{d.score}점</span>
                            </div>
                            <div className="w-full h-1.5 bg-neutral-100 mb-3">
                                <div className="h-full bg-neutral-300" style={{ width: `${d.score}%` }} />
                            </div>
                            <p className="text-xs text-neutral-500 mb-2">
                                <span className="font-medium text-neutral-700">권장 액션:</span> {d.action}
                            </p>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-neutral-400" />
                                <Link href="/intra/wiki" className="text-xs text-neutral-500 underline hover:text-neutral-900">
                                    추천 교육: {d.course}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
