"use client";

import { BookOpen, Video, FileText, ExternalLink } from "lucide-react";

const courses = [
    {
        category: "업무 도구",
        items: [
            { title: "Intra Portal 사용법", desc: "CRM, Workflow, Marketing 모듈 전체 가이드", type: "문서", duration: "30분", level: "필수" },
            { title: "GPR 시스템 가이드", desc: "Goal-Planning-Result 평가 시스템 작성 및 활용법", type: "문서", duration: "20분", level: "필수" },
            { title: "칸반 보드 워크플로우", desc: "Studio 워크플로우의 태스크 관리 및 자동화", type: "문서", duration: "15분", level: "필수" },
            { title: "CRM 연락처 관리", desc: "People, Organizations, Deals 관리 실무", type: "문서", duration: "20분", level: "권장" },
        ],
    },
    {
        category: "브랜드 & 기획",
        items: [
            { title: "Ten:One Universe 이해하기", desc: "10개 브랜드의 관계, 카테고리, 역할 이해", type: "문서", duration: "40분", level: "필수" },
            { title: "브랜드 기획서 작성법", desc: "새 브랜드/프로젝트 기획 시 필수 항목과 프로세스", type: "문서", duration: "25분", level: "권장" },
            { title: "콘텐츠 파이프라인", desc: "아이디어 → 기획 → 제작 → 배포의 전체 흐름", type: "문서", duration: "20분", level: "권장" },
        ],
    },
    {
        category: "마케팅",
        items: [
            { title: "캠페인 기획 & 실행", desc: "Marketing 모듈로 캠페인 생성, 리드 관리, 성과 분석", type: "문서", duration: "30분", level: "권장" },
            { title: "리드 파이프라인 관리", desc: "리드 발굴부터 전환까지의 단계별 관리법", type: "문서", duration: "20분", level: "선택" },
            { title: "데이터 기반 의사결정", desc: "Analytics 대시보드 읽는 법과 인사이트 도출", type: "문서", duration: "25분", level: "선택" },
        ],
    },
    {
        category: "협업 & 커뮤니케이션",
        items: [
            { title: "효과적인 비동기 커뮤니케이션", desc: "슬랙 에티켓, 문서화 습관, 피드백 방법", type: "문서", duration: "15분", level: "필수" },
            { title: "회의 문화", desc: "스탠드업, 위클리, 회고 미팅 가이드", type: "문서", duration: "10분", level: "필수" },
        ],
    },
];

const levelColors: Record<string, string> = {
    "필수": "bg-red-50 text-red-600",
    "권장": "bg-blue-50 text-blue-600",
    "선택": "bg-neutral-100 text-neutral-500",
};

export default function EducationPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <h1 className="text-2xl font-bold">Education</h1>
                <p className="mt-2 text-neutral-500">
                    업무에 필요한 도구, 프로세스, 브랜드 이해를 위한 교육 자료입니다.
                </p>
            </div>

            {/* Progress Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="border border-neutral-200 bg-white p-5 text-center">
                    <p className="text-3xl font-bold">{courses.reduce((sum, c) => sum + c.items.length, 0)}</p>
                    <p className="text-xs text-neutral-500 mt-1">전체 교육</p>
                </div>
                <div className="border border-neutral-200 bg-white p-5 text-center">
                    <p className="text-3xl font-bold">{courses.reduce((sum, c) => sum + c.items.filter(i => i.level === '필수').length, 0)}</p>
                    <p className="text-xs text-neutral-500 mt-1">필수 교육</p>
                </div>
                <div className="border border-neutral-200 bg-white p-5 text-center">
                    <p className="text-3xl font-bold">{courses.reduce((sum, c) => sum + c.items.reduce((s, i) => s + parseInt(i.duration), 0), 0)}분</p>
                    <p className="text-xs text-neutral-500 mt-1">총 소요 시간</p>
                </div>
            </div>

            {/* Course Sections */}
            {courses.map(section => (
                <section key={section.category} className="space-y-3">
                    <h2 className="text-lg font-bold">{section.category}</h2>
                    <div className="space-y-2">
                        {section.items.map(item => (
                            <div key={item.title} className="border border-neutral-200 bg-white p-5 flex items-center justify-between hover:border-neutral-300 transition-colors cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-neutral-50 rounded">
                                        <FileText className="h-4 w-4 text-neutral-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold">{item.title}</h3>
                                        <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-xs text-neutral-400">{item.duration}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${levelColors[item.level]}`}>
                                        {item.level}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}
