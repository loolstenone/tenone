"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Sparkles, Users,
  RefreshCw, ChevronLeft, ChevronRight, Lock,
} from "lucide-react";
import HeroTypeCard from "@/features/hit/HeroTypeCard";
import MBTISpectrum from "@/features/hit/MBTISpectrum";
import DISCChart from "@/features/hit/DISCChart";
import RadarChart from "@/features/hit/RadarChart";
import HeroChatPanel from "@/features/hit/HeroChatPanel";
import HitPdfButton from "@/features/hit/HitPdfButton";
import HitShareButtons from "@/features/hit/HitShareButtons";
import { HitADeepCTA } from "@/features/hit/HitADeepCTA";
import { getHeroGreeting } from "@/lib/hit/hero-agent-system";
import { useAuth } from "@/lib/auth-context";
import type { HitAResult } from "@/types/hit";

// 마크다운 → 순수 텍스트
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
  const { isAuthenticated } = useAuth();
  const [result, setResult] = useState<HitAResult | null>(null);
  const [heroType, setHeroType] = useState<HeroTypeData | null>(null);
  const [reportModules, setReportModules] = useState<Record<string, { title: string; content: string }> | null>(null);
  const [hasDeep, setHasDeep] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
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
        if (data.report_modules) setReportModules(data.report_modules);
        if (data.ch_deep_scores || data.ap_deep_scores) setHasDeep(true);

        // 무료 회원 AI 채팅 남은 횟수 조회
        if (data.member_id) {
          fetch('/api/hit/membership')
            .then(r => r.json())
            .then(mData => {
              if (mData.data?.tier && mData.data.tier !== 'premium' && mData.data.tier !== 'professional') {
                // 현재 사용 횟수 조회
                fetch(`/api/hit/chat/usage?memberId=${data.member_id}`)
                  .then(r => r.json())
                  .then(uData => {
                    if (uData.data !== undefined) {
                      setChatRemaining(Math.max(0, 3 - uData.data));
                    }
                  })
                  .catch(() => setChatRemaining(3));
              }
              // premium/professional은 undefined = 무제한
            })
            .catch(() => {});
        }

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
    { label: "조직 화합", value: result.sPowerScores.harmony ?? 0 },
    { label: "돌파 의지", value: result.sPowerScores.breakthrough ?? 0 },
    { label: "원칙 수호", value: result.sPowerScores.guard ?? 0 },
  ].filter(d => d.value > 0) : [];

  const narrativeParagraphs = result.aiNarrative?.split('\n').filter(p => p.trim()) ?? [];

  const pageLabels = ["영웅 유형", "DISC", "MBTI", "S-Power", "강점·주의점", "다음 단계"];

  const renderPage = () => {
    switch (currentPage) {
      // ── Page 1: 영웅 유형 ──
      case 0:
        return (
          <div key="p0">
            <div className="text-center mb-6">
              <Image src="/hero-logo.png" alt="HeRo" width={48} height={48} className="h-12 w-12 mx-auto mb-3" />
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
                  {cleanMarkdown(heroType.profile_overview.split('\n')[0])}
                </p>
              </div>
            )}
            {/* Share buttons */}
            <div className="mt-6 flex flex-col items-center gap-1.5">
              <p className="text-xs text-neutral-400">결과 공유하기</p>
              <HitShareButtons
                typeCode={result.typeCode}
                typeNameKo={result.typeNameKo}
                typeNickname={result.typeNickname}
                resultId={resultId}
                variant="compact"
              />
            </div>
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
                <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Image src="/hero-logo-wide.png" alt="" width={28} height={14} className="h-4 w-auto" />
                  HeRo의 분석
                </h2>
                <div className="bg-neutral-50 p-5 rounded-xl">
                  <p className="text-sm text-neutral-700 leading-relaxed">{cleanMarkdown(narrativeParagraphs[0])}</p>
                  {narrativeParagraphs.length > 1 && (
                    <p className="text-xs text-neutral-400 mt-3 italic">DISC·MBTI 교차 해석과 상세 분석은 다음 페이지에서 확인하세요.</p>
                  )}
                </div>
              </>
            )}
          </div>
        );

      // ── Page 5: 통합 보고서 (회원) or 안내 (비회원) ──
      case 4:
        // 회원 + 모듈 콘텐츠가 있으면 실제 보고서 렌더링
        if (isAuthenticated && reportModules && Object.keys(reportModules).length > 0) {
          // 카테고리별 그룹핑
          const discMods = Object.entries(reportModules).filter(([k]) => k.startsWith('DISC-'));
          const mbtiMods = Object.entries(reportModules).filter(([k]) => k.startsWith('MBTI-'));
          const crossMods = Object.entries(reportModules).filter(([k]) => k.startsWith('CROSS-'));
          const spMods = Object.entries(reportModules).filter(([k]) => k.startsWith('SP-') && !k.includes('GROWTH'));
          const spGrowth = Object.entries(reportModules).filter(([k]) => k.includes('GROWTH'));
          const commMods = Object.entries(reportModules).filter(([k]) => k.startsWith('COMM-'));

          return (
            <div key="p4">
              <h2 className="text-lg font-bold mb-6">HIT 통합 보고서</h2>

              {/* 모듈 영역 */}
              <div className="space-y-6">
                {/* DISC 해설 */}
                {discMods.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">DISC 행동 특성</h3>
                    {discMods.map(([id, m]) => (
                      <div key={id} className="mb-4">
                        <p className="text-sm font-bold text-neutral-700 mb-1">{m.title}</p>
                        <p className="text-xs text-neutral-500 leading-relaxed">{cleanMarkdown(m.content)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* MBTI 해설 */}
                {mbtiMods.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">MBTI 성향 해설</h3>
                    {mbtiMods.map(([id, m]) => (
                      <div key={id} className="mb-3">
                        <p className="text-sm font-bold text-neutral-700 mb-1">{m.title}</p>
                        <p className="text-xs text-neutral-500 leading-relaxed">{cleanMarkdown(m.content)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 교차 해석 */}
                {crossMods.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">교차 해석</h3>
                    {crossMods.map(([id, m]) => (
                      <div key={id} className="mb-3">
                        <p className="text-sm font-bold text-neutral-700 mb-1">{m.title}</p>
                        <p className="text-xs text-neutral-500 leading-relaxed">{cleanMarkdown(m.content)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* S-Power 강점 */}
                {spMods.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">S-Power 주강점</h3>
                    {spMods.map(([id, m]) => (
                      <div key={id} className="mb-3">
                        <p className="text-sm font-bold text-green-600 mb-1">{m.title}</p>
                        <p className="text-xs text-neutral-500 leading-relaxed">{cleanMarkdown(m.content)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 성장 영역 */}
                {spGrowth.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">성장 영역</h3>
                    {spGrowth.map(([id, m]) => (
                      <div key={id} className="mb-3">
                        <p className="text-sm font-bold text-amber-600 mb-1">{m.title}</p>
                        <p className="text-xs text-neutral-500 leading-relaxed">{cleanMarkdown(m.content)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 소통 스타일 */}
                {commMods.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">소통 스타일</h3>
                    {commMods.map(([id, m]) => (
                      <div key={id} className="mb-3">
                        <p className="text-sm font-bold text-neutral-700 mb-1">{m.title}</p>
                        <p className="text-xs text-neutral-500 leading-relaxed whitespace-pre-line">{cleanMarkdown(m.content)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 푸터 */}
              <div className="mt-8 pt-4 border-t border-neutral-100 text-center">
                <HitPdfButton resultId={resultId} typeCode={result.typeCode} />
              </div>
            </div>
          );
        }

        // 비회원: 미리보기 + 잠금
        return (
          <div key="p4">
            <h2 className="text-lg font-bold mb-1">HIT 통합 보고서</h2>
            <p className="text-xs text-neutral-400 mb-6">보고서 일부를 먼저 보여드립니다</p>

            {/* 첫 강점 공개 */}
            {heroType?.strengths?.[0] && (
              <div className="mb-4 p-4 bg-neutral-50 border-l-2 border-neutral-800 rounded-r-lg">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">핵심 강점 #1</p>
                <p className="text-sm font-semibold text-neutral-800 mb-1.5">{heroType.strengths[0].title}</p>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {cleanMarkdown(heroType.strengths[0].desc || "").slice(0, 90)}…
                </p>
              </div>
            )}

            {/* 나머지 항목 — 흐림 처리 */}
            <div className="relative mb-6">
              <div className="space-y-1.5 blur-[3px] pointer-events-none select-none opacity-70">
                {(heroType?.strengths || []).slice(1, 3).map((s, i) => (
                  <div key={i} className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-[11px] text-neutral-400 mb-0.5">핵심 강점 #{i + 2}</p>
                    <p className="text-sm font-semibold text-neutral-700">{s.title}</p>
                  </div>
                ))}
                {(heroType?.cautions || []).slice(0, 2).map((c, i) => (
                  <div key={`c${i}`} className="p-3 bg-neutral-50 rounded-lg">
                    <p className="text-[11px] text-neutral-400 mb-0.5">주의점 #{i + 1}</p>
                    <p className="text-sm font-semibold text-neutral-700">{c.title}</p>
                  </div>
                ))}
                <div className="p-3 bg-neutral-50 rounded-lg">
                  <p className="text-[11px] text-neutral-400 mb-0.5">소통 · 적합 방향</p>
                  <p className="text-sm font-semibold text-neutral-700">업무에서 나타나는 스타일과 잘 맞는 역할</p>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white pointer-events-none" />
            </div>

            {/* 가입 CTA */}
            <div className="border border-neutral-200 rounded-xl p-6 text-center bg-white">
              <Lock className="h-5 w-5 text-neutral-400 mx-auto mb-3" />
              <p className="text-[15px] font-bold text-neutral-900 mb-2">
                전체 보고서는 회원에게 공개됩니다
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed mb-5">
                DISC 행동 해설 · MBTI 스펙트럼 · 교차 분석<br />
                S-Power 주강점 · 성장 영역 · 소통 스타일
              </p>
              <Link href={`/signup?from=hit&resultId=${resultId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
                무료 회원가입 <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-neutral-400 mt-3">
                지금 본 검사 결과가 자동으로 연결됩니다
              </p>
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
                  <Sparkles className="h-5 w-5 text-neutral-400" />
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
                  <Users className="h-5 w-5 text-neutral-400" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전문가 대면 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HeRo 멘토가 커리어를 함께 설계합니다</p>
                  </div>
                  <Link href={`/hero/coaching?type=mentor&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">예약 →</Link>
                </div>
              </div>

              {/* 전체 보고서 */}
              {result.memberId && (
                <div className="border border-neutral-200 rounded-xl p-5 text-center">
                  <p className="text-xs text-neutral-500 mb-3">전체 분석 결과를 보고서로 저장하세요</p>
                  <HitPdfButton resultId={resultId} typeCode={result.typeCode} />
                </div>
              )}

              {/* 공유 + 재시도 */}
              <div className="pt-4 space-y-2">
                <HitShareButtons
                  typeCode={result.typeCode}
                  typeNameKo={result.typeNameKo}
                  typeNickname={result.typeNickname}
                  resultId={resultId}
                  variant="full"
                />
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
    <div className="mx-auto max-w-3xl px-6 py-10 min-h-[70vh] flex flex-col">
      {/* ── 섹션 탭 ── */}
      <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto">
        {pageLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > currentPage ? 'next' : 'prev'); setCurrentPage(i); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
              i === currentPage
                ? 'bg-[#E53935] text-white'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
            title={label}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 콘텐츠 ── */}
      <div
        key={currentPage}
        style={{ animation: 'fadeIn 0.3s ease-out' }}
      >
        {renderPage()}
      </div>

      {/* ── 네비게이션 ── */}
      <div className="flex items-center justify-between mt-10 pt-4 border-t border-neutral-100">
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

      {/* 비회원 — 가입 CTA · 회원 — 심화 검사 CTA */}
      {isAuthenticated ? (
        <HitADeepCTA resultId={resultId} hasDeep={hasDeep} />
      ) : (
        <section className="mt-16 mb-10">
          <div className="rounded-2xl border border-[#E53935]/30 bg-[#E53935]/5 p-8 text-center">
            <div className="mx-auto mb-4 w-11 h-11 rounded-full bg-[#E53935]/10 flex items-center justify-center">
              <Lock size={18} className="text-[#E53935]" />
            </div>
            <p className="text-sm text-neutral-500 mb-1">지금 보신 요약 너머에</p>
            <p className="text-xl font-bold text-neutral-900 mb-2">
              전체 통합 보고서가 준비되어 있습니다
            </p>
            <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
              DISC 행동 해설 · MBTI 스펙트럼 · 교차 분석<br />
              S-Power 주강점 · 성장 영역 · 소통 스타일까지
            </p>
            <Link
              href={`/signup?from=hit&resultId=${resultId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E53935] text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              무료 회원가입하고 전체 보기 <ArrowRight size={16} />
            </Link>
            <p className="text-[11px] text-neutral-400 mt-3">
              지금 본 검사 결과가 자동으로 연결됩니다
            </p>
          </div>
        </section>
      )}

      {/* CSS Animation */}
      {/* 히어로 AI 채팅 */}
      {result && (
        <HeroChatPanel
          resultId={resultId}
          mode="A_ONLY"
          greeting={getHeroGreeting('A_ONLY', {
            typeCode: result.typeCode,
            typeNameKo: result.typeNameKo,
          })}
          quickQuestions={['DISC 결과 궁금해요', '직장에서 어떻게 나타나나요?', '잘 맞는 유형은?', '성장 방법']}
          memberId={result.memberId}
          chatRemaining={chatRemaining}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
