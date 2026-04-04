"use client";

import { useState } from "react";
import {
  BookOpen,
  Target,
  Sparkles,
} from "lucide-react";

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

// ===== Programs Page =====
export default function ProgramsPage() {
  return (
    <div className="bg-white text-[#1a1a1a] min-h-screen">
      <ProgramSection />
    </div>
  );
}
