"use client";

/**
 * HIT A "나에 대한 이해" 결과 — 결과 페이지(화면)와 보고서(인쇄·PDF) 공용 (2026-10-12)
 * 틀·점수 기준은 features/hit/report/ReportKit (B·C와 같음). print = 보고서: 나의 HIT·바로가기·상담·다음 검사 숨김, 인쇄 도구·모델 가이드 표시
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { RefreshCw, Sparkles } from "lucide-react";
import HeroTypeCard from "@/features/hit/HeroTypeCard";
import MBTISpectrum from "@/features/hit/MBTISpectrum";
import DISCChart from "@/features/hit/DISCChart";
import RadarChart from "@/features/hit/RadarChart";
import HeroChatPanel from "@/features/hit/HeroChatPanel";
import HitShareButtons from "@/features/hit/HitShareButtons";
import HitModelGuide from "@/features/hit/HitModelGuide";
import { HIT_STAGES } from "@/lib/hit/stages";
import { getHeroGreeting } from "@/lib/hit/hero-agent-system";
import { CH_COPY, DISC_COPY, HOLLAND_COPY, SPOWER_LABELS, toParagraphs } from "@/lib/hit/report-copy";
import {
  ReportShell, ReportHeader, HitChain, SectionNav, Section, KeyFindings, ScoreGuide, ScoreList, ScoreRow,
  ModuleList, AiNarrative, NextLink, ReportFooterNote, LoadingState, NotFoundState, formatDate,
  ReportToolbar, ReportCover, FullReportLink, useReportTitle, isoDay,
} from "@/features/hit/report/ReportKit";
import { HitNextSteps } from "@/features/hit/report/HitNextSteps";

type Row = Record<string, unknown>;
type Mod = { id: string; title: string; content: string };
/** hit_hero_types.strengths·cautions — 문자열 목록(현행) 또는 {title, desc}(옛 형식) */
type TypeNote = string | { title: string; desc: string };

function TypeNoteList({ items }: { items: TypeNote[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((it, i) => typeof it === "string" ? (
        <li key={i} className="flex gap-3 text-[15px] text-neutral-700 leading-[1.8]"><span className="text-neutral-300 shrink-0">—</span><span>{it}</span></li>
      ) : (
        <li key={i}><p className="text-[15px] font-semibold text-neutral-900">{it.title}</p><p className="text-[15px] text-neutral-700 mt-1.5 leading-[1.85]">{it.desc}</p></li>
      ))}
    </ul>
  );
}
interface HeroTypeData {
  character_name?: string;
  profile_overview?: string;
  strengths?: TypeNote[];
  cautions?: TypeNote[];
  fit_direction?: string;
}

const NAV = [
  { id: "summary", label: "한눈에" }, { id: "personality", label: "성격" }, { id: "behavior", label: "행동" },
  { id: "strength", label: "강점" }, { id: "type-guide", label: "강점·주의점" }, { id: "character", label: "성품" },
  { id: "interest", label: "흥미" }, { id: "background", label: "성장 배경" }, { id: "commentary", label: "해설" },
];

export default function HitAResultView({ resultId, print = false }: { resultId: string; print?: boolean }) {
  const [d, setD] = useState<Row | null>(null);
  const [heroType, setHeroType] = useState<HeroTypeData | null>(null);
  const [mods, setMods] = useState<Mod[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatRemaining, setChatRemaining] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/a/result/${resultId}`)
      .then(r => r.json())
      .then(async (data) => {
        if (data.error) { setLoading(false); return; }
        if (data.type_code) {
          try {
            const { createClient } = await import("@/lib/supabase/client");
            const { data: ht } = await createClient().from("hit_hero_types")
              .select("character_name,profile_overview,strengths,cautions,fit_direction").eq("type_code", data.type_code).maybeSingle();
            if (ht) setHeroType(ht);
          } catch { /* 유형 설명 없이도 결과 표시 */ }
        }
        setD(data);
        setMods(Object.entries((data.report_modules ?? {}) as Record<string, { title: string; content: string }>).map(([id, m]) => ({ id, ...m })));
        if (!print) {
          // 무료 회원 AI 상담 남은 횟수
          fetch("/api/hit/membership").then(r => r.json()).then(m => {
            if (m.data?.tier && m.data.tier !== "premium" && m.data.tier !== "professional") {
              fetch(`/api/hit/chat/usage?memberId=${data.member_id ?? ""}`).then(r => r.json()).then(u => { if (u.data !== undefined) setChatRemaining(Math.max(0, 3 - u.data)); }).catch(() => setChatRemaining(3));
            }
          }).catch(() => {});
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId, print]);

  useReportTitle([`HeRo ${HIT_STAGES.a.code} ${HIT_STAGES.a.brand} ${HIT_STAGES.a.name}`, d?.type_code as string, isoDay(d?.created_at as string)], !!d);

  if (loading) return <LoadingState />;
  if (!d) return <NotFoundState retryHref="/hero/hit/a" />;

  const n = (k: string) => Number(d[k] ?? 0);
  const typeCode = String(d.type_code ?? "");
  const typeName = heroType?.character_name ?? String(d.type_name_ko ?? "");
  const sp = Object.entries((d.s_power_scores ?? {}) as Record<string, number>).filter(([k, v]) => SPOWER_LABELS[k] && v > 0).sort((a, b) => b[1] - a[1]);
  const ap = Object.entries((d.ap_scores ?? {}) as Record<string, number>).sort((a, b) => b[1] - a[1]);
  const ch = { integrity: n("ch_integrity"), relational: n("ch_relational"), emotional: n("ch_emotional"), ethics: n("ch_ethics"), growth: n("ch_growth") };
  const discPrimary = String(d.disc_primary ?? "");
  const pick = (prefix: string) => mods.filter(m => m.id.startsWith(prefix));
  const spStrength = mods.filter(m => m.id.startsWith("SP-") && !m.id.includes("GROWTH"));
  const spGrowth = mods.filter(m => m.id.includes("GROWTH"));
  const overview = heroType?.profile_overview ? toParagraphs(heroType.profile_overview.split("\n\n")[0] ?? "", 3) : [];

  return (
    <>
    <div className={print ? "hit-report-container" : ""}>
    <ReportShell>
      {print && <ReportToolbar backHref={`/hero/hit/a/result/${resultId}`} />}
      {print && <ReportCover code={`${HIT_STAGES.a.code} · 공통 기반`} title={HIT_STAGES.a.brand} subtitle={HIT_STAGES.a.name} headline={typeCode} sub={typeName} date={formatDate(d.created_at as string)} reportNo={resultId.slice(0, 8).toUpperCase()} />}
      {!print && <ReportHeader code={`${HIT_STAGES.a.code} · 공통 기반`} title={HIT_STAGES.a.brand} subtitle={HIT_STAGES.a.name} date={formatDate(d.created_at as string)} />}
      {!print && <HitChain type="a" id={resultId} />}
      {!print && <SectionNav items={NAV} />}

      <Section id="summary" title="한눈에" lead="성격·행동·성품·흥미를 겹쳐 본 나의 영웅 유형입니다.">
        <HeroTypeCard typeCode={typeCode} nameKo={typeName} nickname={d.type_nickname as string} category={d.type_category as string}
          traits={d.type_traits as string} careers={d.type_careers as string} />
        {overview.length > 0 && <div className="mt-6 space-y-4">{overview.map((p, i) => <p key={i} className="text-[15px] text-neutral-700 leading-[1.9]">{p}</p>)}</div>}
        <div className="mt-8">
          <KeyFindings items={[
            { label: "대표 강점", value: sp[0] ? `${SPOWER_LABELS[sp[0][0]]} ${sp[0][1]}` : "-", note: sp[1] ? `다음 강점: ${SPOWER_LABELS[sp[1][0]]} ${sp[1][1]}` : "" },
            { label: "일하는 방식", value: DISC_COPY[discPrimary] ? `${DISC_COPY[discPrimary].label} (${discPrimary})` : "-", note: DISC_COPY[discPrimary]?.what ?? "" },
            { label: "끌리는 분야", value: ap.slice(0, 2).map(([t]) => HOLLAND_COPY[t]?.label).join(" · ") || "-", note: ap[0] ? HOLLAND_COPY[ap[0][0]]?.what ?? "" : "" },
          ]} />
        </div>
        <div className="mt-6"><ScoreGuide /></div>
        {!print && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-xs text-neutral-400">결과 공유하기</p>
            <HitShareButtons typeCode={typeCode} typeNameKo={typeName} typeNickname={d.type_nickname as string} resultId={resultId} variant="compact" />
          </div>
        )}
      </Section>

      {print && <div className="hidden print:block mt-16"><HitModelGuide mode="print" /></div>}

      <Section id="personality" title="성격" lead="네 가지 축에서 어느 쪽으로 기우는지 보여 줍니다. 가운데(50)에서 멀수록 그 성향이 뚜렷합니다. 좋고 나쁨이 아니라 방향입니다.">
        <div className="rounded-2xl border border-neutral-200 p-5 sm:p-6"><MBTISpectrum eScore={n("mbti_e_score")} sScore={n("mbti_s_score")} tScore={n("mbti_t_score")} jScore={n("mbti_j_score")} /></div>
        <div className="mt-10"><ModuleList modules={pick("MBTI-")} /></div>
        <p className="text-xs text-neutral-400 mt-6">MBTI®는 The Myers-Briggs Company의 상표이며, HIT는 공식 MBTI 검사가 아닙니다.</p>
      </Section>

      <Section id="behavior" title="행동" lead="네 가지 행동 방식이 나에게서 각각 얼마만큼씩 나타나는지(합계 100) 보여 줍니다. 가장 큰 쪽이 평소 일하는 방식입니다.">
        <div className="rounded-2xl border border-neutral-200 p-5 sm:p-6"><DISCChart d={n("disc_d_score")} i={n("disc_i_score")} s={n("disc_s_score")} c={n("disc_c_score")} primary={discPrimary} /></div>
        <div className="mt-10"><ModuleList modules={[...pick("DISC-"), ...pick("COMM-")]} /></div>
      </Section>

      <Section id="strength" title="강점 — S-Power" lead="성격·행동·성품·흥미를 함께 계산한 여덟 가지 강점입니다. 위쪽이 지금 가장 잘 쓰는 힘입니다.">
        {sp.length > 0 && <div className="rounded-2xl border border-neutral-200 p-5 sm:p-6 flex justify-center"><RadarChart data={sp.map(([k, v]) => ({ label: SPOWER_LABELS[k], value: v }))} size={260} /></div>}
        <div className="rounded-2xl border border-neutral-200 px-5 sm:px-6 mt-4">
          {sp.map(([k, v]) => <ScoreRow key={k} label={SPOWER_LABELS[k]} value={v} />)}
        </div>
        <div className="mt-10"><ModuleList modules={spStrength} /></div>
        {spGrowth.length > 0 && <div className="mt-10"><p className="text-xs font-semibold text-neutral-400 mb-4">키우면 좋은 힘</p><ModuleList modules={spGrowth} /></div>}
      </Section>

      {(heroType?.strengths?.length || heroType?.cautions?.length || heroType?.fit_direction) && (
        <Section id="type-guide" title={`강점·주의점 — ${typeCode}`} lead="같은 유형의 사람들이 공통으로 보이는 강점과 조심할 점, 잘 맞는 방향입니다.">
          <div className="space-y-4">
            {(heroType?.strengths?.length ?? 0) > 0 && (
              <div className="rounded-2xl border border-neutral-200 p-5 sm:p-6">
                <p className="text-sm font-bold text-emerald-700">강점</p>
                <TypeNoteList items={heroType!.strengths!} />
              </div>
            )}
            {(heroType?.cautions?.length ?? 0) > 0 && (
              <div className="rounded-2xl border border-neutral-200 p-5 sm:p-6">
                <p className="text-sm font-bold text-amber-700">주의점</p>
                <TypeNoteList items={heroType!.cautions!} />
              </div>
            )}
            {heroType?.fit_direction && (
              <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
                <p className="text-sm font-bold text-neutral-800">잘 맞는 방향</p>
                <p className="text-[15px] text-neutral-700 mt-3 leading-[1.85]">{heroType.fit_direction}</p>
              </div>
            )}
          </div>
        </Section>
      )}

      <Section id="character" title="성품" lead="일과 관계에서 드러나는 태도입니다. 높은 순서로 보여 드립니다.">
        <ScoreList scores={ch} copy={CH_COPY} />
      </Section>

      <Section id="interest" title="흥미" lead="어떤 종류의 일에 마음이 끌리는지입니다. HIT B에서 '해낼 수 있다'는 자신감(효능감)과 겹쳐 봅니다.">
        <div className="rounded-2xl border border-neutral-200 px-5 sm:px-6">
          {ap.map(([t, v]) => HOLLAND_COPY[t] && <ScoreRow key={t} label={HOLLAND_COPY[t].label} value={v} what={HOLLAND_COPY[t].what} plain />)}
        </div>
      </Section>

      <Section id="background" title="성장 배경" lead="지금의 나를 만든 가족·또래·환경의 영향입니다. 나만 볼 수 있으며, 매칭이나 다른 사람에게 쓰지 않습니다.">
        {d.base_summary ? <p className="text-[15px] text-neutral-700 leading-[1.9] mb-8">{String(d.base_summary)}</p> : null}
        <ModuleList modules={pick("UF-")} />
      </Section>

      <Section id="commentary" title="HeRo 해설" lead="성격과 행동을 겹쳐 본 해석입니다.">
        <ModuleList modules={pick("CROSS-")} />
        <div className="mt-10"><AiNarrative text={d.ai_narrative as string | null} /></div>
      </Section>

      <ReportFooterNote />

      {print && (
        <div className="hidden print:block" style={{ pageBreakBefore: "always" }}>
          <div className="flex items-center justify-center" style={{ height: "calc(100vh - 40px)" }}>
            <div className="text-center">
              <Image src="/hero-logo-black-wide.png" alt="HeRo" width={400} height={200} className="w-80 mx-auto opacity-[0.06]" />
              <p className="text-sm text-neutral-300 mt-10 tracking-widest">HeRo Integrated Test</p>
              <p className="text-xs text-neutral-300 mt-2">Ten:One™ Universe</p>
            </div>
          </div>
        </div>
      )}

      {!print && (
        <HeroChatPanel
          resultId={resultId}
          mode="A_ONLY"
          greeting={getHeroGreeting("A_ONLY", { typeCode, typeNameKo: typeName })}
          quickQuestions={["DISC 결과 궁금해요", "직장에서 어떻게 나타나나요?", "잘 맞는 유형은?", "성장 방법"]}
          memberId={(d.member_id as string | undefined) ?? undefined}
          chatRemaining={chatRemaining}
        />
      )}
    </ReportShell>
    </div>

    {!print && (
      <HitNextSteps from="a" aId={resultId}>
        <div className="space-y-3">
          <NextLink href={`/hero/coaching?type=ai&resultId=${resultId}`} title="AI 맞춤 상담" desc="성격과 행동의 교차 해석, 맞는 직무, 성장 방법을 물어보세요" />
          <FullReportLink href={`/hero/hit/a/report/${resultId}`} />
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/hero/hit/a" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-neutral-600"><RefreshCw className="h-3 w-3" /> 다시 검사하기</Link>
        </div>
      </HitNextSteps>
    )}
    {print && (
      <Link href={`/hero/coaching/ai?resultId=${resultId}`} className="no-print fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white font-bold rounded-full shadow-lg hover:bg-neutral-700 transition-colors">
        <Sparkles className="h-5 w-5" /> AI 상담
      </Link>
    )}
    </>
  );
}
