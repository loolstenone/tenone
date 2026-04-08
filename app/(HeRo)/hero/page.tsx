"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Search,
  Compass,
  Handshake,
  Star,
  Crown,
  Sparkles,
  ChevronRight,
  Users,
  Building2,
  Zap,
} from "lucide-react";

/* ── HeRo Red ── */
const RED = "#E53935";

/* ── 파트너 기업 (서비스 오픈 후 실 파트너로 업데이트 예정) ── */
const partners = [
  "스타트업",
  "중소기업",
  "마케팅 에이전시",
  "테크 스타트업",
  "콘텐츠 기업",
  "이커머스",
  "SaaS 기업",
];

/* ── 서비스 3종 ── */
const services = [
  {
    icon: Search,
    num: "01",
    title: "HIT 통합검사",
    desc: "나를 진단합니다",
    detail:
      "숨겨진 강점과 마케팅 DNA를 분석하는 통합 역량 진단. AI가 당신의 64가지 유형 중 하나를 찾아냅니다.",
    href: "/hero/hit",
  },
  {
    icon: Compass,
    num: "02",
    title: "커리어 코칭",
    desc: "방향을 잡아줍니다",
    detail:
      "CMO, CTO, CSO, CBO — 목표 C-Level까지의 체계적 성장 경로를 전문 멘토와 함께 설계합니다.",
    href: "/hero/coaching",
  },
  {
    icon: Handshake,
    num: "03",
    title: "기업 매칭",
    desc: "무대를 만들어줍니다",
    detail:
      "검증된 인재 프로필을 파트너 기업에 연결합니다. 당신에게 맞는 무대를 찾아드립니다.",
    href: "/hero/for-business",
  },
];

/* ── 영웅의 여정 6단계 ── */
const journey = [
  { label: "Dreamer", icon: Sparkles, desc: "꿈을 품다" },
  { label: "Challenger", icon: Zap, desc: "도전하다" },
  { label: "Trainee", icon: Search, desc: "훈련하다" },
  { label: "Debut", icon: Star, desc: "데뷔하다" },
  { label: "Star", icon: Crown, desc: "빛나다" },
  { label: "Legend", icon: Crown, desc: "전설이 되다" },
];

/* ── 64유형 미리보기 (대표 8개) ── */
const previewTypes = [
  { code: "SCE", name: "전략가", alias: "The Strategist" },
  { code: "CMA", name: "크리에이터", alias: "The Creator" },
  { code: "DMR", name: "데이터 마스터", alias: "The Analyst" },
  { code: "BLR", name: "브랜드 빌더", alias: "The Builder" },
  { code: "GRC", name: "그로스 해커", alias: "The Hacker" },
  { code: "NTW", name: "네트워커", alias: "The Connector" },
  { code: "STR", name: "스토리텔러", alias: "The Storyteller" },
  { code: "PFM", name: "퍼포먼서", alias: "The Performer" },
];

/* ── 파트너 캐러셀 ── */
function PartnerCarousel() {
  const doubled = [...partners, ...partners];
  return (
    <div className="overflow-hidden relative mt-12">
      <div className="flex animate-scroll gap-6">
        {doubled.map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="flex-shrink-0 px-6 py-2.5 bg-neutral-100 text-neutral-500 text-sm font-medium rounded-full whitespace-nowrap"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── 히어로 캐릭터 (랜덤) ── */
const heroChars = [
  { src: "/hero-char-boy.png", alt: "HeRo Male" },
  { src: "/hero-char-girl.png", alt: "HeRo Female" },
];

export default function HeRoHomePage() {
  const [activeJourney, setActiveJourney] = useState(2);
  const [heroChar, setHeroChar] = useState<{ src: string; alt: string } | null>(null);
  useEffect(() => {
    setHeroChar(heroChars[Math.floor(Math.random() * heroChars.length)]);
  }, []);

  /* 자동 여정 단계 순환 */
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveJourney((prev) => (prev + 1) % journey.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white">
      {/* ── 캐러셀 애니메이션 ── */}
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ━━━ 1. Hero Section ━━━ */}
      <section className="relative min-h-screen overflow-hidden bg-white">
        {/* 캐릭터 — 좌하단 고정 */}
        {heroChar && (
          <div className="absolute left-0 bottom-0 z-[1] w-[40%] md:w-[35%] lg:w-[30%] h-[75%]">
            <Image
              src={heroChar.src}
              alt={heroChar.alt}
              fill
              className="object-contain object-left-bottom"
              priority
              sizes="35vw"
            />
          </div>
        )}

        {/* 텍스트 + 버튼 */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="mx-auto max-w-7xl w-full px-6 lg:px-8">
            <div className="ml-auto w-full md:w-[55%] lg:w-[50%] text-center md:text-left md:pl-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 mb-5 leading-tight">
                We believe in
                <br />
                <span style={{ color: RED }}>your talent</span>
              </h1>

              <p className="text-sm md:text-base text-neutral-500 mb-8 leading-relaxed max-w-md mx-auto md:mx-0">
                인재 기획사 HeRo.
                <br />
                당신의 숨겨진 재능을 발견하고, 무대 위에 세웁니다.
              </p>

              <div className="flex flex-wrap justify-center md:justify-start">
                <Link
                  href="/hero/hit"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                  style={{ backgroundColor: RED }}
                >
                  HIT 검사 받기 <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ 2. 한 줄 정의 ━━━ */}
      <section className="py-24 bg-neutral-50">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-neutral-900 mb-4">
            HeRo는{" "}
            <span style={{ color: RED }}>인재 기획사</span>
            입니다.
          </h2>
          <p className="text-lg md:text-xl text-neutral-500 leading-relaxed">
            CMO, CTO, CSO, CBO를 길러냅니다.
          </p>
        </div>
      </section>

      {/* ━━━ 3. 두 고객 ━━━ */}
      <section className="py-0 min-h-[50vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[50vh]">
          {/* 인재 */}
          <div className="relative flex flex-col items-center justify-center px-8 py-20 bg-white group">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: `${RED}10` }}
            >
              <Users className="h-8 w-8" style={{ color: RED }} />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-3">
              인재
            </h3>
            <p className="text-neutral-500 text-center max-w-sm mb-8 leading-relaxed">
              나를 알고, 성장하고, 무대에 서세요.
              <br />
              HeRo가 당신의 커리어를 설계합니다.
            </p>
            <Link
              href="/hero/hit"
              className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-white transition-all hover:scale-[1.02]"
              style={{ backgroundColor: RED }}
            >
              HIT 검사 받기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* 기업 */}
          <div className="relative flex flex-col items-center justify-center px-8 py-20 bg-neutral-900 group">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
              기업
            </h3>
            <p className="text-neutral-400 text-center max-w-sm mb-8 leading-relaxed">
              검증된 마케팅 인재를 만나세요.
              <br />
              HeRo가 최적의 인재를 매칭합니다.
            </p>
            <Link
              href="/hero/for-business"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-neutral-900 transition-all"
            >
              기업 문의 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ 4. 서비스 3가지 ━━━ */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              Services
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-neutral-900">
              세 가지 핵심 서비스
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((svc) => (
              <Link
                key={svc.href}
                href={svc.href}
                className="group relative border border-neutral-200 rounded-2xl p-8 hover:border-[#E53935] hover:shadow-xl transition-all"
              >
                <span
                  className="text-5xl font-black block mb-6"
                  style={{ color: `${RED}15` }}
                >
                  {svc.num}
                </span>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${RED}10` }}
                >
                  <svc.icon className="h-6 w-6" style={{ color: RED }} />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-1 group-hover:text-[#E53935] transition-colors">
                  {svc.title}
                </h3>
                <p className="text-sm font-medium text-neutral-400 mb-4">
                  {svc.desc}
                </p>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  {svc.detail}
                </p>
                <div className="mt-6 flex items-center gap-1 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: RED }}
                >
                  자세히 보기 <ChevronRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 5. 영웅의 여정 미리보기 ━━━ */}
      <section className="py-24 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              Hero&apos;s Journey
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-neutral-900">
              영웅의 여정
            </h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
              꿈꾸는 자에서 전설로. 6단계 성장 로드맵.
            </p>
          </div>

          {/* 타임라인 */}
          <div className="relative">
            {/* 수평 라인 */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-neutral-200" />
            <div
              className="hidden md:block absolute top-8 left-0 h-0.5 transition-all duration-700"
              style={{
                width: `${(activeJourney / (journey.length - 1)) * 100}%`,
                backgroundColor: RED,
              }}
            />

            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 md:gap-4">
              {journey.map((step, i) => {
                const isActive = i === activeJourney;
                const isPast = i < activeJourney;
                return (
                  <button
                    key={step.label}
                    onClick={() => setActiveJourney(i)}
                    className="flex flex-col items-center text-center group cursor-pointer"
                  >
                    {/* 노드 */}
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${
                        isActive
                          ? "scale-110 shadow-lg"
                          : isPast
                          ? ""
                          : "bg-neutral-100"
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: RED, boxShadow: `0 8px 24px ${RED}40` }
                          : isPast
                          ? { backgroundColor: `${RED}20` }
                          : undefined
                      }
                    >
                      <step.icon
                        className={`h-6 w-6 transition-colors ${
                          isActive
                            ? "text-white"
                            : isPast
                            ? ""
                            : "text-neutral-400"
                        }`}
                        style={isPast && !isActive ? { color: RED } : undefined}
                      />
                    </div>
                    <p
                      className={`text-sm font-bold transition-colors ${
                        isActive ? "" : "text-neutral-400"
                      }`}
                      style={isActive || isPast ? { color: RED } : undefined}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs mt-1 transition-colors ${
                        isActive ? "text-neutral-700" : "text-neutral-400"
                      }`}
                    >
                      {step.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/hero/journey"
              className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
              style={{ color: RED }}
            >
              자세히 보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ 6. 64유형 미리보기 ━━━ */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <p
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: RED }}
            >
              64 Types
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-neutral-900">
              64가지 마케팅 유형
            </h2>
            <p className="text-neutral-500 mt-3">
              당신은 어떤 유형일까요?
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewTypes.map((t) => (
              <div
                key={t.code}
                className="border border-neutral-200 rounded-2xl p-6 text-center hover:border-[#E53935] hover:shadow-md transition-all group cursor-default"
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-sm font-bold"
                  style={{
                    backgroundColor: `${RED}10`,
                    color: RED,
                  }}
                >
                  {t.code}
                </div>
                <p className="font-bold text-neutral-900 group-hover:text-[#E53935] transition-colors">
                  {t.name}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{t.alias}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/hero/hit"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 font-bold rounded-xl hover:text-white transition-all"
              style={{
                borderColor: RED,
                color: RED,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = RED;
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = RED;
              }}
            >
              나의 유형은? <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━━ 7. CTA ━━━ */}
      <section style={{ backgroundColor: RED }}>
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            당신의 무대를 찾을 준비가 되셨나요?
          </h2>
          <p className="text-white/70 mb-12 max-w-xl mx-auto text-lg leading-relaxed">
            HIT 검사로 나를 알고, 코칭으로 성장하고, 매칭으로 무대에 서세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/hero/hit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white font-bold rounded-xl hover:bg-neutral-100 transition-colors"
              style={{ color: RED }}
            >
              HIT 무료 검사 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hero/coaching"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              HeRo 오디션 지원
            </Link>
            <Link
              href="/hero/for-business"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/50 text-white/90 font-bold rounded-xl hover:border-white hover:text-white transition-colors"
            >
              기업 문의
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
