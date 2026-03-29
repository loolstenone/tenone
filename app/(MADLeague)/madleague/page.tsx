"use client";

import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Users,
  Trophy,
  PartyPopper,
  Presentation,
  Megaphone,
  BookOpen,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const stats = [
  { label: "전국 권역", value: "5개", icon: MapPin },
  { label: "리퍼(Leaguer)", value: "200+", icon: Users },
  { label: "경쟁PT 누적", value: "8회", icon: Presentation },
  { label: "DAM Party", value: "4회", icon: PartyPopper },
];

const regions = [
  {
    name: "MADLeap",
    city: "서울",
    color: "bg-emerald-600",
    desc: "매드리그의 시작점. 서울/수도권 대학생 마케팅 동아리 연합",
    members: "80+",
    href: "/madleague/about",
  },
  {
    name: "PAM",
    city: "부산",
    color: "bg-sky-600",
    desc: "부산/경남 권역 광고·마케팅 대학생 프로젝트 그룹",
    members: "40+",
    href: "/madleague/about",
  },
  {
    name: "ADlle",
    city: "대구",
    color: "bg-orange-600",
    desc: "대구/경북 권역 광고 크리에이티브 연합",
    members: "30+",
    href: "/madleague/about",
  },
  {
    name: "ABC",
    city: "광주",
    color: "bg-purple-600",
    desc: "광주/전남 권역 광고·브랜딩 커뮤니티",
    members: "25+",
    href: "/madleague/about",
  },
  {
    name: "SUZAK",
    city: "제주",
    color: "bg-rose-600",
    desc: "제주 권역 크리에이티브 마케팅 동아리",
    members: "15+",
    href: "/madleague/about",
  },
];

const recentActivities = [
  {
    type: "경쟁PT",
    title: "제8회 경쟁PT — 지평주조 100주년 마케팅",
    date: "2025.11",
    desc: "12개 팀 참가, 서울·부산·대구 3개 권역 동시 진행",
  },
  {
    type: "DAM Party",
    title: "제4회 DAM Party — 기업×대학생 네트워킹",
    date: "2025.09",
    desc: "15개 기업, 120명 대학생 참가. 현장 면접·포트폴리오 리뷰",
  },
  {
    type: "MADzine",
    title: "MADzine Vol.6 — 'Z세대 브랜딩 해부학'",
    date: "2025.08",
    desc: "전국 리퍼 기고, 브랜드 케이스 스터디 12편 수록",
  },
];

const programs = [
  {
    icon: Presentation,
    title: "경쟁PT",
    desc: "실제 기업 과제를 팀 단위로 분석·기획·발표하는 실전 마케팅 경연",
    href: "/madleague/pt",
  },
  {
    icon: PartyPopper,
    title: "DAM Party",
    desc: "기업 실무자와 대학생이 만나는 네트워킹 파티. 면접·포트폴리오 리뷰",
    href: "/madleague/program",
  },
  {
    icon: Trophy,
    title: "Creazy Challenge",
    desc: "칸 라이언즈, 클리오, D&AD 등 글로벌 광고제 도전 프로그램",
    href: "/madleague/program",
  },
  {
    icon: BookOpen,
    title: "MADzine",
    desc: "전국 리퍼가 기고하는 마케팅·광고·브랜딩 연합 매거진",
    href: "/madleague/madzine",
  },
];

const partners = [
  { name: "Ten:One", role: "운영 파트너" },
  { name: "Badak", role: "네트워크 파트너" },
  { name: "SmarComm", role: "마케팅 솔루션" },
  { name: "HeRo", role: "인재 파트너" },
];

export default function MadLeagueHomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative bg-[#0a1f14] text-white min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)`,
          backgroundSize: "40px 40px",
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1f14]" />

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-emerald-300 mb-8">
            <Sparkles className="h-4 w-4" />
            전국 5개 권역 대학생 마케팅/광고 프로젝트 연합
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
            실전이 나를<br />
            <span className="text-emerald-400">강하게 만든다</span>
          </h1>

          <p className="text-lg sm:text-xl text-neutral-300 mb-12 leading-relaxed max-w-2xl mx-auto">
            경쟁하고, 행동하고, 성장하라.<br />
            MAD League는 전국 대학생이 실전 마케팅으로 부딪히는 곳이다.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/madleague/about"
              className="px-10 py-4 bg-[#0F5132] text-white font-bold text-lg hover:bg-[#0a3d24] transition-colors rounded-lg"
            >
              매드리그 알아보기
            </Link>
            <Link
              href="/signup"
              className="px-10 py-4 border-2 border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-colors rounded-lg"
            >
              지금 합류하기
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#0F5132] text-white py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-2xl font-black">{s.value}</p>
                  <p className="text-sm text-emerald-200/80">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5개 권역 ── */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-black text-neutral-900 mb-3">
              전국 5개 권역
            </h2>
            <p className="text-neutral-500 text-lg">
              서울부터 제주까지, 각 권역의 독립 동아리가 하나의 리그로 뭉쳤다
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {regions.map((r) => (
              <Link
                key={r.name}
                href={r.href}
                className="group bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-xl hover:border-[#0F5132]/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${r.color} flex items-center justify-center`}>
                    <span className="text-white font-black text-xs">
                      {r.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 group-hover:text-[#0F5132] transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-xs text-neutral-400">{r.city}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                  {r.desc}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F5132]">
                    {r.members} 리퍼
                  </span>
                  <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-[#0F5132] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 최근 활동 ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-neutral-900">최근 활동</h2>
            <Link href="/madleague/madzine" className="text-sm text-[#0F5132] font-semibold hover:underline flex items-center gap-1">
              전체보기 <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentActivities.map((a) => (
              <div
                key={a.title}
                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Placeholder image area */}
                <div className="h-44 bg-gradient-to-br from-[#0F5132]/10 to-emerald-50 flex items-center justify-center">
                  <span className="text-5xl font-black text-[#0F5132]/10">MAD</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 bg-[#0F5132]/10 text-[#0F5132] text-xs font-bold rounded-full">
                      {a.type}
                    </span>
                    <span className="text-xs text-neutral-400">{a.date}</span>
                  </div>
                  <h3 className="font-bold text-neutral-900 mb-2 leading-snug">{a.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 주요 프로그램 ── */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-4xl font-black text-neutral-900 mb-3">주요 프로그램</h2>
            <p className="text-neutral-500 text-lg">실전 마케팅 역량을 키우는 4가지 핵심 프로그램</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="group bg-white rounded-2xl border border-neutral-200 p-7 hover:shadow-xl hover:border-[#0F5132]/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0F5132]/10 flex items-center justify-center mb-5">
                  <p.icon className="h-6 w-6 text-[#0F5132]" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2 group-hover:text-[#0F5132] transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">{p.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F5132]">
                  자세히 보기 <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 파트너 ── */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-neutral-900 mb-8 text-center">파트너</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {partners.map((p) => (
              <div
                key={p.name}
                className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 text-center hover:border-[#0F5132]/30 transition-colors"
              >
                <Megaphone className="h-6 w-6 text-neutral-300 mx-auto mb-3" />
                <p className="font-bold text-neutral-800">{p.name}</p>
                <p className="text-xs text-neutral-400 mt-1">{p.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-[#0a1f14] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-black mb-4">
            다음 시즌, 너도 리퍼가 돼라
          </h2>
          <p className="text-neutral-400 text-lg mb-10 leading-relaxed">
            전국 200명 넘는 대학생이 매드리그에서<br />
            실전 마케팅으로 성장하고 있다.
          </p>
          <Link
            href="/signup"
            className="inline-block px-12 py-4 bg-[#0F5132] text-white font-bold text-lg hover:bg-[#0a3d24] transition-colors rounded-lg"
          >
            합류 신청하기
          </Link>
        </div>
      </section>
    </div>
  );
}
