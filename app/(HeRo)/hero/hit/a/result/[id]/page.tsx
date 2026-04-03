"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Share2, RefreshCw, ArrowRight, Copy, Check } from "lucide-react";
import HeroTypeCard from "@/features/hit/HeroTypeCard";
import MBTISpectrum from "@/features/hit/MBTISpectrum";
import DISCChart from "@/features/hit/DISCChart";
import RadarChart from "@/features/hit/RadarChart";
import type { HitAResult } from "@/types/hit";

export default function HitAResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitAResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/a/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        // snake_case → camelCase mapping
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
          <Link href="/hero/hit/a" className="text-[#E53935] underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const spData = result.sPowerScores ? [
    { label: "전략적 사고", value: result.sPowerScores.strategic },
    { label: "실행 추진력", value: result.sPowerScores.execution },
    { label: "창의성", value: result.sPowerScores.creativity },
    { label: "대인관계", value: result.sPowerScores.interpersonal },
    { label: "분석적 판단", value: result.sPowerScores.analytical },
  ] : [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT - A 결과</p>
        <h1 className="text-2xl md:text-3xl font-extrabold">나의 영웅 유형</h1>
      </div>

      {/* 64유형 카드 */}
      <HeroTypeCard
        typeCode={result.typeCode}
        nameKo={result.typeNameKo}
        nickname={result.typeNickname}
        category={result.typeCategory}
        traits={result.typeTraits}
        careers={result.typeCareers}
      />

      {/* 기저요인 요약 */}
      {result.baseSummary && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">기저요인 요약</h2>
          <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl">
            {result.baseSummary}
          </p>
        </section>
      )}

      {/* DISC */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">DISC 행동유형</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <DISCChart
            d={result.discDScore}
            i={result.discIScore}
            s={result.discSScore}
            c={result.discCScore}
            primary={result.discPrimary}
          />
        </div>
      </section>

      {/* MBTI */}
      <section className="mt-8">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">MBTI 성향 스펙트럼</h2>
        <div className="border border-neutral-200 rounded-xl p-6">
          <MBTISpectrum
            eScore={result.mbtiEScore}
            sScore={result.mbtiSScore}
            tScore={result.mbtiTScore}
            jScore={result.mbtiJScore}
          />
        </div>
      </section>

      {/* S-Power */}
      {spData.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">S-Power 강점</h2>
          <div className="border border-neutral-200 rounded-xl p-6 flex justify-center">
            <RadarChart data={spData} size={280} />
          </div>
        </section>
      )}

      {/* AI Narrative */}
      {result.aiNarrative && (
        <section className="mt-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">AI 분석</h2>
          <div className="bg-neutral-50 p-6 rounded-xl">
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{result.aiNarrative}</p>
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
        <Link
          href="/hero/hit"
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#E53935] text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
        >
          HIT - B 이어서 받기 <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/hero/hit/a"
          className="flex items-center justify-center gap-2 w-full py-3 text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> 다시 검사하기
        </Link>
      </section>
    </div>
  );
}
