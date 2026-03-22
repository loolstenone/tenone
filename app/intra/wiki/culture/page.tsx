"use client";

import { useState } from "react";
import {
  Mountain,
  Compass,
  Target,
  Rocket,
  Flag,
  CalendarCheck,
  Gem,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Eye,
  Link2,
  Expand,
  RotateCw,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: "vision", label: "Vision House" },
  { id: "values", label: "Core Values" },
  { id: "pce", label: "Plan \u00B7 Connect \u00B7 Expand" },
  { id: "wheel", label: "Ten:One™ Wheel" },
  { id: "principles", label: "Principle 10" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const visionHouse = [
  {
    label: "Philosophy",
    labelKo: "\uCCA0\uD559",
    text: "\uC5F0\uACB0\uC740 \uB354 \uB9CE\uC740 \uAE30\uD68C\uB97C \uB9CC\uB4E4\uC5B4 \uB0B8\uB2E4",
    icon: Mountain,
    color: "bg-neutral-900 text-white",
  },
  {
    label: "Mission",
    labelKo: "\uC0AC\uBA85",
    text: "\uC5F0\uACB0\uD558\uACE0 \uC870\uC9C1\uD558\uACE0 \uC2E4\uD589\uD558\uB77C",
    icon: Compass,
    color: "bg-neutral-800 text-white",
  },
  {
    label: "Vision",
    labelKo: "\uBE44\uC804",
    text: "We are Planner \u2014 10,000\uBA85\uC758 \uAE30\uD68D\uC790\uB97C \uBC1C\uAD74\uD558\uACE0 \uC5F0\uACB0\uD55C\uB2E4",
    icon: Eye,
    color: "bg-neutral-700 text-white",
  },
  {
    label: "Goal",
    labelKo: "\uBAA9\uD45C",
    text: "Who is the Next?",
    icon: Target,
    color: "bg-neutral-600 text-white",
  },
  {
    label: "Strategy",
    labelKo: "\uC804\uB7B5",
    text: "\uC57D\uD55C \uC5F0\uACB0 \uACE0\uB9AC\uB85C \uBE60\uB974\uAC8C \uC870\uC9C1\uD558\uACE0 \uC77C\uC774 \uB418\uAC8C \uD55C\uB2E4",
    icon: Rocket,
    color: "bg-neutral-500 text-white",
  },
  {
    label: "Declaration",
    labelKo: "\uC120\uC5B8",
    text: "2019. 10. 01",
    icon: CalendarCheck,
    color: "bg-neutral-100 text-neutral-700",
  },
];

const coreValues = [
  {
    title: "\uBCF8\uC9C8",
    en: "Essence",
    icon: Gem,
    desc: "\uBCC0\uD558\uC9C0 \uC54A\uC744 \uAC00\uCE58\uC5D0 \uC9D1\uC694\uD558\uAC8C \uC9D1\uC911\uD55C\uB2E4",
    detail:
      "\uD45C\uBA74\uC801\uC778 \uD2B8\uB80C\uB4DC\uB098 \uB2E8\uAE30 \uC131\uACFC\uC5D0 \uD718\uB450\uB974\uC9C0 \uC54A\uB294\uB2E4. \uBB38\uC81C\uC758 \uADFC\uBCF8 \uC6D0\uC778\uC744 \uD30C\uACE0\uB4E4\uACE0, \uC9C4\uC815\uC73C\uB85C \uC911\uC694\uD55C \uAC83\uC774 \uBB34\uC5C7\uC778\uC9C0 \uAD6C\uBD84\uD560 \uC904 \uC544\uB294 \uD798\uC744 \uAE30\uB978\uB2E4.",
  },
  {
    title: "\uC18D\uB3C4",
    en: "Speed",
    icon: Zap,
    desc: "\uC62E\uC740 \uBC29\uD5A5\uC744 \uACC4\uC18D \uD655\uC778\uD558\uBA70 \uBE60\uB974\uAC8C \uC804\uC9C4\uD55C\uB2E4",
    detail:
      "\uBE60\uB974\uAC8C \uC2DC\uB3C4\uD558\uACE0, \uBE60\uB974\uAC8C \uBC30\uC6B0\uACE0, \uBE60\uB974\uAC8C \uBCF4\uC644\uD55C\uB2E4. \uC644\uBCBD\uD568\uC744 \uAE30\uB2E4\uB9AC\uB294 \uB300\uC2E0 \uBC29\uD5A5\uC744 \uD655\uC778\uD558\uBA70 \uC804\uC9C4\uD558\uB294 \uC18D\uB3C4\uAC00 \uC6B0\uB9AC\uC758 \uACBD\uC7C1\uB825\uC774\uB2E4.",
  },
  {
    title: "\uC774\uD589",
    en: "Carry Out",
    icon: CheckCircle2,
    desc: "\uBCF8\uC9C8\uC774 \uD655\uC778\uB41C\uB2E4\uBA74 \uBC14\uB85C \uC2E4\uD589\uC5D0 \uC62E\uAE34\uB2E4",
    detail:
      "\uC544\uBB34\uB9AC \uC88B\uC740 \uC544\uC774\uB514\uC5B4\uB3C4 \uC2E4\uD589\uD558\uC9C0 \uC54A\uC73C\uBA74 \uC758\uBBF8\uAC00 \uC5C6\uB2E4. \uBCF8\uC9C8\uC774 \uD655\uC778\uB41C \uC21C\uAC04, \uB9DD\uC124\uC784 \uC5C6\uC774 \uC2E4\uD589\uC73C\uB85C \uC62E\uAE30\uB294 \uAC83\uC774 \uC6B0\uB9AC\uC758 \uBB38\uD654\uB2E4.",
  },
];

const pceItems = [
  {
    key: "Plan",
    ko: "\uAE30\uD68D",
    desc: "\uBB38\uC81C\uB97C \uC815\uC758\uD558\uACE0, \uBAA9\uD45C\uB97C \uC124\uC815\uD558\uACE0, \uC2E4\uD604 \uAC00\uB2A5\uD55C \uACC4\uD68D\uC744 \uC138\uC6B4\uB2E4. \uBAA8\uB4E0 \uAC83\uC740 \uAE30\uD68D\uC5D0\uC11C \uC2DC\uC791\uB41C\uB2E4.",
    icon: Target,
  },
  {
    key: "Connect",
    ko: "\uC5F0\uACB0",
    desc: "\uC0AC\uB78C\uACFC \uC0AC\uB78C, \uC544\uC774\uB514\uC5B4\uC640 \uC2E4\uD589, \uC870\uC9C1\uACFC \uC870\uC9C1\uC744 \uC5F0\uACB0\uD55C\uB2E4. \uC57D\uD55C \uC5F0\uACB0\uC774 \uAC15\uD55C \uC2E4\uD589\uC744 \uB9CC\uB4E0\uB2E4.",
    icon: Link2,
  },
  {
    key: "Expand",
    ko: "\uD655\uC7A5",
    desc: "\uC131\uACF5 \uACBD\uD5D8\uC744 \uACF5\uC720\uD558\uACE0, \uC0C8\uB85C\uC6B4 \uAE30\uD68C\uB97C \uBC1C\uACAC\uD558\uBA70, \uC9C0\uC18D\uC801\uC73C\uB85C \uC131\uC7A5\uD55C\uB2E4.",
    icon: Expand,
  },
];

const wheelSteps = [
  { label: "\uC790\uBC1C\uC801 \uCC38\uC5EC\uC640 \uACF5\uC720", angle: 0 },
  { label: "\uC2E0\uB8B0 \uAE30\uBC18 \uB124\uD2B8\uC6CC\uD06C", angle: 1 },
  { label: "\uD504\uB85C\uC81D\uD2B8", angle: 2 },
  { label: "\uC131\uACF5 \uACBD\uD5D8", angle: 3 },
  { label: "\uAE30\uD68C \uBC1C\uACAC", angle: 4 },
  { label: "\uBE44\uC988\uB2C8\uC2A4", angle: 5 },
  { label: "\uC9C0\uC18D \uC131\uC7A5", angle: 6 },
];

const principles = [
  {
    num: 1,
    title: "\uC6B0\uB9AC\uB294 \uBAA8\uB450 \uAE30\uD68D\uC790\uB2E4, \uC801\uC5B4\uB3C4 \uC790\uAE30 \uC778\uC0DD\uC5D0\uC11C\uB9CC\uD07C\uC740",
    desc: "\uC790\uAE30 \uC0B6\uC758 \uBAA9\uD45C\u00B7\uBE44\uC804\uC744 \uBA85\uD655\uD788 \uC218\uB9BD\uD55C\uB2E4. \uC5C5\uBB34\uC5D0\uC11C \uC8FC\uB3C4\uC801\uC73C\uB85C \uC758\uC0AC\uACB0\uC815\uD558\uACE0 \uCC45\uC784\uC9C4\uB2E4.",
  },
  {
    num: 2,
    title: "\uAE30\uD68D\uC740 \uBB38\uC81C\uB97C \uD574\uACB0\uD558\uB294 \uAC83\uC774\uB2E4",
    desc: "\uBAA8\uB4E0 \uC5C5\uBB34 \uC2DC\uC791 \uC2DC \uBB38\uC81C \uC815\uC758\uC640 \uD574\uACB0 \uBAA9\uD45C\uB97C \uBA3C\uC800 \uBA85\uD655\uD788 \uD55C\uB2E4. \uBB38\uC81C\uAC00 \uBA85\uD655\uD558\uBA74 \uD574\uACB0\uCC45\uC740 \uC790\uC5F0\uC2A4\uB7FD\uAC8C \uB530\uB77C\uC628\uB2E4.",
  },
  {
    num: 3,
    title: "\uAE30\uD68D\uC790\uB294 \uC77C\uC774 \uB418\uAC8C \uD558\uB294 \uC0AC\uB78C\uC774\uB2E4",
    desc: "\uAD6C\uCCB4\uC801\uC778 \uD589\uB3D9 \uACC4\uD68D\uC744 \uC218\uB9BD\uD558\uACE0 \uCC45\uC784 \uC788\uAC8C \uC2E4\uD589\uD55C\uB2E4. \uACC4\uD68D\uB9CC \uC138\uC6B0\uB294 \uC0AC\uB78C\uC774 \uC544\uB2C8\uB77C, \uACB0\uACFC\uB97C \uB9CC\uB4DC\uB294 \uC0AC\uB78C\uC774\uB2E4.",
  },
  {
    num: 4,
    title: "\uC5B4\uC124\uD508 \uC644\uBCBD\uC8FC\uC758\uB294 \uC77C\uC744 \uCD9C\uBC1C\uC2DC\uD0A4\uC9C0 \uBABB\uD55C\uB2E4",
    desc: "\uC644\uBCBD\uBCF4\uB2E4 \uC18D\uB3C4 \uC6B0\uC120. \uBBF8\uC644\uC131\uC774\uB354\uB77C\uB3C4 \uC2DC\uC791\uD558\uACE0 \uBE60\uB974\uAC8C \uBCF4\uC644\uD55C\uB2E4. 70%\uC758 \uD488\uC9C8\uB85C \uC2DC\uC791\uD574\uC11C 100%\uB85C \uB9CC\uB4E4\uC5B4 \uAC04\uB2E4.",
  },
  {
    num: 5,
    title: "\uB9AC\uB354\uC640 \uD314\uB85C\uC5B4\uB294 \uC5ED\uD560\uC774\uC9C0 \uC9C1\uAE09\uC774 \uC544\uB2C8\uB2E4",
    desc: "\uC0C1\uD669\uC5D0 \uB530\uB77C \uC720\uC5F0\uD558\uAC8C \uC5ED\uD560\uC744 \uC218\uD589\uD55C\uB2E4. \uB204\uAD6C\uB098 \uB9AC\uB354\uAC00 \uB420 \uC218 \uC788\uACE0, \uB204\uAD6C\uB098 \uD314\uB85C\uC5B4\uAC00 \uB420 \uC218 \uC788\uB2E4.",
  },
  {
    num: 6,
    title: "\uBB38\uC81C\uC758 \uBCF8\uC9C8\uC5D0 \uC9D1\uC911\uD55C\uB2E4",
    desc: "\uD45C\uBA74\uC801 \uC6D0\uC778\uC774 \uC544\uB2CC \uADFC\uBCF8 \uC6D0\uC778\uC744 \uD30C\uC545\uD55C\uB2E4. 5 Whys, \uB85C\uC9C1 \uD2B8\uB9AC \uB4F1\uC744 \uD65C\uC6A9\uD574 \uBB38\uC81C\uC758 \uD575\uC2EC\uC744 \uD30C\uACE0\uB4E0\uB2E4.",
  },
  {
    num: 7,
    title: "\uC2E4\uD604\uB418\uC9C0 \uC54A\uC73C\uBA74 \uC544\uC774\uB514\uC5B4\uAC00 \uC544\uB2C8\uB2E4",
    desc: "\uBAA8\uB4E0 \uC544\uC774\uB514\uC5B4\uB294 \uAD6C\uCCB4\uC801\uC778 \uC2E4\uD589 \uACC4\uD68D\uACFC \uD568\uAED8 \uC81C\uC2DC\uD55C\uB2E4. \uC544\uC774\uB514\uC5B4\uB294 \uC2E4\uD589\uB420 \uB54C \uBE44\uB85C\uC18C \uAC00\uCE58\uB97C \uAC16\uB294\uB2E4.",
  },
  {
    num: 8,
    title: "\uB098\uC758 \uC131\uC7A5\uC774 \uC6B0\uB9AC\uC758 \uC131\uC7A5\uC774\uB2E4",
    desc: "\uAC1C\uC778 \uAC15\uC810\u00B7\uC57D\uC810\uC744 \uD30C\uC545\uD558\uACE0, \uB3D9\uB8CC\uC758 \uC131\uC7A5\uC744 \uC9C0\uC6D0\uD55C\uB2E4. \uD568\uAED8 \uC131\uC7A5\uD558\uB294 \uD658\uACBD\uC744 \uB9CC\uB4E0\uB2E4.",
  },
  {
    num: 9,
    title: "\uC2E0\uB8B0\uB294 \uBA3C\uC800 \uBCF4\uC5EC\uC8FC\uB294 \uAC83\uC774\uB2E4",
    desc: "\uBA3C\uC800 \uBFFF\uACE0 \uC9C0\uC9C0\uD55C\uB2E4. \uD22C\uBA85\uD558\uACE0 \uC815\uC9C1\uD55C \uCEE4\uBBA4\uB2C8\uCF00\uC774\uC158\uC73C\uB85C \uC2E0\uB8B0\uB97C \uC30D\uC544\uAC04\uB2E4.",
  },
  {
    num: 10,
    title: "\uB098\uC758 \uC791\uC740 \uC138\uACC4\uAC00 \uC5F0\uACB0\uB418\uC5B4 \uD558\uB098\uC758 \uAC70\uB300\uD55C \uC138\uACC4\uAD00\uC744 \uB9CC\uB4E0\uB2E4",
    desc: "\uB2E4\uC591\uD55C \uBD84\uC57C\uC758 \uD611\uC5C5\uC744 \uD1B5\uD574 \uC0C8\uB85C\uC6B4 \uC2DC\uB108\uC9C0\uB97C \uCC3D\uCD9C\uD55C\uB2E4. \uAC01\uC790\uC758 \uC138\uACC4\uAC00 \uC5F0\uACB0\uB420 \uB54C Ten:One™ Universe\uAC00 \uC644\uC131\uB41C\uB2E4.",
  },
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function VisionHouseSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800">Vision House</h3>
        <p className="text-xs text-neutral-400 mt-1">
          Ten:One™의 가치 체계를 한 눈에 보여주는 구조
        </p>
      </div>

      {/* Pyramid stack */}
      <div className="flex flex-col items-center gap-0">
        {visionHouse.map((item, i) => {
          const Icon = item.icon;
          const widthPercent = 50 + i * 10;
          return (
            <div
              key={item.label}
              className={`${item.color} flex items-center gap-3 px-5 py-3.5 transition-all ${
                i === 0 ? "rounded-t-lg" : ""
              } ${i === visionHouse.length - 1 ? "rounded-b-lg" : ""}`}
              style={{ width: `${widthPercent}%`, minWidth: 280 }}
            >
              <Icon size={16} className="shrink-0 opacity-70" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-60">
                    {item.label}
                  </span>
                  <span className="text-xs opacity-40">{item.labelKo}</span>
                </div>
                <p className="text-xs font-medium mt-0.5 leading-relaxed">{item.text}</p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-neutral-400 text-center">
        Philosophy에서 Declaration까지 &mdash; 위에서 아래로 가치가 구체화된다
      </p>
    </div>
  );
}

function CoreValuesSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800">Core Values</h3>
        <p className="text-xs text-neutral-400 mt-1">
          모든 의사결정과 행동의 기준이 되는 세 가지 핵심 가치
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {coreValues.map((v) => {
          const Icon = v.icon;
          const isOpen = expanded === v.en;
          return (
            <button
              key={v.en}
              onClick={() => setExpanded(isOpen ? null : v.en)}
              className="border border-neutral-200 bg-white p-5 text-left transition-all hover:border-neutral-300 hover:shadow-sm group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Icon size={14} className="text-neutral-500" />
                </div>
                <div>
                  <span className="text-sm font-bold text-neutral-800">{v.title}</span>
                  <span className="text-xs text-neutral-400 ml-1.5">{v.en}</span>
                </div>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{v.desc}</p>
              {isOpen && (
                <p className="text-xs text-neutral-400 leading-relaxed mt-3 pt-3 border-t border-neutral-100">
                  {v.detail}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PCESection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800">Plan &middot; Connect &middot; Expand</h3>
        <p className="text-xs text-neutral-400 mt-1">
          Ten:One™의 세 가지 행동 원리
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {pceItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={item.key} className="flex-1 flex items-start gap-3">
              <div className="flex-1 border border-neutral-200 bg-white p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center">
                    <Icon size={13} className="text-neutral-500" />
                  </div>
                  <span className="text-xs font-bold text-neutral-800">{item.key}</span>
                  <span className="text-xs text-neutral-400">{item.ko}</span>
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
              {i < pceItems.length - 1 && (
                <div className="hidden md:flex items-center self-center text-neutral-300">
                  <ArrowRight size={14} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WheelSection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800">Ten:One™ Wheel</h3>
        <p className="text-xs text-neutral-400 mt-1">
          자발적 참여에서 지속 성장까지 &mdash; 선순환 플라이휠
        </p>
      </div>

      {/* Circular flow visualization */}
      <div className="border border-neutral-200 bg-white p-6">
        <div className="flex items-center justify-center mb-5">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
            <RotateCw size={14} className="text-neutral-500" />
          </div>
        </div>

        <div className="relative flex flex-wrap justify-center gap-0">
          {wheelSteps.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center w-28">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {i + 1}
                </div>
                <p className="text-xs text-neutral-600 text-center mt-2 leading-tight font-medium">
                  {step.label}
                </p>
              </div>
              {i < wheelSteps.length - 1 && (
                <ArrowRight size={12} className="text-neutral-300 shrink-0 -mx-1" />
              )}
            </div>
          ))}
          {/* Loop arrow */}
          <div className="flex items-center">
            <ArrowRight size={12} className="text-neutral-300 shrink-0 -mx-1" />
            <div className="flex flex-col items-center w-16">
              <div className="w-9 h-9 rounded-full bg-neutral-800 text-white flex items-center justify-center">
                <RotateCw size={13} />
              </div>
              <p className="text-xs text-neutral-400 text-center mt-2 leading-tight">
                순환
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-400 text-center mt-5">
          각 단계가 다음 단계의 원동력이 되어 지속적인 성장 사이클을 형성한다
        </p>
      </div>
    </div>
  );
}

function PrinciplesSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800">Principle 10</h3>
        <p className="text-xs text-neutral-400 mt-1">
          Ten:One™ 구성원이 지키는 10가지 원칙
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-2.5">
        {principles.map((p) => {
          const isOpen = openIdx === p.num;
          return (
            <button
              key={p.num}
              onClick={() => setOpenIdx(isOpen ? null : p.num)}
              className={`border bg-white p-4 text-left transition-all flex items-start gap-3 ${
                isOpen
                  ? "border-neutral-400 shadow-sm"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <span
                className={`text-sm font-bold w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                  isOpen
                    ? "bg-neutral-800 text-white"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {p.num}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-neutral-700 leading-relaxed">
                    {p.title}
                  </p>
                  {isOpen ? (
                    <ChevronDown size={12} className="text-neutral-400 shrink-0 mt-0.5" />
                  ) : (
                    <ChevronRight size={12} className="text-neutral-300 shrink-0 mt-0.5" />
                  )}
                </div>
                {isOpen && (
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-2 pt-2 border-t border-neutral-100">
                    {p.desc}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CulturePage() {
  const [activeTab, setActiveTab] = useState<TabId>("vision");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-bold text-neutral-900">Culture</h1>
        <p className="text-xs text-neutral-400 mt-1">
          우리는 컬처를 믿고, 컬처로 일합니다
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 flex gap-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-neutral-800 text-neutral-800"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pb-12">
        {activeTab === "vision" && <VisionHouseSection />}
        {activeTab === "values" && <CoreValuesSection />}
        {activeTab === "pce" && <PCESection />}
        {activeTab === "wheel" && <WheelSection />}
        {activeTab === "principles" && <PrinciplesSection />}
      </div>

      {/* Footer stamp */}
      <div className="border-t border-neutral-100 pt-4 pb-8">
        <div className="flex items-center gap-2 text-xs text-neutral-300">
          <Flag size={10} />
          <span>Declared 2019.10.01 &mdash; Ten:One™ Universe</span>
        </div>
      </div>
    </div>
  );
}
