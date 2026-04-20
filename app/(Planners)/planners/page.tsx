"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  BookOpen,
  Target,
  PenTool,
  BarChart3,
} from "lucide-react";
import NewsletterSubscribeForm from '@/components/newsletter/NewsletterSubscribeForm';

// ===== Hero Section =====
function HeroSection() {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 py-20 md:py-28">
      <div className="max-w-3xl">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#1a1a1a] leading-tight tracking-tight">
          우리는 모두 기획자다
        </h1>
        <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-[#1a1a1a] mt-2 leading-tight tracking-tight">
          적어도, 자기 인생에서만큼은.
        </p>

        <div className="mt-12 md:mt-16 space-y-4 text-[#1a1a1a] text-lg md:text-xl leading-relaxed max-w-2xl">
          <p className="font-medium">인공지능 시대, 더욱 기획자가 되어야 한다.</p>
          <div className="mt-6 space-y-3 text-base md:text-lg text-[#444]">
            <p>AI가 글을 쓰고, 코드를 짜고, 디자인을 만든다.</p>
            <p>그런데 — 무엇을 쓸지, 왜 만들지, 어디로 갈지는 누가 정하는가?</p>
            <p className="text-[#1a1a1a] font-medium mt-4">기획자다.</p>
            <p className="mt-4">AI가 실행을 대신할수록,</p>
            <p>방향을 정하는 힘이 곧 경쟁력이다.</p>
          </div>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link
            href="/planners/planning"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white text-sm tracking-wide hover:bg-[#333] transition-colors"
          >
            기획자가 되는 법
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/planners/planner-tool"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-sm tracking-wide hover:bg-[#f5f5f5] transition-colors"
          >
            도구부터 받기
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="mt-20 flex justify-center">
        <a href="#about" className="text-[#999] hover:text-[#1a1a1a] transition-colors">
          <ArrowDown size={20} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}

// ===== About Section =====
function AboutSection() {
  return (
    <section id="about" className="px-6 md:px-16 lg:px-24 py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">
          Planner&apos;s는
        </h2>

        <div className="mt-12 space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
          <p>Planner&apos;s는 기획자를 위한 브랜드다.</p>
          <p className="mt-4 text-[#444]">도구를 주고,</p>
          <p className="text-[#444]">프레임을 가르치고,</p>
          <p className="text-[#444]">실전에서 증명한다.</p>
        </div>

        <div className="mt-12 space-y-3 text-[#444] text-sm md:text-base leading-relaxed max-w-2xl">
          <p>2004년, 한 사람이 혼자서 트렌드 분석 사이트를 만들었다.</p>
          <p>기술이 따라오지 못했다. 혼자서는 한계가 있었다.</p>
          <p className="mt-4">22년이 지나 AI가 도래했다.</p>
          <p>그때 시작한 것이 드디어 가능해졌다.</p>
          <p className="mt-4 text-[#1a1a1a]">Planner&apos;s는 그 22년의 결과물이다.</p>
          <p>20년 넘게 현장에서 기획하고, 실행하고, 검증한 것들 —</p>
          <p>Vrief, GPR, Principle 10 —</p>
          <p>을 누구나 쓸 수 있게 만든 것이다.</p>
        </div>

        {/* 핵심 믿음 */}
        <div className="mt-16 border-t border-[#e0e0e0] pt-12">
          <div className="space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
            <p className="font-serif text-xl md:text-2xl">&ldquo;우리는 모두 기획자다. 적어도, 자기 인생에서만큼은.&rdquo;</p>
            <div className="mt-6 space-y-2 text-[#444] text-sm md:text-base">
              <p>인생의 목표를 세우는 것도 기획이고,</p>
              <p>이직을 준비하는 것도 기획이고,</p>
              <p>사업을 시작하는 것도 기획이다.</p>
              <p className="mt-4">기획자는 연결하고 조직하고 일이 되게 하는 사람이다.</p>
              <p>당신이 지금 하고 있는 일이 바로 그것이다.</p>
            </div>
          </div>
        </div>

        {/* Universe 소개 */}
        <div className="mt-16 border border-[#e0e0e0] p-8 md:p-10 bg-[#FAFAFA]">
          <p className="text-[#1a1a1a] text-base md:text-lg mb-6">Planner&apos;s는 Ten:One&#8482; Universe의 일부다.</p>
          <div className="space-y-2 text-sm text-[#444] leading-relaxed">
            <p>기획을 배우고 &rarr; <span className="text-[#1a1a1a]">Planner&apos;s</span></p>
            <p>실전 프로젝트를 경험하고 &rarr; <span className="text-[#1a1a1a]">MADLeague</span></p>
            <p>업계 사람들을 만나고 &rarr; <span className="text-[#1a1a1a]">Badak</span></p>
            <p>커리어를 연결하고 &rarr; <span className="text-[#1a1a1a]">HeRo</span></p>
            <p>브랜드를 만든다 &rarr; <span className="text-[#1a1a1a]">Brand Gravity</span></p>
          </div>
          <div className="mt-6 space-y-2 text-sm text-[#444]">
            <p>하나의 브랜드가 아니라</p>
            <p>가치로 연결된 세계관이다.</p>
          </div>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 mt-6 text-sm text-[#1a1a1a] hover:text-[#444] transition-colors"
          >
            Universe 더 보기
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ===== Explore Section (CTAs to sub-pages) =====
function ExploreSection() {
  const pages = [
    {
      title: "Planning",
      desc: "기획의 기본기 + Vrief + Vridge 순환",
      href: "/planners/planning",
      icon: BookOpen,
    },
    {
      title: "GPR",
      desc: "Goal · Plan · Result — 성장의 나침반",
      href: "/planners/gpr",
      icon: Target,
    },
    {
      title: "Planner's Planner",
      desc: "기획자를 위한 도구 — 종이에서 AI까지",
      href: "/planners/planner-tool",
      icon: PenTool,
    },
    {
      title: "Programs",
      desc: "AI 시대에 살아남는 기획력 훈련",
      href: "/planners/programs",
      icon: BarChart3,
    },
  ];

  return (
    <section className="px-6 md:px-16 lg:px-24 py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight mb-12">
          더 알아보기
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="group border border-[#e0e0e0] p-8 bg-white hover:border-[#1a1a1a] transition-colors"
            >
              <page.icon size={20} className="text-[#999] group-hover:text-[#1a1a1a] transition-colors mb-4" />
              <h3 className="font-serif text-xl text-[#1a1a1a] mb-2">{page.title}</h3>
              <p className="text-sm text-[#666] leading-relaxed">{page.desc}</p>
              <span className="inline-flex items-center gap-1 mt-4 text-xs text-[#999] group-hover:text-[#1a1a1a] transition-colors">
                자세히 보기 <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== Main Page =====
export default function PlannersPage() {
  return (
    <main className="bg-white text-[#1a1a1a] min-h-screen">
      <HeroSection />
      <ExploreSection />
      {/* ── 뉴스레터 구독 ── */}
      <section className="py-16 px-6 border-t border-neutral-200">
        <NewsletterSubscribeForm source="planners" brandName="Planner's" accentColor="#1a1a1a" />
      </section>
      <AboutSection />
    </main>
  );
}
