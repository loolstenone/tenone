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
import NewsletterSubscribeForm from '@/components/newsletter/NewsletterSubscribeForm';

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
    title: "써치 라이트",
    desc: "기업–인재를 연결합니다",
    detail:
      "검증된 인재 프로필과 기업의 실제 고민을 Tetrad 매칭으로 연결합니다. 양쪽 모두에게 맞는 무대를 찾아드립니다.",
    href: "/hero/search-light",
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

/* ── 64유형 미리보기 (대표 8개 · hit_hero_types 실제 데이터 기반) ── */
const previewTypes = [
  { code: "D-ENTJ", name: "큰 그림을 짜는 경영 전략가", alias: "The Global Executive" },
  { code: "I-ENFP", name: "마음을 여는 이야기꾼", alias: "The Brand Storyteller" },
  { code: "S-ISFJ", name: "자리에서 빛을 내는 헌신가", alias: "The Devoted Caregiver" },
  { code: "C-INTJ", name: "철저히 설계하는 전략가", alias: "The Precision Architect" },
  { code: "D-ENFP", name: "열정으로 새 판을 여는 개척자", alias: "The Founder Evangelist" },
  { code: "I-INFJ", name: "깊은 통찰로 곁을 지키는 상담가", alias: "The Quiet Counselor" },
  { code: "S-INTJ", name: "긴 호흡으로 쌓는 지식 보유자", alias: "The Knowledge Keeper" },
  { code: "C-ISTP", name: "관찰로 문제를 푸는 엔지니어", alias: "The Analytic Engineer" },
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
                당신의 숨겨진 재능을 발견하고, 멋진 무대를 찾습니다.
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
              href="/hero/search-light"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-neutral-900 transition-all"
            >
              인재 찾기 (써치 라이트) <ArrowRight className="h-4 w-4" />
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
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-neutral-100">
                  <svc.icon className="h-6 w-6 text-neutral-500" />
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
            <p className="text-sm font-bold uppercase tracking-widest mb-3 text-neutral-500">
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
            <p className="text-sm font-bold uppercase tracking-widest mb-3 text-neutral-500">
              64 Types
            </p>
            <h2 className="text-2xl md:text-4xl font-bold text-neutral-900">
              64가지 영웅 유형
            </h2>
            <p className="text-neutral-500 mt-3">
              DISC × MBTI 조합으로 당신만의 커리어 원형을 찾아드립니다.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewTypes.map((t) => (
              <Link
                key={t.code}
                href="/hero/hit"
                className="border border-neutral-200 rounded-2xl p-6 text-center hover:border-[#E53935] hover:shadow-md transition-all group"
              >
                <div
                  className="inline-flex px-3 h-7 items-center rounded-full mx-auto mb-4 text-[11px] font-mono font-bold"
                  style={{
                    backgroundColor: `${RED}10`,
                    color: RED,
                  }}
                >
                  {t.code}
                </div>
                <p className="text-sm font-bold text-neutral-900 group-hover:text-[#E53935] transition-colors leading-snug">
                  {t.name}
                </p>
                <p className="text-xs text-neutral-400 mt-1">{t.alias}</p>
              </Link>
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

      {/* ── 뉴스레터 구독 ── */}
      <section className="py-16 px-6 border-t border-neutral-200">
        <NewsletterSubscribeForm source="hero" brandName="HeRo" accentColor="#E53935" />
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
              href="/hero/talent-agent/apply"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
            >
              HeRo 오디션 지원 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hero/search-light"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/50 text-white/90 font-bold rounded-xl hover:border-white hover:text-white transition-colors"
            >
              기업 문의 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
