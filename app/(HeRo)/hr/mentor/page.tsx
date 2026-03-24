"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Users,
    Star,
    MessageCircle,
    ArrowRight,
    Search,
    Filter,
} from "lucide-react";
import clsx from "clsx";

interface Mentor {
    id: string;
    name: string;
    field: string;
    career: string;
    matchScore: number;
    tags: string[];
    photo: string;
}

const mentors: Mentor[] = [
    {
        id: "m1",
        name: "김전략",
        field: "경영전략 / 사업개발",
        career: "전 삼성전자 전략기획실 15년 / 현 스타트업 대표",
        matchScore: 92,
        tags: ["전략", "사업개발", "M&A"],
        photo: "김",
    },
    {
        id: "m2",
        name: "박브랜드",
        field: "브랜드 / 마케팅",
        career: "전 나이키코리아 마케팅 디렉터 / 현 브랜드 컨설턴트",
        matchScore: 88,
        tags: ["브랜드 전략", "마케팅", "글로벌"],
        photo: "박",
    },
    {
        id: "m3",
        name: "이테크",
        field: "기술 / AI",
        career: "전 네이버 AI Lab / 현 AI 스타트업 CTO",
        matchScore: 85,
        tags: ["AI", "플랫폼", "기술 전략"],
        photo: "이",
    },
    {
        id: "m4",
        name: "최리더",
        field: "리더십 / 조직문화",
        career: "전 구글코리아 HR Director / 현 리더십 코치",
        matchScore: 90,
        tags: ["리더십", "조직문화", "코칭"],
        photo: "최",
    },
    {
        id: "m5",
        name: "정투자",
        field: "투자 / VC",
        career: "전 카카오벤처스 심사역 / 현 엔젤 투자자",
        matchScore: 78,
        tags: ["투자", "스타트업", "사업모델"],
        photo: "정",
    },
    {
        id: "m6",
        name: "한디자인",
        field: "UX/UI 디자인",
        career: "전 토스 디자인 리드 / 현 디자인 스튜디오 대표",
        matchScore: 82,
        tags: ["UX", "디자인 시스템", "프로덕트"],
        photo: "한",
    },
];

const categories = ["전체", "경영전략", "마케팅", "기술", "리더십", "투자", "디자인"];

const programSteps = [
    { step: 1, title: "HIT 진단 완료", desc: "인재 진단 결과를 기반으로 멘토가 매칭됩니다" },
    { step: 2, title: "멘토 선택", desc: "추천 멘토 중 희망하는 멘토를 선택합니다" },
    { step: 3, title: "1:1 멘토링", desc: "월 2회 온/오프라인 멘토링 세션을 진행합니다" },
    { step: 4, title: "성장 리포트", desc: "멘토링 종료 후 성장 리포트를 받습니다" },
];

export default function MentoringPage() {
    const [selectedCategory, setSelectedCategory] = useState("전체");

    const filteredMentors = selectedCategory === "전체"
        ? mentors
        : mentors.filter(m => m.field.includes(selectedCategory) || m.tags.some(t => t.includes(selectedCategory)));

    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-yellow-50 via-white to-amber-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">
                                Mentoring
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            현직 전문가와<br />
                            <span className="text-amber-500">1:1 멘토링</span>
                        </h1>
                        <p className="text-lg text-neutral-600 mb-8">
                            각 분야 현직 전문가 멘토단이 당신의 성장을 돕습니다.
                            HIT 진단 결과를 기반으로 최적의 멘토가 매칭됩니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* Program Steps */}
            <section className="bg-white border-y border-neutral-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {programSteps.map((s) => (
                            <div key={s.step} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                    {s.step}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{s.title}</p>
                                    <p className="text-xs text-neutral-500">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mentor List */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-10">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">멘토 프로필</h2>
                        <p className="text-neutral-500">분야별 전문가 멘토를 만나보세요</p>
                    </div>

                    {/* Filter */}
                    <div className="flex flex-wrap gap-2 justify-center mb-10">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={clsx(
                                    "px-4 py-2 text-sm rounded-full transition-colors",
                                    selectedCategory === cat
                                        ? "bg-amber-500 text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Mentor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMentors.sort((a, b) => b.matchScore - a.matchScore).map((mentor) => (
                            <div key={mentor.id} className="border border-neutral-200 rounded-xl p-6 hover:border-amber-300 transition-colors">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 bg-amber-50 text-amber-600 flex items-center justify-center rounded-full text-lg font-bold flex-shrink-0">
                                        {mentor.photo}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-bold">{mentor.name}</h3>
                                            <div className="flex items-center gap-0.5">
                                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-bold text-neutral-600">{mentor.matchScore}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-amber-600 mb-1">{mentor.field}</p>
                                        <p className="text-xs text-neutral-500">{mentor.career}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {mentor.tags.map((tag) => (
                                        <span key={tag} className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors">
                                    <MessageCircle className="h-4 w-4" />
                                    멘토링 신청
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-2xl font-bold mb-3">멘토링을 신청하세요</h2>
                    <p className="text-neutral-500 mb-8">HIT 진단을 완료하면 최적의 멘토가 매칭됩니다</p>
                    <Link
                        href="/hr/hit"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-lg"
                    >
                        HIT 진단 시작하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
