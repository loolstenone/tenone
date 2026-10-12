"use client";

/** HIT C "진입" 결과 — 결과 페이지(화면)와 보고서(인쇄) 공용. 틀·점수 기준은 features/hit/report/ReportKit (A·B와 같음) */
import { useEffect, useState } from "react";
import Link from "next/link";
import { Printer } from "lucide-react";
import { HIT_STAGES } from "@/lib/hit/stages";
import { READINESS_COPY, ONBOARDING_COPY, DECISION_COPY, STAGE_LABELS, STAGE_DESC, BAND_INFO, scoreBand } from "@/lib/hit/report-copy";
import {
  ReportShell, ReportHeader, HitChain, SectionNav, Section, KeyFindings, ScoreGuide, ScoreList,
  ModuleList, AiNarrative, NextLink, ReportFooterNote, LoadingState, NotFoundState, formatDate,
} from "@/features/hit/report/ReportKit";
import { HitNextSteps } from "@/features/hit/report/HitNextSteps";

interface CResult {
  id: string;
  readiness_scores: Record<string, number>;
  readiness_total: number;
  readiness_gaps: string[];
  checklist_percent: number | null;
  onboarding_scores: Record<string, number>;
  onboarding_total: number;
  career_decision: number;
  ai_report: string | null;
  journey_stage: string;
  track_id: string | null;
  created_at: string;
  report_modules?: { id: string; title: string; content: string }[];
}

const NAV = [
  { id: "summary", label: "한눈에" }, { id: "readiness", label: "취업 준비" }, { id: "onboarding", label: "첫 직무 적응" },
  { id: "decision", label: "진로 결정" }, { id: "commentary", label: "해설" },
];

export default function HitCResultView({ resultId, print = false }: { resultId: string; print?: boolean }) {
  const [r, setR] = useState<CResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hit/c/result/${resultId}`).then(x => x.json()).then(d => { if (!d.error) setR(d); setLoading(false); }).catch(() => setLoading(false));
  }, [resultId]);

  if (loading) return <LoadingState />;
  if (!r) return <NotFoundState retryHref="/hero/hit/c" />;

  const readiness = Object.entries(r.readiness_scores).filter(([k]) => READINESS_COPY[k]).sort((a, b) => b[1] - a[1]);
  const best = readiness[0];
  const weakest = readiness[readiness.length - 1];

  return (
    <>
    <ReportShell>
      {print && (
        <div className="no-print flex items-center justify-between mb-8">
          <Link href={`/hero/hit/c/result/${resultId}`} className="text-sm text-neutral-500 hover:text-neutral-700">← 결과 페이지로</Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700"><Printer className="h-4 w-4" /> 인쇄 / PDF</button>
        </div>
      )}
      <ReportHeader code={`${HIT_STAGES.c.code} · 생애주기`} title={HIT_STAGES.c.name} date={formatDate(r.created_at)}
        stage={STAGE_LABELS[r.journey_stage]} stageDesc={STAGE_DESC[r.journey_stage]} />
      {!print && <HitChain type="c" id={resultId} />}
      {!print && <SectionNav items={NAV} />}

      <Section id="summary" title="한눈에" lead="첫 직무를 향한 지금의 준비 상태입니다.">
        <KeyFindings items={[
          { label: "취업 준비도", value: `${r.readiness_total} · ${BAND_INFO[scoreBand(r.readiness_total)].label}`, note: "여섯 가지 준비 영역의 평균입니다." },
          { label: "가장 준비된 곳", value: best ? `${READINESS_COPY[best[0]].label} ${best[1]}` : "-", note: best ? READINESS_COPY[best[0]].what : "" },
          { label: "먼저 채울 곳", value: weakest && weakest !== best ? `${READINESS_COPY[weakest[0]].label} ${weakest[1]}` : "-", note: weakest ? READINESS_COPY[weakest[0]].what : "" },
        ]} />
        <div className="mt-6"><ScoreGuide /></div>
      </Section>

      <Section id="readiness" title="취업 준비" lead="지원 동기부터 실행까지, 첫 직무를 얻는 데 필요한 여섯 가지 준비입니다. 내가 느끼는 준비 정도를 보여 줍니다.">
        <ScoreList scores={r.readiness_scores} copy={READINESS_COPY} />
      </Section>

      <Section id="onboarding" title="첫 직무 적응" lead="입사 후 첫 몇 달을 얼마나 잘 지낼지 미리 보는 네 가지 힘입니다.">
        <ScoreList scores={r.onboarding_scores} copy={ONBOARDING_COPY} />
      </Section>

      <Section id="decision" title="진로 결정 확신" lead={DECISION_COPY.what}>
        <ScoreList scores={{ decision: r.career_decision }} copy={{ decision: DECISION_COPY }} sort={false} />
      </Section>

      <Section id="commentary" title="HeRo 해설" lead="점수 구간에 따라 미리 쓰고 검수한 해설입니다.">
        <ModuleList modules={r.report_modules ?? []} />
        <div className="mt-10"><AiNarrative text={r.ai_report} /></div>
      </Section>

      <ReportFooterNote />
    </ReportShell>
    {!print && (
      <HitNextSteps from="stage" aId={undefined}>
        <div className="rounded-2xl bg-white border border-neutral-200 p-5 sm:p-6 mb-4">
          <p className="text-[15px] font-bold text-neutral-900">준비 체크리스트는 검사 문항이 아닙니다</p>
          <p className="text-[14px] text-neutral-600 mt-2 leading-[1.8]">
            이력서·면접처럼 &lsquo;이미 해 둔 일&rsquo;을 예/아니오로 표시하는 할 일 목록이에요. 나의 저니에서 하나씩 체크할수록 다음 검사의 준비도에 반영됩니다.
            {typeof r.checklist_percent === "number" && ` 검사 당시 완료율은 ${r.checklist_percent}%였습니다.`}
          </p>
        </div>
        <div className="space-y-3">
          <NextLink href="/hero/journey" title="나의 저니에서 준비 체크하기" desc="목표 · 체크인 · 준비 체크리스트" primary />
          <NextLink href={`/hero/hit/c/report/${resultId}`} title="보고서 보기 · 인쇄" />
        </div>
      </HitNextSteps>
    )}
    </>
  );
}
