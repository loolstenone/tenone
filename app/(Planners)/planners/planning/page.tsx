"use client";

import {
  AlertTriangle,
} from "lucide-react";

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
              <p className="text-[#1a1a1a]">&rarr; 방향이 틀리면 빠를수록 더 멀어진다.</p>
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
              <p className="text-[#1a1a1a]">&rarr; 실현되지 않으면 아이디어가 아니다.</p>
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

// ===== Vridge Section =====
function VridgeSection() {
  return (
    <section className="px-6 md:px-16 lg:px-24 py-20 md:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-3 text-[#1a1a1a] text-base md:text-lg leading-relaxed max-w-2xl">
          <p>Vrief로 방향을 잡고, GPR로 실행하고 측정한다.</p>
          <p className="mt-4 text-[#444]">Vrief 전략 수립(Step 3) &rarr; GPR Goal이 시작된다</p>
          <p className="text-[#444]">GPR Result &rarr; 다음 Vrief 조사 분석(Step 1)에 피드백으로 들어간다</p>
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
              <span className="text-[#999]">&rarr;</span>
              <div className="border border-[#1a1a1a] px-3 py-2 md:px-5 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center">
                <span className="block text-[10px] text-[#999] mb-0.5">Vrief</span>
                가설 검증
              </div>
              <span className="text-[#999]">&rarr;</span>
              <div className="border border-[#1a1a1a] px-3 py-2 md:px-5 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center">
                <span className="block text-[10px] text-[#999] mb-0.5">Vrief</span>
                전략 수립
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-end pr-[15%] md:pr-[12%] my-2">
              <span className="text-[#999] text-lg">&darr;</span>
            </div>

            {/* GPR column aligned right */}
            <div className="flex flex-col items-end pr-[6%] md:pr-[4%] gap-2">
              <div className="border border-[#1a1a1a] px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center min-w-[100px] md:min-w-[120px]">
                <span className="block text-[10px] text-[#999] mb-0.5">GPR</span>
                Goal
              </div>
              <span className="text-[#999]">&darr;</span>
              <div className="border border-[#1a1a1a] px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center min-w-[100px] md:min-w-[120px]">
                <span className="block text-[10px] text-[#999] mb-0.5">GPR</span>
                Plan
              </div>
              <span className="text-[#999]">&darr;</span>
              <div className="border border-[#1a1a1a] px-4 py-2 md:px-6 md:py-3 text-xs md:text-sm text-[#1a1a1a] bg-white text-center min-w-[100px] md:min-w-[120px]">
                <span className="block text-[10px] text-[#999] mb-0.5">GPR</span>
                Result
              </div>
            </div>

            {/* Feedback arrow */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="text-xs text-[#999]">피드백</span>
              <div className="flex-1 border-t border-dashed border-[#999]" />
              <span className="text-xs text-[#999]">&#8635; 조사 분석으로</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Planning Page =====
export default function PlanningPage() {
  return (
    <div className="bg-white text-[#1a1a1a] min-h-screen">
      <LearnSection />
      <VriefSection />
      <VridgeSection />
    </div>
  );
}
