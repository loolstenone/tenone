"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, ArrowLeft, Copy, Check, Sparkles, Users,
  RefreshCw, ChevronLeft, ChevronRight, Lock,
} from "lucide-react";
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

const TOTAL_PAGES = 6;

export default function HitAResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitAResult | null>(null);
  const [heroType, setHeroType] = useState<HeroTypeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/a/result/${resultId}`)
      .then(r => r.json())
      .then(async (data) => {
        if (data.error) { setLoading(false); return; }
        if (data.type_code) {
          try {
            const { createClient } = await import("@/lib/supabase/client");
            const sb = createClient();
            const { data: ht } = await sb.from("hit_hero_types").select("strengths,cautions,fit_direction,profile_overview").eq("type_code", data.type_code).maybeSingle();
            if (ht) setHeroType(ht);
          } catch {}
        }
        setResult({
          id: data.id, sessionId: data.session_id, memberId: data.member_id,
          mbtiType: data.mbti_type,
          mbtiEScore: data.mbti_e_score, mbtiSScore: data.mbti_s_score,
          mbtiTScore: data.mbti_t_score, mbtiJScore: data.mbti_j_score,
          discPrimary: data.disc_primary, discSubtype: data.disc_subtype,
          discDScore: data.disc_d_score, discIScore: data.disc_i_score,
          discSScore: data.disc_s_score, discCScore: data.disc_c_score,
          baseSummary: data.base_summary, baseScores: data.base_scores || {},
          typeCode: data.type_code, typeNameKo: data.type_name_ko,
          typeNickname: data.type_nickname, typeCategory: data.type_category,
          typeTraits: data.type_traits, typeCareers: data.type_careers,
          aiNarrative: data.ai_narrative, sPowerScores: data.s_power_scores,
          createdAt: data.created_at,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  const goNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) {
      setDirection('next');
      setCurrentPage(p => p + 1);
    }
  }, [currentPage]);

  const goPrev = useCallback(() => {
    if (currentPage > 0) {
      setDirection('prev');
      setCurrentPage(p => p - 1);
    }
  }, [currentPage]);

  // 키보드
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const narrativeParagraphs = result.aiNarrative?.split('\n').filter(p => p.trim()) ?? [];

  const pageLabels = ["영웅 유형", "DISC", "MBTI", "S-Power", "강점·주의점", "다음 단계"];

  const renderPage = () => {
    switch (currentPage) {
      // ── Page 1: 영웅 유형 ──
      case 0:
        return (
          <div key="p0">
            <div className="text-center mb-6">
              <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT - A 결과</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">나의 영웅 유형</h1>
            </div>
            <HeroTypeCard
              typeCode={result.typeCode} nameKo={result.typeNameKo}
              nickname={result.typeNickname} category={result.typeCategory}
              traits={result.typeTraits} careers={result.typeCareers}
            />
            {heroType?.profile_overview && (
              <div className="mt-6 bg-neutral-50 p-5 rounded-xl">
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {heroType.profile_overview.split('\n')[0]}
                </p>
              </div>
            )}
          </div>
        );

      // ── Page 2: DISC + 기저요인 ──
      case 1:
        return (
          <div key="p1">
            <h2 className="text-lg font-bold mb-4">DISC 행동유형</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <DISCChart d={result.discDScore} i={result.discIScore} s={result.discSScore} c={result.discCScore} primary={result.discPrimary} />
            </div>
            {result.baseSummary && (
              <>
                <h2 className="text-lg font-bold mb-3">기저요인</h2>
                <p className="text-sm text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-xl">
                  {result.baseSummary}
                </p>
              </>
            )}
          </div>
        );

      // ── Page 3: MBTI ──
      case 2:
        return (
          <div key="p2">
            <h2 className="text-lg font-bold mb-4">MBTI 성향 스펙트럼</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <MBTISpectrum eScore={result.mbtiEScore} sScore={result.mbtiSScore} tScore={result.mbtiTScore} jScore={result.mbtiJScore} />
            </div>
            <div className="bg-neutral-50 p-5 rounded-xl">
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">유형: {result.mbtiType}</p>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {result.mbtiType?.includes('I') ? '에너지를 혼자만의 시간에서 충전하며, 깊이 있는 사고를 선호합니다.' : '다양한 사람과의 교류에서 에너지를 얻으며, 적극적으로 소통합니다.'}
                {' '}
                {result.mbtiType?.includes('N') ? '패턴과 가능성을 먼저 파악하며, 미래 지향적 사고가 특징입니다.' : '구체적인 사실과 현실적 정보를 중시합니다.'}
              </p>
            </div>
          </div>
        );

      // ── Page 4: S-Power + AI ──
      case 3:
        return (
          <div key="p3">
            <h2 className="text-lg font-bold mb-4">S-Power 강점</h2>
            {spData.length > 0 && (
              <div className="border border-neutral-200 rounded-xl p-6 flex justify-center mb-6">
                <RadarChart data={spData} size={260} />
              </div>
            )}
            {narrativeParagraphs.length > 0 && (
              <>
                <h2 className="text-lg font-bold mb-3">AI 분석</h2>
                <div className="bg-neutral-50 p-5 rounded-xl">
                  <p className="text-sm text-neutral-700 leading-relaxed">{narrativeParagraphs[0]}</p>
                  {narrativeParagraphs.length > 1 && (
                    <p className="text-xs text-neutral-400 mt-3 italic">더 자세한 분석은 PDF 보고서에서 확인하세요.</p>
                  )}
                </div>
              </>
            )}
          </div>
        );

      // ── Page 5: 강점/주의점 (블러 — 회원가입 CTA) ──
      case 4:
        return (
          <div key="p4">
            <h2 className="text-lg font-bold mb-4">강점 & 주의 패턴</h2>

            {/* 블러 프리뷰 */}
            <div className="relative">
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-white/60 to-white flex flex-col items-center justify-end pb-8">
                <Lock className="h-5 w-5 text-neutral-400 mb-2" />
                <p className="text-sm font-medium text-neutral-700 mb-1">가입하시면 HIT 통합 보고서를 보실 수 있습니다</p>
                <Link href={`/signup?from=hit&resultId=${resultId}`}
                  className="px-5 py-2.5 bg-[#E53935] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                  회원가입하기
                </Link>
              </div>

              <div className="blur-sm pointer-events-none space-y-4">
                {/* 강점 */}
                <div>
                  <p className="text-xs font-semibold text-green-600 mb-2">핵심 강점 5가지</p>
                  <div className="space-y-3">
                    {(heroType?.strengths || []).slice(0, 5).map((s, i) => (
                      <div key={i} className="border border-neutral-100 rounded-lg p-3">
                        <p className="text-sm font-bold text-neutral-800">{i + 1}. {s.title}</p>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{s.desc}</p>
                      </div>
                    ))}
                    {!heroType?.strengths?.length && (
                      <div className="border border-neutral-100 rounded-lg p-3">
                        <p className="text-sm font-bold text-neutral-800">1. 전략적 의사결정</p>
                        <p className="text-xs text-neutral-500 mt-1">복잡한 상황에서 핵심을 꿰뚫고 최적 경로를 설계합니다.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 주의점 */}
                <div>
                  <p className="text-xs font-semibold text-amber-600 mb-2">주의 패턴 3가지</p>
                  <div className="space-y-3">
                    {(heroType?.cautions || []).slice(0, 3).map((c, i) => (
                      <div key={i} className="border border-neutral-100 rounded-lg p-3">
                        <p className="text-sm font-bold text-neutral-800">{i + 1}. {c.title}</p>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 적합 방향 */}
                {heroType?.fit_direction && (
                  <div>
                    <p className="text-xs font-semibold text-blue-600 mb-2">이 유형에게 어울리는 방향</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">{heroType.fit_direction}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      // ── Page 6: 다음 단계 ──
      case 5:
        return (
          <div key="p5">
            <h2 className="text-lg font-bold mb-6">다음 단계</h2>

            <div className="space-y-4">
              {/* HIT B */}
              <Link href="/hero/hit/b"
                className="block border-2 border-[#E53935] rounded-xl p-5 hover:bg-red-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E53935] text-white rounded-lg flex items-center justify-center font-bold">B</div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">HIT - B 이어서 받기</p>
                    <p className="text-xs text-neutral-500 mt-0.5">적성, 역량, 준비도까지 확인하세요</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#E53935]" />
                </div>
              </Link>

              {/* AI 상담 */}
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#E53935]" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">AI 맞춤 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">DISC×MBTI 교차 해석, 직무 적합도, 성장 로드맵</p>
                  </div>
                  <Link href={`/hero/coaching?type=ai&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">시작 →</Link>
                </div>
              </div>

              {/* 대면 상담 */}
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#E53935]" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전문가 대면 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HeRo 멘토가 커리어를 함께 설계합니다</p>
                  </div>
                  <Link href={`/hero/coaching?type=mentor&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">예약 →</Link>
                </div>
              </div>

              {/* 공유 + 재시도 */}
              <div className="pt-4 space-y-2">
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                  {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 결과 링크 복사</>}
                </button>
                <Link href="/hero/hit/a"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-xs text-neutral-400 hover:text-neutral-600">
                  <RefreshCw className="h-3 w-3" /> 다시 검사하기
                </Link>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-8 min-h-[70vh] flex flex-col">
      {/* ── 페이지 인디케이터 ── */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {pageLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > currentPage ? 'next' : 'prev'); setCurrentPage(i); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentPage ? 'w-6 bg-[#E53935]' : 'w-1.5 bg-neutral-200 hover:bg-neutral-300'
            }`}
            title={label}
          />
        ))}
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="flex-1">
        <div
          key={currentPage}
          className={`animate-fade-in ${direction === 'next' ? 'animate-slide-left' : 'animate-slide-right'}`}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          {renderPage()}
        </div>
      </div>

      {/* ── 네비게이션 ── */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-100">
        <button
          onClick={goPrev}
          disabled={currentPage === 0}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" /> 이전
        </button>

        <span className="text-xs text-neutral-300 font-mono">
          {currentPage + 1} / {TOTAL_PAGES}
        </span>

        <button
          onClick={goNext}
          disabled={currentPage === TOTAL_PAGES - 1}
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          다음 <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
