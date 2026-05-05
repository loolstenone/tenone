"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import NewsletterSubscribeForm from '@/components/newsletter/NewsletterSubscribeForm';
import { useAuth } from "@/lib/auth-context";

// ===== Hero Section =====
function HeroSection() {
  const { isAuthenticated } = useAuth();
  const ppAiHref = isAuthenticated ? "/myverse/app" : "/myverse/planner-tool#pp-ai";
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

        {/* CTA — 3 단계: 1순위 PP AI 앱 (강조) / 2순위 Planning / 3순위 도구 보기 */}
        <div className="mt-12 flex flex-col sm:flex-row flex-wrap gap-3">
          <Link
            href={ppAiHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white text-sm font-medium tracking-wide hover:bg-[#4F46E5] transition-colors shadow-sm"
          >
            <Sparkles size={16} />
            {isAuthenticated ? "PP AI 앱 열기" : "마이버스 AI 시작"}
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/myverse/planning"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white text-sm tracking-wide hover:bg-[#333] transition-colors"
          >
            기획자가 되는 법
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/myverse/planner-tool"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-sm tracking-wide hover:bg-[#f5f5f5] transition-colors"
          >
            도구 보기 (PDF·AI)
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

// ===== PP AI 강조 섹션 — 헤더 메뉴와 중복 안 되는 신규 콘텐츠 =====
function PPAISpotlight() {
  const { isAuthenticated } = useAuth();
  const ppAiHref = isAuthenticated ? "/myverse/app" : "/myverse/planner-tool#pp-ai";
  return (
    <section className="px-6 md:px-16 lg:px-24 py-20 md:py-28 bg-gradient-to-br from-[#6366F1]/5 via-white to-[#6366F1]/10 border-y border-[#6366F1]/10">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#6366F1] text-white text-xs font-semibold rounded-full mb-6">
          <Sparkles size={12} /> Now Live
        </div>
        <h2 className="font-serif text-3xl md:text-5xl text-[#1a1a1a] tracking-tight mb-6">
          Planner&apos;s Planner <span className="text-[#6366F1]">AI</span>
        </h2>
        <p className="text-lg md:text-xl text-[#444] leading-relaxed max-w-2xl mb-8">
          22년 기획 노하우를 담은 종이 플래너에 능동 AI 비서를 더했다.
          <span className="block mt-2 text-[#1a1a1a] font-medium">
            아침엔 브리핑하고, 저녁엔 정리한다.
          </span>
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-10 text-sm">
          <div className="border-l-2 border-[#6366F1] pl-4">
            <p className="font-semibold text-[#1a1a1a]">아침 브리핑</p>
            <p className="text-[#666] text-xs mt-1">오늘 할 일·집중 포인트·날씨까지 한눈에</p>
          </div>
          <div className="border-l-2 border-[#6366F1] pl-4">
            <p className="font-semibold text-[#1a1a1a]">저녁 회고</p>
            <p className="text-[#666] text-xs mt-1">하루를 정리하고 내일을 미리 기획</p>
          </div>
          <div className="border-l-2 border-[#6366F1] pl-4">
            <p className="font-semibold text-[#1a1a1a]">59종 템플릿</p>
            <p className="text-[#666] text-xs mt-1">SWOT·OKR·만다라트 시각 편집</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <Link
            href={ppAiHref}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white text-sm font-semibold rounded hover:bg-[#4F46E5] transition-colors"
          >
            <Sparkles size={16} />
            {isAuthenticated ? "PP AI 앱 열기" : "1년 19,000원으로 시작"}
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/myverse/planner-tool"
            className="inline-flex items-center gap-2 px-6 py-3 text-[#6366F1] text-sm hover:underline"
          >
            기능 자세히 보기
            <ArrowRight size={14} />
          </Link>
        </div>
        <p className="text-xs text-[#888] mt-4">
          PDF 플래너 구매자는 1년 무료 · Weekly·All in One 두 가지 모드
        </p>
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

// ===== Main Page =====
export function PlannersHomePage() {
  return (
    <main className="bg-white text-[#1a1a1a] min-h-screen">
      <HeroSection />
      <PPAISpotlight />
      <AboutSection />
      {/* ── 뉴스레터 구독 ── */}
      <section className="py-16 px-6 border-t border-neutral-200">
        <NewsletterSubscribeForm source="planners" brandName="Planner's" accentColor="#1a1a1a" />
      </section>
    </main>
  );
}
