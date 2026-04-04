"use client";

import Link from "next/link";
import {
  Sparkles,
  DoorOpen,
  Swords,
  Rocket,
  Crown,
  ArrowRight,
} from "lucide-react";

const HERO_RED = "#E53935";

/* ── 5단계 여정 ── */
const stages = [
  {
    number: "01",
    icon: Sparkles,
    title: "Dreamer",
    subtitle: "꿈꾸는 사람",
    paragraphs: [
      "마케팅에 관심은 있지만, 어디서 시작해야 할지 모르겠다. 대학에서 배운 이론과 실무 사이의 간극이 너무 크다. 인턴을 해도 잡무만 한다.",
      "당신의 잠재력은 아직 측정되지 않았을 뿐입니다. HIT 진단으로 당신의 숨겨진 강점을 발견하세요. 10분이면 충분합니다.",
      "Dreamer 단계에서는 자기 인식이 핵심입니다. 나는 무엇을 잘하고, 무엇이 부족한지. HIT가 그 거울이 됩니다.",
    ],
    cta: { label: "HIT A 시작하기", href: "/hero/hit/a" },
    align: "left" as const,
  },
  {
    number: "02",
    icon: DoorOpen,
    title: "Challenger",
    subtitle: "문을 두드리는 사람",
    paragraphs: [
      "HIT 결과를 손에 들고, 4개의 문 앞에 섭니다. MADLeague에서 리그를 뛰거나, Badak에서 현업인과 어깨를 겨루거나, 특화 입구로 들어오거나, 경력 3년 이상이면 다이렉트로.",
      "어떤 문으로 들어오든, 기준은 하나입니다. 당신이 무엇을 할 수 있는가. 스펙이 아니라 실력. 이력서가 아니라 실전.",
    ],
    cta: { label: "오디션 지원하기", href: "/hero/audition" },
    align: "right" as const,
  },
  {
    number: "03",
    icon: Swords,
    title: "Trainee",
    subtitle: "무기를 만드는 사람",
    paragraphs: [
      "HeRo 소속 연습생이 되면, 본격적인 훈련이 시작됩니다. Vrief 프레임워크로 6가지 핵심 역량을 체계적으로 훈련하고, GPR로 매주 성과를 측정합니다.",
      "혼자 싸우지 않습니다. Universe의 자원이 당신의 무기가 됩니다. Mindle의 데이터, SmarComm의 도구, Badak의 네트워크. 당신은 성장에만 집중하면 됩니다.",
      "3개월의 집중 트레이닝. 이 기간이 끝나면, 당신은 이전의 당신이 아닙니다.",
    ],
    cta: null,
    align: "left" as const,
  },
  {
    number: "04",
    icon: Rocket,
    title: "Debut",
    subtitle: "무대에 서는 사람",
    paragraphs: [
      "트레이닝을 마치면, 실제 기업에 파견됩니다. D1 Rookie부터 시작해, 성과에 따라 D2 Pro, D3 Expert, D4 Legend까지. 당신의 Tier는 시장이 결정합니다.",
      "파견이지만 혼자가 아닙니다. HeRo의 GPR 시스템이 성과를 관리하고, Universe의 리소스가 계속 지원됩니다. 당신이 성공하면, 기업도 성공하고, HeRo도 성공합니다.",
    ],
    cta: null,
    align: "right" as const,
  },
  {
    number: "05",
    icon: Crown,
    title: "Star \u2192 Legend",
    subtitle: "빛나고, 길을 만드는 사람",
    paragraphs: [
      "D4 Legend에 도달하면, 선택권이 당신에게 옵니다. 기업의 C레벨로 합류할 수도, 독립해서 자신의 사업을 시작할 수도, HeRo의 멘토가 되어 다음 세대를 이끌 수도 있습니다.",
      "Legend는 끝이 아니라 새로운 시작입니다. 당신의 경험은 다음 Dreamer에게 영감이 되고, 당신의 멘토링은 다음 Challenger를 만듭니다. 영웅은 영웅을 만듭니다.",
      "HeRo는 연예기획사가 아티스트를 만들 듯, 마케팅 인재를 만듭니다. 다만 무대가 다를 뿐.",
    ],
    cta: { label: "당신의 여정을 시작하세요", href: "/hero/hit/a" },
    align: "left" as const,
  },
];

export default function JourneyPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* ── 인트로 ── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p
            className="text-sm font-bold tracking-widest uppercase mb-4"
            style={{ color: HERO_RED }}
          >
            Hero in
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
            영웅의 여정
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            연예기획사가 아티스트를 발굴하고 트레이닝하고 데뷔시키듯,
            <br className="hidden md:block" />
            HeRo는 마케팅 인재를 발굴하고 검증하고 기업에 배치합니다.
          </p>
        </div>
      </section>

      {/* ── 5단계 여정 ── */}
      {stages.map((s) => (
        <section key={s.number} className="py-20 even:bg-neutral-50">
          <div className="mx-auto max-w-5xl px-6">
            <div
              className={`flex flex-col ${
                s.align === "right" ? "md:flex-row-reverse" : "md:flex-row"
              } gap-12 items-start`}
            >
              {/* 넘버 + 아이콘 */}
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

              {/* 텍스트 */}
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
            모든 영웅에게는 시작이 있었습니다.
          </h2>
          <p className="text-neutral-600 mb-8 max-w-xl mx-auto">
            당신의 이야기는 어디서 시작되나요? HIT 진단으로 첫 걸음을
            내딛어 보세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/hero/hit/a"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: HERO_RED }}
            >
              HIT 진단 시작
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
