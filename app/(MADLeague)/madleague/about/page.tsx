"use client";

import {
  Target,
  Swords,
  Link2,
  MapPin,
  Users,
  Shield,
  ChevronRight,
  Building2,
  Quote,
} from "lucide-react";

const coreValues = [
  {
    icon: Swords,
    title: "실전",
    desc: "이론이 아니라 실전이다. 진짜 기업 과제, 진짜 경쟁, 진짜 결과.",
  },
  {
    icon: Target,
    title: "경쟁",
    desc: "건전한 경쟁이 성장을 만든다. 서로를 이기려 하면서 함께 올라간다.",
  },
  {
    icon: Link2,
    title: "연결",
    desc: "서울부터 제주까지. 학교와 지역의 벽을 넘어 전국이 하나로 연결된다.",
  },
];

const timeline = [
  {
    year: "2022",
    title: "MADLeap 출범",
    desc: "서울 권역 대학생 마케팅 동아리 연합 출범. 제1회 경쟁PT 개최.",
    highlight: true,
  },
  {
    year: "2023",
    title: "PAM 합류 — 부산 권역",
    desc: "부산/경남 권역 PAM이 매드리그에 합류. 제1회 DAM Party 개최.",
    highlight: false,
  },
  {
    year: "2024",
    title: "ADlle · ABC 합류",
    desc: "대구 ADlle, 광주 ABC 합류로 4개 권역 체제 완성. Creazy Challenge 시작.",
    highlight: false,
  },
  {
    year: "2025",
    title: "SUZAK 합류 — 전국 5개 권역",
    desc: "제주 SUZAK 합류. 전국 5개 권역, 200명 이상 리퍼. MADzine Vol.6 발행.",
    highlight: true,
  },
];

const structure = [
  {
    title: "매드리그 사무국",
    desc: "전체 운영 총괄. 경쟁PT 기획, DAM Party 운영, 파트너십 관리.",
    icon: Shield,
  },
  {
    title: "5개 권역 동아리",
    desc: "MADLeap(서울), PAM(부산), ADlle(대구), ABC(광주), SUZAK(제주). 각 권역 자율 운영 + 리그 공동 프로그램.",
    icon: MapPin,
  },
  {
    title: "리퍼(Leaguer)",
    desc: "매드리그 소속 대학생 멤버. 경쟁PT, 프로그램, 네트워킹에 참여.",
    icon: Users,
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-[#0a1f14] text-white py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 font-bold text-sm tracking-widest uppercase mb-4 block">
            Our Story
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
            2022년, 매드립에서 시작해<br />
            <span className="text-emerald-400">전국 연합이 되기까지</span>
          </h1>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-2xl mx-auto">
            작은 대학 동아리의 경쟁PT가, 전국 5개 권역 200명 이상의 리퍼가
            부딪히는 실전 마케팅 리그가 되었다.
          </p>
        </div>
      </section>

      {/* ── 핵심 가치 ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4 text-center">
            핵심 가치
          </h2>
          <p className="text-neutral-500 text-center mb-14 text-lg">
            매드리그를 움직이는 세 가지 원칙
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((v) => (
              <div
                key={v.title}
                className="p-8 bg-white border-2 border-neutral-100 rounded-2xl text-center hover:border-[#0F5132]/20 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0F5132]/10 text-[#0F5132] mb-5">
                  <v.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 mb-3">{v.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 철학 Quote ── */}
      <section className="py-16 px-6 bg-[#0F5132]">
        <div className="max-w-3xl mx-auto text-center">
          <Quote className="h-10 w-10 text-emerald-300/40 mx-auto mb-6" />
          <blockquote className="text-2xl md:text-3xl font-black text-white leading-snug mb-4">
            리더와 팔로어는 역할이지<br />직급이 아니다
          </blockquote>
          <p className="text-emerald-200/80 text-lg">
            매드리그에서는 누구나 리더가 되고, 누구나 팔로어가 된다.
            중요한 건 그 순간에 맡은 역할에 최선을 다하는 것.
          </p>
        </div>
      </section>

      {/* ── 타임라인 ── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-14 text-center">
            성장의 타임라인
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-neutral-200 -translate-x-1/2" />

            <div className="space-y-10">
              {timeline.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex items-start gap-8 ${
                    i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className={`absolute left-6 md:left-1/2 w-4 h-4 rounded-full border-4 border-white -translate-x-1/2 mt-1.5 z-10 ${
                    item.highlight ? "bg-[#0F5132]" : "bg-neutral-300"
                  }`} />

                  {/* Content */}
                  <div className={`ml-14 md:ml-0 md:w-1/2 ${
                    i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  }`}>
                    <span className={`inline-block px-3 py-0.5 rounded-full text-sm font-black mb-2 ${
                      item.highlight
                        ? "bg-[#0F5132]/10 text-[#0F5132]"
                        : "bg-neutral-100 text-neutral-500"
                    }`}>
                      {item.year}
                    </span>
                    <h3 className="text-lg font-bold text-neutral-900 mt-1">{item.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 운영 구조 ── */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4 text-center">
            운영 구조
          </h2>
          <p className="text-neutral-500 text-center mb-14 text-lg">
            사무국 + 5개 권역 자율 운영 체제
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {structure.map((s) => (
              <div
                key={s.title}
                className="bg-white rounded-2xl border border-neutral-200 p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 flex items-center justify-center mb-5">
                  <s.icon className="h-6 w-6 text-[#0F5132]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-3">{s.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5개 권역 맵 ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-neutral-900 mb-4 text-center">
            전국 5개 권역 네트워크
          </h2>
          <p className="text-neutral-500 text-center mb-14 text-lg">
            각 권역은 독립적으로 운영되면서, 매드리그 공동 프로그램에 참여한다
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { name: "MADLeap", city: "서울/경기", color: "bg-emerald-600", unis: ["연세대", "중앙대", "숭실대", "한양대 에리카"], count: "8개 대학" },
              { name: "PAM", city: "부산/경남", color: "bg-sky-600", unis: ["부산대", "경성대", "동아대"], count: "4개 대학" },
              { name: "ADlle", city: "대구/경북", color: "bg-orange-600", unis: ["경북대", "영남대", "계명대"], count: "3개 대학" },
              { name: "ABC", city: "광주/전남", color: "bg-purple-600", unis: ["전남대", "조선대", "광주대"], count: "3개 대학" },
              { name: "SUZAK", city: "제주", color: "bg-rose-600", unis: ["제주대"], count: "1개 대학" },
            ].map((r) => (
              <div
                key={r.name}
                className="bg-white border border-neutral-200 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center`}>
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 text-sm">{r.name}</h3>
                    <p className="text-xs text-neutral-400">{r.city}</p>
                  </div>
                </div>
                <p className="text-xs text-[#0F5132] font-semibold mb-2">{r.count}</p>
                <div className="space-y-1">
                  {r.unis.map((u) => (
                    <p key={u} className="text-xs text-neutral-500">{u}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 파트너 ── */}
      <section className="py-16 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-neutral-900 mb-8 text-center">파트너 & 후원</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Ten:One", "Badak", "SmarComm", "HeRo"].map((name) => (
              <div
                key={name}
                className="bg-white border border-neutral-200 rounded-xl p-6 text-center"
              >
                <Building2 className="h-6 w-6 text-neutral-300 mx-auto mb-2" />
                <span className="font-bold text-neutral-700 text-sm">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
