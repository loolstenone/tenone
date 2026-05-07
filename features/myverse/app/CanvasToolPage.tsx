"use client";

import Link from "next/link";
import {
  PenTool,
  Tablet,
  Sparkles,
  ArrowRight,
  Check,
  Download,
  Smartphone,
} from "lucide-react";
import { InstallButton } from "@/features/myverse/app/InstallButton";

// ===== Myverse Tool Section =====
function MyverseToolSection() {
  return (
    <section id="tool" className="px-6 md:px-16 lg:px-24 py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">
          기획자를 위한 플래너
        </h2>
        <p className="mt-4 text-[#666] text-lg">
          생각을 구조화하는 도구. 종이에서 디지털로, 디지털에서 AI로.
        </p>

        {/* 앱 다운로드 — 타이틀 바로 아래 */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 p-5 bg-white border border-[#6366F1]/20 rounded-lg max-w-2xl">
          <div className="flex items-center gap-3 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Myverse_logo_black.png"
              alt="Myverse"
              className="w-12 h-12 rounded-xl shadow-md shadow-black/10 shrink-0"
            />
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">
                Myverse<sup className="text-[9px] font-bold text-[#6366F1] ml-0.5">AI</sup>
              </p>
              <p className="text-[11px] text-[#666] mt-0.5">홈 화면에 설치 · Android · iOS · PC</p>
            </div>
          </div>
          <InstallButton
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#6366F1] text-white text-sm font-semibold rounded-lg hover:bg-[#4F46E5] transition-colors sm:ml-auto shrink-0"
          >
            <Download size={14} />
            앱 다운로드
            <Smartphone size={12} className="opacity-70" />
          </InstallButton>
        </div>
        <p className="mt-2 text-xs text-[#999] max-w-2xl">
          앱스토어 등록 없이 1회 클릭으로 홈 화면에 추가 — 모든 기능은 웹과 100% 동일하게 작동합니다.
        </p>

        {/* 5-1. Myverse 2026 */}
        <div className="mt-16">
          <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">마이버스 2026</h3>
          <div className="mt-6 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-2xl">
            <p>플래너를 위한 플래너.</p>
            <p>단순한 일정 관리가 아니다.</p>
            <p>기획자의 사고를 구조화하는 도구다.</p>
            <p className="mt-4">Vrief의 3단계(조사 분석 &rarr; 가설 검증 &rarr; 전략 수립)와</p>
            <p>GPR의 3단계(Goal &rarr; Plan &rarr; Result)가</p>
            <p>플래너 안에 자연스럽게 녹아 있다.</p>
          </div>

          {/* 라인업 */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              { name: "All in One", desc: "연간 + 주간 + 프로젝트를 하나에" },
              { name: "연간 플래너", desc: "1년의 방향을 잡는다" },
              { name: "주간 플래너", desc: "한 주의 실행을 설계한다" },
              { name: "프로젝트 북", desc: "Frame + Work + Book. 프로젝트 단위로 기획한다" },
            ].map((item) => (
              <div key={item.name} className="border border-[#e0e0e0] p-6 bg-white">
                <PenTool size={16} className="text-[#999] mb-3" />
                <p className="text-[#1a1a1a] font-medium text-sm">{item.name}</p>
                <p className="text-[#666] text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 함께 쓰는 도구 */}
          <div className="mt-10 space-y-3 text-xs text-[#666] leading-relaxed">
            <p><span className="text-[#1a1a1a]">노트북 시리즈:</span> 코넬노트 &middot; 리갈패드 &middot; 콘티북 &middot; 격자 &middot; 줄 &middot; 무지</p>
            <p><span className="text-[#1a1a1a]">프레임워크 템플릿 20종+:</span> 만다라트 &middot; SWOT &middot; OKR &middot; 4분면 &middot; 비즈니스 캔버스 ...</p>
            <p><span className="text-[#1a1a1a]">스타트업 브리프 7종:</span> 비전략 &middot; 마전략 &middot; 브전략 &middot; 커뮤니케이션 &middot; RFP &middot; 진단</p>
            <p><span className="text-[#1a1a1a]">아이디어 샤워 시리즈:</span> 앰비언트 미디어 &middot; 비즈니스 카드 &middot; 쇼핑백 &middot; 모두의 캠페인</p>
          </div>
        </div>

        {/* 5-2. 디지털 Myverse */}
        <div className="mt-20 border-t border-[#e0e0e0] pt-12">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">디지털 마이버스</h3>
            <span className="text-xs px-2 py-0.5 border border-[#ccc] text-[#999] tracking-widest uppercase">
              Coming Soon
            </span>
          </div>
          <p className="text-[#666] text-base mt-1">어디서든 기획하라</p>

          <div className="mt-6 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-2xl">
            <p>같은 구조, 다른 매체.</p>
            <p>종이에서 시작한 마이버스가</p>
            <p>태블릿과 웹으로 확장된다.</p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            {/* GoodNotes / Notability */}
            <div className="border border-[#e0e0e0] p-6 bg-white">
              <Tablet size={16} className="text-[#999] mb-3" />
              <p className="text-[#1a1a1a] font-medium text-sm mb-3">GoodNotes / Notability 버전</p>
              <div className="space-y-2 text-xs text-[#444] leading-relaxed">
                <p>아이패드에서 손글씨로 기획한다.</p>
                <p>GoodNotes &middot; Notability 호환 하이퍼링크 PDF.</p>
                <p>탭 하나로 연간 &rarr; 주간 &rarr; 프로젝트를 오간다.</p>
                <p>Vrief 3단계와 GPR이 페이지 구조에 내장되어 있다.</p>
                <p className="mt-2">펜으로 쓰는 기획의 감각은 그대로,</p>
                <p>디지털의 검색과 정리가 더해진다.</p>
              </div>
            </div>

            {/* 삼성노트 */}
            <div className="border border-[#e0e0e0] p-6 bg-white">
              <Tablet size={16} className="text-[#999] mb-3" />
              <p className="text-[#1a1a1a] font-medium text-sm mb-3">삼성노트 버전</p>
              <div className="space-y-2 text-xs text-[#444] leading-relaxed">
                <p>삼성 갤럭시 탭 + S Pen 환경에 최적화.</p>
                <p>삼성노트 네이티브 호환.</p>
                <p>같은 구조, 같은 프레임워크.</p>
                <p>디바이스가 달라도 기획하는 방식은 같다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5-3. AI Myverse */}
        <div id="pp-ai" className="mt-20 border-t border-[#e0e0e0] pt-12">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">마이버스 AI</h3>
            <span className="text-xs px-2 py-0.5 bg-[#6366F1] text-white tracking-widest uppercase">
              Now Live
            </span>
          </div>
          <p className="text-[#666] text-base mt-1">능동 AI 비서가 기획하는 삶을 돕는다</p>

          <div className="mt-6 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-2xl">
            <p>종이 플래너가 구조를 잡아줬다면,</p>
            <p>AI 플래너는 사고를 가속한다.</p>
            <p className="mt-4">Vrief의 질문에 AI가 함께 답한다.</p>
            <p>GPR의 목표를 AI가 함께 추적한다.</p>
          </div>

          {/* 작동 방식 */}
          <div className="mt-10 space-y-8">
            <div className="border-l-2 border-[#1a1a1a] pl-6">
              <p className="text-xs text-[#999] uppercase tracking-widest mb-1">1</p>
              <p className="text-[#1a1a1a] font-medium text-sm mb-2">Vrief 어시스턴트</p>
              <div className="space-y-1 text-xs text-[#444] leading-relaxed">
                <p>&ldquo;진짜 문제가 뭔가요?&rdquo;라고 AI가 묻는다.</p>
                <p>조사 분석을 도와주고, 가설을 함께 세우고,</p>
                <p>검증할 수 있는 방법을 제안한다.</p>
                <p>기획자가 생각하는 것을 AI가 가속한다.</p>
              </div>
            </div>

            <div className="border-l-2 border-[#1a1a1a] pl-6">
              <p className="text-xs text-[#999] uppercase tracking-widest mb-1">2</p>
              <p className="text-[#1a1a1a] font-medium text-sm mb-2">GPR 트래커</p>
              <div className="space-y-1 text-xs text-[#444] leading-relaxed">
                <p>목표를 입력하면 AI가 실행 계획을 구조화한다.</p>
                <p>진행 상황을 자동으로 추적하고,</p>
                <p>Result에서 다음 Goal을 제안한다.</p>
                <p>Vridge 순환이 자동으로 돌아간다.</p>
              </div>
            </div>

            <div className="border-l-2 border-[#1a1a1a] pl-6">
              <p className="text-xs text-[#999] uppercase tracking-widest mb-1">3</p>
              <p className="text-[#1a1a1a] font-medium text-sm mb-2">인사이트 연결</p>
              <div className="space-y-1 text-xs text-[#444] leading-relaxed">
                <p>기획 과정에서 발견한 것들을 AI가 연결한다.</p>
                <p>&ldquo;이 가설은 지난 프로젝트의 이 결과와 관련이 있습니다.&rdquo;</p>
                <p>경험이 쌓일수록 AI가 더 날카로워진다.</p>
              </div>
            </div>
          </div>

          {/* 포지셔닝 */}
          <div className="mt-10 border border-[#e0e0e0] p-8 bg-white max-w-2xl">
            <div className="space-y-2 text-sm text-[#444] leading-relaxed">
              <p>Myverse AI는 AI가 기획을 대신하는 도구가 아니다.</p>
              <p className="text-[#1a1a1a]">기획자의 사고를 가속하는 도구다.</p>
              <p className="mt-4">AI가 80%를 채우고,</p>
              <p>사람이 20%의 핵심 판단 — Why와 What — 을 한다.</p>
              <p className="mt-4">기획은 여전히 사람의 일이다.</p>
              <p>다만, 훨씬 빠르고 날카롭게.</p>
            </div>
          </div>

          {/* CTA + 가격 */}
          <div className="mt-12 border border-[#6366F1] bg-white p-8 max-w-2xl">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-serif text-4xl text-[#1a1a1a]">19,000</span>
              <span className="text-[#666]">원 / 연</span>
            </div>
            <ul className="space-y-2 mb-6 text-sm text-[#444]">
              {[
                "능동 AI 비서 — 아침 브리핑 · 저녁 정리",
                "Personal Identity · Yearly · Monthly · Weekly · Daily",
                "Project Book (Vrief 4단계 + GPR 7필드)",
                "Templates 109종 · 풀텍스트 검색",
                "Copy-to-AI 심층 검증",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={14} className="text-[#6366F1] shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/myverse/purchase"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] transition-colors"
              >
                지금 시작하기 <ArrowRight size={14} />
              </Link>
              <InstallButton
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#6366F1]/30 text-[#6366F1] text-sm font-medium hover:bg-[#6366F1]/5 transition-colors"
              >
                <Download size={14} />
                앱 설치 <Smartphone size={12} className="opacity-60" />
              </InstallButton>
            </div>
            <p className="text-xs text-[#999] mt-4 leading-relaxed">
              종이 플래너&apos;s 플래너(2026 All In One) 구매자는{" "}
              <Link href="/myverse/purchase" className="text-[#6366F1] underline">1년 무료 제공</Link>.
              <br />
              모든 기능은 웹에서 그대로 작동 — 별도 앱스토어 다운로드 없이 홈 화면에 추가만 하면 됩니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Myverse Tool Page =====
export function CanvasToolPage() {
  return (
    <div className="bg-white text-[#1a1a1a] min-h-screen">
      <MyverseToolSection />
    </div>
  );
}
