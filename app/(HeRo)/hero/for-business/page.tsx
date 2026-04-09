"use client";

import { useState } from "react";
import {
  AlertTriangle,
  UserX,
  Clock,
  Shield,
  Globe,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  Send,
  ArrowRight,
  Building2,
  Star,
  Award,
  Crown,
} from "lucide-react";

const HERO_RED = "#E53935";

/* ── 페인 포인트 ── */
const painPoints = [
  {
    icon: UserX,
    title: "채용이 안 된다",
    desc: "공고를 올려도 지원자가 없거나, 원하는 수준의 인재가 오지 않습니다. 채용 시장은 이미 레드오션.",
  },
  {
    icon: AlertTriangle,
    title: "데려와도 깨진다",
    desc: "어렵게 뽑아도 3개월 내 퇴사. 온보딩 비용, 팀 리빌딩 비용, 사기 저하까지. 악순환.",
  },
  {
    icon: Clock,
    title: "키우려면 느리다",
    desc: "주니어를 뽑아서 가르치자니 6개월~1년. 그 사이 프로젝트는 멈추고, 시장 기회는 지나갑니다.",
  },
];

/* ── 서비스 모델 ── */
const serviceModels = [
  {
    icon: Building2,
    title: "레지던스 파견",
    period: "3 / 6 / 12개월",
    desc: "HeRo 소속 인재가 귀사에 상주하며 실무를 수행합니다. 검증된 인재를 즉시 투입.",
  },
  {
    icon: TrendingUp,
    title: "정규직 전환 옵션",
    desc: "파견 기간 중 성과가 확인되면 정규직 전환이 가능합니다. 리스크 없는 채용.",
  },
  {
    icon: Zap,
    title: "GPR 성과 관리",
    desc: "HeRo가 파견 인재의 성과를 GPR(Goal-Process-Result) 프레임으로 관리합니다. 투명한 성과 리포트 제공.",
  },
];

/* ── 차별점 ── */
const differentiators = [
  {
    icon: Globe,
    name: "Vrief",
    desc: "체계적인 역량 검증 프레임워크. 파견 전부터 역량이 수치화됩니다.",
  },
  {
    icon: Star,
    name: "Mindle",
    desc: "최신 트렌드와 데이터를 실시간으로 공급. 파견 인재가 시장을 읽는 눈을 갖습니다.",
  },
  {
    icon: Zap,
    name: "SmarComm",
    desc: "마케팅 자동화 도구를 무장한 인재. 혼자서도 팀 단위의 성과를 냅니다.",
  },
  {
    icon: Users,
    name: "Badak",
    desc: "현업 마케터 네트워크와 연결. 필요할 때 전문가 자문을 즉시 받을 수 있습니다.",
  },
];

/* ── Tier 안내 ── */
const tiers = [
  {
    tier: "D1",
    name: "Rookie",
    experience: "1~2년",
    range: "250~350만원/월",
    desc: "기본기를 갖춘 주니어. 실행력 중심.",
  },
  {
    tier: "D2",
    name: "Pro",
    experience: "3~5년",
    range: "400~550만원/월",
    desc: "독립적 프로젝트 수행 가능. 전략+실행.",
  },
  {
    tier: "D3",
    name: "Expert",
    experience: "5~8년",
    range: "600~800만원/월",
    desc: "팀 리딩 가능. 전략 설계+팀 운영.",
  },
  {
    tier: "D4",
    name: "Legend",
    experience: "8년+",
    range: "협의",
    desc: "C레벨 역량. 조직 전체 마케팅 총괄.",
  },
];

/* ── 기간 옵션 ── */
const durationOptions = ["3개월", "6개월", "12개월", "기타 (협의)"];

export default function ForBusinessPage() {
  const [form, setForm] = useState({
    company: "",
    contact: "",
    email: "",
    phone: "",
    role: "",
    duration: "",
    budget: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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
            HeRo for Business
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
            채용의 고통에서
            <br />
            벗어나세요.
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            HeRo는 검증된 마케팅 인재를 즉시 파견합니다. 채용 리스크 없이,
            원하는 기간만큼, 확실한 성과와 함께.
          </p>
        </div>
      </section>

      {/* ── 페인 포인트 ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-12">
            이런 고민, 익숙하시죠?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {painPoints.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl border border-neutral-200 p-8 text-center"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${HERO_RED}10` }}
                >
                  <p.icon className="w-7 h-7" style={{ color: HERO_RED }} />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">
                  {p.title}
                </h3>
                <p className="text-sm text-neutral-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HeRo의 해법 ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-6">
              채용이 아니라 파견.
              <br />
              혼자가 아니라 Universe.
            </h2>
            <p className="text-neutral-600 mb-4">
              HeRo는 전통적인 채용 모델을 바꿉니다. 검증된 인재를 필요한
              기간만큼 파견하고, 성과가 확인되면 전환합니다. 파견 인재는
              개인이 아닙니다. HeRo의 체계적인 성장 시스템과 Universe의
              리소스가 함께 갑니다.
            </p>
            <p className="text-neutral-600">
              사람 1명이 오면, Universe가 옵니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 서비스 모델 ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-12">
            서비스 모델
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceModels.map((m) => (
              <div
                key={m.title}
                className="bg-white rounded-2xl border border-neutral-200 p-8"
              >
                <m.icon className="w-8 h-8 mb-4" style={{ color: HERO_RED }} />
                <h3 className="text-lg font-bold text-neutral-900 mb-1">
                  {m.title}
                </h3>
                {m.period && (
                  <span className="text-xs text-neutral-500">{m.period}</span>
                )}
                <p className="text-sm text-neutral-600 mt-3">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 차별점 ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-4">
            사람 1명이 오면, Universe가 옵니다
          </h2>
          <p className="text-neutral-500 text-center mb-12 max-w-xl mx-auto">
            HeRo 소속 인재는 이런 무기를 장착하고 갑니다.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {differentiators.map((d) => (
              <div key={d.name} className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${HERO_RED}10` }}
                >
                  <d.icon className="w-5 h-5" style={{ color: HERO_RED }} />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">{d.name}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tier 안내 ── */}
      <section className="py-20 bg-neutral-50">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-12">
            인재 Tier & 단가
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-3xl mx-auto text-sm">
              <thead>
                <tr className="border-b-2 border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                    Tier
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                    등급
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                    경력
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">
                    월 단가
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900 hidden sm:table-cell">
                    설명
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => (
                  <tr key={t.tier} className="border-b border-neutral-100">
                    <td className="py-3 px-4">
                      <span
                        className="font-bold"
                        style={{ color: HERO_RED }}
                      >
                        {t.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-900">
                      {t.name}
                    </td>
                    <td className="py-3 px-4 text-neutral-600">
                      {t.experience}
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-900">
                      {t.range}
                    </td>
                    <td className="py-3 px-4 text-neutral-500 hidden sm:table-cell">
                      {t.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-neutral-400 text-center mt-6">
            * 단가는 프로젝트 규모, 파견 기간, 역할에 따라 협의 가능합니다.
          </p>
        </div>
      </section>

      {/* ── 문의 폼 ── */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-4">
            인재 파견 문의
          </h2>
          <p className="text-neutral-500 text-center mb-12">
            아래 양식을 작성해 주시면, 담당자가 1영업일 내에 연락
            드리겠습니다.
          </p>

          {submitted ? (
            <div className="text-center py-16">
              <CheckCircle
                className="w-16 h-16 mx-auto mb-4"
                style={{ color: HERO_RED }}
              />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                문의가 접수되었습니다
              </h3>
              <p className="text-neutral-600">
                1영업일 내에 담당자가 연락 드리겠습니다.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="max-w-xl mx-auto space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    회사명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value })
                    }
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    담당자명 *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.contact}
                    onChange={(e) =>
                      setForm({ ...form, contact: e.target.value })
                    }
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  필요 역할 *
                </label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value })
                  }
                  placeholder="예: 퍼포먼스 마케터, 콘텐츠 기획자"
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    희망 기간 *
                  </label>
                  <select
                    required
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 bg-white"
                  >
                    <option value="">선택해 주세요</option>
                    {durationOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    예산 범위
                  </label>
                  <input
                    type="text"
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                    placeholder="예: 월 400~500만원"
                    className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  추가 메시지
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="프로젝트 상황, 기대하는 역할 등을 자유롭게 작성해 주세요."
                  className="w-full border border-neutral-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: HERO_RED }}
              >
                <Send className="w-4 h-4" />
                문의하기
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
