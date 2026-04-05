"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import HeroTypeCard from "@/features/hit/HeroTypeCard";
import MBTISpectrum from "@/features/hit/MBTISpectrum";
import DISCChart from "@/features/hit/DISCChart";
import RadarChart from "@/features/hit/RadarChart";
import type { HitAResult } from "@/types/hit";

interface HeroTypeData {
  strengths: { title: string; desc: string }[];
  cautions: { title: string; desc: string }[];
  fit_direction: string;
  profile_overview: string;
}

export default function HitAReportPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitAResult | null>(null);
  const [heroType, setHeroType] = useState<HeroTypeData | null>(null);
  const [reportModules, setReportModules] = useState<Record<string, { title: string; content: string }> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/a/result/${resultId}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.error) {
          setLoading(false);
          return;
        }
        if (data.type_code) {
          try {
            const { createClient } = await import("@/lib/supabase/client");
            const sb = createClient();
            const { data: ht } = await sb
              .from("hit_hero_types")
              .select("strengths,cautions,fit_direction,profile_overview")
              .eq("type_code", data.type_code)
              .maybeSingle();
            if (ht) setHeroType(ht);
          } catch {}
        }
        setResult({
          id: data.id,
          sessionId: data.session_id,
          memberId: data.member_id,
          mbtiType: data.mbti_type,
          mbtiEScore: data.mbti_e_score,
          mbtiSScore: data.mbti_s_score,
          mbtiTScore: data.mbti_t_score,
          mbtiJScore: data.mbti_j_score,
          discPrimary: data.disc_primary,
          discSubtype: data.disc_subtype,
          discDScore: data.disc_d_score,
          discIScore: data.disc_i_score,
          discSScore: data.disc_s_score,
          discCScore: data.disc_c_score,
          baseSummary: data.base_summary,
          baseScores: data.base_scores || {},
          typeCode: data.type_code,
          typeNameKo: data.type_name_ko,
          typeNickname: data.type_nickname,
          typeCategory: data.type_category,
          typeTraits: data.type_traits,
          typeCareers: data.type_careers,
          aiNarrative: data.ai_narrative,
          sPowerScores: data.s_power_scores,
          createdAt: data.created_at,
        });
        if (data.report_modules) setReportModules(data.report_modules);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p>
          <Link
            href="/hero/hit/a"
            className="text-[#E53935] underline text-sm"
          >
            다시 검사하기
          </Link>
        </div>
      </div>
    );
  }

  const spData = result.sPowerScores
    ? [
        { label: "전략적 사고", value: result.sPowerScores.strategic },
        { label: "실행 추진력", value: result.sPowerScores.execution },
        { label: "창의성", value: result.sPowerScores.creativity },
        { label: "대인관계", value: result.sPowerScores.interpersonal },
        { label: "분석적 판단", value: result.sPowerScores.analytical },
      ]
    : [];

  const narrativeParagraphs =
    result.aiNarrative?.split("\n").filter((p) => p.trim()) ?? [];

  const formattedDate = new Date(result.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Report modules grouped by category
  const discMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("DISC-"))
    : [];
  const mbtiMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("MBTI-"))
    : [];
  const crossMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("CROSS-"))
    : [];
  const spMods = reportModules
    ? Object.entries(reportModules).filter(
        ([k]) => k.startsWith("SP-") && !k.includes("GROWTH")
      )
    : [];
  const spGrowth = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.includes("GROWTH"))
    : [];
  const commMods = reportModules
    ? Object.entries(reportModules).filter(([k]) => k.startsWith("COMM-"))
    : [];

  return (
    <div className="hit-report-container mx-auto max-w-[210mm] px-8 py-10">
      {/* ── 인쇄 버튼 (화면에서만 보임) ── */}
      <div className="no-print flex items-center justify-between mb-8">
        <Link
          href={`/hero/hit/a/result/${resultId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" /> 결과 페이지로 돌아가기
        </Link>
        <button
          onClick={handlePrint}
          className="print-keep inline-flex items-center gap-2 px-5 py-2.5 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"
        >
          <Printer className="h-4 w-4" />
          인쇄 / PDF 저장
        </button>
      </div>

      {/* ══════════════════════════════════════════
          Section 1: 표지 / 헤더
          ══════════════════════════════════════════ */}
      <section className="hit-print-section">
        {/* 보고서 헤더 */}
        <div className="border-b-2 border-[#E53935] pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#E53935] uppercase tracking-[0.2em] mb-1">
                HeRo Integrated Test
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">
                HIT A 결과 보고서
              </h1>
            </div>
            <div className="text-right text-xs text-neutral-400">
              <p>{formattedDate}</p>
              <p className="mt-1 font-mono text-[10px]">ID: {resultId.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* 영웅 유형 카드 */}
        <div className="mb-6">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">
            나의 영웅 유형
          </p>
          <HeroTypeCard
            typeCode={result.typeCode}
            nameKo={result.typeNameKo}
            nickname={result.typeNickname}
            category={result.typeCategory}
            traits={result.typeTraits}
            careers={result.typeCareers}
          />
        </div>

        {heroType?.profile_overview && (
          <div className="bg-neutral-50 p-5 rounded-xl mb-4">
            <p className="text-sm text-neutral-600 leading-relaxed">
              {heroType.profile_overview}
            </p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          Section 2: DISC 행동유형 + 기저요인
          ══════════════════════════════════════════ */}
      <section className="hit-print-section">
        <h2 className="text-lg font-bold mb-4 pt-4 border-t border-neutral-200">
          DISC 행동유형
        </h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-6">
          <DISCChart
            d={result.discDScore}
            i={result.discIScore}
            s={result.discSScore}
            c={result.discCScore}
            primary={result.discPrimary}
          />
        </div>
        {result.baseSummary && (
          <>
            <h3 className="text-base font-bold mb-3">기저요인</h3>
            <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl">
              {result.baseSummary}
            </p>
          </>
        )}
      </section>

      {/* ══════════════════════════════════════════
          Section 3: MBTI 성향 스펙트럼
          ══════════════════════════════════════════ */}
      <section className="hit-print-section">
        <h2 className="text-lg font-bold mb-4 pt-4 border-t border-neutral-200">
          MBTI 성향 스펙트럼
        </h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-6">
          <MBTISpectrum
            eScore={result.mbtiEScore}
            sScore={result.mbtiSScore}
            tScore={result.mbtiTScore}
            jScore={result.mbtiJScore}
          />
        </div>
        <div className="bg-neutral-50 p-5 rounded-xl">
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
            유형: {result.mbtiType}
          </p>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {result.mbtiType?.includes("I")
              ? "에너지를 혼자만의 시간에서 충전하며, 깊이 있는 사고를 선호합니다."
              : "다양한 사람과의 교류에서 에너지를 얻으며, 적극적으로 소통합니다."}{" "}
            {result.mbtiType?.includes("N")
              ? "패턴과 가능성을 먼저 파악하며, 미래 지향적 사고가 특징입니다."
              : "구체적인 사실과 현실적 정보를 중시합니다."}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          Section 4: S-Power 강점 + AI 분석
          ══════════════════════════════════════════ */}
      <section className="hit-print-section">
        <h2 className="text-lg font-bold mb-4 pt-4 border-t border-neutral-200">
          S-Power 강점
        </h2>
        {spData.length > 0 && (
          <div className="border border-neutral-200 rounded-xl p-6 flex justify-center mb-6">
            <RadarChart data={spData} size={260} />
          </div>
        )}
        {narrativeParagraphs.length > 0 && (
          <>
            <h3 className="text-base font-bold mb-3">AI 분석</h3>
            <div className="bg-neutral-50 p-5 rounded-xl space-y-3">
              {narrativeParagraphs.map((p, i) => (
                <p key={i} className="text-sm text-neutral-700 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ══════════════════════════════════════════
          Section 5: 강점 / 주의점
          ══════════════════════════════════════════ */}
      <section className="hit-print-section">
        <h2 className="text-lg font-bold mb-4 pt-4 border-t border-neutral-200">
          강점 및 주의점
        </h2>

        {heroType?.strengths && heroType.strengths.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">
              강점
            </h3>
            <div className="space-y-3">
              {heroType.strengths.map((s, i) => (
                <div key={i} className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-bold text-neutral-800 mb-1">
                    {s.title}
                  </p>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {heroType?.cautions && heroType.cautions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">
              주의점
            </h3>
            <div className="space-y-3">
              {heroType.cautions.map((c, i) => (
                <div key={i} className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm font-bold text-neutral-800 mb-1">
                    {c.title}
                  </p>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {heroType?.fit_direction && (
          <div>
            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
              적합 방향
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed bg-blue-50 p-4 rounded-lg">
              {heroType.fit_direction}
            </p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          Section 6: 통합 보고서 (회원 모듈)
          ══════════════════════════════════════════ */}
      {reportModules && Object.keys(reportModules).length > 0 && (
        <section className="hit-print-section">
          <h2 className="text-lg font-bold mb-4 pt-4 border-t border-neutral-200">
            HIT 통합 보고서
          </h2>

          {/* DISC 해설 */}
          {discMods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                DISC 행동 특성
              </h3>
              {discMods.map(([id, m]) => (
                <div key={id} className="mb-4">
                  <p className="text-sm font-bold text-neutral-700 mb-1">
                    {m.title}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* MBTI 해설 */}
          {mbtiMods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                MBTI 성향 해설
              </h3>
              {mbtiMods.map(([id, m]) => (
                <div key={id} className="mb-3">
                  <p className="text-sm font-bold text-neutral-700 mb-1">
                    {m.title}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 교차 해석 */}
          {crossMods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                교차 해석
              </h3>
              {crossMods.map(([id, m]) => (
                <div key={id} className="mb-3">
                  <p className="text-sm font-bold text-neutral-700 mb-1">
                    {m.title}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* S-Power 주강점 */}
          {spMods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                S-Power 주강점
              </h3>
              {spMods.map(([id, m]) => (
                <div key={id} className="mb-3">
                  <p className="text-sm font-bold text-green-600 mb-1">
                    {m.title}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 성장 영역 */}
          {spGrowth.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                성장 영역
              </h3>
              {spGrowth.map(([id, m]) => (
                <div key={id} className="mb-3">
                  <p className="text-sm font-bold text-amber-600 mb-1">
                    {m.title}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* 소통 스타일 */}
          {commMods.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                소통 스타일
              </h3>
              {commMods.map(([id, m]) => (
                <div key={id} className="mb-3">
                  <p className="text-sm font-bold text-neutral-700 mb-1">
                    {m.title}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed whitespace-pre-line">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 푸터 (인쇄 시 표시) ── */}
      <div className="mt-12 pt-4 border-t border-neutral-200 text-center">
        <p className="text-[10px] text-neutral-300">
          HeRo Integrated Test (HIT) | Ten:One Universe | {formattedDate}
        </p>
      </div>
    </div>
  );
}
