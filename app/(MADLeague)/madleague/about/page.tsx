import Link from 'next/link';
import { Target, Swords, TrendingUp, Trophy, Users, Building2, GraduationCap } from 'lucide-react';

export const metadata = {
  title: '매드리그란',
  description: 'Match, Act, Develop — MADLeague의 정체성과 비전',
};

const MAD = [
  { icon: Target, title: 'Match', desc: '실제 기업의 과제와 학생의 열정을 연결한다.' },
  { icon: Swords, title: 'Act', desc: '현장에서 움직이고, 경쟁에서 부딪힌다.' },
  { icon: TrendingUp, title: 'Develop', desc: '실전에서 성장한다. 그게 전부다.' },
];

const PROGRAMS = [
  { title: 'PJT', desc: '실전 프로젝트 OJT' },
  { title: '경쟁 PT', desc: '기업 과제 경쟁' },
  { title: '마케톤', desc: 'Marketing + Hacking + Marathon, 72시간' },
  { title: '인사이트 투어링', desc: '지역·기업 투어 후 제안' },
  { title: '아이디어 무브먼트', desc: '사회 문제 해결 아이디어 쇼케이스' },
  { title: '히어로 프로그램', desc: '커리어 솔루션' },
  { title: 'DAM 파티', desc: 'Digital Advertising Meeting' },
];

const MEMBER_TYPES = [
  { icon: GraduationCap, title: '공식 동아리', desc: '전국 7개 권역 공식 거점 동아리' },
  { icon: Users, title: '매드리거', desc: '동아리 멤버로 활동하는 대학생' },
  { icon: Trophy, title: '일반 회원', desc: 'MADzine 구독 + DAM 참여' },
  { icon: Building2, title: '기업 회원', desc: '경쟁PT 과제기업 / 채용 파트너' },
];

export default function AboutPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">ABOUT</div>
          <h1 className="mt-3 text-5xl sm:text-7xl font-black tracking-tight">
            매드리그란
          </h1>
          <p className="mt-8 text-xl text-neutral-300 leading-relaxed max-w-2xl">
            <span className="text-[#EC1D25] font-black">MAD</span>는
            <strong className="text-white"> Marketing + ADvertising + Digital</strong>의 약자.
            <br />
            <span className="text-[#EC1D25] font-black">League</span>는
            연맹 — 결속시키다, 경쟁하게 하다.
          </p>
          <p className="mt-6 text-neutral-400 leading-relaxed max-w-2xl">
            MADLeague는 전국 대학생 광고·마케팅 동아리 연합이다.
            7개 권역, 100명이 넘는 매드리거가 같은 브리프를 놓고 경쟁하고, 같은 과제에서 성장한다.
          </p>
        </div>
      </section>

      {/* Mission — MAD */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">MISSION</div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-16">Match · Act · Develop</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MAD.map((m) => (
            <div key={m.title} className="bg-neutral-950 border border-neutral-900 p-10">
              <m.icon className="h-8 w-8 text-[#EC1D25]" />
              <div className="mt-6 text-3xl font-black">{m.title}</div>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Members */}
      <section className="bg-neutral-950 border-y border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">MEMBERS</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-16">네 가지 자리</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MEMBER_TYPES.map((m) => (
              <div key={m.title} className="bg-black border border-neutral-900 p-6">
                <m.icon className="h-6 w-6 text-neutral-500" />
                <div className="mt-4 font-black">{m.title}</div>
                <p className="mt-2 text-xs text-neutral-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">PROGRAMS</div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-16">7가지 실전 무대</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROGRAMS.map((p) => (
            <div key={p.title} className="bg-neutral-950 border border-neutral-900 p-6">
              <div className="text-lg font-black">{p.title}</div>
              <p className="mt-2 text-sm text-neutral-400">{p.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/madleague/programs" className="inline-flex items-center text-sm font-bold text-[#EC1D25] hover:underline">
            프로그램 전체 →
          </Link>
        </div>
      </section>

      {/* BI */}
      <section className="bg-neutral-950 border-y border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">BRAND IDENTITY</div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-16">브랜드 아이덴티티</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#EC1D25] p-10 aspect-square flex flex-col justify-between">
              <div className="text-xs font-bold text-white/80 tracking-widest">PRIMARY</div>
              <div>
                <div className="text-3xl font-black text-white">MAD RED</div>
                <div className="mt-1 text-white/80 font-bold">#EC1D25</div>
                <div className="mt-3 text-xs text-white/80">불타오르는 열정</div>
              </div>
            </div>
            <div className="bg-black border border-neutral-800 p-10 aspect-square flex flex-col justify-between">
              <div className="text-xs font-bold text-neutral-500 tracking-widest">BASE</div>
              <div>
                <div className="text-3xl font-black text-white">MAD BLACK</div>
                <div className="mt-1 text-neutral-500 font-bold">#000000</div>
                <div className="mt-3 text-xs text-neutral-500">흔들리지 않는 인내</div>
              </div>
            </div>
            <div className="bg-[#FFC000] p-10 aspect-square flex flex-col justify-between">
              <div className="text-xs font-bold text-black/70 tracking-widest">ACCENT</div>
              <div>
                <div className="text-3xl font-black text-black">MAD GOLD</div>
                <div className="mt-1 text-black/70 font-bold">#FFC000</div>
                <div className="mt-3 text-xs text-black/70">번뜩이는 재치 · MAD Crown</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAMbe */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">CHARACTER</div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-8">DAMbe · 담비</h2>
            <p className="text-lg text-neutral-300 leading-relaxed">
              호랑이를 잡아먹는 담비. 작지만 무리 지어 움직이고, 물러서지 않는다.
            </p>
            <p className="mt-4 text-neutral-400 leading-relaxed">
              MADLeague의 마스코트. 학생이라는 신분으로 거대 광고계에 도전하는 정체성의 상징.
              <span className="text-white"> "담비라 세상아!"</span>
            </p>
          </div>
          <div className="aspect-square bg-neutral-950 border border-neutral-900 flex items-center justify-center">
            <div className="text-8xl">🦡</div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold tracking-widest text-white/80">CONTACT</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">문의 · 협업 · 과제 의뢰</h2>
            <p className="mt-2 text-white/90 text-sm">신규 동아리 개설, 경쟁PT 기업 파트너, 강연 요청 모두 환영합니다.</p>
          </div>
          <a
            href="mailto:info@madleague.net"
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 transition"
          >
            info@madleague.net
          </a>
        </div>
      </section>
    </div>
  );
}
