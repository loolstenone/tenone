"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  FileText,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  Star,
  Target,
  Zap,
  ChevronRight,
  Award,
  UserCheck,
  Handshake,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

/* ── 인재 파이프라인 단계 ── */
const pipeline = [
  {
    stage: "MAD League",
    label: "발굴",
    desc: "대학 동아리 연합에서 잠재력 있는 인재를 발견합니다",
    icon: GraduationCap,
    color: "bg-orange-100 text-[#D85A30]",
    ring: "ring-[#D85A30]/20",
  },
  {
    stage: "HeRo",
    label: "육성",
    desc: "HIT 진단 + 멘토링 + 커리어 로드맵으로 키웁니다",
    icon: TrendingUp,
    color: "bg-orange-100 text-[#D85A30]",
    ring: "ring-[#D85A30]/40",
  },
  {
    stage: "기업 연결",
    label: "매칭",
    desc: "검증된 인재를 파트너 기업에 연결합니다",
    icon: Building2,
    color: "bg-orange-100 text-[#D85A30]",
    ring: "ring-[#D85A30]/60",
  },
];

/* ── 서비스 3종 ── */
const services = [
  {
    icon: Search,
    title: "HIT 프로그램",
    sub: "Hidden Intelligence Talent",
    desc: "숨겨진 잠재력을 진단하는 통합 역량 평가. AI 기반 분석으로 강점과 성장 포인트를 정밀하게 파악합니다.",
    href: "/hero/hit",
    badge: "인재 발굴",
  },
  {
    icon: FileText,
    title: "Resume Lab",
    sub: "AI 이력서 & 포트폴리오",
    desc: "AI가 이력서를 분석하고, 직무별 맞춤 포트폴리오를 자동 생성합니다. 합격률을 극대화하세요.",
    href: "/hero/resume",
    badge: "퍼스널 브랜딩",
  },
  {
    icon: Briefcase,
    title: "Career Path",
    sub: "C-Level 커리어 로드맵",
    desc: "CMO, CTO, CSO, CBO — 목표 C-Level까지의 체계적 성장 경로를 설계하고 추적합니다.",
    href: "/hero/career",
    badge: "커리어 성장",
  },
];

/* ── 최근 매칭 성과 ── */
const recentMatches = [
  {
    talent: "김서연",
    from: "MAD League 5기",
    role: "브랜드 마케터",
    company: "스타트업 A사",
    status: "입사 확정",
    score: 94,
  },
  {
    talent: "박준호",
    from: "MAD League 4기",
    role: "프로덕트 디자이너",
    company: "IT 대기업 B사",
    status: "최종 합격",
    score: 91,
  },
  {
    talent: "이하나",
    from: "MAD League 5기",
    role: "데이터 분석가",
    company: "핀테크 C사",
    status: "인턴 전환",
    score: 88,
  },
  {
    talent: "최민수",
    from: "MAD League 3기",
    role: "풀스택 개발자",
    company: "AI 스타트업 D사",
    status: "입사 확정",
    score: 96,
  },
];

/* ── 통계 ── */
const stats = [
  { icon: Handshake, value: "100+", label: "매칭 성사", unit: "건" },
  { icon: Building2, value: "50+", label: "파트너 기업", unit: "개" },
  { icon: Users, value: "500+", label: "등록 인재", unit: "명" },
  { icon: Award, value: "92%", label: "매칭 만족도", unit: "" },
];

/* ── 파트너 기업 (가상) ── */
const partners = [
  "카카오", "네이버", "라인", "쿠팡", "토스", "당근",
  "무신사", "마켓컬리", "리디", "왓챠",
];

/* ── Universe 연결 ── */
const universeLinks = [
  { brand: "MAD League", desc: "대학 동아리 연합 — 인재 소스", href: "/madleague", color: "bg-violet-100 text-violet-700" },
  { brand: "Badak", desc: "네트워킹 플랫폼 — 기업 연결", href: "/badak", color: "bg-emerald-100 text-emerald-700" },
  { brand: "ChangeUp", desc: "창업 교육 — 기업가 육성", href: "/changeup", color: "bg-teal-100 text-teal-700" },
  { brand: "RooK", desc: "AI 크리에이터 — 크리에이티브 인재", href: "/rook", color: "bg-blue-100 text-blue-700" },
];

export default function HeRoHomePage() {
  const [hoveredPipeline, setHoveredPipeline] = useState<number | null>(null);

  return (
    <div>
      {/* ━━ Hero Section ━━ */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-amber-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D85A30]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#D85A30]/10 px-4 py-1.5 rounded-full mb-6">
              <Target className="h-4 w-4 text-[#D85A30]" />
              <span className="text-sm font-semibold text-[#D85A30] tracking-wide">
                Hidden Intelligence & Real Opportunity
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              <span className="text-[#D85A30]">발굴</span>하고,{" "}
              <span className="text-[#D85A30]">키우고</span>,{" "}
              <span className="text-[#D85A30]">연결</span>한다
            </h1>

            <p className="text-lg md:text-xl text-neutral-600 leading-relaxed mb-10 max-w-2xl">
              HeRo는 숨겨진 인재를 발견하고, 체계적인 프로그램으로 성장시키며,
              최적의 기업과 연결하는 <strong>인재 파이프라인 플랫폼</strong>입니다.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/hero/hit"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#D85A30] text-white font-bold hover:bg-[#C04E28] transition-colors rounded-xl shadow-lg shadow-[#D85A30]/20"
              >
                HIT 진단 시작하기 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/hero/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-neutral-300 text-neutral-700 font-bold hover:border-[#D85A30] hover:text-[#D85A30] transition-colors rounded-xl"
              >
                HeRo 알아보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Stats Bar ━━ */}
      <section className="bg-[#D85A30]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <s.icon className="h-5 w-5 mb-2 text-white/80" />
                <p className="text-2xl md:text-4xl font-black">
                  {s.value}
                  {s.unit && <span className="text-base font-normal text-white/70 ml-1">{s.unit}</span>}
                </p>
                <p className="text-sm text-white/80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 인재 파이프라인 시각화 ━━ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">인재 파이프라인</h2>
            <p className="text-neutral-500 max-w-xl mx-auto">
              MAD League에서 발굴된 인재가 HeRo를 거쳐 기업에 연결되는 완전한 인재 여정
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {pipeline.map((step, i) => (
              <div
                key={step.stage}
                className={`relative border-2 rounded-2xl p-8 transition-all cursor-default ${
                  hoveredPipeline === i
                    ? "border-[#D85A30] shadow-xl shadow-[#D85A30]/10 scale-[1.02]"
                    : "border-neutral-200 hover:border-[#D85A30]/40"
                }`}
                onMouseEnter={() => setHoveredPipeline(i)}
                onMouseLeave={() => setHoveredPipeline(null)}
              >
                {/* Step number */}
                <div className="absolute -top-4 left-6 bg-[#D85A30] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>

                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-5`}>
                  <step.icon className="h-7 w-7" />
                </div>

                <p className="text-xs font-bold text-[#D85A30] uppercase tracking-wider mb-1">{step.label}</p>
                <h3 className="text-xl font-bold mb-2">{step.stage}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>

                {/* Arrow connector */}
                {i < 2 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <ChevronRight className="h-6 w-6 text-[#D85A30]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 서비스 3종 ━━ */}
      <section className="bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">핵심 서비스</h2>
            <p className="text-neutral-500">인재의 잠재력을 극대화하는 세 가지 솔루션</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((svc) => (
              <Link
                key={svc.href}
                href={svc.href}
                className="group bg-white border border-neutral-200 rounded-2xl p-8 hover:border-[#D85A30] hover:shadow-xl hover:shadow-[#D85A30]/5 transition-all"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#D85A30]/10 text-[#D85A30] flex items-center justify-center">
                    <svc.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-[#D85A30] bg-[#D85A30]/10 px-2.5 py-1 rounded-full">
                    {svc.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1 group-hover:text-[#D85A30] transition-colors">{svc.title}</h3>
                <p className="text-xs text-neutral-400 mb-3">{svc.sub}</p>
                <p className="text-sm text-neutral-500 leading-relaxed">{svc.desc}</p>
                <div className="mt-5 flex items-center gap-1 text-sm text-[#D85A30] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  자세히 보기 <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 최근 매칭 성과 ━━ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">최근 매칭 성과</h2>
              <p className="text-neutral-500">HeRo를 통해 기업과 연결된 인재들</p>
            </div>
            <Link
              href="/hero/career"
              className="inline-flex items-center gap-1 text-sm text-[#D85A30] font-semibold hover:gap-2 transition-all"
            >
              전체 성과 보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentMatches.map((m) => (
              <div
                key={m.talent}
                className="border border-neutral-200 rounded-2xl p-6 hover:border-[#D85A30]/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#D85A30] text-white flex items-center justify-center font-bold text-lg">
                    {m.talent.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{m.talent}</p>
                    <p className="text-xs text-neutral-400">{m.from}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">포지션</span>
                    <span className="font-medium">{m.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">기업</span>
                    <span className="font-medium">{m.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">HIT 점수</span>
                    <span className="font-bold text-[#D85A30]">{m.score}점</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600">{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 파트너 기업 ━━ */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">파트너 기업</h2>
            <p className="text-neutral-500">HeRo 인재와 함께하는 기업들</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {partners.map((p) => (
              <div
                key={p}
                className="px-6 py-3 bg-white border border-neutral-200 rounded-xl text-sm font-medium text-neutral-600 hover:border-[#D85A30]/40 hover:text-[#D85A30] transition-colors"
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Ten:One Universe 연결 ━━ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Ten:One Universe</h2>
            <p className="text-neutral-500">HeRo가 연결하는 생태계</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {universeLinks.map((u) => (
              <Link
                key={u.brand}
                href={u.href}
                className="group border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold mb-4 ${u.color}`}>
                  {u.brand}
                </div>
                <p className="text-sm text-neutral-600 group-hover:text-neutral-900 transition-colors">{u.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-[#D85A30] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  방문하기 <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ CTA ━━ */}
      <section className="bg-gradient-to-r from-[#D85A30] to-[#E8764A]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 text-center">
          <UserCheck className="h-10 w-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
            당신의 HeRo 여정을 시작하세요
          </h2>
          <p className="text-white/80 mb-10 max-w-xl mx-auto text-lg">
            숨겨진 잠재력을 발견하고, 꿈의 커리어를 향해 나아가세요.
            HeRo가 처음부터 끝까지 함께합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/hero/hit"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#D85A30] font-bold hover:bg-orange-50 transition-colors rounded-xl"
            >
              HIT 진단 시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white text-white font-bold hover:bg-white/10 transition-colors rounded-xl"
            >
              회원가입
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
