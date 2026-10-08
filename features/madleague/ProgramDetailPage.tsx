import Link from 'next/link';
import { ArrowLeft, ArrowRight, type LucideIcon } from 'lucide-react';
import { getMadProgram, getMadProgramNeighbors, MAD_ACCENT, MAD_PROGRAM_GROUPS, type MadProgram } from '@/features/madleague/programs-list';
import { ProgramCTA } from '@/features/madleague/ProgramCTA';

/**
 * MADLeague 프로그램 상세 표준 템플릿 — 10개 프로그램이 전부 같은 뼈대로 보인다.
 *
 *   ① 히어로        eyebrow · 제목 · 한 줄 요약 · 대상/시기/방식 칩   (programs-list.ts)
 *   ② 한눈에 보기    대상 · 시기 · 방식 · 참가비 · 남는 것             (programs-list.ts glance)
 *   ③ 진행 과정      steps (3~5단계)
 *   ④ 얻는 것        gets  (카드 2~3개)
 *   ⑤ 자유 섹션      children — 프로그램 고유 내용 (광고제 일정표·DAM 히스토리·명예의 전당 …)
 *   ⑥ 참여 CTA       ProgramCTA — 신청서/매드리거 등록 + 문의하기 (전 프로그램 동일)
 *   ⑦ 다른 프로그램   이전 · 다음 · 전체 보기
 *
 * 내용(steps·gets·자유 섹션)은 각 page.tsx가 넘기고, 구조·순서·CTA는 여기서만 정한다.
 */
export type ProgramStep = { title: string; desc: string; icon?: LucideIcon };
export type ProgramGet = { title: string; desc: string; icon?: LucideIcon };

export function ProgramDetailPage({
  programKey,
  heroImage,
  heroExtra,
  steps,
  stepsTitle,
  gets,
  getsTitle,
  children,
  cta,
}: {
  programKey: string;
  /** 히어로 배경 이미지 (선택) — 텍스트 카피 위에 흐리게 깔린다 */
  heroImage?: string;
  /** 히어로 요약 아래 추가 카피 (선택) */
  heroExtra?: React.ReactNode;
  steps: ProgramStep[];
  stepsTitle?: string;
  gets: ProgramGet[];
  getsTitle?: string;
  children?: React.ReactNode;
  /** CTA 주 버튼 덮어쓰기 — 페이지 안에 신청 폼이 있을 때 앵커로 */
  cta?: { primary?: { label: string; href: string } };
}) {
  const p = getMadProgram(programKey);
  const accent = p.accent ?? MAD_ACCENT;
  const group = MAD_PROGRAM_GROUPS.find((g) => g.key === p.group)!;
  const { prev, next } = getMadProgramNeighbors(programKey);

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* ① 히어로 */}
      <section className="relative overflow-hidden border-b border-neutral-900">
        {heroImage && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" aria-hidden />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" aria-hidden />
          </>
        )}
        {!heroImage && (
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 50%, ${accent}2e, transparent 60%)` }} aria-hidden />
        )}
        <div className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36">
          <div className="flex items-center gap-3 text-xs font-bold tracking-widest">
            <span style={{ color: accent }}>{p.eyebrow}</span>
            <span className="text-neutral-700">/</span>
            <span className="text-neutral-500">{group.label} 프로그램</span>
          </div>
          <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">{p.title}</h1>
          <p className="mt-8 max-w-2xl text-xl sm:text-2xl text-neutral-300 leading-relaxed">{p.desc}</p>
          {heroExtra}
          <dl className="mt-10 flex flex-wrap gap-2">
            {[
              ['대상', p.glance.who],
              ['시기', p.glance.when],
              ['참가비', p.glance.fee],
            ].map(([k, v]) => (
              <div key={k} className="inline-flex items-center gap-2 border border-neutral-800 bg-black/60 px-4 py-2 text-sm">
                <dt className="font-bold" style={{ color: accent }}>{k}</dt>
                <dd className="text-neutral-300">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ② 한눈에 보기 */}
      <section className="border-b border-neutral-900 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest mb-4" style={{ color: accent }}>AT A GLANCE</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-10">한눈에 보기</h2>
          <dl className="grid grid-cols-1 md:grid-cols-5 gap-px bg-neutral-900 border border-neutral-900">
            {[
              ['누가', p.glance.who],
              ['언제', p.glance.when],
              ['어떻게', p.glance.how],
              ['참가비', p.glance.fee],
              ['남는 것', p.glance.outcome],
            ].map(([k, v]) => (
              <div key={k} className="bg-black p-6">
                <dt className="text-xs font-bold tracking-widest text-neutral-500">{k}</dt>
                <dd className="mt-3 text-base text-neutral-200 leading-relaxed">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ③ 진행 과정 */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs font-bold tracking-widest text-neutral-500 mb-4">HOW IT WORKS</div>
        <h2 className="text-3xl sm:text-4xl font-black mb-14">{stepsTitle ?? '이렇게 진행된다'}</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-neutral-950 border border-neutral-900 p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-10 w-10 flex items-center justify-center text-sm font-black shrink-0 text-black" style={{ backgroundColor: accent }}>{i + 1}</div>
                {s.icon && <s.icon className="h-6 w-6 text-neutral-500" />}
              </div>
              <div className="text-xl font-black">{s.title}</div>
              <p className="mt-3 text-base text-neutral-500 leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ④ 얻는 것 */}
      <section className="border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-xs font-bold tracking-widest text-neutral-500 mb-4">WHAT YOU GET</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-14">{getsTitle ?? '끝나면 남는 것'}</h2>
          <div className={`grid grid-cols-1 gap-8 ${gets.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {gets.map((g) => (
              <div key={g.title} className="bg-neutral-950 border border-neutral-900 p-12">
                {g.icon && <g.icon className="h-10 w-10" style={{ color: accent }} />}
                <div className={`${g.icon ? 'mt-8' : ''} text-2xl sm:text-3xl font-black`}>{g.title}</div>
                <p className="mt-4 text-lg text-neutral-400 leading-relaxed">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ 자유 섹션 */}
      {children}

      {/* ⑥ 참여 CTA */}
      <ProgramCTA program={p} primary={cta?.primary} />

      {/* ⑦ 다른 프로그램 */}
      <ProgramNeighbors prev={prev} next={next} />
    </div>
  );
}

function ProgramNeighbors({ prev, next }: { prev: MadProgram; next: MadProgram }) {
  return (
    <nav aria-label="다른 프로그램" className="border-t border-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        <Link href={prev.href} className="group flex items-center gap-4 text-left">
          <ArrowLeft className="h-5 w-5 text-neutral-600 group-hover:text-[#EC1D25] transition shrink-0" />
          <span>
            <span className="block text-xs font-bold tracking-widest text-neutral-500">이전 프로그램</span>
            <span className="block mt-1 text-xl font-black group-hover:text-[#EC1D25] transition">{prev.title}</span>
          </span>
        </Link>
        <Link href="/madleague/programs" className="text-sm font-bold text-neutral-400 hover:text-white transition text-center">전체 프로그램</Link>
        <Link href={next.href} className="group flex items-center justify-end gap-4 text-right">
          <span>
            <span className="block text-xs font-bold tracking-widest text-neutral-500">다음 프로그램</span>
            <span className="block mt-1 text-xl font-black group-hover:text-[#EC1D25] transition">{next.title}</span>
          </span>
          <ArrowRight className="h-5 w-5 text-neutral-600 group-hover:text-[#EC1D25] transition shrink-0" />
        </Link>
      </div>
    </nav>
  );
}

/** 자유 섹션(⑤)용 공통 껍데기 — eyebrow·제목·본문. 페이지 고유 내용도 같은 리듬으로 */
export function ProgramSection({ id, eyebrow, title, intro, tone = 'black', children }: {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  tone?: 'black' | 'dark';
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className={`border-t border-neutral-900 ${tone === 'dark' ? 'bg-neutral-950' : ''}`}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs font-bold tracking-widest text-[#EC1D25] mb-4">{eyebrow}</div>
        <h2 className="text-3xl sm:text-4xl font-black leading-tight">{title}</h2>
        {intro && <div className="mt-6 max-w-3xl text-lg text-neutral-400 leading-relaxed">{intro}</div>}
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}
