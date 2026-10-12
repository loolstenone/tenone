"use client";

/**
 * HIT 결과 리포트 공통 부품 (2026-10-12) — A·B·C~GAP 결과가 같은 틀·같은 점수 기준으로 읽히게
 * 순서: ReportHeader → HitChain → SectionNav → (한눈에 → 상세 → 해설 → 다음 단계)
 * 색: 빨강은 행동(링크·CTA)·현재 단계 표시만 (HeRo CLAUDE.md 색 SSOT)
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, ArrowLeft, Printer } from "lucide-react";
import HitModelGuideModal from "@/features/hit/HitModelGuideModal";
import { BAND_INFO, SCORE_GUIDE, scoreBand, toParagraphs, interpret, type DimensionCopy } from "@/lib/hit/report-copy";
import { HIT_STAGES } from "@/lib/hit/stages";

export function ReportShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`mx-auto ${wide ? "max-w-3xl" : "max-w-2xl"} px-5 sm:px-6 pt-10 pb-24`}>{children}</div>;
}

export function ReportHeader({ code, title, subtitle, date, stage, stageDesc }: { code: string; title: string; subtitle?: string; date?: string; stage?: string; stageDesc?: string }) {
  return (
    <header className="text-center">
      <Image src="/hero-logo.png" alt="HeRo" width={40} height={40} className="h-10 w-10 mx-auto mb-4" />
      <p className="text-xs font-semibold text-neutral-400 tracking-wide">{code}</p>
      <h1 className="text-[32px] sm:text-[36px] font-extrabold text-neutral-900 mt-2 leading-tight">{title}</h1>
      {subtitle && <p className="text-[16px] font-semibold text-neutral-600 mt-2 break-keep">{subtitle}</p>}
      {date && <p className="text-sm text-neutral-400 mt-3">{date}</p>}
      {stage && (
        <div className="mt-6">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-red-50 text-[#E53935]">{stage}</span>
          {stageDesc && <p className="text-[15px] text-neutral-600 mt-4 leading-[1.8] max-w-md mx-auto">{stageDesc}</p>}
        </div>
      )}
    </header>
  );
}

type ChainItem = { id: string; headline: string; sub: string } | null;
type ChainData = { a: ChainItem; b: ChainItem; stage: (ChainItem & { key: string; name: string }) | null };

/** 나의 HIT — 같은 회차의 A·B·생애주기 결과를 한 줄로. 현재 보고 있는 검사를 표시 */
export function HitChain({ type, id }: { type: string; id: string }) {
  const [d, setD] = useState<ChainData | null>(null);
  useEffect(() => {
    fetch(`/api/hit/chain?type=${type}&id=${id}`).then(r => r.ok ? r.json() : null).then(setD).catch(() => setD(null));
  }, [type, id]);
  if (!d) return <div className="mt-10 h-[88px]" />;

  const items: { key: string; code: string; name: string; data: ChainItem; href: string; start: string }[] = [
    { key: "a", code: HIT_STAGES.a.letter, name: HIT_STAGES.a.code, data: d.a, href: d.a ? `/hero/hit/a/result/${d.a.id}` : "/hero/hit/a", start: "/hero/hit/a" },
    { key: "b", code: HIT_STAGES.b.letter, name: HIT_STAGES.b.code, data: d.b, href: d.b ? `/hero/hit/b/result/${d.b.id}` : `/hero/hit/b${d.a ? `?a=${d.a.id}` : ""}`, start: "/hero/hit/b" },
    d.stage
      ? { key: d.stage.key, code: HIT_STAGES[d.stage.key as keyof typeof HIT_STAGES].letter, name: d.stage.name, data: d.stage, href: `/hero/hit/${d.stage.key}/result/${d.stage.id}`, start: "" }
      : { key: "stage", code: "C~G", name: "생애주기 검사 선택", data: null, href: "/hero/hit", start: "/hero/hit" },
  ];

  return (
    <nav aria-label="나의 HIT" className="mt-10">
      <p className="text-xs font-semibold text-neutral-400 mb-3">나의 HIT — 공통(Archetype · Bounce) + 지금 단계</p>
      <div className="grid grid-cols-3 gap-2">
        {items.map(it => {
          const current = it.key === type;
          return (
            <Link key={it.key} href={it.href} aria-current={current ? "page" : undefined}
              className={`rounded-xl border p-3 transition-colors ${current ? "border-neutral-900 bg-white" : "border-neutral-200 hover:bg-neutral-50"}`}>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex h-5 min-w-5 px-1 items-center justify-center rounded text-[10px] font-bold ${it.data ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-400"}`}>{it.code}</span>
                {it.data && !current && <Check className="h-3 w-3 text-neutral-400" />}
              </div>
              <p className="text-[12px] font-semibold text-neutral-500 mt-2 truncate">{it.name}</p>
              {it.data ? (
                <>
                  <p className="text-[13px] font-bold text-neutral-900 mt-0.5 truncate">{it.data.headline}</p>
                  <p className="text-[11px] text-neutral-500 truncate">{it.data.sub}</p>
                </>
              ) : (
                <p className="text-[13px] font-semibold text-[#E53935] mt-0.5">시작하기 →</p>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  return (
    <div className="sticky top-0 z-20 -mx-5 sm:-mx-6 px-5 sm:px-6 mt-10 py-3 bg-white/90 backdrop-blur border-b border-neutral-100">
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {items.map(it => (
          <a key={it.id} href={`#${it.id}`} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors">{it.label}</a>
        ))}
      </div>
    </div>
  );
}

export function Section({ id, title, lead, children }: { id: string; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 pt-16">
      <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
      {lead && <p className="text-[15px] text-neutral-500 mt-2 leading-[1.8]">{lead}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** 한눈에 — 핵심 3가지 */
export function KeyFindings({ items }: { items: { label: string; value: string; note: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map(it => (
        <div key={it.label} className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-xs text-neutral-400">{it.label}</p>
          <p className="text-lg font-extrabold text-neutral-900 mt-2 leading-snug">{it.value}</p>
          <p className="text-[13px] text-neutral-500 mt-2 leading-relaxed">{it.note}</p>
        </div>
      ))}
    </div>
  );
}

export function ScoreGuide() {
  return (
    <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
      <p className="text-sm font-bold text-neutral-800">{SCORE_GUIDE.title}</p>
      <div className="mt-3 space-y-2">
        {SCORE_GUIDE.lines.map(l => <p key={l} className="text-[14px] text-neutral-600 leading-[1.8]">{l}</p>)}
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {(Object.keys(BAND_INFO) as (keyof typeof BAND_INFO)[]).map(k => (
          <span key={k} className={`px-2.5 py-1 rounded-full text-xs font-medium ${BAND_INFO[k].tone}`}>{BAND_INFO[k].range} · {BAND_INFO[k].label}</span>
        ))}
      </div>
    </div>
  );
}

export function BandChip({ value }: { value: number }) {
  const b = BAND_INFO[scoreBand(value)];
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${b.tone}`}>{b.label}</span>;
}

/** 점수 한 줄 — 이름·구간·점수 / 막대 / 무엇을 보나 / 이 점수의 의미 */
export function ScoreRow({ label, value, what, meaning, plain = false }: { label: string; value: number; what?: string; meaning?: string; plain?: boolean }) {
  // plain = 강점·약점이 아닌 '선호·방향' 점수 (흥미·이직 동기·2막 방향 등) — 구간 표시 없이 중립색
  const band = plain ? { bar: "bg-neutral-400" } : BAND_INFO[scoreBand(value)];
  return (
    <div className="py-5 border-b border-neutral-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-semibold text-neutral-900">{label}</span>
        {!plain && <BandChip value={value} />}
        <span className="ml-auto text-lg font-extrabold text-neutral-900 tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-3">
        <div className={`h-full rounded-full ${band.bar}`} style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </div>
      {what && <p className="text-[13px] text-neutral-400 mt-3">{what}</p>}
      {meaning && <p className="text-[15px] text-neutral-700 mt-2 leading-[1.85]">{meaning}</p>}
    </div>
  );
}

/** 사전 정의(copy)로 ScoreRow 목록 — 높은 점수 순 */
export function ScoreList({ scores, copy, sort = true }: { scores: Record<string, number>; copy: Record<string, DimensionCopy>; sort?: boolean }) {
  const entries = Object.entries(scores).filter(([k]) => copy[k]);
  if (sort) entries.sort((a, b) => b[1] - a[1]);
  return (
    <div className="rounded-2xl border border-neutral-200 px-5 sm:px-6">
      {entries.map(([k, v]) => <ScoreRow key={k} label={copy[k].label} value={v} what={copy[k].what} meaning={interpret(copy[k], v)} />)}
    </div>
  );
}

export function Prose({ text, className = "" }: { text: string; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {toParagraphs(text).map((p, i) => <p key={i} className="text-[15px] text-neutral-700 leading-[1.9]">{p}</p>)}
    </div>
  );
}

/** HeRo 해설 — 점수 구간으로 고른 검수 모듈 */
export function ModuleList({ modules }: { modules: { id: string; title: string; content: string }[] }) {
  if (modules.length === 0) return null;
  return (
    <div className="space-y-10">
      {modules.map(m => (
        <article key={m.id}>
          <h3 className="text-[16px] font-bold text-neutral-900">{m.title}</h3>
          <Prose text={m.content} className="mt-3" />
        </article>
      ))}
    </div>
  );
}

export function AiNarrative({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  return (
    <div className="rounded-2xl bg-neutral-50 p-5 sm:p-7">
      <p className="text-xs font-semibold text-neutral-400 mb-4">종합 해설 · AI 보조 (점수와 유형은 바꾸지 않습니다)</p>
      <Prose text={text.replace(/[#*`]/g, "")} />
    </div>
  );
}

export function NextLink({ href, title, desc, primary = false }: { href: string; title: string; desc?: string; primary?: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-4 rounded-2xl p-5 transition-shadow hover:shadow-md ${primary ? "border-2 border-[#E53935]" : "border border-neutral-200"}`}>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-neutral-900">{title}</p>
        {desc && <p className="text-[13px] text-neutral-500 mt-1 leading-relaxed">{desc}</p>}
      </div>
      <ArrowRight className={`h-4 w-4 shrink-0 ${primary ? "text-[#E53935]" : "text-neutral-400"}`} />
    </Link>
  );
}

export function ReportFooterNote() {
  return (
    <p className="text-xs text-neutral-400 leading-relaxed mt-16 pt-6 border-t border-neutral-100">
      HIT는 자기보고식 검사입니다. 유형은 경향이며, 결과만으로 채용이나 진로를 결정하지 않습니다.{" "}
      <Link href="/hero/hit/method" className="underline hover:text-neutral-600">결과는 이렇게 만들어집니다</Link>
    </p>
  );
}

export function LoadingState() {
  return <div className="min-h-[60vh] flex items-center justify-center"><div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" /></div>;
}

export function NotFoundState({ retryHref }: { retryHref: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-center">
      <div><p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p><Link href={retryHref} className="text-[#E53935] underline text-sm">검사 페이지로</Link></div>
    </div>
  );
}

export function formatDate(iso: string | undefined | null) {
  return iso ? new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "";
}

/**
 * 보고서 파일명 — 브라우저는 인쇄·PDF 저장 때 document.title을 파일명으로 쓴다.
 * 예: HeRo HIT A 나에 대한 이해 - D-ENTJ - 2026-10-12
 */
export function useReportTitle(parts: (string | null | undefined)[], ready: boolean) {
  const title = parts.filter(Boolean).join(" - ");
  useEffect(() => {
    if (!ready || !title) return;
    const prev = document.title;
    document.title = title;
    return () => { document.title = prev; };
  }, [ready, title]);
}

export function isoDay(iso: string | undefined | null) {
  return iso ? new Date(iso).toISOString().slice(0, 10) : "";
}

/** 보고서(인쇄) 상단 도구 — 결과 화면으로 · 검사 설명 · 인쇄/PDF (인쇄 시 숨김) */
export function ReportToolbar({ backHref }: { backHref: string }) {
  return (
    <div className="no-print flex items-center justify-between gap-2 mb-10">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"><ArrowLeft className="h-4 w-4" /> 결과 화면으로</Link>
      <div className="flex items-center gap-2">
        <HitModelGuideModal />
        <button onClick={() => window.print()} className="print-keep inline-flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"><Printer className="h-4 w-4" /> 인쇄 / PDF</button>
      </div>
    </div>
  );
}

/** 보고서 표지 — 화면에서는 첫 카드, 인쇄에서는 한 장 전체 */
export function ReportCover({ code, title, subtitle, headline, sub, date, reportNo }: { code: string; title: string; subtitle?: string; headline?: string; sub?: string; date?: string; reportNo?: string }) {
  return (
    <section className="hit-cover rounded-3xl border border-neutral-200 px-8 py-16 sm:py-20 text-center mb-12 print:border-0 print:rounded-none print:flex print:flex-col print:justify-center print:min-h-[260mm] print:mb-0" style={{ breakAfter: "page" }}>
      <Image src="/hero-logo.png" alt="HeRo" width={64} height={64} className="h-16 w-16 mx-auto" />
      <p className="text-xs font-semibold text-neutral-400 tracking-[0.2em] mt-8">HeRo INTEGRATED TEST · 결과 보고서</p>
      <p className="text-sm font-semibold text-neutral-500 mt-10">{code}</p>
      <h1 className="text-[40px] sm:text-[48px] font-extrabold text-neutral-900 mt-2 leading-tight break-keep">{title}</h1>
      {subtitle && <p className="text-lg font-semibold text-neutral-600 mt-2 break-keep">{subtitle}</p>}
      {headline && <p className="text-2xl font-bold text-neutral-900 mt-10">{headline}</p>}
      {sub && <p className="text-[15px] text-neutral-500 mt-2">{sub}</p>}
      <div className="mt-14 space-y-1 text-sm text-neutral-400">
        {date && <p>검사일 {date}</p>}
        {reportNo && <p>보고서 번호 {reportNo}</p>}
      </div>
      <p className="text-xs text-neutral-300 mt-14">HeRo · Ten:One™ Universe</p>
    </section>
  );
}

/** 결과 화면 → 전체 보고서 (새 탭) */
export function FullReportLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener" className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-neutral-900">전체 보고서 보기</p>
        <p className="text-[13px] text-neutral-500 mt-1">표지 포함 · 인쇄 / PDF 저장</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-neutral-400" />
    </a>
  );
}
