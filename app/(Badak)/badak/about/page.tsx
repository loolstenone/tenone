'use client';

import Link from 'next/link';
import {
  Users, Target, TrendingUp, MessageCircle,
  ArrowRight, Sparkles, Heart, Zap,
  ChevronRight, Crown, Search,
} from 'lucide-react';

const FLOW_STEPS = [
  {
    step: '01',
    title: '니즈를 말하다',
    desc: '"이직 준비 같이할 사람!", "GA4 세팅 좀 알려줘"… 당신의 솔직한 니즈를 던져주세요.',
    icon: Search,
    accent: '#ffd93d',
  },
  {
    step: '02',
    title: '관심이 모이다',
    desc: '같은 고민을 가진 사람들이 "나도!"를 누릅니다. 15명이 모이면 모임 개설이 가능해집니다.',
    icon: Heart,
    accent: '#ff6b6b',
  },
  {
    step: '03',
    title: '바닥장이 나서다',
    desc: '누군가가 "내가 이끌어 볼게"라고 손을 듭니다. 바닥장은 모임을 만들고 이끄는 사람입니다.',
    icon: Crown,
    accent: '#4ade80',
  },
  {
    step: '04',
    title: '만남이 시작되다',
    desc: '1회 단발, 연속, 정기, 비정기… 형태는 자유. 중요한 건 같은 바닥에서 만나는 것.',
    icon: Sparkles,
    accent: '#74b9ff',
  },
];

const FEATURES = [
  { title: '니즈 클라우드', desc: '업계 사람들의 진짜 고민과 니즈가 실시간으로 모입니다', href: '/badak' },
  { title: '탐색', desc: '니즈별 관심 인원, 모임 현황을 한눈에 보고 나에게 맞는 니즈를 찾으세요', href: '/badak/explore' },
  { title: '모임', desc: '1회 밋업부터 연속 스터디, 정기 네트워킹까지 다양한 만남', href: '/badak/groups' },
  { title: '스토리', desc: '바닥에서 만남이 만들어낸 성장과 변화의 이야기', href: '/badak/story' },
  { title: '커뮤니티', desc: '자유롭게 이야기 나누고, 질문하고, 정보를 공유하는 공간', href: '/badak/community' },
  { title: '바닥장 신청', desc: '바닥장이 되어 모임을 이끌어보세요', href: '/badak/apply' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] pt-14">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,217,61,0.3) 0%, transparent 60%)' }} />

        <div className="relative mx-auto max-w-2xl">
          <p className="mb-4 text-xs font-medium tracking-widest text-white/30">NEEDS · WANTS · CONNECTION</p>

          <h1 className="mb-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
            바닥
          </h1>

          <div className="mx-auto mb-8 max-w-md space-y-3 text-sm leading-relaxed text-white/50">
            <p>우리는 흔히 업계를 <span className="text-white/80 font-medium">바닥</span>이라고 합니다.</p>
            <p><span className="text-white/80 font-medium">바닥 좁다</span>고도 합니다.</p>
            <p>그런데 그 좁은 바닥인데,<br />만나기는 어렵습니다.</p>
          </div>
        </div>
      </section>

      {/* ── 철학 ── */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-white/8 p-6 sm:p-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="space-y-4 text-sm leading-loose text-white/45">
              <p>
                다 뻔히 아는 처지라는 생각에<br />
                서로에게 바랄 게 없다고 생각합니다.
              </p>
              <p>
                만남을 통해서 뭔가 큰 걸 바라는 건 아닐 겁니다.
              </p>
              <p className="text-white/60">
                그러나 잘 생각해 보세요.
              </p>
              <p className="text-white/60">
                우연한 만남 속에서 기회가 찾아오거나,<br />
                줏어 들은 정보나 지식으로 좋은 기회를 만들기도 합니다.
              </p>
              <p className="text-white/70 font-medium">
                죽고 못 사는 막역한 사이보다는<br />
                나를 좋게 본 <span className="text-amber-400">약한 연결 고리</span>의 의인이<br />
                나에게 기회를 만들어 주기도 합니다.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-base font-bold text-white/70">
              성장하고 싶은 사람들의 꿈을 서로 만나게 하고 싶다.
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-400">
              니즈와 원츠를 만나게 하다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 어떻게 작동하나요 ── */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-lg font-bold text-white">어떻게 작동하나요?</h2>
            <p className="mt-1 text-xs text-white/30">니즈에서 만남까지, 4단계</p>
          </div>

          <div className="space-y-3">
            {FLOW_STEPS.map(({ step, title, desc, icon: Icon, accent }) => (
              <div key={step} className="flex gap-4 rounded-2xl border border-white/8 p-4 transition-all hover:border-white/15"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${accent}15` }}>
                  <Icon className="h-5 w-5" style={{ color: accent }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white/20">{step}</span>
                    <h3 className="text-sm font-bold text-white/80">{title}</h3>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-white/35">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 약한 연결의 힘 ── */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h2 className="text-lg font-bold text-white">약한 연결의 힘</h2>
            <p className="mt-1 text-xs text-white/30">Weak Ties, Strong Opportunities</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                title: '우연한 기회',
                desc: '잘 모르는 사이에서 오히려 새로운 기회가 찾아옵니다',
                accent: '#ffd93d',
              },
              {
                icon: MessageCircle,
                title: '다른 시선',
                desc: '같은 바닥, 다른 포지션의 이야기가 시야를 넓혀줍니다',
                accent: '#74b9ff',
              },
              {
                icon: TrendingUp,
                title: '함께 성장',
                desc: '혼자 못 가는 길을, 같은 고민을 가진 사람들과 함께',
                accent: '#4ade80',
              },
            ].map(({ icon: Icon, title, desc, accent }) => (
              <div key={title} className="rounded-2xl border border-white/8 p-5 text-center"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <Icon className="mx-auto mb-3 h-6 w-6" style={{ color: accent, opacity: 0.6 }} />
                <h3 className="mb-1.5 text-sm font-bold text-white/70">{title}</h3>
                <p className="text-[11px] leading-relaxed text-white/30">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 바닥에서 할 수 있는 것들 ── */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-white">바닥에서 할 수 있는 것들</h2>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {FEATURES.map(({ title, desc, href }) => (
              <Link key={title} href={href}
                className="group flex items-center justify-between rounded-xl border border-white/6 p-4 transition-all hover:border-white/15 hover:bg-white/3"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white/70 group-hover:text-white/90">{title}</h3>
                  <p className="mt-0.5 text-[11px] text-white/25">{desc}</p>
                </div>
                <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-white/10 group-hover:text-white/30" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 누가 오면 좋을까요 ── */}
      <section className="px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-white">누가 오면 좋을까요?</h2>
          </div>

          <div className="rounded-2xl border border-white/8 p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                '이직 고민', '스킬업', '사이드 프로젝트', '네트워킹',
                '리더십', '프리랜서 전환', '창업 준비', '업계 탐색',
                '커리어 전환', '해외 진출', '스터디', '멘토링',
              ].map((tag) => (
                <span key={tag} className="rounded-full border border-white/8 px-3 py-1.5 text-xs text-white/40">
                  {tag}
                </span>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-white/25">
              산업군, 직무, 경력에 상관없이 — 성장하고 싶은 모든 분
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-2 text-sm text-white/40">지금 바닥에 들어오세요</p>
          <h2 className="mb-6 text-xl font-bold text-white">
            당신의 니즈가<br />누군가의 원츠입니다
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/badak"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all"
              style={{ background: 'rgba(255,217,61,0.15)', color: '#ffd93d' }}>
              바닥 둘러보기 <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/badak/apply"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white/50 transition-all hover:border-white/30 hover:text-white/80">
              바닥장 신청하기
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <section className="border-t border-white/6 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-1 text-[10px] text-white/15">A Part of</p>
          <p className="mb-4 text-xs font-medium text-white/30">Ten:One Universe</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {[
              { name: 'MAD League', href: 'https://madleague.net' },
              { name: 'HeRo', href: 'https://hero.ne.kr' },
              { name: 'YouInOne', href: 'https://youinone.com' },
              { name: 'TenOne', href: 'https://tenone.biz' },
            ].map((link) => (
              <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer"
                className="text-[11px] text-white/20 transition-colors hover:text-white/40">
                {link.name}
              </a>
            ))}
          </div>
          <p className="mt-6 text-[10px] text-white/10">
            contact@badak.biz
          </p>
        </div>
      </section>
    </div>
  );
}
