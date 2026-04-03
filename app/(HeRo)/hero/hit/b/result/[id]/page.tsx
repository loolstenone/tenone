"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Copy, Check, RefreshCw, ArrowRight } from "lucide-react";
import PersonalityRadar from "@/features/hit/PersonalityRadar";
import RIASECChart from "@/features/hit/RIASECChart";
import CompetencyChart from "@/features/hit/CompetencyChart";
import ReadinessGauge from "@/features/hit/ReadinessGauge";
import type { HitBResult } from "@/types/hit";

const TRACK_DISPLAY_NAMES: Record<string, string> = {
  marketing_strategy: '마케팅전략',
  branding: '브랜딩',
  advertising: '광고기획',
  content: '콘텐츠',
  data_performance: '데이터/퍼포먼스',
};

const JOURNEY_STAGE_NAMES: Record<string, { label: string; color: string }> = {
  ready: { label: '실전 준비 완료', color: 'text-green-600 bg-green-50' },
  developing: { label: '역량 개발 중', color: 'text-yellow-600 bg-yellow-50' },
  exploring: { label: '탐색 단계', color: 'text-orange-600 bg-orange-50' },
  discovering: { label: '발견 단계', color: 'text-red-600 bg-red-50' },
};

export default function HitBResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitBResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/b/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        // snake_case → camelCase
        setResult({
          id: data.id,
          sessionId: data.session_id,
          memberId: data.member_id,
          hitAResultId: data.hit_a_result_id,
          personalityScores: data.personality_scores || {},
          darkTriadFlags: data.dark_triad_flags || {},
          riasecR: data.riasec_r,
          riasecI: data.riasec_i,
          riasecA: data.riasec_a,
          riasecS: data.riasec_s,
          riasecE: data.riasec_e,
          riasecC: data.riasec_c,
          hollandCode: data.holland_code,
          competencyCommon: data.competency_common || {},
          competencyTrack: data.competency_track,
          competencyTrackScores: data.competency_track_scores || {},
          readinessSelf: data.readiness_self,
          readinessPortfolio: data.readiness_portfolio,
          readinessInterview: data.readiness_interview,
          readinessNetwork: data.readiness_network,
          readinessTotal: data.readiness_total,
          readinessGrade: data.readiness_grade,
          readinessGaps: data.readiness_gaps || [],
          aiReport: data.ai_report,
          journeyStage: data.journey_stage,
          createdAt: data.created_at,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-400 text-sm">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p>
          <Link href="/hero/hit/b" className="text-[#E53935] underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const stageInfo = JOURNEY_STAGE_NAMES[result.journeyStage] || JOURNEY_STAGE_NAMES.discovering;
  const trackDisplayName = TRACK_DISPLAY_NAMES[result.competencyTrack] || result.competencyTrack;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT B 결과</p>
        <h1 className="text-2xl md:text-3xl font-extrabold">종합 커리어 진단</h1>
      </div>

      {/* Journey Stage Badge */}
      <div className="flex justify-center mb-8">
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${stageInfo.color}`}>
          {stageInfo.label}
        </span>
      </div>

      {/* Personality */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">성격 특성</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <PersonalityRadar
            scores={result.personalityScores}
            darkTriadFlags={result.darkTriadFlags}
          />
        </div>
      </section>

      {/* RIASEC */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">직업 흥미 (RIASEC)</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <RIASECChart
            r={result.riasecR}
            i={result.riasecI}
            a={result.riasecA}
            s={result.riasecS}
            e={result.riasecE}
            c={result.riasecC}
            hollandCode={result.hollandCode}
          />
        </div>
      </section>

      {/* Competency */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">역량 진단</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <CompetencyChart
            common={result.competencyCommon}
            trackScores={result.competencyTrackScores}
            trackName={trackDisplayName}
          />
        </div>
      </section>

      {/* Readiness */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">커리어 준비도</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <ReadinessGauge
            self={result.readinessSelf}
            portfolio={result.readinessPortfolio}
            interview={result.readinessInterview}
            network={result.readinessNetwork}
            total={result.readinessTotal}
            grade={result.readinessGrade}
            gaps={result.readinessGaps}
          />
        </div>
      </section>

      {/* AI Report */}
      {result.aiReport && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">AI 종합 리포트</h2>
          <div className="bg-neutral-50 p-6 rounded-xl">
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{result.aiReport}</p>
          </div>
        </section>
      )}

      {/* Actions */}
      <section className="mt-10 space-y-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 w-full py-3 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50 transition-colors"
        >
          {copied ? <><Check className="h-4 w-4 text-green-500" /> 복사됨</> : <><Copy className="h-4 w-4" /> 결과 링크 복사</>}
        </button>
        {result.hitAResultId && (
          <Link
            href={`/hero/hit/profile/${result.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#E53935] text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            통합 프로필 보기 <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link
          href="/hero/hit/b"
          className="flex items-center justify-center gap-2 w-full py-3 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> 다시 검사하기
        </Link>
      </section>
    </div>
  );
}
