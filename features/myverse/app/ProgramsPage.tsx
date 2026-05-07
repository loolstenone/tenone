"use client";

import {
  BookOpen,
  Target,
  Sparkles,
  Bell,
} from "lucide-react";

// ===== Program Section =====
function ProgramSection() {

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
          <p className="mt-4 font-medium">Myverse는 세 가지를 훈련한다.</p>
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

        {/* 관심 등록 — 오픈 준비 중 */}
        <div className="mt-16 border border-[#e0e0e0] p-8 md:p-10 bg-white max-w-lg">
          <div className="flex items-start gap-4">
            <Bell size={18} className="text-[#999] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-[#1a1a1a] font-medium mb-1">커리큘럼 준비 중입니다</p>
              <p className="text-sm text-[#666] leading-relaxed">
                오픈 일정이 확정되면 Myverse 커뮤니티와 인스타그램을 통해 가장 먼저 안내드립니다.
              </p>
            </div>
          </div>
        </div>

        {/* Universe 연결 */}
        <div className="mt-16 space-y-2 text-[#444] text-sm md:text-base leading-relaxed">
          <p>Myverse에서 기획력을 키우고,</p>
          <p>MADLeague에서 실전으로 증명하고,</p>
          <p>HeRo를 통해 세상에 나간다.</p>
        </div>
      </div>
    </section>
  );
}

// ===== Programs Page =====
export function ProgramsPage() {
  return (
    <div className="bg-white text-[#1a1a1a] min-h-screen">
      <ProgramSection />
    </div>
  );
}
