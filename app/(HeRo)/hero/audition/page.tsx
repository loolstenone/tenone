"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Sparkles,
  Briefcase,
  FileText,
  Clock,
  MessageCircle,
  Gift,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle,
  Shield,
  Globe,
  DollarSign,
  Compass,
} from "lucide-react";

const HERO_RED = "#E53935";

/* ── 4개의 문 ── */
const doors = [
  {
    icon: GraduationCap,
    number: "01",
    title: "MADLeague 정규 과정",
    target: "대학생",
    desc: "MADLeague에서 리그를 완주하고 상위 성과를 낸 멤버. 이미 실전에서 검증된 잠재력.",
    link: "/hero/hit/a",
    linkLabel: "MADLeague 알아보기",
  },
  {
    icon: Users,
    number: "02",
    title: "Badak 커뮤니티",
    target: "현업인",
    desc: "Badak 네트워크에서 활동하며 실력을 증명한 현업 마케터. 경험 위에 체계를 얹는다.",
    link: "/hero/hit/a",
    linkLabel: "Badak 알아보기",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "특화 입구",
    target: "0gamja / FWN / domo",
    desc: "크리에이터, 콘텐츠 전문가, 데이터 분석가. 특화 영역에서 두각을 나타낸 인재.",
    link: "/hero/hit/a",
    linkLabel: "특화 프로그램 보기",
  },
  {
    icon: Briefcase,
    number: "04",
    title: "HeRo 다이렉트",
    target: "경력 3년+",
    desc: "이미 현업에서 검증된 경력자. HIT 진단과 면접으로 바로 HeRo 소속 도전.",
    link: "/hero/hit/a",
    linkLabel: "HIT 시작하기",
  },
];

/* ── 오디션 3단계 ── */
const steps = [
  {
    icon: FileText,
    number: 1,
    title: "서류 심사",
    desc: "HIT 진단 결과와 포트폴리오를 기반으로 잠재력을 평가합니다. 학벌이 아니라 실력과 가능성을 봅니다.",
  },
  {
    icon: Clock,
    number: 2,
    title: "실전 과제 48h",
    desc: "48시간 내에 실전 과제를 수행합니다. 실제 프로젝트와 동일한 조건에서 문제 해결 능력을 검증합니다.",
  },
  {
    icon: MessageCircle,
    number: 3,
    title: "면접",
    desc: "HeRo 디렉터와의 1:1 면접. 역량보다 태도, 스킬보다 성장 의지를 중점적으로 봅니다.",
  },
];

/* ── 혜택 ── */
const benefits = [
  { icon: Shield, text: "HeRo 소속 계약 체결" },
  { icon: CheckCircle, text: "Vrief / GPR 트레이닝 프로그램" },
  { icon: Globe, text: "Ten:One Universe 전체 리소스 접근" },
  { icon: DollarSign, text: "수익 배분 70% (업계 최고 수준)" },
  { icon: Compass, text: "전담 커리어 코칭 프로그램" },
];

/* ── FAQ ── */
const faqs = [
  {
    q: "HIT를 반드시 받아야 하나요?",
    a: "네, HIT 진단은 필수입니다. HeRo는 객관적 데이터를 기반으로 인재를 평가합니다. HIT A(기본 진단)는 무료이며, 10분이면 완료됩니다.",
  },
  {
    q: "비전공자도 가능한가요?",
    a: "물론입니다. HeRo는 전공이 아니라 잠재력과 성장 의지를 봅니다. 실제로 HeRo 소속 인재의 40%가 비전공 출신입니다.",
  },
  {
    q: "오디션 준비 기간은 얼마나 필요한가요?",
    a: "별도의 준비 기간이 필요하지 않습니다. HIT 진단은 현재 상태를 측정하는 것이고, 실전 과제도 기존 역량으로 충분히 수행 가능합니다.",
  },
  {
    q: "합격 후 의무 계약 기간이 있나요?",
    a: "최소 6개월 활동을 권장하지만, 의무 계약은 아닙니다. 다만 Vrief 트레이닝 과정(3개월)은 완수를 권장합니다.",
  },
  {
    q: "현재 직장에 다니면서도 지원할 수 있나요?",
    a: "가능합니다. HeRo 다이렉트(경력 3년+) 경로로 지원하시면 됩니다. 파트타임 활동도 협의 가능합니다.",
  },
];

/* ── 역할 옵션 ── */
const roleOptions = [
  "마케팅 전략",
  "콘텐츠 기획",
  "퍼포먼스 마케팅",
  "브랜드 매니지먼트",
  "데이터 분석",
  "크리에이티브 디렉팅",
  "PR / 커뮤니케이션",
  "기타",
];

export default function AuditionPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    portfolio: "",
    intro: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* ── 인트로 ── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p
            className="text-sm font-bold tracking-widest uppercase mb-4"
            style={{ color: HERO_RED }}
          >
            HeRo Audition
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
            이력서가 아니라
            <br />
            실전에서 봅니다.
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            HeRo의 오디션은 스펙이 아니라 가능성을 봅니다. 학벌도, 경력
            연차도 기준이 아닙니다. 당신이 무엇을 할 수 있는지, 그리고
            얼마나 성장할 수 있는지를 봅니다.
          </p>
        </div>
      </section>

      {/* ── 4개의 문 ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-4">
            4개의 문
          </h2>
          <p className="text-neutral-500 text-center mb-12 max-w-xl mx-auto">
            HeRo에 합류하는 경로는 하나가 아닙니다. 당신의 현재 위치에서
            가장 가까운 문을 선택하세요.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doors.map((d) => (
              <div
                key={d.number}
                className="bg-white rounded-2xl border border-neutral-200 p-8 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${HERO_RED}10` }}
                  >
                    <d.icon className="w-6 h-6" style={{ color: HERO_RED }} />
                  </div>
                  <div>
                    <span
                      className="text-xs font-bold"
                      style={{ color: HERO_RED }}
                    >
                      DOOR {d.number}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900">
                      {d.title}
                    </h3>
                    <span className="text-sm text-neutral-500">
                      {d.target}
                    </span>
                  </div>
                </div>
                <p className="text-neutral-600 text-sm mb-4">{d.desc}</p>
                <Link
                  href={d.link}
                  className="text-sm font-semibold inline-flex items-center gap-1 hover:underline"
                  style={{ color: HERO_RED }}
                >
                  {d.linkLabel} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 오디션 3단계 ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-12">
            오디션 3단계
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            {steps.map((s) => (
              <div key={s.number} className="flex-1 text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold"
                  style={{ backgroundColor: HERO_RED }}
                >
                  {s.number}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-neutral-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 혜택 ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-12">
            HeRo 소속 혜택
          </h2>
          <ul className="max-w-xl mx-auto space-y-4">
            {benefits.map((b, i) => (
              <li
                key={i}
                className="flex items-center gap-4 bg-white rounded-xl border border-neutral-200 px-6 py-4"
              >
                <b.icon className="w-5 h-5 shrink-0" style={{ color: HERO_RED }} />
                <span className="text-neutral-800 font-medium">{b.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 지원 폼 ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-4">
            오디션 지원
          </h2>
          <p className="text-neutral-500 text-center mb-12">
            아래 양식을 작성해 주세요. 접수 후 3일 이내에 안내 메일을
            드립니다.
          </p>

          {submitted ? (
            <div className="text-center py-16">
              <CheckCircle
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: HERO_RED }}
              />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                지원이 완료되었습니다
              </h3>
              <p className="text-neutral-600">
                3일 이내에 입력하신 이메일로 안내 드리겠습니다.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="max-w-xl mx-auto space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  이메일 *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  연락처 *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="010-0000-0000"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  희망 역할 *
                </label>
                <select
                  required
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-white"
                >
                  <option value="">선택해 주세요</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  포트폴리오 URL
                </label>
                <input
                  type="url"
                  value={form.portfolio}
                  onChange={(e) =>
                    setForm({ ...form, portfolio: e.target.value })
                  }
                  placeholder="https://"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  자기소개 *{" "}
                  <span className="text-neutral-400 font-normal">
                    ({form.intro.length}/500)
                  </span>
                </label>
                <textarea
                  required
                  maxLength={500}
                  rows={5}
                  value={form.intro}
                  onChange={(e) =>
                    setForm({ ...form, intro: e.target.value })
                  }
                  placeholder="자유롭게 작성해 주세요. 왜 HeRo에 합류하고 싶은지, 어떤 성장을 꿈꾸는지 알려주세요."
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: HERO_RED }}
              >
                <Send className="w-4 h-4" />
                지원서 제출
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-12">
            자주 묻는 질문
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer"
                >
                  <span className="font-medium text-neutral-900">{f.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4 text-sm text-neutral-600">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
