"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Copy, Check, Share2 } from "lucide-react";
import HeroTypeCard from "@/features/hit/HeroTypeCard";
import MBTISpectrum from "@/features/hit/MBTISpectrum";
import DISCChart from "@/features/hit/DISCChart";
import RadarChart from "@/features/hit/RadarChart";
import PersonalityRadar from "@/features/hit/PersonalityRadar";
import RIASECChart from "@/features/hit/RIASECChart";
import CompetencyChart from "@/features/hit/CompetencyChart";
import ReadinessGauge from "@/features/hit/ReadinessGauge";
import type { HitAResult, HitBResult } from "@/types/hit";

function cleanMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^[-*]\s/gm, '')
    .replace(/^\d+\.\s/gm, '')
    .trim();
}

const TRACK_DISPLAY_NAMES: Record<string, string> = {
  marketing_strategy: '마케팅전략',
  branding: '브랜딩',
  advertising: '광고기획',
  content: '콘텐츠',
  data_performance: '데이터/퍼포먼스',
};

const JOURNEY_STAGE_NAMES: Record<string, string> = {
  ready: '실전 준비 완료',
  developing: '역량 개발 중',
  exploring: '탐색 단계',
  discovering: '발견 단계',
};

export default function IntegratedProfilePage() {
  const params = useParams();
  const hitBResultId = params.id as string;

  const [hitA, setHitA] = useState<HitAResult | null>(null);
  const [hitB, setHitB] = useState<HitBResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hitBResultId) return;

    async function loadData() {
      try {
        // Load HIT B
        const bRes = await fetch(`/api/hit/b/result/${hitBResultId}`);
        const bData = await bRes.json();
        if (bData.error) { setLoading(false); return; }

        const bResult: HitBResult = {
          id: bData.id,
          sessionId: bData.session_id,
          memberId: bData.member_id,
          hitAResultId: bData.hit_a_result_id,
          personalityScores: bData.personality_scores || {},
          darkTriadFlags: bData.dark_triad_flags || {},
          riasecR: bData.riasec_r,
          riasecI: bData.riasec_i,
          riasecA: bData.riasec_a,
          riasecS: bData.riasec_s,
          riasecE: bData.riasec_e,
          riasecC: bData.riasec_c,
          hollandCode: bData.holland_code,
          competencyCommon: bData.competency_common || {},
          competencyTrack: bData.competency_track,
          competencyTrackScores: bData.competency_track_scores || {},
          readinessSelf: bData.readiness_self,
          readinessPortfolio: bData.readiness_portfolio,
          readinessInterview: bData.readiness_interview,
          readinessNetwork: bData.readiness_network,
          readinessTotal: bData.readiness_total,
          readinessGrade: bData.readiness_grade,
          readinessGaps: bData.readiness_gaps || [],
          aiReport: bData.ai_report,
          journeyStage: bData.journey_stage,
          createdAt: bData.created_at,
        };
        setHitB(bResult);

        // Load HIT A if linked
        if (bData.hit_a_result_id) {
          const aRes = await fetch(`/api/hit/a/result/${bData.hit_a_result_id}`);
          const aData = await aRes.json();
          if (!aData.error) {
            setHitA({
              id: aData.id,
              sessionId: aData.session_id,
              memberId: aData.member_id,
              mbtiType: aData.mbti_type,
              mbtiEScore: aData.mbti_e_score,
              mbtiSScore: aData.mbti_s_score,
              mbtiTScore: aData.mbti_t_score,
              mbtiJScore: aData.mbti_j_score,
              discPrimary: aData.disc_primary,
              discSubtype: aData.disc_subtype,
              discDScore: aData.disc_d_score,
              discIScore: aData.disc_i_score,
              discSScore: aData.disc_s_score,
              discCScore: aData.disc_c_score,
              baseSummary: aData.base_summary,
              baseScores: aData.base_scores || {},
              typeCode: aData.type_code,
              typeNameKo: aData.type_name_ko,
              typeNickname: aData.type_nickname,
              typeCategory: aData.type_category,
              typeTraits: aData.type_traits,
              typeCareers: aData.type_careers,
              aiNarrative: aData.ai_narrative,
              sPowerScores: aData.s_power_scores,
              createdAt: aData.created_at,
            });
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [hitBResultId]);

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
          <p className="text-neutral-400 text-sm">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!hitB) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">프로필을 찾을 수 없습니다.</p>
          <Link href="/hero/hit" className="text-[#E53935] underline text-sm">검사 메인으로</Link>
        </div>
      </div>
    );
  }

  const spData = hitA?.sPowerScores ? [
    { label: "전략적 사고", value: hitA.sPowerScores.strategic },
    { label: "실행 추진력", value: hitA.sPowerScores.execution },
    { label: "창의성", value: hitA.sPowerScores.creativity },
    { label: "대인관계", value: hitA.sPowerScores.interpersonal },
    { label: "분석적 판단", value: hitA.sPowerScores.analytical },
  ] : [];

  const trackDisplayName = TRACK_DISPLAY_NAMES[hitB.competencyTrack] || hitB.competencyTrack;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <Image src="/hero-logo.png" alt="HeRo" width={56} height={56} className="h-14 w-14 mx-auto mb-3" />
        <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">Integrated Hero Profile</p>
        <h1 className="text-2xl md:text-3xl font-extrabold">통합 영웅 프로필</h1>
        <p className="text-sm text-neutral-500 mt-2">HIT - A + HIT - B 종합</p>
      </div>

      {/* ── HIT A Section ── */}
      {hitA && (
        <>
          <div className="mt-8 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-full">
              PART 1 — 나는 누구인가
            </div>
          </div>

          {/* 64유형 카드 */}
          <HeroTypeCard
            typeCode={hitA.typeCode}
            nameKo={hitA.typeNameKo}
            nickname={hitA.typeNickname}
            category={hitA.typeCategory}
            traits={hitA.typeTraits}
            careers={hitA.typeCareers}
          />

          {/* MBTI */}
          <section className="mt-6">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">MBTI 성향</h2>
            <div className="border border-neutral-200 rounded-xl p-6">
              <MBTISpectrum
                eScore={hitA.mbtiEScore}
                sScore={hitA.mbtiSScore}
                tScore={hitA.mbtiTScore}
                jScore={hitA.mbtiJScore}
              />
            </div>
          </section>

          {/* DISC */}
          <section className="mt-6">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">DISC 행동유형</h2>
            <div className="border border-neutral-200 rounded-xl p-6">
              <DISCChart
                d={hitA.discDScore}
                i={hitA.discIScore}
                s={hitA.discSScore}
                c={hitA.discCScore}
                primary={hitA.discPrimary}
              />
            </div>
          </section>

          {/* S-Power */}
          {spData.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">S-Power 강점</h2>
              <div className="border border-neutral-200 rounded-xl p-6 flex justify-center">
                <RadarChart data={spData} size={280} />
              </div>
            </section>
          )}
        </>
      )}

      {/* ── HIT B Section ── */}
      <div className="mt-12 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-[#E53935] text-xs font-bold rounded-full">
          PART 2 — 나의 커리어
        </div>
      </div>

      {/* Personality */}
      <section className="mt-6">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">성격 특성</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <PersonalityRadar
            scores={hitB.personalityScores}
            darkTriadFlags={hitB.darkTriadFlags}
          />
        </div>
      </section>

      {/* RIASEC */}
      <section className="mt-6">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">직업 흥미</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <RIASECChart
            r={hitB.riasecR}
            i={hitB.riasecI}
            a={hitB.riasecA}
            s={hitB.riasecS}
            e={hitB.riasecE}
            c={hitB.riasecC}
            hollandCode={hitB.hollandCode}
          />
        </div>
      </section>

      {/* Competency */}
      <section className="mt-6">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">역량</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <CompetencyChart
            common={hitB.competencyCommon}
            trackScores={hitB.competencyTrackScores}
            trackName={trackDisplayName}
          />
        </div>
      </section>

      {/* Readiness */}
      <section className="mt-6">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">커리어 준비도</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <ReadinessGauge
            self={hitB.readinessSelf}
            portfolio={hitB.readinessPortfolio}
            interview={hitB.readinessInterview}
            network={hitB.readinessNetwork}
            total={hitB.readinessTotal}
            grade={hitB.readinessGrade}
            gaps={hitB.readinessGaps}
          />
        </div>
      </section>

      {/* AI Report */}
      {hitB.aiReport && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Image src="/hero-logo-wide.png" alt="" width={24} height={12} className="h-3.5 w-auto opacity-50" />
            HeRo의 종합 분석
          </h2>
          <div className="bg-neutral-50 p-6 rounded-xl">
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{cleanMarkdown(hitB.aiReport)}</p>
          </div>
        </section>
      )}

      {/* Journey Stage */}
      <section className="mt-8 text-center">
        <p className="text-xs text-neutral-400 mb-2">현재 여정 단계</p>
        <span className="inline-block px-4 py-2 bg-[#E53935] text-white text-sm font-bold rounded-full">
          {JOURNEY_STAGE_NAMES[hitB.journeyStage] || hitB.journeyStage}
        </span>
      </section>

      {/* Actions */}
      <section className="mt-10 space-y-3">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 w-full py-3 border border-neutral-200 rounded-xl text-sm hover:bg-neutral-50 transition-colors"
        >
          {copied
            ? <><Check className="h-4 w-4 text-green-500" /> 복사됨</>
            : <><Copy className="h-4 w-4" /> 프로필 링크 복사</>
          }
        </button>
        <Link
          href="/hero/hit"
          className="flex items-center justify-center gap-2 w-full py-3 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <Share2 className="h-3.5 w-3.5" /> 검사 메인으로
        </Link>
      </section>
    </div>
  );
}
