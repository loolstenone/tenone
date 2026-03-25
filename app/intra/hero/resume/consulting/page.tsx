"use client";

import { useState } from "react";
import { Bot, CheckCircle, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import clsx from "clsx";

interface Improvement {
    id: number;
    category: string;
    issue: string;
    before: string;
    after: string;
    applied: boolean;
}

const mockImprovements: Improvement[] = [
    {
        id: 1,
        category: "자기소개",
        issue: "자기소개가 너무 추상적입니다",
        before: "새로운 가치를 창출하는 것이 목표입니다.",
        after: "2025년 기준 10개 대학, 50개 브랜드를 연결하여 200명의 인재 풀을 구축했습니다.",
        applied: false,
    },
    {
        id: 2,
        category: "프로젝트",
        issue: "프로젝트 경험에 역할이 불명확합니다",
        before: "기획 총괄 / 디렉터",
        after: "전략 기획 PM: 브랜드 아키텍처 설계, 5개 부문 조직 구조 수립, 파트너십 10건 체결",
        applied: false,
    },
    {
        id: 3,
        category: "경력",
        issue: "성과 수치가 부족합니다",
        before: "Ten:One™ Universe 멀티 브랜드 생태계 총괄",
        after: "멀티 브랜드 생태계 총괄 (9개 브랜드 런칭, MAU 15K 달성, 팀원 12명 리딩)",
        applied: false,
    },
    {
        id: 4,
        category: "역량",
        issue: "스킬 키워드가 너무 포괄적입니다",
        before: "마케팅, AI",
        after: "브랜드 전략, 퍼포먼스 마케팅, AI 프롬프트 엔지니어링, GPT API 활용",
        applied: false,
    },
    {
        id: 5,
        category: "구성",
        issue: "MADLeague 경험의 가치가 덜 부각됩니다",
        before: "10개 대학 연합 프로그램 기획",
        after: "10개 대학 200명 참여 프로그램 기획/운영, 인재 발굴-육성-매칭 파이프라인 구축",
        applied: false,
    },
];

export default function ResumeConsultingPage() {
    const [improvements, setImprovements] = useState(mockImprovements);
    const [applying, setApplying] = useState(false);

    const appliedCount = improvements.filter(i => i.applied).length;
    const score = 78 + appliedCount * 3;

    const toggleApply = (id: number) => {
        setImprovements(prev => prev.map(i => i.id === id ? { ...i, applied: !i.applied } : i));
    };

    const applyAll = () => {
        setApplying(true);
        setTimeout(() => {
            setImprovements(prev => prev.map(i => ({ ...i, applied: true })));
            setApplying(false);
        }, 1000);
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-6">
                <h1 className="text-xl font-bold mb-1">이력서 AI 컨설팅</h1>
                <p className="text-sm text-neutral-500">AI가 이력서를 분석하고 개선점을 제안합니다</p>
            </div>

            {/* Score Card */}
            <div className="border border-neutral-200 bg-white p-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e5e5" strokeWidth="8" />
                            <circle
                                cx="50" cy="50" r="42" fill="none" stroke="#171717" strokeWidth="8"
                                strokeDasharray={`${(score / 100) * 264} 264`}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-lg font-bold">{score}</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Bot className="h-4 w-4 text-neutral-900" />
                            <h2 className="text-sm font-semibold">AI 분석 결과</h2>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">
                            종합 점수: <span className="font-bold">{score}/100</span>
                        </p>
                        <div className="flex items-start gap-2">
                            <CheckCircle className="h-3.5 w-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-neutral-500">
                                경영 전략과 브랜드 기획 경험이 풍부합니다. 리더십과 조직 설계 역량이 돋보입니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Improvements */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">개선 포인트 ({appliedCount}/{improvements.length} 적용)</h3>
                <button
                    onClick={applyAll}
                    disabled={applying || appliedCount === improvements.length}
                    className={clsx(
                        "flex items-center gap-1.5 px-3 py-2 text-xs transition-colors",
                        appliedCount === improvements.length
                            ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                            : "bg-neutral-900 text-white hover:bg-neutral-800"
                    )}
                >
                    <Sparkles className="h-3 w-3" />
                    {applying ? "적용 중..." : "전체 적용"}
                </button>
            </div>

            <div className="space-y-4 mb-6">
                {improvements.map((item, idx) => (
                    <div key={item.id} className={clsx(
                        "border bg-white p-5 transition-colors",
                        item.applied ? "border-neutral-300" : "border-neutral-200"
                    )}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 font-medium">{item.category}</span>
                                <div className="flex items-center gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5 text-neutral-400" />
                                    <span className="text-sm font-medium">{item.issue}</span>
                                </div>
                            </div>
                            {item.applied && (
                                <span className="text-xs px-2 py-0.5 bg-neutral-900 text-white">적용 완료</span>
                            )}
                        </div>

                        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-start">
                            <div className="p-3 bg-neutral-50 border border-neutral-100">
                                <p className="text-xs text-neutral-400 mb-1">Before</p>
                                <p className="text-xs text-neutral-500 line-through">{item.before}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-neutral-300 mt-4" />
                            <div className="p-3 bg-neutral-50 border border-neutral-200">
                                <p className="text-xs text-neutral-400 mb-1">After</p>
                                <p className="text-xs text-neutral-900 font-medium">{item.after}</p>
                            </div>
                        </div>

                        {!item.applied && (
                            <div className="mt-3 text-right">
                                <button
                                    onClick={() => toggleApply(item.id)}
                                    className="px-3 py-1.5 text-xs border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                                >
                                    이 항목 적용
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
