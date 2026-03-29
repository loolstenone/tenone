"use client";

import Link from "next/link";
import {
  Presentation,
  PartyPopper,
  Globe,
  BookOpen,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Trophy,
  Briefcase,
  Star,
  Zap,
} from "lucide-react";

const mainPrograms = [
  {
    icon: Presentation,
    title: "경쟁PT",
    subtitle: "Competition PT",
    desc: "매드리그의 핵심 프로그램. 실제 기업이 제시하는 마케팅 과제를 바탕으로, 전국 각 권역의 팀들이 경쟁 프레젠테이션을 진행한다.",
    details: [
      "실제 기업 마케팅 과제 기반",
      "전국 5개 권역 동시 진행",
      "현업 마케터·광고인 심사",
      "우수팀 인턴십 기회 + 상금",
    ],
    frequency: "연 2회",
    participants: "팀 단위 (4~6인)",
    duration: "6주",
    href: "/madleague/pt",
    color: "bg-[#0F5132]",
  },
  {
    icon: PartyPopper,
    title: "DAM Party",
    subtitle: "기업 × 대학생 네트워킹",
    desc: "DAM(Develop And Match) Party는 기업 실무자와 대학생이 직접 만나는 네트워킹 파티. 포트폴리오 리뷰, 현장 면접, 멘토링이 한자리에서 벌어진다.",
    details: [
      "기업 부스 운영 (15개+ 기업)",
      "현장 포트폴리오 리뷰",
      "1:1 멘토링 세션",
      "네트워킹 파티 & 어워드",
    ],
    frequency: "연 2회",
    participants: "리퍼 전원 + 기업",
    duration: "1일",
    href: "/madleague/program",
    color: "bg-sky-600",
  },
  {
    icon: Globe,
    title: "Creazy Challenge",
    subtitle: "글로벌 광고제 도전",
    desc: "칸 라이언즈, 클리오 어워드, D&AD 등 세계적 광고제에 매드리그 팀이 도전한다. 글로벌 수준의 크리에이티브를 목표로 한다.",
    details: [
      "칸 라이언즈 Young Lions 부문",
      "클리오 어워드 Student 부문",
      "D&AD New Blood",
      "멘토링 + 작품 피드백",
    ],
    frequency: "연 1회",
    participants: "선발 팀 (2~3인)",
    duration: "12주",
    href: "/madleague/program",
    color: "bg-orange-600",
  },
  {
    icon: BookOpen,
    title: "MADzine",
    subtitle: "연합 매거진",
    desc: "전국 리퍼가 기고하는 마케팅·광고·브랜딩 연합 매거진. 브랜드 케이스 스터디, 인터뷰, 트렌드 분석을 담는다.",
    details: [
      "리퍼 직접 기고",
      "브랜드 케이스 스터디",
      "현업 인터뷰",
      "트렌드 분석 & 칼럼",
    ],
    frequency: "반기 1회",
    participants: "기고 희망 리퍼",
    duration: "상시",
    href: "/madleague/madzine",
    color: "bg-purple-600",
  },
];

const benefits = [
  { icon: Trophy, title: "수상 & 상금", desc: "경쟁PT 우수팀 상금 + 파트너사 인턴십" },
  { icon: Briefcase, title: "현업 연결", desc: "DAM Party를 통한 기업 실무자 직접 네트워킹" },
  { icon: Star, title: "포트폴리오", desc: "실전 프로젝트 결과물로 취업 포트폴리오 완성" },
  { icon: Zap, title: "글로벌 도전", desc: "Creazy Challenge로 세계 광고제 무대 경험" },
];

export default function ProgramPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[#0a1f14] text-white py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-4 block">
            Programs
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            실전으로 증명하는<br />
            <span className="text-emerald-400">4가지 프로그램</span>
          </h1>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
            경쟁PT, DAM Party, Creazy Challenge, MADzine.
            각각 다른 방식으로, 같은 목표를 향한다 ---- 실전 마케터로 성장.
          </p>
        </div>
      </section>

      {/* ── 프로그램 상세 ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          {mainPrograms.map((prog, i) => (
            <div
              key={prog.title}
              className={`rounded-3xl overflow-hidden border border-neutral-200 ${
                i % 2 === 0 ? "" : ""
              }`}
            >
              {/* Header bar */}
              <div className={`${prog.color} px-8 py-5 flex items-center gap-4`}>
                <prog.icon className="h-7 w-7 text-white" />
                <div>
                  <h3 className="text-xl font-black text-white">{prog.title}</h3>
                  <p className="text-sm text-white/70">{prog.subtitle}</p>
                </div>
              </div>

              <div className="p-8 bg-white">
                <p className="text-neutral-600 leading-relaxed mb-8 text-lg">
                  {prog.desc}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Details */}
                  <div>
                    <h4 className="font-bold text-neutral-900 mb-4 text-sm uppercase tracking-wider">
                      주요 내용
                    </h4>
                    <ul className="space-y-3">
                      {prog.details.map((d) => (
                        <li key={d} className="flex items-start gap-3 text-sm text-neutral-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0F5132] mt-2 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Meta */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                      <Calendar className="h-4 w-4 text-[#0F5132]" />
                      <span className="font-medium">빈도:</span> {prog.frequency}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                      <Users className="h-4 w-4 text-[#0F5132]" />
                      <span className="font-medium">참가:</span> {prog.participants}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-600">
                      <Clock className="h-4 w-4 text-[#0F5132]" />
                      <span className="font-medium">기간:</span> {prog.duration}
                    </div>
                  </div>
                </div>

                <Link
                  href={prog.href}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white font-semibold rounded-lg hover:bg-neutral-800 transition-colors text-sm"
                >
                  자세히 보기 <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 참여 혜택 ── */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4 text-center">
            리퍼가 얻는 것
          </h2>
          <p className="text-neutral-500 text-center mb-14 text-lg">
            매드리그 프로그램에 참여하면
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl border border-neutral-200 p-7 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0F5132]/10 flex items-center justify-center mx-auto mb-5">
                  <b.icon className="h-6 w-6 text-[#0F5132]" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{b.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-[#0a1f14] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black mb-4">
            프로그램에 참여하고 싶다면
          </h2>
          <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
            매드리그에 가입하면 모든 프로그램에 참여할 수 있다.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#0F5132] text-white font-bold text-lg hover:bg-[#0a3d24] transition-colors rounded-lg"
          >
            합류 신청하기 <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
