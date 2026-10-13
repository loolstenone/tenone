"use client";

import { PageHero } from "@/features/hero/PageHero";
import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, usePathname } from "next/navigation";
import {
  Sparkles, ArrowRight, CheckCircle, MessageCircle,
  Shield, Clock, Brain, Users, FileText, Zap, X, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { loginHref } from "@/lib/login-href";

const RED = "#E53935";

const features = [
  {
    icon: Brain,
    title: "HIT 결과 기반 맞춤 상담",
    desc: "행동 유형(DISC)·성격(MBTI)·강점·성장 배경 결과를 함께 보고, 내 상황에 맞춰 상담합니다.",
  },
  {
    icon: MessageCircle,
    title: "실시간 대화형 상담",
    desc: "채팅으로 편하게 물어보면 AI 상담사가 바로 답합니다. 강점, 약점, 맞는 직무, 성장 방향 등 무엇이든 물어보세요.",
  },
  {
    icon: FileText,
    title: "상담 기록 자동 저장",
    desc: "모든 상담 내용이 자동으로 저장되어 언제든 다시 볼 수 있습니다. 이전 상담을 이어서 진행할 수도 있습니다.",
  },
  {
    icon: Shield,
    title: "개인정보 보호",
    desc: "상담 내용은 본인만 열람 가능하며, 제3자에게 공유되지 않습니다. 안심하고 솔직하게 상담하세요.",
  },
];

const topics = [
  "내 DISC 유형의 강점과 약점이 궁금해요",
  "직장에서 나의 행동 패턴은 어떤가요?",
  "나에게 잘 맞는 직무 방향이 궁금해요",
  "팀에서 어떤 역할을 맡으면 좋을까요?",
  "성장을 위해 어떤 역량을 개발해야 하나요?",
  "갈등 상황에서 나의 대처 패턴은?",
  "리더십 스타일은 어떤 편인가요?",
  "이직/전직 시 고려할 점은?",
];


function AICounselingPageInner() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AICounselingContent />
    </Suspense>
  );
}

function AICounselingContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const resultId = searchParams.get("resultId");
  const { isAuthenticated, user } = useAuth();


  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <PageHero
        label="AI 상담"
        title={<>나를 가장 잘 아는<br />AI 상담사와 대화하세요</>}
        desc="내 HIT 검사 결과를 읽은 AI가 강점, 성장 방향, 커리어 고민을 1:1로 함께 이야기합니다."
        cta={resultId ? { label: "상담 시작하기", href: `/hero/hit/a/result/${resultId}` } : { label: "HIT 검사 먼저 받기", href: "/hero/hit" }}
      />

      {/* ── 이런 상담이 가능합니다 ── */}
      <section className="py-20 border-t border-neutral-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">이런 상담이 가능합니다</h2>
            <p className="text-neutral-500">HIT 검사 결과를 바탕으로 이런 이야기를 나눌 수 있습니다</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topics.map((topic) => (
              <div key={topic} className="border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors">
                <p className="text-sm text-neutral-700 leading-relaxed">{topic}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 특징 ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">HeRo AI 상담의 특징</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${RED}10` }}>
                  <f.icon className="h-6 w-6" style={{ color: RED }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 요금·결제 안내 없음 — 통신판매업 신고 전 가격 정보는 화면·소스 어디에도 두지 않는다 (2026-10-12·13 사용자 결정). 사업 시작 시 git 이력에서 복원 */}

      {/* ── 프로세스 ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">이용 절차</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, icon: Zap, title: "HIT 검사", desc: "검사를 마칩니다" },
              { step: 2, icon: FileText, title: "결과 확인", desc: "보고서를 확인합니다" },
              { step: 3, icon: Sparkles, title: "AI 상담", desc: "AI 상담사와 대화합니다" },
              { step: 4, icon: Users, title: "대면 상담", desc: "필요 시 전문가를 만납니다" },
            ].map((s, i) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold" style={{ backgroundColor: RED }}>
                  <s.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-neutral-900 mb-1">{s.title}</p>
                <p className="text-xs text-neutral-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 안내 ── */}
      <section className="py-16 border-t border-neutral-100">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="bg-neutral-50 rounded-2xl p-8">
            <p className="text-sm text-neutral-500 leading-relaxed mb-4">
              AI 상담은 HeRo 통합 검사(HIT) 결과를 바탕으로 한 참고용 상담입니다.
              의학적·심리학적 진단이 아닙니다. 중요한 결정은 전문 상담사와 직접 만나 상의해 보시길 권합니다.
            </p>
            <Link
              href="/hero/coaching"
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: RED }}
            >
              전문가 대면 상담 보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AICounselingPage() {
  return (
    <Suspense>
      <AICounselingPageInner />
    </Suspense>
  );
}
