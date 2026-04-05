"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Sparkles, ArrowRight, CheckCircle, MessageCircle,
  Shield, Clock, Brain, Users, FileText, Zap, X, AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const RED = "#E53935";

const features = [
  {
    icon: Brain,
    title: "HIT 결과 기반 맞춤 상담",
    desc: "DISC, MBTI, S-Power, 기저요인(UF) 검사 결과를 통합 분석하여 당신만의 맥락에 맞는 상담을 제공합니다.",
  },
  {
    icon: MessageCircle,
    title: "실시간 대화형 상담",
    desc: "채팅 형태로 자유롭게 질문하고, AI 상담사가 즉시 응답합니다. 강점, 약점, 직무 적합도, 성장 방향 등 무엇이든 물어보세요.",
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

const pricing = [
  {
    plan: "체험",
    price: "무료",
    priceNum: 0,
    desc: "HIT A/B 기본 결과",
    features: [
      "HIT A/B 검사",
      "기본 결과 리포트 (웹)",
      "회원 가입 시 풀 버전 PDF 제공",
    ],
    cta: "검사 시작하기",
    highlight: false,
  },
  {
    plan: "스탠다드",
    price: "9,900원",
    priceNum: 9900,
    desc: "AI 상담 + 심층 분석",
    features: [
      "AI 상담 (7일)",
      "HIT 결과 기반 맞춤 상담",
      "DISC x MBTI 교차 해석",
      "S-Power 강점 코칭",
      "직무 적합도 분석",
      "상담 기록 저장",
    ],
    cta: "시작하기",
    highlight: true,
  },
  {
    plan: "프리미엄",
    price: "99,000원",
    priceNum: 99000,
    desc: "커리어 설계 종합 서비스",
    features: [
      "스탠다드 서비스 전체 포함",
      "AI 상담 (30일)",
      "커리어 로드맵 설계",
      "이력서/포트폴리오 피드백",
      "맞춤 성장 액션플랜",
      "PDF 종합 리포트",
    ],
    cta: "프리미엄 시작",
    highlight: false,
  },
];

export default function AICounselingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AICounselingContent />
    </Suspense>
  );
}

function AICounselingContent() {
  const searchParams = useSearchParams();
  const resultId = searchParams.get("resultId");
  const { isAuthenticated, user } = useAuth();
  const [hitModal, setHitModal] = useState<{ show: boolean; type: 'login' | 'hitA' | 'hitB' | 'ready' }>({ show: false, type: 'login' });

  const handlePurchase = async (planIndex: number) => {
    // 체험은 바로 진행
    if (planIndex === 0) {
      window.location.href = '/hero/hit';
      return;
    }

    // 로그인 확인
    if (!isAuthenticated || !user) {
      setHitModal({ show: true, type: 'login' });
      return;
    }

    // HIT 완료 확인
    try {
      const { checkHitCompletion } = await import('@/lib/supabase/hero');
      const hit = await checkHitCompletion(user.id);

      if (!hit.hasA) {
        setHitModal({ show: true, type: 'hitA' });
      } else if (!hit.hasB) {
        setHitModal({ show: true, type: 'hitB' });
      } else {
        setHitModal({ show: true, type: 'ready' });
      }
    } catch {
      setHitModal({ show: true, type: 'hitA' });
    }
  };

  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-neutral-50" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" style={{ color: RED }} />
              <span className="text-sm font-bold uppercase tracking-wider" style={{ color: RED }}>
                AI Counseling
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900 mb-5 leading-tight">
              나를 가장 잘 아는
              <br />
              <span style={{ color: RED }}>AI 상담사</span>와 대화하세요
            </h1>
            <p className="text-lg text-neutral-500 mb-8 leading-relaxed">
              HIT 검사 결과를 완벽히 이해한 AI가 당신의 강점, 성장 방향,
              커리어 전략을 1:1로 상담합니다.
            </p>
            <div className="flex flex-wrap gap-3">
              {resultId ? (
                <Link
                  href={`/hero/hit/a/result/${resultId}`}
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-xl transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: RED }}
                >
                  <Sparkles className="h-4 w-4" />
                  상담 시작하기
                </Link>
              ) : (
                <Link
                  href="/hero/hit"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-bold rounded-xl transition-all hover:scale-[1.02]"
                  style={{ backgroundColor: RED }}
                >
                  HIT 검사 먼저 받기 <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 이런 상담이 가능합니다 ── */}
      <section className="py-20 border-t border-neutral-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">이런 상담이 가능합니다</h2>
            <p className="text-neutral-500">HIT 검사 결과를 바탕으로 깊이 있는 대화를 나눌 수 있습니다</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topics.map((topic) => (
              <div key={topic} className="border border-neutral-200 rounded-xl p-5 hover:border-red-200 transition-colors">
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

      {/* ── 요금 ── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">요금 안내</h2>
            <p className="text-neutral-500">목적에 맞는 플랜을 선택하세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((p) => (
              <div
                key={p.plan}
                className={`rounded-2xl p-8 ${
                  p.highlight
                    ? "border-2 border-[#E53935] shadow-lg relative"
                    : "border border-neutral-200"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-white px-4 py-1 rounded-full" style={{ backgroundColor: RED }}>
                    추천
                  </span>
                )}
                <div className="text-center mb-6">
                  <p className="text-sm font-semibold text-neutral-400 mb-2">{p.plan}</p>
                  <p className="text-3xl font-extrabold text-neutral-900">{p.price}</p>
                  <p className="text-xs text-neutral-400 mt-1">{p.desc}</p>
                </div>
                <div className="space-y-3 mb-8">
                  {p.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: RED }} />
                      <span className="text-sm text-neutral-600">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handlePurchase(i)}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                    p.highlight
                      ? "text-white hover:opacity-90"
                      : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                  }`}
                  style={p.highlight ? { backgroundColor: RED } : undefined}
                >
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* HIT 체크 모달 */}
        {hitModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
              <button onClick={() => setHitModal({ show: false, type: 'login' })} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
              {hitModal.type === 'login' && (
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">로그인이 필요합니다</h3>
                  <p className="text-sm text-neutral-500 mb-6">서비스를 이용하려면 먼저 로그인해주세요.</p>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl" style={{ backgroundColor: RED }}>
                    로그인하기
                  </Link>
                </div>
              )}
              {hitModal.type === 'hitA' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8" style={{ color: RED }} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">HIT A 검사를 먼저 완료해주세요</h3>
                  <p className="text-sm text-neutral-500 mb-6">성격/강점 진단(HIT A)을 완료해야 맞춤 상담이 가능합니다.</p>
                  <Link href="/hero/hit/a" className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl" style={{ backgroundColor: RED }}>
                    HIT A 시작하기 <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
              {hitModal.type === 'hitB' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8" style={{ color: RED }} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">HIT B 검사를 완료하면 더 정확합니다</h3>
                  <p className="text-sm text-neutral-500 mb-6">역량/적성 진단(HIT B)까지 완료하면 교차 분석이 가능합니다.</p>
                  <Link href="/hero/hit/b" className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold rounded-xl" style={{ backgroundColor: RED }}>
                    HIT B 시작하기 <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
              {hitModal.type === 'ready' && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">결제 준비 중</h3>
                  <p className="text-sm text-neutral-500 mb-6">결제 시스템이 곧 오픈됩니다. 조금만 기다려주세요.</p>
                  <button onClick={() => setHitModal({ show: false, type: 'login' })} className="px-6 py-3 border border-neutral-300 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50">
                    확인
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── 프로세스 ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3">이용 절차</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: 1, icon: Zap, title: "HIT 검사", desc: "통합 검사를 완료합니다" },
              { step: 2, icon: FileText, title: "결과 확인", desc: "보고서를 확인합니다" },
              { step: 3, icon: Sparkles, title: "AI 상담", desc: "상담사와 대화합니다" },
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
              본 AI 상담 서비스는 HeRo 통합검사(HIT) 결과를 기반으로 한 참고용 상담입니다.
              의학적/심리학적 진단이 아니며, 중요한 의사결정은 반드시 전문 상담사와의 대면 상담을 권장합니다.
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
