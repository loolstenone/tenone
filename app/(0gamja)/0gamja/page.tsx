"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Heart,
  BookOpen,
  Feather,
  MessageCircle,
  Users,
  Sparkles,
  Coffee,
  Smile,
  PenTool,
  Eye,
  Clock,
  Star,
  HeartHandshake,
  Lightbulb,
} from "lucide-react";

/* ── 최근 콘텐츠 ── */
const recentPosts = [
  {
    id: 1,
    title: "당신의 하루에",
    author: "GamjaJeon",
    category: "에세이",
    excerpt: "오늘 아침, 뿌연 하늘이 궁금해 창가로 다가가니 비가 온다. 창가에 맺힌 이슬방울 하나가 내 시선을 붙잡았다.",
    date: "2026.03.23",
    views: 342,
    likes: 28,
    mood: "peaceful",
  },
  {
    id: 2,
    title: "겨울다운 겨울,",
    author: "gamjamaster",
    category: "에세이",
    excerpt: "겨울은 겨울다워야 한다. 코끝이 시리고 손끝이 차갑고, 입김이 뿌옇게 피어오르는 그런 겨울.",
    date: "2026.03.17",
    views: 289,
    likes: 41,
    mood: "cozy",
  },
  {
    id: 3,
    title: "트루먼 쇼 세상에 사는 루비 로드",
    author: "gamjamaster",
    category: "에세이",
    excerpt: "우리 모두는 자신만의 작은 트루먼 쇼를 살고 있다. 스마트폰 하나로 배우이자 감독이자 관객이 된 시대.",
    date: "2026.03.16",
    views: 415,
    likes: 56,
    mood: "thoughtful",
  },
  {
    id: 4,
    title: "로션 대신 연고를 발라보자!",
    author: "Glow Gamja",
    category: "뷰티",
    excerpt: "요즘은 약국에서 판매하는 제약 제품을 화장품으로 활용하는 트렌드가 뜨거운데요!",
    date: "2026.03.06",
    views: 523,
    likes: 72,
    mood: "fun",
  },
  {
    id: 5,
    title: "나는 감자 깎는 기계였다.",
    author: "GamjaJeon",
    category: "에세이",
    excerpt: "그리고 나는 감자 깎는 기계였다. 내 앞에 일했던 사람도, 그 앞에 일했던 사람도.",
    date: "2026.02.27",
    views: 198,
    likes: 33,
    mood: "reflective",
  },
  {
    id: 6,
    title: "감자 여러분 안녕!",
    author: "gamjamaster",
    category: "소개",
    excerpt: "공감자는 평범한 사람들의 일상에 공감하고 감자들의 성장에 영감을 불어넣는 이야기를 담아냅니다.",
    date: "2026.01.27",
    views: 687,
    likes: 95,
    mood: "warm",
  },
];

const moodColors: Record<string, string> = {
  peaceful: "bg-sky-100 text-sky-600",
  cozy: "bg-amber-100 text-amber-600",
  thoughtful: "bg-violet-100 text-violet-600",
  fun: "bg-pink-100 text-pink-600",
  reflective: "bg-slate-100 text-slate-600",
  warm: "bg-rose-100 text-rose-600",
};

/* ── 작가 소개 ── */
const writers = [
  {
    name: "gamjamaster",
    role: "대장 감자",
    desc: "공감자의 시작. 일상의 소소한 순간을 따뜻한 시선으로 담아냅니다.",
    posts: 12,
    specialty: "에세이 & 일상",
  },
  {
    name: "GamjaJeon",
    role: "감자전",
    desc: "치열한 일상 속에서 찾는 작은 위로. 공장에서 사무실까지, 모든 직장인의 이야기.",
    posts: 8,
    specialty: "직장 에세이",
  },
  {
    name: "Glow Gamja",
    role: "윤감자",
    desc: "피부부터 마음까지 빛나게. 가성비 뷰티 팁과 셀프케어를 나눕니다.",
    posts: 5,
    specialty: "뷰티 & 셀프케어",
  },
];

/* ── 심리 상담 / 공감 프로그램 ── */
const empathyPrograms = [
  {
    icon: MessageCircle,
    title: "감자톡",
    desc: "익명으로 속마음을 나누는 공간. 감자들끼리 서로 위로하고 공감합니다.",
    status: "상시 운영",
  },
  {
    icon: HeartHandshake,
    title: "1:1 감자 상담",
    desc: "혼자 감당하기 힘든 이야기가 있다면. 전문 상담사가 함께합니다.",
    status: "예약제",
  },
  {
    icon: Lightbulb,
    title: "성장 감자 워크숍",
    desc: "자존감, 관계, 진로 고민. 같은 세대 감자들과 함께 답을 찾아가는 워크숍.",
    status: "월 2회",
  },
];

/* ── 통계 ── */
const statItems = [
  { icon: BookOpen, value: "50+", label: "발행 콘텐츠" },
  { icon: Users, value: "3", label: "필찐(필진)" },
  { icon: Heart, value: "2.1K+", label: "공감 수" },
  { icon: Eye, value: "8.5K+", label: "누적 조회" },
];

/* ── 카테고리 ── */
const categories = [
  { name: "에세이", count: 28, color: "bg-pink-100 text-pink-600" },
  { name: "뷰티", count: 8, color: "bg-purple-100 text-purple-600" },
  { name: "일상", count: 12, color: "bg-amber-100 text-amber-600" },
  { name: "소개", count: 3, color: "bg-sky-100 text-sky-600" },
];

/* ── Universe 연결 ── */
const universeLinks = [
  { brand: "MAD League", desc: "대학생 커뮤니티 콘텐츠 협업", color: "text-violet-500" },
  { brand: "HeRo", desc: "청년 커리어 고민 콘텐츠", color: "text-orange-500" },
  { brand: "ChangeUp", desc: "창업 이야기 & 동기부여", color: "text-teal-500" },
  { brand: "RooK", desc: "AI 아트 & 감성 비주얼 협업", color: "text-blue-500" },
];

export default function OgamjaHome() {
  return (
    <div>
      {/* ━━ Hero Section ━━ */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden">
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#F472B6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-amber-200/20 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-[#F472B6]/10 px-4 py-1.5 rounded-full mb-8">
              <Heart className="w-4 h-4 text-[#F472B6]" />
              <span className="text-sm font-semibold text-[#F472B6]">Young & Empathy</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              하찮지만 귀여운<br />
              <span className="text-[#F472B6]">감자들</span>의 공감 이야기
            </h1>

            <p className="text-lg md:text-xl text-neutral-500 leading-relaxed mb-10 max-w-2xl mx-auto">
              평범한 일상에 공감하고, 소소한 순간에 웃음을 나누며,
              함께 성장하는 <strong className="text-neutral-700">공감자</strong> 이야기입니다.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/0gamja/writers"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#F472B6] text-white font-bold hover:bg-[#EC4899] transition-colors rounded-xl shadow-lg shadow-[#F472B6]/20"
              >
                <Feather className="h-4 w-4" /> 필찐 알아보기
              </Link>
              <Link
                href="/0gamja/about"
                className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-neutral-300 text-neutral-700 font-bold hover:border-[#F472B6] hover:text-[#F472B6] transition-colors rounded-xl"
              >
                공감자 소개
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ━━ Stats ━━ */}
      <section className="bg-[#F472B6]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {statItems.map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <s.icon className="w-5 h-5 text-white/80 mb-2" />
                <div className="text-2xl md:text-3xl font-black">{s.value}</div>
                <div className="text-sm text-white/80 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 최근 콘텐츠 ━━ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">최근 이야기</h2>
              <p className="text-neutral-500">감자들이 나누는 따뜻한 글</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.name}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full ${cat.color} cursor-pointer hover:opacity-80 transition-opacity`}
                >
                  {cat.name} ({cat.count})
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href="/0gamja"
                className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-xl hover:border-[#F472B6]/40 transition-all"
              >
                <div className="aspect-[16/9] bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center relative">
                  <Coffee className="w-12 h-12 text-[#F472B6]/30" />
                  <div className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full ${moodColors[post.mood] || "bg-neutral-100 text-neutral-500"}`}>
                    {post.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-neutral-900 group-hover:text-[#F472B6] transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-neutral-600">by {post.author}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views}</span>
                    </div>
                    <span>{post.date}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 작가 소개 ━━ */}
      <section className="py-20 px-6 bg-neutral-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">필찐 소개</h2>
            <p className="text-neutral-500">공감자와 함께하는 감자 작가들</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {writers.map((w) => (
              <div
                key={w.name}
                className="bg-white rounded-2xl p-8 border border-neutral-200 hover:border-[#F472B6]/40 hover:shadow-lg transition-all text-center"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F472B6] to-pink-300 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {w.name.charAt(0)}
                </div>
                <h3 className="text-lg font-bold mb-1">{w.name}</h3>
                <p className="text-sm text-[#F472B6] font-medium mb-1">{w.role}</p>
                <p className="text-xs text-neutral-400 mb-4">{w.specialty}</p>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">{w.desc}</p>
                <div className="flex items-center justify-center gap-2">
                  <PenTool className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-500">{w.posts}편 발행</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/0gamja/writers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F472B6]/10 text-[#F472B6] font-semibold hover:bg-[#F472B6]/20 transition-colors rounded-xl"
            >
              필찐 되기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ━━ 심리 상담 / 공감 프로그램 ━━ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">공감 프로그램</h2>
            <p className="text-neutral-500">혼자가 아닌 함께, 감자들의 마음 돌봄</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {empathyPrograms.map((prog) => (
              <div
                key={prog.title}
                className="border border-neutral-200 rounded-2xl p-8 hover:border-[#F472B6] hover:shadow-lg transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F472B6]/10 flex items-center justify-center mb-5">
                  <prog.icon className="w-7 h-7 text-[#F472B6]" />
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-[#F472B6] transition-colors">{prog.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">{prog.desc}</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span className="text-xs text-neutral-400 font-medium">{prog.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ 놓치면 아쉬운 글 ━━ */}
      <section className="py-16 px-6 bg-gradient-to-br from-pink-50 to-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold mb-2">흘린 감자 주워드림</h2>
          <p className="text-neutral-500 mb-8">놓치면 아쉬운 인기 글</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentPosts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href="/0gamja"
                className="group flex items-center gap-4 bg-white rounded-2xl p-5 border border-neutral-200 hover:border-[#F472B6]/40 hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-[#F472B6]/10 flex items-center justify-center shrink-0">
                  <Smile className="w-6 h-6 text-[#F472B6]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 group-hover:text-[#F472B6] transition-colors truncate">{post.title}</p>
                  <p className="text-sm text-neutral-500">by {post.author}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                    <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{post.likes}</span>
                    <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{post.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Universe 연결 ━━ */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold mb-2">Ten:One Universe</h2>
            <p className="text-neutral-500 text-sm">공감자가 연결하는 따뜻한 생태계</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {universeLinks.map((u) => (
              <div key={u.brand} className="border border-neutral-200 rounded-xl p-4 text-center hover:shadow-md transition-all">
                <p className={`font-bold mb-1 ${u.color}`}>{u.brand}</p>
                <p className="text-xs text-neutral-500">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ CTA ━━ */}
      <section className="bg-gradient-to-r from-[#F472B6] to-pink-400">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 text-center">
          <Feather className="w-10 h-10 text-white/80 mx-auto mb-4" />
          <h2 className="text-2xl md:text-4xl font-black text-white mb-4">
            당신도 감자가 되어주세요
          </h2>
          <p className="text-white/80 mb-10 max-w-xl mx-auto text-lg">
            하찮아도 괜찮아요. 소소한 이야기가 누군가에게는 큰 위로가 됩니다.
            함께 공감하고 함께 성장해요.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/0gamja/writers"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-[#F472B6] font-bold hover:bg-pink-50 transition-colors rounded-xl"
            >
              필찐 지원하기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/0gamja/programs"
              className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white text-white font-bold hover:bg-white/10 transition-colors rounded-xl"
            >
              공감 프로그램 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
