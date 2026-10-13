"use client";

import { PageHero } from "@/features/hero/PageHero";
import Link from "next/link";
import {
    FileText,
    Bot,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Sparkles,
    Download,
    Eye,
} from "lucide-react";

const consultingFeatures = [
    {
        title: "AI 분석 엔진",
        desc: "AI가 이력서를 읽고 고칠 점을 알려 드립니다.",
        icon: Bot,
    },
    {
        title: "고치기 전·후 비교",
        desc: "고치기 전과 후를 나란히 놓고 무엇이 달라졌는지 보여 드립니다.",
        icon: Eye,
    },
    {
        title: "전문가 1:1 컨설팅",
        desc: "AI 분석을 바탕으로 전문 컨설턴트가 직접 의견을 드립니다.",
        icon: Sparkles,
    },
    {
        title: "맞춤 템플릿 제공",
        desc: "직무에 맞는 이력서 양식을 드립니다.",
        icon: Download,
    },
];

const beforeAfterExamples = [
    {
        category: "자기소개",
        before: "새로운 가치를 창출하는 것이 목표입니다.",
        after: "10개 대학, 50개 브랜드를 연결하여 200명의 인재 풀을 구축했습니다.",
    },
    {
        category: "프로젝트",
        before: "기획 총괄 / 디렉터",
        after: "전략 기획 PM: 브랜드 아키텍처 설계, 5개 부문 조직 구조 수립, 파트너십 10건 체결",
    },
    {
        category: "경력",
        before: "멀티 브랜드 생태계 총괄",
        after: "멀티 브랜드 생태계 총괄 (9개 브랜드 런칭, MAU 15K 달성, 팀원 12명 리딩)",
    },
];


export default function ResumePage() {
    return (
        <div>
            {/* Hero */}
            <PageHero
                label="이력서 컨설팅"
                title={<>이력서를<br />한 단계 더 다듬습니다</>}
                desc="AI 분석과 전문가 의견으로 이력서를 더 좋게 고쳐 보세요. 고치기 전과 후를 비교해 무엇이 나아졌는지 바로 확인할 수 있습니다."
                cta={{ label: "이력서 등록·분석 신청", href: "/hero/resume/workspace" }}
            />

            {/* Features */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">컨설팅 서비스</h2>
                        <p className="text-neutral-500">AI와 전문가가 함께 보는 이력서 컨설팅</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {consultingFeatures.map((f) => (
                            <div key={f.title} className="border border-neutral-200 rounded-xs p-6 text-center hover:border-neutral-300 transition-colors">
                                <div className="w-12 h-12 bg-neutral-50 text-neutral-600 rounded-xs flex items-center justify-center mx-auto mb-4">
                                    <f.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-sm font-bold mb-2">{f.title}</h3>
                                <p className="text-xs text-neutral-500">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Before/After */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">고치기 전·후 예시</h2>
                        <p className="text-neutral-500">이렇게 달라질 수 있습니다 (이해를 돕기 위한 예시)</p>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {beforeAfterExamples.map((ex) => (
                            <div key={ex.category} className="bg-white border border-neutral-200 rounded-xs p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-none font-normal">
                                        {ex.category}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-xs">
                                        <p className="text-xs text-red-400 mb-1 font-normal">고치기 전</p>
                                        <p className="text-sm text-neutral-500 line-through">{ex.before}</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-neutral-400 hidden md:block mt-4" />
                                    <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-xs">
                                        <p className="text-xs text-neutral-500 mb-1 font-normal">고친 후</p>
                                        <p className="text-sm text-neutral-900 font-normal">{ex.after}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 요금 안내 없음 — 통신판매업 신고 전 가격 정보는 화면·소스 어디에도 두지 않는다 (2026-10-13). 사업 시작 시 git 이력에서 복원 */}

            {/* CTA */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-2xl font-bold mb-3">이력서를 분석해보세요</h2>
                    <p className="text-neutral-500 mb-8">이력서를 올리면 AI가 먼저 살펴봅니다</p>
                    <Link
                        href="/hero/resume/workspace"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-500 text-white font-normal hover:bg-neutral-600 transition-colors rounded-xs"
                    >
                        이력서 등록하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
