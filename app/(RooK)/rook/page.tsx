"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Film,
  Image,
  Music,
  Palette,
  Users,
  Eye,
  Award,
  Sparkles,
  Trophy,
  Clock,
  Flame,
  Star,
  MonitorPlay,
  Wand2,
} from "lucide-react";

/* ── 갤러리 작품 ── */
const gallery = [
  { id: 1, title: "비열한 저잣거리", category: "AI Film", icon: Film, color: "from-orange-500 to-red-600" },
  { id: 2, title: "FEARLESS - MV", category: "Music Video", icon: Music, color: "from-pink-500 to-purple-600" },
  { id: 3, title: "까치호랑이", category: "AI Art", icon: Image, color: "from-amber-500 to-orange-600" },
  { id: 4, title: "조선의 바람", category: "AI Art", icon: Palette, color: "from-red-500 to-rose-600" },
  { id: 5, title: "사이버펑크 서울", category: "AI Art", icon: Sparkles, color: "from-cyan-500 to-blue-600" },
  { id: 6, title: "진주 귀걸이를 한 소녀", category: "Classic Remake", icon: Image, color: "from-emerald-500 to-teal-600" },
];

/* ── 최근 작품 (NEW) ── */
const latestWorks = [
  { title: "사이버펑크 느와르 액션", creator: "루크 스튜디오", date: "2026.03.25", views: "2.3K", category: "AI Film" },
  { title: "이소룡 피규어 AI 생성", creator: "미연", date: "2026.03.22", views: "1.8K", category: "AI Art" },
  { title: "오피스 액션 피규어", creator: "하은", date: "2026.03.20", views: "1.5K", category: "AI Art" },
  { title: "니에프스의 창 - 최초의 사진", creator: "유진", date: "2026.03.18", views: "1.2K", category: "Classic Remake" },
];

/* ── 챌린지 현황 ── */
const challenges = [
  {
    title: "K-Heritage AI Art Challenge",
    desc: "한국의 전통 문화유산을 AI로 재해석하는 챌린지",
    deadline: "2026.04.30",
    participants: 47,
    prize: "100만원",
    status: "진행 중",
    hot: true,
  },
  {
    title: "AI Short Film Festival",
    desc: "3분 이내 AI 단편 영화 공모",
    deadline: "2026.05.15",
    participants: 23,
    prize: "200만원",
    status: "모집 중",
    hot: false,
  },
  {
    title: "Classic Masterpiece Remix",
    desc: "명화를 AI로 리믹스하는 월간 챌린지",
    deadline: "매월 말",
    participants: 89,
    prize: "50만원/월",
    status: "상시",
    hot: false,
  },
];

/* ── 크리에이터 프로필 ── */
const creators = [
  { name: "미연", role: "Visual Artist", specialty: "패션 & 뷰티 비주얼", works: 24, followers: "3.2K" },
  { name: "하은", role: "Character Designer", specialty: "캐릭터 & 일러스트", works: 31, followers: "2.8K" },
  { name: "수아", role: "Fashion AI", specialty: "AI 패션 생성", works: 18, followers: "4.1K" },
  { name: "지우", role: "Portrait Artist", specialty: "인물 & 초상화", works: 22, followers: "2.5K" },
  { name: "다인", role: "K-Girl Group", specialty: "AI 아이돌", works: 15, followers: "5.7K" },
  { name: "세라", role: "Concept Artist", specialty: "컨셉 아트", works: 29, followers: "1.9K" },
  { name: "유진", role: "Classical AI", specialty: "클래식 리메이크", works: 12, followers: "2.1K" },
  { name: "민서", role: "Digital Human", specialty: "디지털 휴먼", works: 20, followers: "3.5K" },
];

/* ── 통계 ── */
const stats = [
  { icon: Film, value: "50+", label: "작품" },
  { icon: Users, value: "9", label: "AI Artist" },
  { icon: Eye, value: "45K+", label: "총 조회수" },
  { icon: Award, value: "5", label: "장르" },
];

/* ── Universe 연결 ── */
const universeLinks = [
  { brand: "LUKI", desc: "AI 아이돌 — RooK 크리에이터 합작", color: "text-pink-400" },
  { brand: "MAD League", desc: "대학생 크리에이터 발굴", color: "text-violet-400" },
  { brand: "SmarComm", desc: "AI 콘텐츠 마케팅 협업", color: "text-emerald-400" },
  { brand: "HeRo", desc: "크리에이티브 인재 매칭", color: "text-orange-400" },
];

export default function RooKHome() {
  const [activeTab, setActiveTab] = useState<"gallery" | "latest">("gallery");

  return (
    <div className="bg-[#0a0a0a]">
      {/* ━━ Hero Section ━━ */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#185FA5]/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative text-center px-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-[#185FA5]/20 border border-[#185FA5]/30 px-4 py-1.5 rounded-full mb-8">
            <Wand2 className="w-4 h-4 text-[#185FA5]" />
            <span className="text-sm text-[#5A9BD5] font-medium">AI CREATOR PLATFORM</span>
          </div>

          <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            AI로{" "}
            <span className="bg-gradient-to-r from-[#185FA5] to-[#5A9BD5] bg-clip-text text-transparent">
              창작
            </span>
            하다
          </h1>

          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            밈에서 영화까지, RooK의 창작 영역에는 경계가 없습니다.
            <br className="hidden md:block" />
            AI 크리에이터들이 만드는 새로운 콘텐츠의 세계.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/rook/works"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#185FA5] text-white font-bold hover:bg-[#1a6dba] transition-colors rounded-xl shadow-lg shadow-[#185FA5]/30"
            >
              <Play className="h-4 w-4" /> 작품 갤러리
            </Link>
            <Link
              href="/rook/rookie"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-neutral-700 text-neutral-300 font-bold hover:border-[#185FA5] hover:text-[#5A9BD5] transition-colors rounded-xl"
            >
              RooKie 지원하기
            </Link>
          </div>
        </div>
      </section>

      {/* ━━ Stats ━━ */}
      <section className="border-y border-neutral-800">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="w-5 h-5 text-[#185FA5] mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-black text-white">{s.value}</div>
                <div className="text-xs text-neutral-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 갤러리 / 최신 작품 탭 ━━ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Works</h2>
              <p className="text-neutral-500">RooK 크리에이터들의 작품 세계</p>
            </div>
            <div className="inline-flex bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("gallery")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "gallery" ? "bg-[#185FA5] text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                갤러리
              </button>
              <button
                onClick={() => setActiveTab("latest")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "latest" ? "bg-[#185FA5] text-white" : "text-neutral-400 hover:text-white"
                }`}
              >
                최신 작품
              </button>
            </div>
          </div>

          {activeTab === "gallery" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((work) => {
                const Icon = work.icon;
                return (
                  <Link
                    key={work.id}
                    href="/rook/works"
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${work.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
                      <Icon className="w-10 h-10 text-white/90 mb-3" />
                      <p className="text-white font-bold text-lg">{work.title}</p>
                      <p className="text-white/70 text-xs mt-1">{work.category}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {latestWorks.map((w) => (
                <Link
                  key={w.title}
                  href="/rook/works"
                  className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-[#185FA5]/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#185FA5]/20 flex items-center justify-center shrink-0">
                    <MonitorPlay className="w-5 h-5 text-[#185FA5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{w.title}</p>
                    <p className="text-xs text-neutral-500">{w.creator} · {w.category}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-neutral-500 shrink-0">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{w.views}</span>
                    <span>{w.date}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-600 shrink-0" />
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/rook/works"
              className="inline-flex items-center gap-2 text-sm text-[#5A9BD5] font-semibold hover:text-[#185FA5] transition-colors"
            >
              전체 작품 보기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━ 챌린지 현황 ━━ */}
      <section className="py-20 px-6 bg-gradient-to-b from-[#0a0a0a] to-[#111]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">챌린지</h2>
            <p className="text-neutral-500">AI 크리에이터를 위한 도전의 무대</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {challenges.map((ch) => (
              <div
                key={ch.title}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 hover:border-[#185FA5]/50 transition-colors relative"
              >
                {ch.hot && (
                  <div className="absolute -top-2 right-4 flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <Flame className="w-3 h-3" /> HOT
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-[#185FA5]" />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    ch.status === "진행 중" ? "bg-emerald-500/20 text-emerald-400" :
                    ch.status === "모집 중" ? "bg-blue-500/20 text-blue-400" :
                    "bg-neutral-700 text-neutral-400"
                  }`}>
                    {ch.status}
                  </span>
                </div>
                <h3 className="text-white font-bold mb-2">{ch.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">{ch.desc}</p>
                <div className="space-y-2 text-xs text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> 마감: {ch.deadline}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> 참여: {ch.participants}명
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5" /> 상금: {ch.prize}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 크리에이터 프로필 ━━ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">AI Artist</h2>
              <p className="text-neutral-500">RooK 소속 AI 크리에이터</p>
            </div>
            <Link
              href="/rook/artist"
              className="inline-flex items-center gap-1 text-sm text-[#5A9BD5] font-semibold hover:text-[#185FA5] transition-colors"
            >
              전체 아티스트 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {creators.map((c) => (
              <Link
                key={c.name}
                href="/rook/artist"
                className="group bg-neutral-900 border border-neutral-800 rounded-2xl p-5 hover:border-[#185FA5]/50 transition-all text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#185FA5] to-[#5A9BD5] flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {c.name.charAt(0)}
                </div>
                <p className="text-white font-bold group-hover:text-[#5A9BD5] transition-colors">{c.name}</p>
                <p className="text-xs text-[#185FA5] mb-1">{c.role}</p>
                <p className="text-xs text-neutral-500 mb-3">{c.specialty}</p>
                <div className="flex justify-center gap-4 text-xs text-neutral-500">
                  <span>{c.works} works</span>
                  <span>{c.followers} fans</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Universe 연결 ━━ */}
      <section className="py-16 px-6 border-t border-neutral-800">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-white mb-2">Ten:One Universe</h2>
            <p className="text-neutral-500 text-sm">RooK이 연결하는 크리에이티브 생태계</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {universeLinks.map((u) => (
              <div key={u.brand} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
                <p className={`font-bold mb-1 ${u.color}`}>{u.brand}</p>
                <p className="text-xs text-neutral-500">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ RooKie CTA ━━ */}
      <section className="py-20 px-6 bg-gradient-to-t from-[#185FA5]/20 to-transparent">
        <div className="mx-auto max-w-4xl text-center">
          <Palette className="w-12 h-12 text-[#185FA5] mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 italic">
            I want You<br />For RooKie
          </h2>
          <p className="text-neutral-400 mb-4 max-w-xl mx-auto">
            RooKie는 RooK과 함께 AI 창작을 연구하며 콘텐츠를 제작하는 신입 크리에이터입니다.
            수시 모집 중이니 많은 도전 부탁드립니다.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/rook/rookie"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#185FA5] text-white font-bold hover:bg-[#1a6dba] transition-colors rounded-xl"
            >
              RooKie 지원하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/rook/about"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-neutral-700 text-neutral-300 font-bold hover:border-[#185FA5] hover:text-[#5A9BD5] transition-colors rounded-xl"
            >
              RooK 알아보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
