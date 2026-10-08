import Link from 'next/link';
import { ProgramBoard } from '@/features/programs/ProgramBoard';
import { PROGRAM_THEMES } from '@/features/programs/ProgramTheme';
import { ArrowRight } from 'lucide-react';
import { MAD_ACCENT, MAD_PROGRAM_GROUPS, MAD_PROGRAMS } from '@/features/madleague/programs-list';

export const metadata = {
  title: '프로그램',
  description: `MADLeague ${MAD_PROGRAMS.length}가지 실전 무대 — 도전 · 실전 · 훈련 · 연결`,
};

export default function ProgramsPage() {
  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <section className="border-b border-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest text-[#EC1D25]">PROGRAMS</div>
          <h1 className="mt-3 text-4xl sm:text-6xl font-black tracking-tight">
            {MAD_PROGRAMS.length}가지 실전 무대
          </h1>
          <p className="mt-6 max-w-xl text-neutral-400 leading-relaxed">
            MADLeague는 학생이 실전을 경험할 수 있는 {MAD_PROGRAMS.length}가지 프로그램을 운영한다.
            방식은 넷으로 나뉜다 — <span className="text-white">도전·실전·훈련·연결</span>. 결국 하나를 남긴다, 진짜 경험.
          </p>
          {/* 그룹 바로가기 */}
          <div className="mt-10 flex flex-wrap gap-2">
            {MAD_PROGRAM_GROUPS.map((g) => (
              <a key={g.key} href={`#${g.key}`} className="inline-flex items-center gap-2 border border-neutral-800 px-4 py-2 text-sm font-bold text-neutral-300 hover:border-[#EC1D25] hover:text-white transition">
                {g.label}
                <span className="text-xs text-neutral-600">{MAD_PROGRAMS.filter((p) => p.group === g.key).length}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4그룹 — 사람들이 10개를 한 번에 이해하게 */}
      {MAD_PROGRAM_GROUPS.map((g, gi) => {
        const items = MAD_PROGRAMS.filter((p) => p.group === g.key);
        return (
          <section key={g.key} id={g.key} className={`scroll-mt-32 ${gi > 0 ? 'border-t border-neutral-900' : ''}`}>
            <div className="mx-auto max-w-7xl px-6 py-16">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                <div>
                  <div className="text-xs font-bold tracking-widest text-[#EC1D25]">{g.eyebrow}</div>
                  <h2 className="mt-2 text-3xl sm:text-4xl font-black">{g.label}</h2>
                </div>
                <p className="text-neutral-400 md:text-right">{g.desc}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((p) => {
                  const accent = p.accent ?? MAD_ACCENT;
                  return (
                    <Link
                      key={p.href}
                      href={p.href}
                      className={`group relative p-10 border transition ${
                        p.featured
                          ? 'bg-[#EC1D25] border-[#EC1D25] hover:bg-[#d01820]'
                          : 'bg-neutral-950 border-neutral-900 hover:border-[#EC1D25]'
                      }`}
                    >
                      <div className="text-xs font-bold tracking-widest" style={{ color: p.featured ? 'rgba(255,255,255,0.7)' : accent }}>{p.eyebrow}</div>
                      <div className="mt-3 text-3xl font-black text-white">{p.title}</div>
                      <div className={`mt-4 text-sm leading-relaxed ${p.featured ? 'text-white/90' : 'text-neutral-400'}`}>{p.desc}</div>
                      <dl className={`mt-6 space-y-1 text-xs ${p.featured ? 'text-white/80' : 'text-neutral-500'}`}>
                        <div className="flex gap-2"><dt className="w-10 shrink-0 font-bold">대상</dt><dd>{p.glance.who}</dd></div>
                        <div className="flex gap-2"><dt className="w-10 shrink-0 font-bold">시기</dt><dd>{p.glance.when}</dd></div>
                      </dl>
                      <ArrowRight className={`mt-8 h-5 w-5 ${p.featured ? 'text-white' : 'text-neutral-600 group-hover:text-[#EC1D25]'} transition`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* 다른 브랜드 프로그램 — 창구에 MADLeague를 지정한 RooK 실전 프로젝트·HeRo 프로그램 (운영·동의는 주인 브랜드). 회차가 없으면 숨김 */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <ProgramBoard theme={PROGRAM_THEMES.madleague} brands={['rook', 'hero']} title="함께하는 프로그램" hideWhenEmpty />
      </section>
    </div>
  );
}
