"use client";

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
        desc: "AI가 이력서를 분석하여 개선점을 자동으로 제안합니다.",
        icon: Bot,
    },
    {
        title: "Before/After 비교",
        desc: "개선 전후를 나란히 비교하여 명확한 차이를 보여줍니다.",
        icon: Eye,
    },
    {
        title: "전문가 1:1 컨설팅",
        desc: "AI 분석 결과를 바탕으로 전문 컨설턴트가 피드백합니다.",
        icon: Sparkles,
    },
    {
        title: "맞춤 템플릿 제공",
        desc: "직무별 최적화된 이력서 템플릿을 제공합니다.",
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

const plans = [
    {
        name: "AI 기본 분석",
        price: "무료",
        features: ["AI 종합 점수", "개선 포인트 3개", "기본 피드백"],
        highlight: false,
    },
    {
        name: "AI 프리미엄",
        price: "29,000원",
        features: ["AI 종합 점수", "개선 포인트 무제한", "Before/After 비교", "맞춤 템플릿"],
        highlight: true,
    },
    {
        name: "전문가 컨설팅",
        price: "89,000원",
        features: ["AI 프리미엄 전체 포함", "전문가 1:1 피드백", "화상 컨설팅 30분", "수정 후 재검토"],
        highlight: false,
    },
];

export default function ResumePage() {
    return (
        <div>
            {/* Hero */}
            <section className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-amber-500" />
                            <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">
                                Resume Consulting
                            </span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            이력서를<br />
                            <span className="text-amber-500">완벽하게</span> 다듬습니다
                        </h1>
                        <p className="text-lg text-neutral-600 mb-8">
                            AI 분석과 전문가 컨설팅을 통해 이력서의 완성도를 높이세요.
                            Before/After 비교로 명확한 개선 효과를 확인할 수 있습니다.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-lg"
                        >
                            이력서 분석 신청 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">컨설팅 서비스</h2>
                        <p className="text-neutral-500">AI + 전문가가 함께하는 이력서 컨설팅</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {consultingFeatures.map((f) => (
                            <div key={f.title} className="border border-neutral-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors">
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                        <h2 className="text-3xl font-bold mb-3">Before / After 사례</h2>
                        <p className="text-neutral-500">실제 개선 사례를 확인하세요</p>
                    </div>
                    <div className="max-w-3xl mx-auto space-y-6">
                        {beforeAfterExamples.map((ex) => (
                            <div key={ex.category} className="bg-white border border-neutral-200 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                                        {ex.category}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                        <p className="text-xs text-red-400 mb-1 font-medium">Before</p>
                                        <p className="text-sm text-neutral-500 line-through">{ex.before}</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-amber-400 hidden md:block mt-4" />
                                    <div className="p-4 bg-green-50 border border-green-100 rounded-lg">
                                        <p className="text-xs text-green-500 mb-1 font-medium">After</p>
                                        <p className="text-sm text-neutral-900 font-medium">{ex.after}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-bold mb-3">이용 요금</h2>
                        <p className="text-neutral-500">필요에 맞는 플랜을 선택하세요</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`border rounded-xl p-6 ${plan.highlight ? "border-amber-400 ring-2 ring-amber-200 bg-amber-50" : "border-neutral-200"}`}
                            >
                                {plan.highlight && (
                                    <span className="text-xs px-2.5 py-0.5 bg-amber-500 text-white rounded-full font-medium mb-3 inline-block">
                                        추천
                                    </span>
                                )}
                                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                                <p className="text-2xl font-extrabold text-amber-600 mb-4">{plan.price}</p>
                                <ul className="space-y-2 mb-6">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                            <span className="text-sm text-neutral-600">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/signup"
                                    className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${plan.highlight ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"}`}
                                >
                                    신청하기
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-2xl font-bold mb-3">이력서를 분석해보세요</h2>
                    <p className="text-neutral-500 mb-8">AI 기본 분석은 무료로 이용할 수 있습니다</p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-lg"
                    >
                        무료 분석 시작 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
