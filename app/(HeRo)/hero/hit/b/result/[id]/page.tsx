"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Copy, Check, Sparkles, Users,
  RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import PersonalityRadar from "@/features/hit/PersonalityRadar";
import RIASECChart from "@/features/hit/RIASECChart";
import CompetencyChart from "@/features/hit/CompetencyChart";
import ReadinessGauge from "@/features/hit/ReadinessGauge";
import HeroChatPanel from "@/features/hit/HeroChatPanel";
import { getHeroGreeting } from "@/lib/hit/hero-agent-system";
import type { HitBResult } from "@/types/hit";

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

const TRACK_NAMES: Record<string, string> = {
  marketing_strategy: '마케팅전략', branding: '브랜딩',
  advertising: '광고기획', content: '콘텐츠', data_performance: '데이터/퍼포먼스',
};

const STAGE_INFO: Record<string, { label: string; color: string }> = {
  ready: { label: '실전 준비 완료', color: 'text-green-600 bg-green-50' },
  developing: { label: '역량 개발 중', color: 'text-yellow-600 bg-yellow-50' },
  exploring: { label: '탐색 단계', color: 'text-orange-600 bg-orange-50' },
  discovering: { label: '발견 단계', color: 'text-red-600 bg-red-50' },
};

const TOTAL_PAGES = 6;

export default function HitBResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitBResult | null>(null);
  const [reportModules, setReportModules] = useState<Record<string, { title: string; content: string }>>({});
  const [personalityLabels, setPersonalityLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/b/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        setResult({
          id: data.id, sessionId: data.session_id, memberId: data.member_id,
          hitAResultId: data.hit_a_result_id,
          personalityScores: data.personality_scores || {},
          darkTriadFlags: data.dark_triad_flags || {},
          riasecR: data.riasec_r, riasecI: data.riasec_i, riasecA: data.riasec_a,
          riasecS: data.riasec_s, riasecE: data.riasec_e, riasecC: data.riasec_c,
          hollandCode: data.holland_code,
          competencyCommon: data.competency_common || {},
          competencyTrack: data.competency_track,
          competencyTrackScores: data.competency_track_scores || {},
          readinessSelf: data.readiness_self, readinessPortfolio: data.readiness_portfolio,
          readinessInterview: data.readiness_interview, readinessNetwork: data.readiness_network,
          readinessTotal: data.readiness_total, readinessGrade: data.readiness_grade,
          readinessGaps: data.readiness_gaps || [],
          aiReport: data.ai_report, journeyStage: data.journey_stage,
          createdAt: data.created_at,
        });
        if (data.report_modules) setReportModules(data.report_modules);
        if (data.personality_labels) setPersonalityLabels(data.personality_labels);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  const goNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) { setDirection('next'); setCurrentPage(p => p + 1); }
  }, [currentPage]);
  const goPrev = useCallback(() => {
    if (currentPage > 0) { setDirection('prev'); setCurrentPage(p => p - 1); }
  }, [currentPage]);

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
          <Link href="/hero/hit/b" className="text-[#E53935] underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const stageInfo = STAGE_INFO[result.journeyStage] || STAGE_INFO.discovering;
  const trackName = TRACK_NAMES[result.competencyTrack] || result.competencyTrack;
  const pageLabels = ["여정 단계", "성격 특성", "RIASEC", "역량", "준비도", "다음 단계"];

  // 모듈 카테고리별 필터
  const personalityMods = Object.entries(reportModules).filter(([k]) => /^(EMOTIONAL|ETHICS|GROWTH|INTEGRITY|RELATION)/.test(k));
  const riasecMods = Object.entries(reportModules).filter(([k]) => k.startsWith('RIASEC-'));
  const compMods = Object.entries(reportModules).filter(([k]) => k.startsWith('COMP-'));
  const readyMods = Object.entries(reportModules).filter(([k]) => k.startsWith('READY-'));

  const renderPage = () => {
    switch (currentPage) {
      // ── Page 1: 여정 단계 + 요약 ──
      case 0:
        return (
          <div key="p0">
            <div className="text-center mb-6">
              <Image src="/hero-logo.png" alt="HeRo" width={48} height={48} className="h-12 w-12 mx-auto mb-3" />
              <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT - B 결과</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">종합 커리어 진단</h1>
            </div>
            <div className="flex justify-center mb-6">
              <span className={`px-5 py-2.5 rounded-full text-sm font-bold ${stageInfo.color}`}>
                {stageInfo.label}
              </span>
            </div>
            <div className="bg-neutral-50 p-5 rounded-xl space-y-2">
              <p className="text-sm text-neutral-600">
                <span className="font-bold">Holland 코드:</span> {result.hollandCode}
              </p>
              <p className="text-sm text-neutral-600">
                <span className="font-bold">전문 트랙:</span> {trackName}
              </p>
              <p className="text-sm text-neutral-600">
                <span className="font-bold">준비도:</span> {result.readinessGrade}등급 ({result.readinessTotal}%)
              </p>
            </div>
          </div>
        );

      // ── Page 2: 성격 특성 ──
      case 1:
        return (
          <div key="p1">
            <h2 className="text-lg font-bold mb-4">성격 특성</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <PersonalityRadar scores={result.personalityScores} labels={personalityLabels} />
            </div>
            {personalityMods.length > 0 && (
              <div className="space-y-5">
                {personalityMods.map(([id, m]) => (
                  <div key={id} className="border-l-2 border-neutral-300 pl-4">
                    <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                    <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ── Page 3: RIASEC ──
      case 2:
        return (
          <div key="p2">
            <h2 className="text-lg font-bold mb-4">직업 흥미 (RIASEC)</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <RIASECChart
                r={result.riasecR} i={result.riasecI} a={result.riasecA}
                s={result.riasecS} e={result.riasecE} c={result.riasecC}
                hollandCode={result.hollandCode}
              />
            </div>
            {riasecMods.length > 0 && riasecMods.map(([id, m]) => (
              <div key={id} className="border-l-2 border-purple-400 pl-4 mb-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
          </div>
        );

      // ── Page 4: 역량 ──
      case 3:
        return (
          <div key="p3">
            <h2 className="text-lg font-bold mb-4">역량 진단</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <CompetencyChart
                common={result.competencyCommon}
                trackScores={result.competencyTrackScores}
                trackName={trackName}
              />
            </div>
            {compMods.length > 0 && (
              <div className="space-y-5">
                {compMods.map(([id, m]) => {
                  const isA = id.endsWith('-A');
                  const isD = id.endsWith('-D');
                  const borderColor = isA ? 'border-green-400' : isD ? 'border-red-300' : 'border-neutral-300';
                  return (
                    <div key={id} className={`border-l-2 ${borderColor} pl-4`}>
                      <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                      <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      // ── Page 5: 준비도 ──
      case 4:
        return (
          <div key="p4">
            <h2 className="text-lg font-bold mb-4">커리어 준비도</h2>
            <div className="border border-neutral-200 rounded-xl p-6">
              <ReadinessGauge
                self={result.readinessSelf} portfolio={result.readinessPortfolio}
                interview={result.readinessInterview} network={result.readinessNetwork}
                total={result.readinessTotal} grade={result.readinessGrade}
                gaps={result.readinessGaps}
              />
            </div>
            {readyMods.length > 0 && readyMods.map(([id, m]) => (
              <div key={id} className="mt-6 border-l-2 border-blue-400 pl-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
            {result.aiReport && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Image src="/hero-logo-wide.png" alt="" width={24} height={12} className="h-3.5 w-auto opacity-50" />
                  HeRo의 종합 분석
                </h3>
                <div className="bg-neutral-50 p-5 rounded-xl">
                  <p className="text-sm text-neutral-700 leading-[1.8] whitespace-pre-line">
                    {cleanMarkdown(result.aiReport)}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      // ── Page 6: 다음 단계 ──
      case 5:
        return (
          <div key="p5">
            <h2 className="text-lg font-bold mb-6">다음 단계</h2>
            <div className="space-y-4">
              {result.hitAResultId && (
                <Link href={`/hero/hit/profile/${result.id}`}
                  className="block border-2 border-[#E53935] rounded-xl p-5 hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E53935] text-white rounded-lg flex items-center justify-center font-bold text-sm">A+B</div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800">통합 프로필 보기</p>
                      <p className="text-xs text-neutral-500 mt-0.5">HIT A + B 결과를 한눈에</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#E53935]" />
                  </div>
                </Link>
              )}
              {/* 풀 보고서 */}
              <Link href={`/hero/hit/b/report/${resultId}`}
                className="block border border-neutral-200 rounded-xl p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">PDF</div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전체 보고서 보기</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HIT B 상세 분석 + 인쇄/PDF 저장</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#E53935]" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">AI 맞춤 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">A×B 교차 분석, 직무 적합도, 성장 로드맵</p>
                  </div>
                  <Link href={`/hero/coaching?type=ai&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">시작 →</Link>
                </div>
              </div>
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
              <div className="pt-4 space-y-2">
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                  {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 결과 링크 복사</>}
                </button>
                <Link href="/hero/hit/b"
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
      {/* 페이지 인디케이터 */}
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

      {/* 콘텐츠 */}
      <div className="flex-1">
        <div key={currentPage} style={{ animation: 'fadeIn 0.3s ease-out' }}>
          {renderPage()}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-100">
        <button onClick={goPrev} disabled={currentPage === 0}
          className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" /> 이전
        </button>
        <span className="text-xs text-neutral-300 font-mono">{currentPage + 1} / {TOTAL_PAGES}</span>
        <button onClick={goNext} disabled={currentPage === TOTAL_PAGES - 1}
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          다음 <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* 히어로 AI 채팅 */}
      {result && (
        <HeroChatPanel
          resultId={resultId}
          mode={result.hitAResultId ? 'AB_FULL' : 'B_ONLY'}
          greeting={getHeroGreeting(
            result.hitAResultId ? 'AB_FULL' : 'B_ONLY',
            { hollandCode: result.hollandCode, topCompetency: TRACK_NAMES[result.competencyTrack] }
          )}
          quickQuestions={result.hitAResultId
            ? ['직무 적합도 분석', '성격과 역량 연결', '3개월 성장 플랜', '면접 강점 어필']
            : ['적성에 맞는 직무는?', '역량 올리려면?', '취업 준비 어디서부터?', '면접 준비']
          }
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
