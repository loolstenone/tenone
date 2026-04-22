"use client";

import Link from "next/link";
import { CheckCircle, ArrowRight, Sparkles, Users, Megaphone, Search, Building2, Flashlight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const RED = "#E53935";

type Plan = {
  key: "free" | "standard" | "pro" | "premium";
  name: string;
  price: string;
  priceNote: string;
  desc: string;
  highlight?: boolean;
  features: string[];
  cta: { label: string; href: string };
};

const PLANS: Plan[] = [
  {
    key: "free",
    name: "무료",
    price: "0원",
    priceNote: "회원가입만으로",
    desc: "HIT A 검사와 웹 보고서를 끝까지",
    features: [
      "HIT A 검사 (UF · MBTI · DISC · 인성 · 적성)",
      "S-Power 핵심 강점 + 64유형 프로필",
      "HIT A 전체 웹 보고서",
      "HIT A PDF 1회 다운로드",
      "AI 상담 체험 · 하루 3턴 · 3일",
    ],
    cta: { label: "검사 시작하기", href: "/hero/hit/a" },
  },
  {
    key: "standard",
    name: "스탠다드",
    price: "14,900원",
    priceNote: "1회 결제",
    desc: "내 상황에 맞는 심화 검사 하나를 이어서",
    highlight: true,
    features: [
      "무료 플랜 전부 포함",
      "BCDEF 중 1개 선택 · 전체 웹 보고서 + PDF",
      "HIT A × 선택 검사 교차 해석",
      "AI 상담 7일 · 무제한",
      "DISC × MBTI × 인성 교차 코칭",
      "상담 기록 저장",
    ],
    cta: { label: "시작하기", href: "/hero/coaching/ai" },
  },
  {
    key: "pro",
    name: "프로",
    price: "39,900원",
    priceNote: "1회 결제",
    desc: "AI 커리어 코칭까지 · 내 손으로 설계하는 다음",
    features: [
      "스탠다드 플랜 전부 포함",
      "AI 상담 30일 · 무제한",
      "AI 커리어 로드맵 설계",
      "AI 이력서 · 포트폴리오 피드백",
      "AI 맞춤 성장 액션플랜",
      "검사 결과 전용 PDF 재발급",
    ],
    cta: { label: "프로 시작", href: "/hero/coaching/ai" },
  },
  {
    key: "premium",
    name: "프리미엄",
    price: "99,000원",
    priceNote: "1회 결제",
    desc: "HeRo 전문가와 1:1로 다음을 함께",
    features: [
      "프로 플랜 전부 포함",
      "HeRo 전문가 1:1 상담 세션",
      "이력서 · 포트폴리오 전문가 피드백",
      "커리어 전환 전략 함께 설계",
      "상담 기록 PDF 정리 제공",
      "후속 점검 세션 (30일 내 1회)",
    ],
    cta: { label: "프리미엄 시작", href: "/hero/coaching/ai" },
  },
];

function PlanCard({ plan: p }: { plan: Plan }) {
  return (
    <div
      className={`relative h-full flex flex-col rounded-2xl p-7 bg-white ${
        p.highlight ? "border-2 border-[#E53935] shadow-lg" : "border border-neutral-200"
      }`}
    >
      {p.highlight && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold text-white px-3 py-1 rounded-full"
          style={{ backgroundColor: RED }}
        >
          추천
        </span>
      )}

      {/* 헤더 영역 — 고정 높이로 정렬 */}
      <div className="text-center pb-5 mb-5 border-b border-neutral-100 min-h-[200px] flex flex-col justify-between">
        <p className="text-sm font-semibold text-neutral-500 mb-3">{p.name}</p>
        <div>
          <p className="text-3xl font-extrabold text-neutral-900">{p.price}</p>
          <p className="text-[11px] text-neutral-400 mt-1">{p.priceNote}</p>
        </div>
        <p className="text-xs text-neutral-500 mt-4 leading-relaxed min-h-[2.5em]">{p.desc}</p>
      </div>

      {/* 피처 영역 — 가변. flex-1로 늘어남 */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {p.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#E53935]" />
            <span className="text-sm text-neutral-600 leading-relaxed">{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA — 항상 카드 맨 아래 */}
      <Link
        href={p.cta.href}
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-colors ${
          p.highlight
            ? "bg-[#E53935] text-white hover:bg-red-700"
            : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
        }`}
      >
        {p.cta.label} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function HeRoPricingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-neutral-50" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 lg:py-24 text-center">
          <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3">
            필요한 만큼만 고르세요
          </h1>
          <p className="text-neutral-500 max-w-xl mx-auto">
            HIT A는 모두 무료로 끝까지 봅니다. 그 위에 얹는 심화와 상담만 단계별 패키지로 제공합니다.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          {/* Desktop/tablet: 4-col grid */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {PLANS.map((p) => (
              <PlanCard key={p.key} plan={p} />
            ))}
          </div>

          {/* Mobile: horizontal snap slider */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto snap-x snap-mandatory flex gap-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {PLANS.map((p) => (
              <div key={p.key} className="snap-center shrink-0 w-[85%] max-w-xs">
                <PlanCard plan={p} />
              </div>
            ))}
          </div>

          {!isAuthenticated && (
            <p className="text-center text-xs text-neutral-400 mt-8">
              회원가입 후 결제는 HIT A 검사 완료 시점에 진행됩니다.
            </p>
          )}
        </div>
      </section>

      {/* Talent Agent 신청 — HeRo 인재 기획사 소개 */}
      <section className="pb-8">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-white p-10 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #E53935 0%, transparent 50%), radial-gradient(circle at 80% 80%, #E53935 0%, transparent 50%)" }} />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[11px] font-semibold tracking-widest uppercase mb-5">
                <Megaphone className="h-3.5 w-3.5" />
                Talent Agent
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4 leading-tight">
                HeRo는 SM · JYP처럼<br />
                잠재된 인재를 발굴하고 키워내는 기획사입니다
              </h2>
              <p className="text-sm md:text-base text-neutral-300 max-w-xl mx-auto mb-8 leading-relaxed">
                혼자 풀기엔 벅찬 커리어의 다음 장을, HeRo가 기획사처럼 함께 설계하고 키웁니다.
              </p>
              <Link
                href="/hero/talent-agent/apply"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#E53935] text-white font-bold text-sm hover:bg-red-700 transition-colors"
              >
                탤런트 에이전시 신청하기 <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-neutral-400 mt-4">무료로 신청하고 HeRo의 발굴 프로세스를 받아보세요</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Light — 구직자 · 구인 기업 매칭 */}
      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-3xl bg-neutral-50 border border-neutral-200 p-10 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 text-[11px] font-semibold tracking-widest uppercase mb-5 text-neutral-600">
                <Flashlight className="h-3.5 w-3.5 rotate-90" />
                Search Light
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-3 leading-tight">
                서로를 찾고 있습니다
              </h2>
              <p className="text-sm md:text-base text-neutral-500 max-w-xl mx-auto leading-relaxed">
                구직자와 기업이 각자의 자리에서 정확한 상대를 만날 수 있도록
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 구직자 */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-7 hover:border-[#E53935] transition-colors flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                    <Search className="h-5 w-5 text-[#E53935]" />
                  </div>
                  <h3 className="font-bold text-neutral-900">구직자라면</h3>
                </div>
                <p className="text-[15px] font-bold text-neutral-900 mb-2 leading-snug">
                  당신을 애타게 찾고 있습니다
                </p>
                <p className="text-sm text-neutral-500 leading-relaxed mb-6 flex-1">
                  희망 직무를 알려주시면 HeRo가 어울리는 자리를 조용히 매칭해 드립니다.
                </p>
                <Link
                  href="/hero/jh/write"
                  className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#E53935] text-[#E53935] font-semibold text-sm hover:bg-red-50 transition-colors"
                >
                  희망 직무 작성 <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* 구인 기업 */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-7 hover:border-neutral-900 transition-colors flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-neutral-700" />
                  </div>
                  <h3 className="font-bold text-neutral-900">인재를 찾는 기업이라면</h3>
                </div>
                <p className="text-[15px] font-bold text-neutral-900 mb-2 leading-snug">
                  필요한 자리를 알려 주세요
                </p>
                <p className="text-sm text-neutral-500 leading-relaxed mb-6 flex-1">
                  TIH를 작성하시면 HeRo가 자리에 맞는 숨은 인재를 큐레이션해 제안합니다.
                </p>
                <Link
                  href="/hero/search-light"
                  className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-700 transition-colors"
                >
                  기업용 매칭 의뢰 <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI 상담 & 커리어 코칭 안내 */}
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-2">
              무엇을 언제 쓰나요
            </p>
            <h2 className="text-xl font-bold text-neutral-900">AI 상담과 커리어 코칭은 이렇게 쓰입니다</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-[#E53935]" />
                <h3 className="font-bold text-neutral-900">AI 상담</h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                HIT 결과 데이터를 이해한 AI가 즉시 답변합니다. 내 강점이 어떤 장면에서 힘을 발휘하는지,
                지금 고민에 어떤 시각을 더해야 하는지를 대화로 풀어냅니다.
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-neutral-400" />
                  <span>무료 — 하루 3턴 · 3일 체험</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#E53935]" />
                  <span>스탠다드 — 7일 무제한</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#E53935]" />
                  <span>프리미엄 — 30일 무제한</span>
                </li>
              </ul>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-[#E53935]" />
                <h3 className="font-bold text-neutral-900">커리어 코칭 (사람)</h3>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                AI 상담으로 풀리지 않는 전환점에서, HeRo 전문가와 1:1 대면 또는 화상 세션으로
                이력서 · 포트폴리오 · 로드맵을 함께 설계합니다.
              </p>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-[#E53935]" />
                  <span>프리미엄 — 1:1 매칭 우선권 포함</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-neutral-400" />
                  <span>세션 단건 결제는 별도 안내 (예정)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / 안내 */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6 space-y-4">
          <h2 className="text-center text-xl font-bold text-neutral-900 mb-8">자주 묻는 질문</h2>
          {[
            {
              q: "HIT A는 정말 무료인가요?",
              a: "네. 회원가입만 하면 HIT A 검사 + 전체 웹 보고서 + PDF 1회를 무료로 드립니다. 결제가 필요한 지점은 BCDEF 심화 검사와 AI 상담 유료 플랜부터입니다.",
            },
            {
              q: "BCDEF는 중복으로 받을 수 있나요?",
              a: "스탠다드는 1개, 프리미엄은 전부 언락입니다. BCDEF는 서로 다른 생애주기 국면이라 보통 1~2개만 본인에게 해당합니다.",
            },
            {
              q: "결제는 어떻게 이루어지나요?",
              a: "현재 결제 PG 연동 전입니다. 플랜을 선택하시면 우선 안내 알림을 받을 수 있도록 신청해 두실 수 있습니다.",
            },
            {
              q: "환불 정책은 어떻게 되나요?",
              a: "디지털 콘텐츠 특성상 PDF 다운로드 · AI 상담 1회 이상 사용 시 환불이 제한됩니다. 자세한 약관은 결제 단계에서 안내됩니다.",
            },
          ].map((f) => (
            <div key={f.q} className="border border-neutral-200 rounded-xl p-5">
              <p className="font-semibold text-neutral-800 mb-2">{f.q}</p>
              <p className="text-sm text-neutral-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
