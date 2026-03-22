"use client";

import { useState } from "react";
import { Users, Star, MessageCircle, Clock, CheckCircle } from "lucide-react";
import clsx from "clsx";

interface Mentor {
    id: string;
    name: string;
    field: string;
    career: string;
    matchScore: number;
    tags: string[];
    status: "available" | "requested" | "matched";
}

const mockMentors: Mentor[] = [
    {
        id: "m1",
        name: "김전략",
        field: "경영전략 / 사업개발",
        career: "삼성전자 전략기획실 15년, 현 스타트업 대표",
        matchScore: 92,
        tags: ["전략", "사업개발", "M&A"],
        status: "available",
    },
    {
        id: "m2",
        name: "박브랜드",
        field: "브랜드 / 마케팅",
        career: "나이키코리아 마케팅 디렉터, 현 브랜드 컨설턴트",
        matchScore: 88,
        tags: ["브랜드 전략", "마케팅", "글로벌"],
        status: "available",
    },
    {
        id: "m3",
        name: "이테크",
        field: "기술 / AI",
        career: "네이버 AI Lab, 현 AI 스타트업 CTO",
        matchScore: 75,
        tags: ["AI", "플랫폼", "기술 전략"],
        status: "available",
    },
    {
        id: "m4",
        name: "최리더",
        field: "리더십 / 조직문화",
        career: "구글코리아 HR Director, 현 리더십 코치",
        matchScore: 85,
        tags: ["리더십", "조직문화", "코칭"],
        status: "available",
    },
    {
        id: "m5",
        name: "정투자",
        field: "투자 / VC",
        career: "카카오벤처스 심사역, 현 엔젤 투자자",
        matchScore: 70,
        tags: ["투자", "스타트업", "사업모델"],
        status: "available",
    },
];

export default function MentorMatchingPage() {
    const [mentors, setMentors] = useState(mockMentors);

    const handleRequest = (id: string) => {
        setMentors(prev => prev.map(m => m.id === id ? { ...m, status: "requested" as const } : m));
    };

    const requestedCount = mentors.filter(m => m.status === "requested").length;

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1">멘토 매칭</h1>
                <p className="text-sm text-neutral-500">YouInOne 멘토단과 연결합니다</p>
            </div>

            {/* My Mentoring Status */}
            <div className="border border-neutral-200 bg-white p-5 mb-6">
                <h3 className="text-sm font-semibold mb-3">내 멘토링 현황</h3>
                {requestedCount > 0 ? (
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-neutral-400" />
                        <p className="text-sm text-neutral-600">
                            매칭 요청 중: <span className="font-medium">{requestedCount}건</span>
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-neutral-300" />
                        <p className="text-sm text-neutral-400">현재 매칭된 멘토가 없습니다. 아래에서 멘토를 선택해주세요.</p>
                    </div>
                )}
            </div>

            {/* Mentor Cards */}
            <div className="grid grid-cols-1 gap-4">
                {mentors.sort((a, b) => b.matchScore - a.matchScore).map(mentor => (
                    <div key={mentor.id} className="border border-neutral-200 bg-white p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-neutral-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-neutral-400">
                                    {mentor.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-semibold">{mentor.name}</h4>
                                        <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500">{mentor.field}</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mb-2">{mentor.career}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {mentor.tags.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-0.5 border border-neutral-200 text-neutral-500">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                                <div className="mb-2">
                                    <p className="text-xs text-neutral-400">매칭 적합도</p>
                                    <p className={clsx(
                                        "text-lg font-bold",
                                        mentor.matchScore >= 85 ? "text-neutral-900" : "text-neutral-400"
                                    )}>
                                        {mentor.matchScore}%
                                    </p>
                                </div>
                                {mentor.status === "available" ? (
                                    <button
                                        onClick={() => handleRequest(mentor.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
                                    >
                                        <MessageCircle className="h-3 w-3" />
                                        매칭 요청
                                    </button>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                                        <CheckCircle className="h-3 w-3" />
                                        요청 완료
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
