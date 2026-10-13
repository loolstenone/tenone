"use client";

import { useState, useEffect } from "react";
import HeroChatPanel from "@/features/hit/HeroChatPanel";
import { getHeroGreeting } from "@/lib/hit/hero-agent-system";
import { mapHitBResult } from "@/features/hit/hit-b-result-mapper";
import { CORE_COMPETENCY_LABELS, type CoreCompetency } from "@/lib/hit/scoring-b";
import { HIT_STAGES } from "@/lib/hit/stages";
import { HitNextSteps } from "@/features/hit/report/HitNextSteps";
import { CORE_MODULE_KEY, trackModuleId } from "@/lib/hit/report-assembler";
import { CORE_COPY, INSIGHT_COPY, HOLLAND_COPY, EFFICACY_INFO, STAGE_LABELS, STAGE_DESC, scoreBand } from "@/lib/hit/report-copy";
import { TRACK_COMPETENCY_LABELS, trackCompetencyLabel } from "@/lib/hit/track-competency-labels";
import {
  ReportShell, ReportHeader, HitChain, SectionNav, Section, KeyFindings, ScoreGuide, ScoreList, ScoreRow,
  ModuleList, AiNarrative, ReportFooterNote, LoadingState, NotFoundState, formatDate,
  ReportToolbar, ReportCover, FullReportLink, useReportTitle, isoDay,
} from "@/features/hit/report/ReportKit";
import type { HitBResult } from "@/types/hit";

const NAV = [
  { id: "summary", label: "한눈에" }, { id: "core", label: "핵심역량" }, { id: "track", label: "직무 역량" },
  { id: "efficacy", label: "효능감 × 흥미" }, { id: "insight", label: "자기·직무 이해" },
  { id: "commentary", label: "해설" },
];

const TRACK_MEANING: Record<string, string> = {
  strong: "이 직무에서 강점으로 내세울 수 있습니다. 경험과 결과물로 증명해 두세요.",
  solid: "기본은 갖췄습니다. 결과물 하나로 보여 줄 수 있으면 강점이 됩니다.",
  grow: "앞으로 3개월 동안 채우면 좋은 영역입니다. 관련 프로젝트나 강의로 경험을 쌓아 보세요.",
  focus: "지금 가장 먼저 채울 영역입니다. 작은 실습부터 시작하면 빠르게 올라갑니다.",
};

const MATRIX_GROUPS = [
  { key: "optimal", title: "중심에 둘 일", desc: "끌리고, 해낼 수 있다고 느낍니다 (흥미·효능감 모두 60 이상)." },
  { key: "explore", title: "배우면 되는 일", desc: "끌리지만 아직 자신이 없습니다. 경험을 쌓으면 중심이 될 수 있습니다." },
  { key: "burnout", title: "소진 주의", desc: "할 수는 있지만 끌리지 않습니다. 오래 하면 지칠 수 있어요." },
] as const;

/** HIT B "역량과 방향" — 결과 화면과 보고서(인쇄·PDF) 공용 (2026-10-12). print = 표지·인쇄 도구, 나의 HIT·바로가기·상담·다음 검사 숨김 */
export default function HitBResultView({ resultId, print = false }: { resultId: string; print?: boolean }) {
  const [result, setResult] = useState<(HitBResult & { trackName: string }) | null>(null);
  const [modules, setModules] = useState<{ id: string; title: string; content: string }[]>([]);
  const [trackMods, setTrackMods] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/b/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setResult(mapHitBResult(data));
          const mods = (data.report_modules ?? {}) as Record<string, { title: string; content: string }>;
          // 핵심역량 해설 — 점수 높은 순 (API는 DB 순서로 돌려줌)
          const common = (data.competency_common ?? {}) as Record<string, number>;
          const scoreOf = (id: string) => common[Object.keys(CORE_MODULE_KEY).find(k => id.startsWith(`CORE-${CORE_MODULE_KEY[k]}-`)) ?? ""] ?? 0;
          setTrackMods(Object.fromEntries(Object.entries(mods).filter(([k]) => k.startsWith("TRK-")).map(([k, m]) => [k, m.content])));
          setModules(Object.entries(mods).filter(([k]) => k.startsWith("CORE-")).map(([id, m]) => ({ id, ...m })).sort((a, b) => scoreOf(b.id) - scoreOf(a.id)));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  useReportTitle([`HeRo ${HIT_STAGES.b.code} ${HIT_STAGES.b.name}`, result?.trackName, isoDay(result?.createdAt)], !!result);

  if (loading) return <LoadingState />;
  if (!result) return <NotFoundState retryHref="/hero/hit/b" />;

  const core = Object.entries(result.competencyCommon).sort((a, b) => b[1] - a[1]) as [CoreCompetency, number][];
  const topCore = core[0];
  const track = Object.entries(result.competencyTrackScores).sort((a, b) => b[1] - a[1]);
  const topTrack = track[0];
  const lowTrack = track[track.length - 1];
  const center = result.matrix?.optimal?.length ? result.matrix.optimal : result.efficacyTop3.split("").slice(0, 2);
  const eff = result.efficacyScores;
  // matrix = null이면 HIT A 미측정(mapper가 처리). 흥미·효능 모두 60 미만이면 세 그룹이 다 비어 빈 구역만 보이던 결함 (2026-10-13)
  const matrixMeasured = !!result.matrix;
  const matrixHasGroup = matrixMeasured && MATRIX_GROUPS.some(g => result.matrix![g.key].length > 0);

  return (
    <>
    <div className={print ? "hit-report-container" : ""}>
    <ReportShell>
      {print && <ReportToolbar backHref={`/hero/hit/b/result/${resultId}`} />}
      {print && <ReportCover code={`공통 기반`} title={HIT_STAGES.b.code} subtitle={HIT_STAGES.b.name} headline={result.trackName} sub={STAGE_LABELS[result.journeyStage]} date={formatDate(result.createdAt)} reportNo={resultId.slice(0, 8).toUpperCase()} />}
      {!print && <ReportHeader code={`공통 기반`} title={HIT_STAGES.b.code} subtitle={HIT_STAGES.b.name} date={formatDate(result.createdAt)}
        stage={STAGE_LABELS[result.journeyStage]} stageDesc={STAGE_DESC[result.journeyStage]} />}
      {print && <div className="text-center mb-4"><span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-red-50 text-[#E53935]">{STAGE_LABELS[result.journeyStage]}</span><p className="text-[15px] text-neutral-600 mt-4 leading-[1.8]">{STAGE_DESC[result.journeyStage]}</p></div>}
      {!print && <HitChain type="b" id={resultId} />}
      {!print && <SectionNav items={NAV} />}

      <Section id="summary" title="한눈에" lead="이번 검사에서 가장 먼저 알아 두면 좋은 세 가지입니다.">
        <KeyFindings items={[
          { label: "가장 강한 기본기", value: topCore ? `${CORE_COMPETENCY_LABELS[topCore[0]]} ${topCore[1]}` : "-", note: topCore ? CORE_COPY[topCore[0]].what : "" },
          { label: `${result.trackName} 직무 역량`, value: topTrack ? `${trackCompetencyLabel(topTrack[0])} ${topTrack[1]}` : "-", note: lowTrack && lowTrack !== topTrack ? `채울 곳: ${trackCompetencyLabel(lowTrack[0])} ${lowTrack[1]}` : "" },
          { label: result.matrix?.optimal?.length ? "중심에 둘 분야" : "자신 있는 분야", value: center.map(t => HOLLAND_COPY[t]?.label ?? t).join(" · ") || "-", note: center[0] ? HOLLAND_COPY[center[0]]?.what ?? "" : "" },
        ]} />
        <div className="mt-6"><ScoreGuide /></div>
      </Section>

      <Section id="core" title="핵심역량" lead="어떤 직무에서든 필요한 여섯 가지 기본기입니다. 높은 순서로 보여 드립니다.">
        <ScoreList scores={result.competencyCommon} copy={CORE_COPY} />
      </Section>

      <Section id="track" title={`직무 역량 — ${result.trackName}`} lead="희망 직무에서 실제로 요구하는 여섯 가지 역량입니다. 강점은 내세우고, 낮은 곳은 다음 준비 목표로 삼으세요.">
        <div className="rounded-2xl border border-neutral-200 px-5 sm:px-6">
          {track.map(([k, v]) => (
            <ScoreRow key={k} label={trackCompetencyLabel(k)} value={v} what={TRACK_COMPETENCY_LABELS[k]?.what} meaning={trackMods[trackModuleId(k, v)] ?? TRACK_MEANING[scoreBand(v)]} />
          ))}
        </div>
      </Section>

      <Section id="efficacy" title="효능감 × 흥미" lead={EFFICACY_INFO.what}>
        {matrixMeasured && !matrixHasGroup ? (
          <p className="text-[15px] text-neutral-600 leading-[1.8]">흥미와 효능감이 모두 60을 넘는 분야가 아직 없습니다. 끌리는 일과 자신 있는 일이 뚜렷하게 정해지지 않은 단계라는 뜻이에요. 아래 효능감이 가장 높은 분야부터 작은 경험을 쌓아 보면 방향이 선명해집니다.</p>
        ) : matrixMeasured ? (
          <div className="space-y-4">
            {MATRIX_GROUPS.map(g => {
              const types = result.matrix![g.key];
              if (!types.length) return null;
              return (
                <div key={g.key} className="rounded-2xl border border-neutral-200 p-5 sm:p-6">
                  <p className="text-[16px] font-bold text-neutral-900">{g.title}</p>
                  <p className="text-[14px] text-neutral-500 mt-1 leading-relaxed">{g.desc}</p>
                  <ul className="mt-4 space-y-3">
                    {types.map(t => (
                      <li key={t} className="flex items-baseline gap-3">
                        <span className="text-[15px] font-semibold text-neutral-900 w-16 shrink-0">{HOLLAND_COPY[t]?.label}</span>
                        <span className="text-[14px] text-neutral-600 leading-relaxed">{HOLLAND_COPY[t]?.what} · 효능감 {eff[t] ?? 0}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-[15px] text-neutral-500">HIT - Archetype 흥미 결과가 없어 교차 분석은 생략했습니다. 아래 효능감만 참고하세요.</p>
        )}
        <h3 className="text-[15px] font-bold text-neutral-900 mt-10 mb-2">분야별 효능감</h3>
        <div className="rounded-2xl border border-neutral-200 px-5 sm:px-6">
          {Object.entries(HOLLAND_COPY).map(([t, c]) => [t, c, eff[t] ?? 0] as const).sort((a, b) => b[2] - a[2]).map(([t, c, v]) => (
            <ScoreRow key={t} label={c.label} value={v} what={c.what} />
          ))}
        </div>
      </Section>

      <Section id="insight" title="자기·직무 이해" lead="나를 얼마나 알고, 가고 싶은 직무를 얼마나 아는지입니다. 둘 다 높을수록 준비가 구체적이 됩니다.">
        <ScoreList scores={{ self_understanding: result.insightSelf, job_understanding: result.insightJob }} copy={INSIGHT_COPY} sort={false} />
      </Section>

      <Section id="commentary" title="HeRo 해설" lead="핵심역량 여섯 가지 각각에 대해, 점수 구간에 맞춰 미리 쓰고 검수한 해설입니다. 강한 역량부터 보여 드립니다.">
        <ModuleList modules={modules} />
        <div className="mt-10"><AiNarrative text={result.aiReport} /></div>
      </Section>

      <ReportFooterNote />

      {!print && <HeroChatPanel
        resultId={resultId}
        mode={result.hitAResultId ? "AB_FULL" : "B_ONLY"}
        greeting={getHeroGreeting(result.hitAResultId ? "AB_FULL" : "B_ONLY", { hollandCode: result.efficacyTop3, topCompetency: topCore ? CORE_COMPETENCY_LABELS[topCore[0]] : undefined })}
        quickQuestions={result.hitAResultId ? ["직무 적합도 분석", "성격과 역량 연결", "3개월 성장 플랜", "배우면 되는 영역은?"] : ["적성에 맞는 직무는?", "역량 올리려면?", "어디서부터 시작할까?", "효능감이 낮은 이유"]}
      />}
    </ReportShell>
    </div>
    {!print && (
      <HitNextSteps from="b" bId={resultId}>
        <FullReportLink href={`/hero/hit/b/report/${resultId}`} />
      </HitNextSteps>
    )}
    </>
  );
}
