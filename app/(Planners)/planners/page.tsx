"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  AlertTriangle,
  BookOpen,
  Target,
  BarChart3,
  PenTool,
  Tablet,
  Sparkles,
  Mail,
} from "lucide-react";

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
          <a
            href="#learn"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] text-white text-sm tracking-wide hover:bg-[#333] transition-colors"
          >
            기획자가 되는 법
            <ArrowRight size={16} />
          </a>
          <a
            href="#tool"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#1a1a1a] text-[#1a1a1a] text-sm tracking-wide hover:bg-[#f5f5f5] transition-colors"
          >
            도구부터 받기
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      <div className="mt-20 flex justify-center">
        <a href="#learn" className="text-[#999] hover:text-[#1a1a1a] transition-colors">
          <ArrowDown size={20} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}

// ===== 기획의 기본기 Section =====
function LearnSection() {
  return (
    <section id="learn" className="px-6 md:px-16 lg:px-24 py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">
          기획의 기본기
        </h2>
        <p className="mt-4 text-[#666] text-lg">
          기획과 계획은 다르다. 이 차이를 아는 것이 시작이다.
        </p>

        {/* 도입부 */}
        <div className="mt-16 space-y-4 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
          <p>기획(企劃)과 계획(計劃).</p>
          <p>비슷해 보이지만 완전히 다른 일이다.</p>
          <p className="mt-6">기획은 &ldquo;올바른 일&rdquo;을 찾는 것이고,</p>
          <p>계획은 &ldquo;일을 올바르게&rdquo; 하는 것이다.</p>
          <p className="mt-6">순서가 있다.</p>
          <p>기획이 먼저, 계획이 다음이다.</p>
        </div>

        {/* 기획 vs 계획 블록 */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          {/* 기획 블록 */}
          <div className="border border-[#e0e0e0] p-8 md:p-10 bg-white">
            <h3 className="font-serif text-2xl text-[#1a1a1a]">기획(企劃)</h3>
            <p className="mt-4 text-[#1a1a1a] font-medium">&ldquo;왜, 무엇을&rdquo;에 답한다.</p>
            <div className="mt-6 space-y-3 text-[#444] text-sm md:text-base leading-relaxed">
              <p>문제의 본질을 찾고, 방향을 정하고, 전략을 세우는 사고 과정.</p>
              <p>처음부터 파워포인트를 열지 마세요.</p>
              <p>질문에 답을 충실히 하다 보면 그것 자체가 시나리오가 된다.</p>
            </div>
            <p className="mt-8 text-xs text-[#999] uppercase tracking-widest">결과물: 전략과 방향성</p>
          </div>

          {/* 계획 블록 */}
          <div className="border border-[#e0e0e0] p-8 md:p-10 bg-white">
            <h3 className="font-serif text-2xl text-[#1a1a1a]">계획(計劃)</h3>
            <p className="mt-4 text-[#1a1a1a] font-medium">&ldquo;누가, 언제, 어떻게&rdquo;에 답한다.</p>
            <div className="mt-6 space-y-3 text-[#444] text-sm md:text-base leading-relaxed">
              <p>기획에서 정한 방향을 실행 가능한 단위로 쪼개고,</p>
              <p>담당자와 기한과 자원을 배정하는 실행 설계.</p>
              <p>수치와 기한이 없으면 계획이 아니라 희망사항이다.</p>
            </div>
            <p className="mt-8 text-xs text-[#999] uppercase tracking-widest">결과물: 실행 로드맵</p>
          </div>
        </div>

        {/* 경고 블록 */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="border-l-2 border-[#1a1a1a] pl-6 py-2">
            <div className="flex items-center gap-2 text-[#1a1a1a] mb-3">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">실수 1.</span>
            </div>
            <div className="space-y-2 text-sm text-[#444] leading-relaxed">
              <p>기획 없이 계획부터 짠다.</p>
              <p>왜 하는지 모르고 일정표만 채운다.</p>
              <p className="text-[#1a1a1a]">→ 방향이 틀리면 빠를수록 더 멀어진다.</p>
            </div>
          </div>
          <div className="border-l-2 border-[#1a1a1a] pl-6 py-2">
            <div className="flex items-center gap-2 text-[#1a1a1a] mb-3">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">실수 2.</span>
            </div>
            <div className="space-y-2 text-sm text-[#444] leading-relaxed">
              <p>기획만 하고 계획으로 넘어가지 않는다.</p>
              <p>전략은 훌륭한데 &ldquo;그래서 누가 언제까지?&rdquo;가 빠진다.</p>
              <p className="text-[#1a1a1a]">→ 실현되지 않으면 아이디어가 아니다.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Vrief Section =====
function VriefSection() {
  return (
    <section id="vrief" className="px-6 md:px-16 lg:px-24 py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">
          Vrief — 승리하는 브리프
        </h2>
        <p className="mt-4 text-[#666] text-lg">
          Vision + Brief. 될 수 있는 방법을 찾아가는 과정.
        </p>

        <div className="mt-12 space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
          <p>Vrief는 양식이 아니다.</p>
          <p>함께 일하는 프로토콜이다.</p>
          <p className="mt-4 text-[#444]">혼자 빈칸을 채우는 서류가 아니라,</p>
          <p className="text-[#444]">팀이 같은 방향을 보고 같은 언어로 생각하게 만드는 과정이다.</p>
        </div>

        {/* 3단계 */}
        <div className="mt-16 space-y-12">
          {/* Step 1 */}
          <div className="border-t border-[#e0e0e0] pt-8">
            <p className="text-xs text-[#999] uppercase tracking-widest mb-2">Step 1</p>
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">조사 분석</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>우리는 누구이고, 상황은 어떠한가.</p>
              <p>진짜 문제는 무엇인가.</p>
              <p>— 클라이언트가 말하는 문제가 진짜 문제인가?</p>
              <p>어떤 방향으로 풀 수 있을까.</p>
              <p className="mt-4 text-[#1a1a1a] italic">&ldquo;정말 그게 문제일까? 더 나은 방법은 없을까?&rdquo;</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-t border-[#e0e0e0] pt-8">
            <p className="text-xs text-[#999] uppercase tracking-widest mb-2">Step 2</p>
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">가설 검증</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>가설 중 검증된 것은 무엇이고, 틀린 것은 무엇인가.</p>
              <p>우리만의 차별화된 관점은 무엇인가.</p>
              <p>소비자의 숨겨진 니즈는 어디에 있는가.</p>
              <p className="mt-4">여기서 핵심 메시지가 나온다.</p>
              <p>소비자의 언어로 이야기할 수 있어야 한다.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-t border-[#e0e0e0] pt-8">
            <p className="text-xs text-[#999] uppercase tracking-widest mb-2">Step 3</p>
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">전략 수립</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>차별화 전략 + 핵심 메시지.</p>
              <p>구체적 실행 계획 — 누가, 언제, 어떻게.</p>
              <p>성과 측정 기준.</p>
              <p className="mt-4">여기서 나온 것이 실행된다.</p>
              <p>실현되지 않으면 아이디어가 아니다.</p>
            </div>
          </div>
        </div>

        {/* Vrief의 정신 */}
        <div className="mt-16 border border-[#e0e0e0] p-8 md:p-10 bg-[#FAFAFA]">
          <div className="space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
            <p>Vrief는 &ldquo;될 수 있는 방법&rdquo;을 찾아가는 과정이다.</p>
            <p className="mt-4 text-[#444]">제약 앞에서 멈추지 않는다.</p>
            <p className="text-[#444]">부정적인 결론으로 끝나지 않는다.</p>
            <p className="text-[#444]">극한까지 방법을 찾고, 차선이라도 만들어낸다.</p>
            <p className="mt-4 text-[#1a1a1a] font-medium">그것이 기획자의 일이다.</p>
          </div>
        </div>

        {/* AI와 함께 쓰는 Vrief */}
        <div className="mt-16">
          <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">AI와 함께 쓰는 Vrief</h3>
          <div className="mt-6 space-y-3 text-[#444] text-sm md:text-base leading-relaxed max-w-2xl">
            <p className="text-[#1a1a1a] font-medium">AI가 80%를 채우고, 사람이 20%의 핵심 판단을 한다.</p>
            <p className="mt-4">Step 1에서 AI가 정보를 수집하고 정리한다.</p>
            <p>Step 2에서 AI가 가설을 시뮬레이션하고 패턴을 찾는다.</p>
            <p>Step 3에서 AI가 시나리오를 비교하고 실행 계획을 잡는다.</p>
            <p className="mt-4">그러나 — &ldquo;이게 진짜 문제인가?&rdquo;를 묻는 것은 사람이다.</p>
            <p>&ldquo;이 방향이 맞는가?&rdquo;를 결정하는 것도 사람이다.</p>
            <p className="mt-4 text-[#1a1a1a]">AI 시대일수록 Why와 What을 정하는 기획자의 가치가 올라간다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== GPR Section =====
function GPRSection() {
  return (
    <section id="gpr" className="px-6 md:px-16 lg:px-24 py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">
          GPR — 성장의 나침반
        </h2>
        <p className="mt-4 text-[#666] text-lg">
          Goal · Plan · Result. 목표를 세우고, 실행하고, 돌아본다.
        </p>

        <div className="mt-12 space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
          <p>GPR은 평가 도구가 아니다.</p>
          <p>성장의 나침반이다.</p>
          <p className="mt-4 text-[#444]">&ldquo;지금 내가 어디에 있고, 어디로 가고 있는가&rdquo;를</p>
          <p className="text-[#444]">스스로 알게 해주는 프로토콜.</p>
          <p className="mt-4 text-[#444]">위에서 내려오는 관리가 아니라</p>
          <p className="text-[#444]">자기 스스로 방향을 잡는 습관이다.</p>
        </div>

        {/* 3단계 */}
        <div className="mt-16 space-y-12">
          <div className="border-t border-[#d0d0d0] pt-8">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">Goal — 어디로 갈 것인가</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>명확하고 측정 가능한 목표.</p>
              <p>숫자와 기한이 있어야 한다.</p>
              <p>&ldquo;열심히 하겠습니다&rdquo;는 Goal이 아니다.</p>
              <p>&ldquo;3월 말까지 참석률 80%를 달성한다&rdquo;가 Goal이다.</p>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] pt-8">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">Plan — 어떻게 갈 것인가</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>목표를 달성하기 위한 구체적 액션.</p>
              <p>누가, 무엇을, 언제까지.</p>
              <p>필요한 리소스와 예상 장애물.</p>
            </div>
          </div>

          <div className="border-t border-[#d0d0d0] pt-8">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">Result — 무엇을 배웠는가</h3>
            <div className="mt-4 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-xl">
              <p>실행 결과를 기록하고 다음 사이클에 반영한다.</p>
              <p>Result는 점수가 아니다.</p>
              <p>&ldquo;이번에 뭘 배웠는가, 다음에 뭘 다르게 할 것인가&rdquo;가 핵심이다.</p>
              <p>성공도 실패도 기록하면 자산이 된다.</p>
            </div>
          </div>
        </div>

        {/* GPR의 정신 */}
        <div className="mt-16 border border-[#d0d0d0] p-8 md:p-10 bg-white">
          <div className="space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed">
            <p className="font-medium">나의 성장이 우리의 성장이다.</p>
            <p className="mt-4 text-[#444]">보고가 아니라 공유다.</p>
            <p className="text-[#444]">평가가 아니라 개선이다.</p>
            <p className="text-[#444]">기록하지 않으면 흘러간다.</p>
            <p className="text-[#444]">기록하면 자산이 된다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Vridge Section =====
function VridgeSection() {
  return (
    <section className="px-6 md:px-16 lg:px-24 py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
          <p>Vrief로 방향을 잡고, GPR로 실행하고 측정한다.</p>
          <p className="mt-4 text-[#444]">Vrief 전략 수립(Step 3) → GPR Goal이 시작된다</p>
          <p className="text-[#444]">GPR Result → 다음 Vrief 조사 분석(Step 1)에 피드백으로 들어간다</p>
          <p className="mt-4">이 순환이 Vridge다.</p>
          <p className="text-[#444]">일을 시작하는 사고방식과 일을 계속하는 사고방식이</p>
          <p className="text-[#444]">하나로 이어진다.</p>
        </div>

        {/* Vridge Diagram */}
        <div className="mt-16 flex justify-center">
          <div className="w-full max-w-2xl">
            {/* Vrief row */}
            <div className="flex items-center gap-2 md:gap-4 justify-center">
              <div className="border border-[#1a1a1a] px-3 py-2 md:px-5 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center">
                <span className="block text-[10px] text-[#999] mb-0.5">Vrief</span>
                조사 분석
              </div>
              <span className="text-[#999]">→</span>
              <div className="border border-[#1a1a1a] px-3 py-2 md:px-5 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center">
                <span className="block text-[10px] text-[#999] mb-0.5">Vrief</span>
                가설 검증
              </div>
              <span className="text-[#999]">→</span>
              <div className="border border-[#1a1a1a] px-3 py-2 md:px-5 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center">
                <span className="block text-[10px] text-[#999] mb-0.5">Vrief</span>
                전략 수립
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-end pr-[15%] md:pr-[12%] my-2">
              <span className="text-[#999] text-lg">↓</span>
            </div>

            {/* GPR column aligned right */}
            <div className="flex flex-col items-end pr-[6%] md:pr-[4%] gap-2">
              <div className="border border-[#1a1a1a] px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center min-w-[100px] md:min-w-[120px]">
                <span className="block text-[10px] text-[#999] mb-0.5">GPR</span>
                Goal
              </div>
              <span className="text-[#999]">↓</span>
              <div className="border border-[#1a1a1a] px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center min-w-[100px] md:min-w-[120px]">
                <span className="block text-[10px] text-[#999] mb-0.5">GPR</span>
                Plan
              </div>
              <span className="text-[#999]">↓</span>
              <div className="border border-[#1a1a1a] px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center min-w-[100px] md:min-w-[120px]">
                <span className="block text-[10px] text-[#999] mb-0.5">GPR</span>
                Result
              </div>
            </div>

            {/* Feedback arrow */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-xs text-[#999]">피드백</span>
              <div className="flex-1 border-t border-dashed border-[#999]" />
              <span className="text-xs text-[#999]">↻ 조사 분석으로</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Program Section =====
function ProgramSection() {
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="program" className="px-6 md:px-16 lg:px-24 py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">
            AI 시대에 살아남는 기획력
          </h2>
          <span className="text-xs px-2 py-1 border border-[#ccc] text-[#999] tracking-widest uppercase">
            Coming Soon
          </span>
        </div>

        <div className="mt-12 space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
          <p>기획은 가르칠 수 있는 것이 아니라</p>
          <p>훈련할 수 있는 것이다.</p>
          <p className="mt-4 font-medium">Planner&apos;s는 세 가지를 훈련한다.</p>
        </div>

        {/* 커리큘럼 3축 */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="border border-[#e0e0e0] p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={18} className="text-[#1a1a1a]" />
              <p className="text-xs text-[#999] uppercase tracking-widest">1. 사고 체계</p>
            </div>
            <h3 className="font-serif text-xl text-[#1a1a1a] mb-4">Vrief</h3>
            <div className="space-y-2 text-sm text-[#444] leading-relaxed">
              <p>진짜 문제를 찾는 법.</p>
              <p>가설을 세우고 부수는 법.</p>
              <p>검증된 것만 전략으로 올리는 법.</p>
              <p>처음부터 파워포인트를 열지 않는 법.</p>
            </div>
          </div>

          <div className="border border-[#e0e0e0] p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={18} className="text-[#1a1a1a]" />
              <p className="text-xs text-[#999] uppercase tracking-widest">2. 실행 가속</p>
            </div>
            <h3 className="font-serif text-xl text-[#1a1a1a] mb-4">AI 활용</h3>
            <div className="space-y-2 text-sm text-[#444] leading-relaxed">
              <p>AI가 80%를 채운다.</p>
              <p>사람은 20%의 핵심 판단에 집중한다.</p>
              <p>정보 수집, 가설 시뮬레이션, 시나리오 비교 —</p>
              <p>AI가 속도를 내고, 사람이 방향을 잡는다.</p>
            </div>
          </div>

          <div className="border border-[#e0e0e0] p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <Target size={18} className="text-[#1a1a1a]" />
              <p className="text-xs text-[#999] uppercase tracking-widest">3. 성과 관리</p>
            </div>
            <h3 className="font-serif text-xl text-[#1a1a1a] mb-4">GPR</h3>
            <div className="space-y-2 text-sm text-[#444] leading-relaxed">
              <p>목표를 세우고, 실행하고, 돌아본다.</p>
              <p>수치와 기한이 없으면 희망사항이다.</p>
              <p>성공도 실패도 기록하면 자산이 된다.</p>
            </div>
          </div>
        </div>

        {/* 관심 등록 폼 */}
        <div className="mt-16 border border-[#e0e0e0] p-8 md:p-10 bg-white max-w-lg">
          {!submitted ? (
            <>
              <p className="text-sm text-[#444] mb-6">
                커리큘럼이 오픈되면 가장 먼저 알려드립니다
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="이름"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-[#ddd] px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  required
                />
                <input
                  type="email"
                  placeholder="이메일"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-[#ddd] px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                  required
                />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-[#ddd] px-4 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#1a1a1a] transition-colors appearance-none bg-white"
                  required
                >
                  <option value="" disabled>직군 선택</option>
                  <option value="student">대학생</option>
                  <option value="junior">주니어</option>
                  <option value="professional">현업</option>
                  <option value="other">기타</option>
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#1a1a1a] text-white py-2.5 text-sm tracking-wide hover:bg-[#333] transition-colors"
                >
                  관심 등록
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-[#1a1a1a] font-medium">등록되었습니다.</p>
              <p className="text-sm text-[#999] mt-2">오픈 시 가장 먼저 알려드리겠습니다.</p>
            </div>
          )}
        </div>

        {/* Universe 연결 */}
        <div className="mt-16 space-y-2 text-[#444] text-sm md:text-base leading-relaxed">
          <p>Planner&apos;s에서 기획력을 키우고,</p>
          <p>MADLeague에서 실전으로 증명하고,</p>
          <p>HeRo를 통해 세상에 나간다.</p>
        </div>
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
            <p>기획을 배우고 → <span className="text-[#1a1a1a]">Planner&apos;s</span></p>
            <p>실전 프로젝트를 경험하고 → <span className="text-[#1a1a1a]">MADLeague</span></p>
            <p>업계 사람들을 만나고 → <span className="text-[#1a1a1a]">Badak</span></p>
            <p>커리어를 연결하고 → <span className="text-[#1a1a1a]">HeRo</span></p>
            <p>브랜드를 만든다 → <span className="text-[#1a1a1a]">Brand Gravity</span></p>
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

// ===== Planner's Planner Section =====
function PlannersPlannerSection() {
  const [aiFormData, setAiFormData] = useState({ name: "", email: "" });
  const [aiSubmitted, setAiSubmitted] = useState(false);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAiSubmitted(true);
  };

  return (
    <section id="tool" className="px-6 md:px-16 lg:px-24 py-20 md:py-28 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] tracking-tight">
          기획자를 위한 플래너
        </h2>
        <p className="mt-4 text-[#666] text-lg">
          생각을 구조화하는 도구. 종이에서 디지털로, 디지털에서 AI로.
        </p>

        {/* 5-1. Planner's Planner 2026 */}
        <div className="mt-16">
          <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">Planner&apos;s Planner 2026</h3>
          <div className="mt-6 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-2xl">
            <p>플래너를 위한 플래너.</p>
            <p>단순한 일정 관리가 아니다.</p>
            <p>기획자의 사고를 구조화하는 도구다.</p>
            <p className="mt-4">Vrief의 3단계(조사 분석 → 가설 검증 → 전략 수립)와</p>
            <p>GPR의 3단계(Goal → Plan → Result)가</p>
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
            <p><span className="text-[#1a1a1a]">노트북 시리즈:</span> 코넬노트 · 리갈패드 · 콘티북 · 격자 · 줄 · 무지</p>
            <p><span className="text-[#1a1a1a]">프레임워크 템플릿 20종+:</span> 만다라트 · SWOT · OKR · 4분면 · 비즈니스 캔버스 ...</p>
            <p><span className="text-[#1a1a1a]">스타트업 브리프 7종:</span> 비전략 · 마전략 · 브전략 · 커뮤니케이션 · RFP · 진단</p>
            <p><span className="text-[#1a1a1a]">아이디어 샤워 시리즈:</span> 앰비언트 미디어 · 비즈니스 카드 · 쇼핑백 · 모두의 캠페인</p>
          </div>
        </div>

        {/* 5-2. 디지털 Planner's Planner */}
        <div className="mt-20 border-t border-[#e0e0e0] pt-12">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">디지털 Planner&apos;s Planner</h3>
            <span className="text-xs px-2 py-0.5 border border-[#ccc] text-[#999] tracking-widest uppercase">
              Coming Soon
            </span>
          </div>
          <p className="text-[#666] text-base mt-1">어디서든 기획하라</p>

          <div className="mt-6 space-y-2 text-[#444] text-sm md:text-base leading-relaxed max-w-2xl">
            <p>같은 구조, 다른 매체.</p>
            <p>종이에서 시작한 Planner&apos;s Planner가</p>
            <p>태블릿과 웹으로 확장된다.</p>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            {/* GoodNotes / Notability */}
            <div className="border border-[#e0e0e0] p-6 bg-white">
              <Tablet size={16} className="text-[#999] mb-3" />
              <p className="text-[#1a1a1a] font-medium text-sm mb-3">GoodNotes / Notability 버전</p>
              <div className="space-y-2 text-xs text-[#444] leading-relaxed">
                <p>아이패드에서 손글씨로 기획한다.</p>
                <p>GoodNotes · Notability 호환 하이퍼링크 PDF.</p>
                <p>탭 하나로 연간 → 주간 → 프로젝트를 오간다.</p>
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

        {/* 5-3. AI Planner's Planner */}
        <div className="mt-20 border-t border-[#e0e0e0] pt-12">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-serif text-xl md:text-2xl text-[#1a1a1a]">AI Planner&apos;s Planner</h3>
            <span className="text-xs px-2 py-0.5 border border-[#ccc] text-[#999] tracking-widest uppercase">
              Coming Soon
            </span>
          </div>
          <p className="text-[#666] text-base mt-1">AI가 기획을 돕는다</p>

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
              <p>AI Planner&apos;s Planner는 AI가 기획을 대신하는 도구가 아니다.</p>
              <p className="text-[#1a1a1a]">기획자의 사고를 가속하는 도구다.</p>
              <p className="mt-4">AI가 80%를 채우고,</p>
              <p>사람이 20%의 핵심 판단 — Why와 What — 을 한다.</p>
              <p className="mt-4">기획은 여전히 사람의 일이다.</p>
              <p>다만, 훨씬 빠르고 날카롭게.</p>
            </div>
          </div>

          {/* AI 관심 등록 */}
          <div className="mt-10 max-w-sm">
            {!aiSubmitted ? (
              <>
                <p className="text-sm text-[#444] mb-4">
                  AI Planner&apos;s Planner가 오픈되면 가장 먼저 알려드립니다
                </p>
                <form onSubmit={handleAiSubmit} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="이메일"
                    value={aiFormData.email}
                    onChange={(e) => setAiFormData({ ...aiFormData, email: e.target.value })}
                    className="flex-1 border border-[#ddd] px-3 py-2 text-sm text-[#1a1a1a] placeholder:text-[#bbb] focus:outline-none focus:border-[#1a1a1a] transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1a1a1a] text-white text-sm hover:bg-[#333] transition-colors"
                  >
                    <Mail size={14} />
                  </button>
                </form>
              </>
            ) : (
              <p className="text-sm text-[#1a1a1a]">등록되었습니다. 오픈 시 알려드리겠습니다.</p>
            )}
          </div>
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
      <LearnSection />
      <VriefSection />
      <GPRSection />
      <VridgeSection />
      <ProgramSection />
      <AboutSection />
      <PlannersPlannerSection />
    </main>
  );
}
