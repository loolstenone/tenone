"use client";

import { useState } from "react";
import Link from "next/link";
import {
    TrendingUp,
    Zap,
    Target,
    ArrowRight,
    ChevronRight,
    BarChart3,
    Briefcase,
    GraduationCap,
    Crown,
    Users,
    Star,
    MessageCircle,
    Sparkles,
    FolderOpen,
    Globe,
    Camera,
    CheckCircle,
    Palette,
} from "lucide-react";
import clsx from "clsx";

/* ── HeRo Red accent ── */
const HERO_RED = "#E53935";

/* ===== Tab definitions ===== */
const tabs = [
    { id: "career", label: "커리어 코칭" },
    { id: "mentor", label: "멘토 매칭" },
    { id: "branding", label: "퍼스널 브랜딩" },
] as const;

type TabId = (typeof tabs)[number]["id"];

/* ===== Career data ===== */
const tracks = [
    {
        code: "CMO",
        fullName: "Chief Marketing Officer",
        desc: "마케팅 / 브랜드",
        icon: BarChart3,
        levels: ["마케팅 인턴", "마케팅 매니저", "마케팅 디렉터", "CMO"],
        skills: ["SNS 운영", "퍼포먼스 마케팅", "브랜드 전략", "팀 리딩"],
    },
    {
        code: "CTO",
        fullName: "Chief Technology Officer",
        desc: "기술 / 개발",
        icon: Zap,
        levels: ["주니어 개발자", "시니어 개발자", "테크 리드", "CTO"],
        skills: ["프로그래밍", "아키텍처 설계", "기술 전략", "R&D 총괄"],
    },
    {
        code: "CSO",
        fullName: "Chief Strategy Officer",
        desc: "전략 / 기획",
        icon: Target,
        levels: ["전략 기획 사원", "전략 기획 매니저", "전략 디렉터", "CSO"],
        skills: ["시장 분석", "사업 모델링", "포트폴리오 전략", "비전 설계"],
    },
    {
        code: "CBO",
        fullName: "Chief Business Officer",
        desc: "사업 / 영업",
        icon: Briefcase,
        levels: ["영업 사원", "사업개발 매니저", "사업 디렉터", "CBO"],
        skills: ["고객 관리", "파트너십", "사업 총괄", "해외 확장"],
    },
];

const stages = [
    { icon: GraduationCap, label: "Entry", desc: "입문 단계", color: "bg-red-100 text-red-700" },
    { icon: Briefcase, label: "Growth", desc: "성장 단계", color: "bg-red-200 text-red-800" },
    { icon: TrendingUp, label: "Senior", desc: "시니어 단계", color: "bg-red-300 text-white" },
    { icon: Crown, label: "C-Level", desc: "경영진 단계", color: "text-white", bg: HERO_RED },
];

/* ===== Mentor data ===== */
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

const mentorCategories = ["전체", "경영전략", "마케팅", "기술", "리더십", "투자", "디자인"];

const programSteps = [
    { step: 1, title: "HIT 진단 완료", desc: "인재 진단 결과를 기반으로 멘토가 매칭됩니다" },
    { step: 2, title: "멘토 선택", desc: "추천 멘토 중 희망하는 멘토를 선택합니다" },
    { step: 3, title: "1:1 멘토링", desc: "월 2회 온/오프라인 멘토링 세션을 진행합니다" },
    { step: 4, title: "성장 리포트", desc: "멘토링 종료 후 성장 리포트를 받습니다" },
];

/* ===== Branding data ===== */
const brandingPrograms = [
    {
        icon: Sparkles,
        title: "HeRo 캐릭터",
        desc: "HIT 진단 결과 기반 나만의 퍼스널 브랜드 캐릭터를 생성합니다.",
        features: ["DISC 기반 성격 유형", "강점 키워드", "브랜드 스토리", "비주얼 캐릭터"],
    },
    {
        icon: FolderOpen,
        title: "포트폴리오 제작",
        desc: "프로젝트 경험을 체계적으로 정리한 전문 포트폴리오를 제작합니다.",
        features: ["프로젝트 하이라이트", "성과 시각화", "디자인 템플릿", "PDF 내보내기"],
    },
    {
        icon: Globe,
        title: "SNS 브랜딩",
        desc: "LinkedIn, Instagram 등 소셜 미디어 프로필을 최적화합니다.",
        features: ["프로필 컨설팅", "콘텐츠 전략", "해시태그 전략", "인사이트 분석"],
    },
    {
        icon: Camera,
        title: "프로필 촬영",
        desc: "전문 프로필 사진 촬영 및 보정 서비스를 제공합니다.",
        features: ["전문 스튜디오 촬영", "리터칭 포함", "다양한 컨셉", "SNS/이력서 최적화"],
    },
];

const brandingProcess = [
    { step: 1, title: "진단 분석", desc: "HIT 결과로 브랜드 DNA 추출" },
    { step: 2, title: "키워드 도출", desc: "나만의 브랜드 키워드 정의" },
    { step: 3, title: "스토리 구성", desc: "브랜드 스토리 및 비전 정리" },
    { step: 4, title: "비주얼 제작", desc: "포트폴리오/프로필 제작" },
    { step: 5, title: "채널 배포", desc: "SNS 및 구직 플랫폼 최적화" },
];

/* ================================================================
   Coaching Page
   ================================================================ */
export default function CoachingPage() {
    const [activeTab, setActiveTab] = useState<TabId>("career");
    const [selectedCategory, setSelectedCategory] = useState("전체");

    const filteredMentors =
        selectedCategory === "전체"
            ? mentors
            : mentors.filter(
                  (m) =>
                      m.field.includes(selectedCategory) ||
                      m.tags.some((t) => t.includes(selectedCategory))
              );

    return (
        <div>
            {/* ── Page Hero ── */}
            <section className="bg-gradient-to-br from-red-50 via-white to-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="h-5 w-5" style={{ color: HERO_RED }} />
                            <span
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: HERO_RED }}
                            >
                                HeRo Coaching
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                            커리어, 멘토링, 브랜딩을
                            <br />
                            <span style={{ color: HERO_RED }}>하나의 코칭</span>으로
                        </h1>
                        <p className="text-lg text-neutral-600 mb-8">
                            HIT 진단 결과를 기반으로 커리어 설계, 전문가 멘토 매칭,
                            퍼스널 브랜딩까지 통합 코칭 프로그램을 제공합니다.
                        </p>
                        <Link
                            href="/hero/hit"
                            className="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                            style={{ backgroundColor: HERO_RED }}
                        >
                            HIT 진단 시작하기 <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Tab Navigation ── */}
            <div className="sticky top-0 z-30 bg-white border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex gap-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={clsx(
                                    "relative px-6 py-4 text-sm font-semibold transition-colors",
                                    activeTab === tab.id
                                        ? "text-neutral-900"
                                        : "text-neutral-400 hover:text-neutral-600"
                                )}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span
                                        className="absolute bottom-0 left-0 right-0 h-0.5"
                                        style={{ backgroundColor: HERO_RED }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Tab Content ── */}
            {activeTab === "career" && <CareerSection />}
            {activeTab === "mentor" && (
                <MentorSection
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    filteredMentors={filteredMentors}
                />
            )}
            {activeTab === "branding" && <BrandingSection />}

            {/* ── Unified CTA ── */}
            <section style={{ backgroundColor: HERO_RED }}>
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 text-center">
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-3">
                        지금 HeRo 코칭을 시작하세요
                    </h2>
                    <p className="text-red-100 mb-8">
                        HIT 진단 한 번이면 커리어 설계, 멘토 매칭, 브랜딩까지 모두 연결됩니다
                    </p>
                    <Link
                        href="/hero/hit"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-white font-bold rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: HERO_RED }}
                    >
                        HIT 진단 시작하기 <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </div>
    );
}

/* ================================================================
   Section 1: Career Coaching
   ================================================================ */
function CareerSection() {
    return (
        <>
            {/* Growth Stages */}
            <section className="bg-white border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <h3 className="text-lg font-bold mb-6">성장 단계</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stages.map((stage, i) => (
                            <div key={stage.label} className="flex items-center gap-3">
                                <div
                                    className={clsx(
                                        "w-10 h-10 rounded-lg flex items-center justify-center",
                                        stage.color
                                    )}
                                    style={stage.bg ? { backgroundColor: stage.bg } : undefined}
                                >
                                    <stage.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{stage.label}</p>
                                    <p className="text-xs text-neutral-400">{stage.desc}</p>
                                </div>
                                {i < 3 && (
                                    <ChevronRight className="h-4 w-4 text-neutral-300 hidden md:block ml-auto" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tracks */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">직무별 경로</h2>
                        <p className="text-neutral-500">
                            4가지 C-Level 트랙에서 나의 경로를 선택하세요
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {tracks.map((track) => (
                            <div
                                key={track.code}
                                className="border border-neutral-200 rounded-xl p-6 hover:border-red-300 transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div
                                        className="w-12 h-12 text-white rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: HERO_RED }}
                                    >
                                        <track.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold px-2 py-0.5 bg-neutral-900 text-white rounded">
                                                {track.code}
                                            </span>
                                            <h3 className="text-base font-bold">
                                                {track.fullName}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-neutral-400">{track.desc}</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-xs text-neutral-400 mb-2">성장 경로</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {track.levels.map((level, i) => (
                                            <span
                                                key={level}
                                                className="flex items-center gap-1.5"
                                            >
                                                <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                                                    {level}
                                                </span>
                                                {i < track.levels.length - 1 && (
                                                    <ChevronRight className="h-3 w-3 text-neutral-300" />
                                                )}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-neutral-400 mb-2">핵심 역량</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {track.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="text-xs px-2 py-0.5 bg-red-50 rounded-full"
                                                style={{ color: HERO_RED }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* HIT recommendation note */}
                    <div className="mt-10 p-4 bg-red-50 rounded-lg border border-red-100 text-center">
                        <p className="text-sm text-neutral-700">
                            <span className="font-bold" style={{ color: HERO_RED }}>
                                HIT 진단
                            </span>
                            을 완료하면 AI가 나에게 맞는 트랙과 현재 단계를 추천합니다
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}

/* ================================================================
   Section 2: Mentor Matching
   ================================================================ */
function MentorSection({
    selectedCategory,
    setSelectedCategory,
    filteredMentors,
}: {
    selectedCategory: string;
    setSelectedCategory: (v: string) => void;
    filteredMentors: Mentor[];
}) {
    return (
        <>
            {/* Program Steps */}
            <section className="bg-white border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <h3 className="text-lg font-bold mb-6">멘토링 프로세스</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {programSteps.map((s) => (
                            <div key={s.step} className="flex items-start gap-3">
                                <div
                                    className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                    style={{ backgroundColor: HERO_RED }}
                                >
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

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 justify-center mb-10">
                        {mentorCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={clsx(
                                    "px-4 py-2 text-sm rounded-full transition-colors",
                                    selectedCategory === cat
                                        ? "text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                )}
                                style={
                                    selectedCategory === cat
                                        ? { backgroundColor: HERO_RED }
                                        : undefined
                                }
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Mentor Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...filteredMentors]
                            .sort((a, b) => b.matchScore - a.matchScore)
                            .map((mentor) => (
                                <div
                                    key={mentor.id}
                                    className="border border-neutral-200 rounded-xl p-6 hover:border-red-300 transition-colors"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 bg-red-50 flex items-center justify-center rounded-full text-lg font-bold flex-shrink-0"
                                            style={{ color: HERO_RED }}
                                        >
                                            {mentor.photo}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-base font-bold">
                                                    {mentor.name}
                                                </h3>
                                                <div className="flex items-center gap-0.5">
                                                    <Star
                                                        className="h-3 w-3"
                                                        style={{ color: HERO_RED, fill: HERO_RED }}
                                                    />
                                                    <span className="text-xs font-bold text-neutral-600">
                                                        {mentor.matchScore}
                                                    </span>
                                                </div>
                                            </div>
                                            <p
                                                className="text-xs mb-1"
                                                style={{ color: HERO_RED }}
                                            >
                                                {mentor.field}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {mentor.career}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {mentor.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                                        style={{ color: HERO_RED }}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        멘토링 신청
                                    </button>
                                </div>
                            ))}
                    </div>
                </div>
            </section>
        </>
    );
}

/* ================================================================
   Section 3: Personal Branding
   ================================================================ */
function BrandingSection() {
    return (
        <>
            {/* Branding Process */}
            <section className="bg-white border-b border-neutral-200">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                    <h3 className="text-lg font-bold mb-6">브랜딩 프로세스</h3>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {brandingProcess.map((p, i) => (
                            <div key={p.step} className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 text-white rounded-full flex items-center justify-center text-xs font-bold"
                                        style={{ backgroundColor: HERO_RED }}
                                    >
                                        {p.step}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">{p.title}</p>
                                        <p className="text-xs text-neutral-400">{p.desc}</p>
                                    </div>
                                </div>
                                {i < brandingProcess.length - 1 && (
                                    <ArrowRight className="h-3 w-3 text-neutral-300 hidden sm:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Programs */}
            <section className="bg-white">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">브랜딩 프로그램</h2>
                        <p className="text-neutral-500">
                            4가지 프로그램으로 나만의 브랜드를 구축하세요
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {brandingPrograms.map((prog) => (
                            <div
                                key={prog.title}
                                className="border border-neutral-200 rounded-xl p-6 hover:border-red-300 transition-colors"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center"
                                        style={{ color: HERO_RED }}
                                    >
                                        <prog.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{prog.title}</h3>
                                        <p className="text-xs text-neutral-500">{prog.desc}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {prog.features.map((f) => (
                                        <div key={f} className="flex items-center gap-2">
                                            <CheckCircle
                                                className="h-3.5 w-3.5 flex-shrink-0"
                                                style={{ color: HERO_RED }}
                                            />
                                            <span className="text-xs text-neutral-600">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sample Character */}
            <section className="bg-neutral-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20">
                    <div className="text-center mb-14">
                        <h2 className="text-xl md:text-3xl font-bold mb-3">HeRo 캐릭터 예시</h2>
                        <p className="text-neutral-500">
                            HIT 진단 결과를 기반으로 생성되는 캐릭터
                        </p>
                    </div>
                    <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-xl p-8">
                        <div className="flex items-start gap-5 mb-6">
                            <div
                                className="w-20 h-20 text-white flex items-center justify-center rounded-xl flex-shrink-0"
                                style={{ backgroundColor: HERO_RED }}
                            >
                                <Sparkles className="h-8 w-8" />
                            </div>
                            <div>
                                <p
                                    className="text-xs uppercase tracking-wider mb-1"
                                    style={{ color: HERO_RED }}
                                >
                                    HeRo Character
                                </p>
                                <h3 className="text-xl font-bold mb-1">
                                    비전을 제시하는 전략가
                                </h3>
                                <p className="text-sm text-neutral-500 italic mb-3">
                                    The Visionary Strategist
                                </p>
                                <p className="text-sm text-neutral-600">
                                    큰 그림을 그리고, 사람을 모으며, 세계관을 설계하는 리더형
                                    인재.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span
                                className="text-xs px-3 py-1 text-white rounded-full"
                                style={{ backgroundColor: HERO_RED }}
                            >
                                ENTJ
                            </span>
                            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                                D 주도성
                            </span>
                            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                                전략적 사고 92점
                            </span>
                            <span className="text-xs px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full">
                                리더십 90점
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {["#전략", "#연결", "#세계관", "#AI", "#브랜드", "#리더십"].map(
                                (kw) => (
                                    <span
                                        key={kw}
                                        className="text-xs px-2.5 py-1 bg-red-50 rounded-full font-medium"
                                        style={{ color: HERO_RED }}
                                    >
                                        {kw}
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
