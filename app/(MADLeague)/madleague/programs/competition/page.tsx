"use client";

import Link from "next/link";
import {
  Users,
  Search,
  Lightbulb,
  Presentation,
  Trophy,
  Calendar,
  ArrowRight,
  ChevronRight,
  Clock,
  MapPin,
  Star,
  Medal,
} from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "팀 구성",
    desc: "같은 권역 또는 크로스 권역으로 4~6인 팀을 구성한다.",
  },
  {
    icon: Search,
    title: "과제 분석",
    desc: "실제 기업이 제시하는 마케팅 과제를 분석하고 시장 조사를 진행한다.",
  },
  {
    icon: Lightbulb,
    title: "전략 수립",
    desc: "타겟 분석, 포지셔닝, 크리에이티브, 미디어 플랜까지 전략을 짠다.",
  },
  {
    icon: Presentation,
    title: "경쟁 PT",
    desc: "현업 심사위원단 앞에서 경쟁 프레젠테이션. 최고의 전략이 이긴다.",
  },
];

const ptArchive = [
  {
    round: "제8회",
    title: "지평주조 100주년 마케팅",
    year: "2025",
    semester: "2학기",
    client: "지평주조",
    teams: 12,
    regions: "서울·부산·대구",
    winner: "팀 MADMAX (MADLeap)",
    desc: "지평주조 100주년을 기념하는 브랜드 리포지셔닝 및 MZ 타겟 캠페인",
  },
  {
    round: "제7회",
    title: "스타트업 브랜딩 챌린지",
    year: "2025",
    semester: "1학기",
    client: "스타트업 3사",
    teams: 10,
    regions: "전 권역",
    winner: "팀 SPARK (PAM)",
    desc: "초기 스타트업의 브랜드 아이덴티티·론칭 전략 수립",
  },
  {
    round: "제6회",
    title: "소셜 미디어 캠페인",
    year: "2024",
    semester: "2학기",
    client: "뷰티 브랜드 A",
    teams: 8,
    regions: "서울·부산",
    winner: "팀 BLAZE (MADLeap)",
    desc: "Z세대 타겟 소셜 미디어 마케팅 캠페인 기획·실행",
  },
  {
    round: "제5회",
    title: "로컬 브랜드 리브랜딩",
    year: "2024",
    semester: "1학기",
    client: "지역 F&B 브랜드",
    teams: 8,
    regions: "서울·대구",
    winner: "팀 ORBIT (ADlle)",
    desc: "지역 로컬 브랜드의 전국 확장을 위한 리브랜딩 전략",
  },
  {
    round: "제4회",
    title: "ESG 캠페인 기획",
    year: "2023",
    semester: "2학기",
    client: "제조업 B사",
    teams: 6,
    regions: "서울·부산",
    winner: "팀 GREEN (PAM)",
    desc: "ESG 경영 커뮤니케이션 및 소비자 인식 개선 캠페인",
  },
  {
    round: "제3회",
    title: "신제품 론칭 전략",
    year: "2023",
    semester: "1학기",
    client: "식품 브랜드 C",
    teams: 6,
    regions: "서울",
    winner: "팀 ROAR (MADLeap)",
    desc: "신제품 론칭을 위한 통합 마케팅 커뮤니케이션 전략",
  },
  {
    round: "제2회",
    title: "디지털 퍼포먼스 마케팅",
    year: "2022",
    semester: "2학기",
    client: "IT 스타트업 D",
    teams: 5,
    regions: "서울",
    winner: "팀 PULSE (MADLeap)",
    desc: "앱 다운로드 극대화를 위한 퍼포먼스 마케팅 전략",
  },
  {
    round: "제1회",
    title: "브랜드 인지도 캠페인",
    year: "2022",
    semester: "1학기",
    client: "카페 브랜드 E",
    teams: 4,
    regions: "서울",
    winner: "팀 WAVE (MADLeap)",
    desc: "매드리그 최초의 경쟁PT. 신생 카페 브랜드 인지도 확보 전략",
  },
];

const nextPT = {
  round: "제9회",
  title: "2026 상반기 경쟁PT",
  date: "2026년 4월 ~ 5월",
  status: "모집 예정",
  details: [
    "과제 기업: 추후 공개",
    "참가 대상: 매드리그 리퍼 전원",
    "참가 형태: 4~6인 팀",
    "진행: 전국 5개 권역 동시",
  ],
};

export default function PtPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[#0a1f14] text-white py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-4 block">
            Competition PT
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            진짜 기업 과제,<br />
            <span className="text-emerald-400">진짜 경쟁</span>
          </h1>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
            실제 기업의 마케팅 과제를 바탕으로, 전국 각 권역의 팀들이
            경쟁 프레젠테이션으로 맞붙는다. 이론이 아닌 실전이다.
          </p>
        </div>
      </section>

      {/* ── 진행 프로세스 ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-14 text-center">
            진행 프로세스
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] right-[-2rem] h-0.5 bg-neutral-200" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F5132]/10 text-[#0F5132] mb-4 relative">
                    <step.icon className="h-7 w-7" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0F5132] text-white text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 다음 경쟁PT ── */}
      <section className="py-16 px-6 bg-[#0F5132]">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full mb-4">
                {nextPT.status}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                {nextPT.round} {nextPT.title}
              </h2>
              <p className="text-emerald-200/80 flex items-center gap-2 mb-6">
                <Calendar className="h-4 w-4" /> {nextPT.date}
              </p>
              <ul className="space-y-2">
                {nextPT.details.map((d) => (
                  <li key={d} className="flex items-center gap-2 text-sm text-emerald-100/90">
                    <ChevronRight className="h-3 w-3 shrink-0" /> {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="shrink-0">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0F5132] font-bold rounded-lg hover:bg-emerald-50 transition-colors"
              >
                참가 신청 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 역대 경쟁PT 아카이브 ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4 text-center">
            역대 경쟁PT 아카이브
          </h2>
          <p className="text-neutral-500 text-center mb-14 text-lg">
            제1회부터 제8회까지, 매 시즌의 기록
          </p>

          <div className="space-y-4">
            {ptArchive.map((pt) => (
              <div
                key={pt.round}
                className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg hover:border-[#0F5132]/20 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
                  {/* Round badge */}
                  <div className="shrink-0">
                    <span className="inline-block px-4 py-1.5 bg-[#0F5132]/10 text-[#0F5132] font-black text-sm rounded-lg">
                      {pt.round}
                    </span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">{pt.title}</h3>
                    <p className="text-sm text-neutral-500 mb-3">{pt.desc}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {pt.year} {pt.semester}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {pt.regions}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {pt.teams}개 팀
                      </span>
                    </div>
                  </div>

                  {/* Winner */}
                  <div className="shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg">
                    <Medal className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="text-[10px] text-amber-600 font-semibold uppercase">Winner</p>
                      <p className="text-sm font-bold text-neutral-800">{pt.winner}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 수상작 갤러리 ── */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4 text-center">
            수상작 갤러리
          </h2>
          <p className="text-neutral-500 text-center mb-14 text-lg">
            역대 수상팀의 프레젠테이션 하이라이트
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ptArchive.slice(0, 6).map((pt) => (
              <div
                key={`gallery-${pt.round}`}
                className="bg-white rounded-2xl border border-neutral-200 overflow-hidden group hover:shadow-lg transition-shadow"
              >
                {/* Placeholder thumbnail */}
                <div className="h-48 bg-gradient-to-br from-[#0F5132]/10 to-emerald-50 flex items-center justify-center relative">
                  <div className="text-center">
                    <span className="text-4xl font-black text-[#0F5132]/15">{pt.round}</span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 bg-white/80 backdrop-blur-sm text-xs font-bold text-[#0F5132] rounded-full">
                      {pt.year}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-neutral-900 mb-1">{pt.title}</h3>
                  <p className="text-xs text-neutral-400 mb-3">Client: {pt.client}</p>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-sm font-semibold text-neutral-700">{pt.winner}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-[#0a1f14] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black mb-4">
            다음 경쟁PT의 주인공이 되어라
          </h2>
          <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
            제9회 경쟁PT 참가팀을 모집한다.<br />
            진짜 과제, 진짜 경쟁, 진짜 성장.
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
