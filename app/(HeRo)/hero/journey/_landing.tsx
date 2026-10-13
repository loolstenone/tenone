"use client";

import Link from "next/link";
import { PageHero } from "@/features/hero/PageHero";
import { loginHref } from "@/lib/login-href";
import {
  Sparkles,
  DoorOpen,
  Swords,
  Rocket,
  Crown,
  ArrowRight,
} from "lucide-react";

const HERO_RED = "#E53935";

/* ── 5단계 여정 (비로그인 마케팅) ── */
const stages = [
  {
    number: "01",
    icon: Sparkles,
    title: "꿈꾸는 사람",
    subtitle: "어디서 시작할지 찾는 사람",
    paragraphs: [
      "관심은 있는데 어디서 시작할지 모르겠다. 학교에서 배운 것과 실무가 너무 다르다. 인턴을 해도 잡무만 한다.",
      "아직 내 강점을 재 본 적이 없을 뿐입니다. HIT 검사로 몰랐던 강점을 찾아보세요.",
      "이 단계에서는 나를 아는 것이 가장 중요합니다. 무엇을 잘하고 무엇이 부족한지 HIT 결과로 확인해 보세요.",
    ],
    cta: { label: "기본 성향 검사 시작하기", href: "/hero/hit/a" },
    align: "left" as const,
  },
  {
    number: "02",
    icon: DoorOpen,
    title: "도전자",
    subtitle: "문을 두드리는 사람",
    paragraphs: [
      "HIT 결과를 들고 첫 문을 두드립니다. 오디션으로 실력을 보여 주거나, 경력이 있으면 바로 시작할 수 있습니다.",
      "어떤 길로 오든 기준은 하나입니다. 무엇을 할 수 있는가. 스펙보다 실력을 봅니다.",
    ],
    cta: { label: "오디션 지원하기", href: "/hero/audition" },
    align: "right" as const,
  },
  {
    number: "03",
    icon: Swords,
    title: "연습생",
    subtitle: "실력을 쌓는 사람",
    paragraphs: [
      "HeRo 연습생이 되면 본격적으로 훈련을 시작합니다. 목표를 정해 핵심 역량을 키우고, 매주 성과를 점검합니다.",
      "혼자 하지 않습니다. 유니버스의 여러 브랜드와 사람들이 함께 돕습니다.",
      "석 달 동안 집중해서 훈련합니다.",
    ],
    cta: null,
    align: "left" as const,
  },
  {
    number: "04",
    icon: Rocket,
    title: "데뷔",
    subtitle: "무대에 서는 사람",
    paragraphs: [
      "훈련을 마치면 실제 일을 맡아 봅니다. 신입 단계부터 시작해 성과에 따라 단계가 올라갑니다.",
      "데뷔한 뒤에도 HeRo가 성과를 함께 점검하고 계속 돕습니다.",
    ],
    cta: null,
    align: "right" as const,
  },
  {
    number: "05",
    icon: Crown,
    title: "스타 → 레전드",
    subtitle: "인정받고, 다음 사람의 길을 여는 사람",
    paragraphs: [
      "레전드 단계에 오르면 길을 직접 고릅니다. 임원으로 합류하거나, 내 사업을 시작하거나, HeRo 멘토가 되어 후배를 도울 수 있습니다.",
      "내 경험이 다음 사람에게 길잡이가 됩니다.",
    ],
    cta: { label: "HIT 검사로 시작하기", href: "/hero/hit/a" },
    align: "left" as const,
  },
];

export function JourneyLanding() {
  return (
    <div className="bg-white min-h-screen">
      {/* ── 인트로 ── */}
      <PageHero
        align="center"
        label="히어로의 성장 단계"
        title="꿈꾸는 사람에서 레전드까지"
        desc="연예 기획사가 연습생을 발굴하고 훈련시켜 데뷔시키는 것처럼, HeRo는 내 강점을 찾고 실력을 키워 일할 준비를 돕습니다."
        note={<>이미 시작하셨나요? <Link href={loginHref("/hero/journey")} className="font-semibold underline" style={{ color: HERO_RED }}>로그인</Link>하면 나의 성장 기록으로 이동합니다.</>}
      />

      {/* ── 5단계 여정 ── */}
      {stages.map((s) => (
        <section key={s.number} className="py-20 even:bg-neutral-50">
          <div className="mx-auto max-w-5xl px-6">
            <div
              className={`flex flex-col ${
                s.align === "right" ? "md:flex-row-reverse" : "md:flex-row"
              } gap-12 items-start`}
            >
              <div className="shrink-0 flex flex-col items-center md:items-start">
                <span
                  className="text-7xl md:text-8xl font-black leading-none"
                  style={{ color: `${HERO_RED}15` }}
                >
                  {s.number}
                </span>
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center -mt-4"
                  style={{ backgroundColor: HERO_RED }}
                >
                  <s.icon className="w-7 h-7 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-1">
                  {s.title}
                </h2>
                <p
                  className="text-lg font-medium mb-6"
                  style={{ color: HERO_RED }}
                >
                  {s.subtitle}
                </p>
                <div className="space-y-4">
                  {s.paragraphs.map((p, i) => (
                    <p key={i} className="text-neutral-600 leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
                {s.cta && (
                  <Link
                    href={s.cta.href}
                    className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: HERO_RED }}
                  >
                    {s.cta.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ── 마무리 CTA ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
            첫걸음은 나를 아는 것부터입니다.
          </h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            HIT 검사로 내 강점과 유형부터 확인해 보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/hero/hit/a"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: HERO_RED }}
            >
              HIT 검사 시작
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/hero/audition"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold border-2 hover:bg-neutral-50 transition-colors"
              style={{ borderColor: HERO_RED, color: HERO_RED }}
            >
              오디션 지원
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
