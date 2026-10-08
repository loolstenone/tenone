import Link from 'next/link';
import { ArrowLeft, ArrowRight, MessageSquare, type LucideIcon } from 'lucide-react';
import { CrossSiteLink } from '@/components/CrossSiteLink';
import { getMadProgram, getMadProgramNeighbors, MAD_ACCENT, MAD_PROGRAM_GROUPS, type MadProgram } from '@/features/madleague/programs-list';
import { ProgramCTA } from '@/features/madleague/ProgramCTA';

/**
 * MADLeague 프로그램 상세 표준 템플릿 — 10개 프로그램이 전부 같은 뼈대로 보인다.
 *
 *   ① 히어로        eyebrow · 제목 · 한 줄 요약 · tagline · 대상/시기/참가비 칩   (전부 programs-list.ts — 페이지별 히어로 꾸밈 금지)
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
  steps,
  stepsTitle,
  gets,
  getsTitle,
  children,
  cta,
}: {
  programKey: string;
  steps: ProgramStep[];
  stepsTitle?: string;
  gets: ProgramGet[];
  getsTitle?: string;
  children?: React.ReactNode;
  /** CTA 주 버튼 덮어쓰기 — 페이지 안에 신청 폼이 있을 때 앵커로 */
  cta?: { primary?: { label: string; href: string } };
}) {
  const p = getMadProgram(programKey);
  if (!p.glance) throw new Error(`${programKey}: 직접 운영 프로그램은 glance 필수 — 연계 프로그램은 PartnerProgramPage`);
  const glance = p.glance;
  const accent = p.accent ?? MAD_ACCENT;
  const { prev, next } = getMadProgramNeighbors(programKey);

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      {/* ① 히어로 */}
      <ProgramHero p={p} />

      {/* ② 한눈에 보기 */}
      <section className="border-b border-neutral-900 bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-xs font-bold tracking-widest mb-4" style={{ color: accent }}>AT A GLANCE</div>
          <h2 className="text-3xl sm:text-4xl font-black mb-10">한눈에 보기</h2>
          <dl className="grid grid-cols-1 md:grid-cols-5 gap-px bg-neutral-900 border border-neutral-900">
            {[
              ['누가', glance.who],
              ['언제', glance.when],
              ['어떻게', glance.how],
              ['참가비', glance.fee],
              ['남는 것', glance.outcome],
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
                <div className="h-10 w-10 flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: accent, color: accent === MAD_ACCENT ? "#fff" : "#000" }}>{i + 1}</div>
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

/** ① 히어로 — 직접 운영·연계 공용. 칩: 직접 운영 = 대상·시기·참가비 / 연계 = 운영 브랜드 */
function ProgramHero({ p }: { p: MadProgram }) {
  const accent = p.accent ?? MAD_ACCENT;
  const group = MAD_PROGRAM_GROUPS.find((g) => g.key === p.group)!;
  const chips: [string, string][] = p.glance
    ? [['대상', p.glance.who], ['시기', p.glance.when], ['참가비', p.glance.fee]]
    : p.partner ? [['MADLeague', '맛보기'], ['정식', p.partner.brand], ['계정', 'Ten:One ID 하나'], ['기록', '동의 시 연계']] : [];
  return (
    <section className="relative overflow-hidden border-b border-neutral-900">
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 50%, ${accent}2e, transparent 60%)` }} aria-hidden />
      <div className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36">
        <div className="flex items-center gap-3 text-xs font-bold tracking-widest">
          <span style={{ color: accent }}>{p.eyebrow}</span>
          <span className="text-neutral-700">/</span>
          <span className="text-neutral-500">{group.label} 프로그램</span>
        </div>
        <h1 className="mt-4 text-5xl sm:text-7xl font-black tracking-tight leading-tight">{p.title}</h1>
        <p className="mt-8 max-w-2xl text-xl sm:text-2xl text-neutral-300 leading-relaxed">{p.desc}</p>
        <p className="mt-6 text-lg sm:text-xl font-bold" style={{ color: accent }}>{p.tagline}</p>
        <dl className="mt-10 flex flex-wrap gap-2">
          {chips.map(([k, v]) => (
            <div key={k} className="inline-flex items-center gap-2 border border-neutral-800 bg-black/60 px-4 py-2 text-sm">
              <dt className="font-bold" style={{ color: accent }}>{k}</dt>
              <dd className="text-neutral-300">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/**
 * 연계 프로그램 템플릿 — 유니버스 다른 브랜드가 운영 (HeRo·RooK·Planner's).
 * MADLeague에서는 맛보기만, 정식은 그 브랜드에 신청해 사용, 경험·데이터는 본인 동의로 연계 (2026-10-09 사용자 결정).
 * 운영사는 Ten:One™ 하나 — 서비스만 다르다. 계정 하나(Ten:One ID)로 바로 이용, 서비스 첫 진입 동의(member_brand_joins),
 * 서비스 간 기록 연계는 서비스별 별도 동의 (데이터 계약 3·4조, 개인정보보호법 제18조).
 *
 *   ① 히어로  ② 맛보기(MADLeague) → 정식(주인 브랜드) → 연계(본인 동의)  ③ 자유 섹션  ④ 정식 신청 CTA  ⑤ 이전·다음
 */
export function PartnerProgramPage({ programKey, children }: { programKey: string; children?: React.ReactNode }) {
  const p = getMadProgram(programKey);
  if (!p.partner) throw new Error(`${programKey}: 연계 프로그램은 partner 필수`);
  const partner = p.partner;
  const accent = p.accent ?? MAD_ACCENT;
  const onLight = accent !== MAD_ACCENT;
  const { prev, next } = getMadProgramNeighbors(programKey);

  return (
    <div className="bg-[var(--mad-black,#000)] text-white">
      <ProgramHero p={p} />

      {/* ② 맛보기 → 정식 → 연계 */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-xs font-bold tracking-widest text-neutral-500 mb-4">TASTE · FULL · LINK</div>
        <h2 className="text-3xl sm:text-4xl font-black mb-6">MADLeague에서 맛보고, {partner.brand}에서 제대로</h2>
        <p className="max-w-3xl text-lg text-neutral-400 leading-relaxed mb-14">
          매드리그 안에서는 가볍게 경험해 본다. 정식으로는 같은 Ten:One ID로 {partner.brand}를 쓴다 — 새로 가입할 필요 없다. 동의하면 두 서비스의 경험과 기록이 이어진다.
        </p>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: 1, label: 'MADLeague에서 맛보기', items: partner.taste },
            { n: 2, label: `${partner.brand}에서 정식으로`, items: partner.full },
            { n: 3, label: '동의하면 이어진다', items: partner.link },
          ].map((col) => (
            <li key={col.label} className="bg-neutral-950 border border-neutral-900 p-10" style={col.n === 2 ? { borderColor: accent } : undefined}>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center text-sm font-black shrink-0" style={{ backgroundColor: accent, color: onLight ? '#000' : '#fff' }}>{col.n}</div>
                <div className="text-lg font-black">{col.label}</div>
              </div>
              <ul className="mt-6 space-y-3 text-neutral-300 leading-relaxed">
                {col.items.map((t) => <li key={t}>— {t}</li>)}
              </ul>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-neutral-500">
          MADLeague와 {partner.brand}는 모두 Ten:One™이 운영하는 서비스입니다. 계정은 하나로 쓰고, {partner.brand}를 처음 이용할 때 이용 동의를 받습니다. 서비스 사이의 기록 연계는 서비스마다 따로 동의한 경우에만 이뤄지고, 언제든 끊을 수 있습니다.
        </p>
      </section>

      {children}

      {/* ④ 연결 CTA */}
      <section id="join" style={{ backgroundColor: accent }}>
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className={`text-sm font-bold tracking-widest mb-3 ${onLight ? 'text-black/60' : 'text-white/70'}`}>NEXT STEP</div>
          <h2 className={`text-3xl sm:text-4xl font-black ${onLight ? 'text-black' : 'text-white'}`}>정식으로는 {partner.brand}에서</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {partner.href ? (
              <CrossSiteLink href={partner.href} className="inline-flex items-center gap-3 bg-black hover:bg-neutral-900 text-white font-bold px-8 py-4 text-lg transition">
                {partner.linkLabel ?? `${partner.brand}로 가기`} <ArrowRight className="h-5 w-5" />
              </CrossSiteLink>
            ) : (
              <span className={`inline-flex items-center px-8 py-4 text-lg font-bold ${onLight ? 'bg-black/20 text-black/70' : 'bg-black/30 text-white/70'}`}>{partner.brand} 사이트 준비 중</span>
            )}
            <Link href="/madleague/contact?type=program" className={`inline-flex items-center gap-2 border font-bold px-6 py-4 transition ${onLight ? 'border-black/30 text-black hover:bg-black/10' : 'border-white/40 text-white hover:bg-white/10'}`}>
              <MessageSquare className="h-4 w-4" /> 문의하기
            </Link>
          </div>
        </div>
      </section>

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
