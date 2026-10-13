import Link from 'next/link';
import Image from 'next/image';
import { Swords, Activity, TrendingUp, Users, Building2, GraduationCap, Compass, ArrowRight } from 'lucide-react';
import { MAD_PROGRAMS, MAD_PROGRAM_GROUPS } from '@/features/madleague/programs-list';

export const metadata = {
  title: '매드리그란',
  description: 'Match, Active, Develop — MADLeague의 정체성과 비전',
};

const MAD = [
  { icon: Swords, title: 'Match', desc: '실제 기업의 과제와 학생의 열정을 연결한다.' },
  { icon: Activity, title: 'Active', desc: '현장에서 움직이고, 경쟁에서 부딪힌다.' },
  { icon: TrendingUp, title: 'Develop', desc: '실전에서 성장한다. 그게 전부다.' },
];

const MEMBER_TYPES = [
  { icon: GraduationCap, title: '공식 동아리', desc: '내부 심사를 통해 선정된 전국 권역별 공식 동아리' },
  { icon: Users, title: '매드리거', desc: '공식 동아리에서 실전을 쌓는 마케터' },
  { icon: Compass, title: '멘토', desc: '현업의 시선으로 매드리거의 실전을 이끄는 선배' },
  { icon: Building2, title: '기업 회원', desc: '경쟁 PT 과제 기업 · 채용 파트너' },
];

// BI 컬러 — 열정(Red) · 끈기(Black) · 재치 발랄함(Gold)
const COLORS = [
  { hex: '#EC1D25', name: 'Red', word: 'Passion', ko: '열정' },
  { hex: '#000000', name: 'Black', word: 'Patience', ko: '끈기' },
  { hex: '#FFC000', name: 'Gold', word: 'Witty', ko: '재치 발랄함' },
];

export default function AboutPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(236,29,37,0.18),transparent_60%)]" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">ABOUT</div>
          <h1 className="mt-3 text-5xl sm:text-7xl font-bold tracking-tight">
            매드리그란
          </h1>
          <p className="mt-8 text-xl text-neutral-300 leading-relaxed max-w-2xl">
            <span className="text-[#EC1D25] font-bold">MAD</span>는
            <strong className="text-white"> Match, Active, Develop</strong>.
            <br />
            <span className="text-[#EC1D25] font-bold">League</span>는
            연맹 — 결속시키다, 경쟁하게 하다.
          </p>
          <p className="mt-6 text-neutral-400 leading-relaxed max-w-2xl">
            전국 대학생 동아리들의 경쟁을 통한 성장.
            <br />
            클라이언트의 실제 프로젝트를 제안하고 실행한다.
            <br />
            <span className="text-white">경력 같은 신입의 무대 - 매드리그</span>
          </p>
        </div>
      </section>

      {/* Mission — MAD */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">MISSION</div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-16">Match · Active · Develop</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MAD.map((m) => (
            <div key={m.title} className="bg-neutral-950 border border-neutral-900 p-10">
              <m.icon className="h-8 w-8 text-[#EC1D25]" />
              <div className="mt-6 text-3xl font-bold">{m.title}</div>
              <p className="mt-3 text-sm text-neutral-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Members */}
      <section className="bg-neutral-950 border-y border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">MEMBERS</div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-16">매드리그의 구성원</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MEMBER_TYPES.map((m) => (
              <div key={m.title} className="bg-black border border-neutral-900 p-6">
                <m.icon className="h-6 w-6 text-neutral-500" />
                <div className="mt-4 font-bold">{m.title}</div>
                <p className="mt-2 text-xs text-neutral-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs — 취지·구성만 (프로그램별 설명은 프로그램 페이지에, 2026-10-11) */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">PROGRAMS</div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">실전 프로젝트로<br />경력 같은 신입으로</h2>
        <p className="mt-6 text-lg text-neutral-300 leading-relaxed max-w-2xl break-keep">
          기업과 지자체의 실제 고민을 프로젝트 경쟁을 통해 해결한다.
        </p>
        <p className="mt-3 text-neutral-400 leading-relaxed max-w-2xl break-keep">
          가상의 과제가 아니라 지금 누군가 풀고 있는 문제를 받는다. 동아리가 팀이 되어 경쟁하고, 현장에서 결과로 증명하고,
          그 경험은 유니버스의 다른 서비스로, 그리고 현업과의 만남으로 이어진다. 프로그램은 세 가지 방식으로 나뉜다.
        </p>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {MAD_PROGRAM_GROUPS.map((g, i) => {
            const names = MAD_PROGRAMS.filter(p => p.group === g.key).map(p => p.title);
            return (
              <div key={g.key} className="bg-neutral-950 border border-neutral-900 p-8">
                <div className="text-xs font-bold tracking-widest text-[#EC1D25]">0{i + 1} · {g.eyebrow}</div>
                <div className="mt-3 text-2xl font-bold">{g.label}</div>
                <p className="mt-3 text-sm text-neutral-400 leading-relaxed break-keep">{g.desc}</p>
                <p className="mt-5 text-xs text-neutral-500 leading-relaxed break-keep">{names.join(' · ')}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-8">
          <Link href="/madleague/programs" className="inline-flex items-center gap-1 text-sm font-bold text-[#EC1D25] hover:underline">
            프로그램 전체 보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* BI */}
      <section className="bg-neutral-950 border-y border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">BRAND IDENTITY</div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-16">브랜드 아이덴티티</h2>
          {/* 세 원 — 바탕 줄무늬(검정·빨강·금색) 위에 색이 겹쳐 하나의 강인함을 만든다 */}
          <div className="relative overflow-hidden" style={{ background: 'linear-gradient(#000 0 30%, #EC1D25 30% 50%, #FFC000 50% 100%)' }}>
            <div className="flex items-center justify-center py-10 sm:py-14 px-4">
              {COLORS.map((c, i) => (
                <div
                  key={c.hex}
                  className={`relative flex aspect-square w-1/3 max-w-[260px] flex-col items-center justify-center rounded-none text-center text-white ${i > 0 ? '-ml-[6%]' : ''}`}
                  style={{ backgroundColor: c.hex, zIndex: i + 1 }}
                >
                  <div className="text-xs sm:text-xl font-bold">{c.hex}</div>
                  <div className="mt-1 sm:mt-3 text-sm sm:text-2xl font-bold">{c.name}</div>
                  <div className="mt-1 sm:mt-3 text-xs sm:text-xl font-bold">{c.word}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-12 text-2xl sm:text-4xl font-bold leading-snug">
            열정과 끈기 그리고 재치 발랄함
            <br />
            이 조합은 강인함을 만들어 낸다.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {COLORS.map(c => (
              <div key={c.hex} className="flex items-center gap-4 bg-black border border-neutral-900 p-4">
                <div className="h-12 w-12 shrink-0 border border-neutral-800" style={{ backgroundColor: c.hex }} />
                <div>
                  <div className="font-bold">MAD {c.name.toUpperCase()} <span className="ml-1 font-mono text-sm text-neutral-400">{c.hex}</span></div>
                  <div className="text-sm text-neutral-400">{c.word} · {c.ko}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DAMbe */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-3">CHARACTER</div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-8">DAMbe · 담비</h2>
            <p className="text-lg text-neutral-300 leading-relaxed">
              호랑이를 잡아먹는 담비. 작지만 무리 지어 움직이고, 물러서지 않는다.
            </p>
            <p className="mt-4 text-neutral-400 leading-relaxed">
              MADLeague의 마스코트. 아직 작지만 거대한 마케팅 광고계에 도전하는 정체성을 상징.
              <span className="text-white"> "담비라 세상아!"</span>
            </p>
          </div>
          {/* 배경 투명 원본 — 페이지 검정 바탕 위에 바로 (상자 없음) */}
          <div className="relative mx-auto h-[420px] sm:h-[520px] w-full max-w-sm">
            <Image
              src="/logos/madleague/dambe-trophy.webp"
              alt="트로피를 든 DAMbe 캐릭터"
              fill
              sizes="(min-width: 768px) 384px, 100vw"
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="bg-[#EC1D25]">
        <div className="mx-auto max-w-7xl px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-sm font-bold tracking-widest text-white/80">CONTACT</div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">문의 · 협업 · 과제 의뢰</h2>
            <p className="mt-2 text-white/90 text-sm">공식 동아리 신청, 경쟁 PT 과제 기업, 강연 요청 모두 환영합니다.</p>
          </div>
          {/* 미식축구 담비 — 공을 들고 달리는 매드리거 */}
          <Image
            src="/logos/madleague/dambe-football.webp"
            alt="미식축구를 하는 담비 캐릭터"
            width={1079}
            height={458}
            className="w-full max-w-md md:w-auto md:h-44 lg:h-52 object-contain md:mx-auto"
          />
          <Link
            href="/madleague/contact"
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 transition shrink-0"
          >
            문의하기 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
