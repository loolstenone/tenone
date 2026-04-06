"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Copy, Check, Sparkles, Users,
  RefreshCw, ChevronLeft, ChevronRight,
  Sun, Compass, Award, Heart, AlertTriangle,
} from "lucide-react";

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

interface HitEResult {
  id: string;
  sessionId: string;
  memberId: string | null;
  hitAResultId: string | null;
  lifeSatisfaction: number;
  remainingPassion: number;
  directionType: string;
  directionScores: Record<string, number>;
  legacySkillScore: number;
  legacyAreas: string[];
  socialNeedScore: number;
  secondActReadiness: number;
  aiReport: string;
  journeyStage: string;
  createdAt: string;
}

const DIRECTION_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  social_contribution: { label: '사회 공헌형', desc: '경험으로 사회에 기여하기', color: 'text-green-600 bg-green-50' },
  entrepreneurship: { label: '창업/사업형', desc: '새로운 사업에 도전하기', color: 'text-blue-600 bg-blue-50' },
  education: { label: '교육/멘토링형', desc: '지식과 경험을 전수하기', color: 'text-purple-600 bg-purple-50' },
  leisure: { label: '여가/취미형', desc: '자유롭게 삶을 즐기기', color: 'text-orange-600 bg-orange-50' },
};

const JOURNEY_LABELS: Record<string, { label: string; color: string }> = {
  ready_to_launch: { label: '2막 시작 준비 완료', color: 'text-green-600 bg-green-50' },
  almost_ready: { label: '거의 준비됨', color: 'text-blue-600 bg-blue-50' },
  direction_found: { label: '방향 탐색 완료', color: 'text-purple-600 bg-purple-50' },
  exploring: { label: '탐색 중', color: 'text-yellow-600 bg-yellow-50' },
  needs_reflection: { label: '성찰 필요', color: 'text-orange-600 bg-orange-50' },
  early_awareness: { label: '초기 인식', color: 'text-neutral-600 bg-neutral-100' },
};

const TOTAL_PAGES = 5;

export default function HitEResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitEResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/e/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        setResult({
          id: data.id,
          sessionId: data.session_id,
          memberId: data.member_id,
          hitAResultId: data.hit_a_result_id,
          lifeSatisfaction: data.life_satisfaction ?? 0,
          remainingPassion: data.remaining_passion ?? 0,
          directionType: data.direction_type ?? 'social_contribution',
          directionScores: data.direction_scores ?? {},
          legacySkillScore: data.legacy_skill_score ?? 0,
          legacyAreas: data.legacy_areas ?? [],
          socialNeedScore: data.social_need_score ?? 0,
          secondActReadiness: data.second_act_readiness ?? 0,
          aiReport: data.ai_report ?? '',
          journeyStage: data.journey_stage ?? 'exploring',
          createdAt: data.created_at,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  const goNext = useCallback(() => {
    if (currentPage < TOTAL_PAGES - 1) setCurrentPage(p => p + 1);
  }, [currentPage]);
  const goPrev = useCallback(() => {
    if (currentPage > 0) setCurrentPage(p => p - 1);
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
        <div className="h-10 w-10 border-2 border-neutral-200 border-t-amber-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p>
          <Link href="/hero/hit/e" className="text-amber-700 underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const dirInfo = DIRECTION_LABELS[result.directionType] || DIRECTION_LABELS.social_contribution;
  const journeyInfo = JOURNEY_LABELS[result.journeyStage] || JOURNEY_LABELS.exploring;
  const pageLabels = ["종합 요약", "삶의 만족도 & 열정", "방향 탐색", "레거시 스킬 & 준비도", "다음 단계"];

  // Simple bar renderer
  const ScoreBar = ({ label, value, color = 'bg-amber-700', max = 100 }: { label: string; value: number; color?: string; max?: number }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-400 font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.min(value, max)}%` }} />
      </div>
    </div>
  );

  // Life Satisfaction Gauge (SVG)
  const SatisfactionGauge = ({ value, label }: { value: number; label: string }) => {
    const rotation = (value / 100) * 180 - 90;
    return (
      <div className="text-center">
        <svg viewBox="0 0 200 120" className="w-full max-w-[180px] mx-auto">
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e5e5" strokeWidth="12" strokeLinecap="round" />
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#b45309" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 251.2} 251.2`} />
          <line x1="100" y1="100" x2="100" y2="30"
            stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"
            transform={`rotate(${rotation} 100 100)`} />
          <circle cx="100" cy="100" r="4" fill="#1a1a1a" />
          <text x="100" y="95" textAnchor="middle" className="text-2xl font-extrabold fill-neutral-900">{value}%</text>
        </svg>
        <p className="text-xs text-neutral-400 mt-1">{label}</p>
      </div>
    );
  };

  // Direction Radar (SVG)
  const DirectionRadar = () => {
    const directions = [
      { label: '사회공헌', key: 'social_contribution' },
      { label: '창업/사업', key: 'entrepreneurship' },
      { label: '교육/멘토링', key: 'education' },
      { label: '여가/취미', key: 'leisure' },
    ];
    const cx = 120, cy = 120, maxR = 90;
    const n = directions.length;
    const angleStep = (2 * Math.PI) / n;

    const pointsValue = directions.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = ((result.directionScores[d.key] || 0) / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={directions.map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              const r = scale * maxR;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none" stroke="#e5e5e5" strokeWidth="0.5"
          />
        ))}
        {directions.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return (
            <line key={i} x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)}
              stroke="#e5e5e5" strokeWidth="0.5"
            />
          );
        })}
        <polygon points={pointsValue} fill="rgba(180,83,9,0.15)" stroke="#b45309" strokeWidth="2" />
        {directions.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = ((result.directionScores[d.key] || 0) / 100) * maxR;
          return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="3" fill="#b45309" />;
        })}
        {directions.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const lr = maxR + 20;
          const x = cx + lr * Math.cos(angle);
          const y = cy + lr * Math.sin(angle);
          return (
            <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              className="text-[10px] fill-neutral-500">
              {d.label}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      // ── Page 1: 종합 요약 ──
      case 0:
        return (
          <div key="p0">
            <div className="text-center mb-6">
              <Image src="/hero-logo.png" alt="HeRo" width={48} height={48} className="h-12 w-12 mx-auto mb-3" />
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">HIT - E 결과</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">인생 2막 분석</h1>
            </div>
            <div className="flex justify-center mb-6">
              <span className={`px-5 py-2.5 rounded-full text-sm font-bold ${journeyInfo.color}`}>
                {journeyInfo.label}
              </span>
            </div>
            <div className="bg-neutral-50 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <Sun className="h-4 w-4 text-amber-700" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">삶의 만족도:</span> {result.lifeSatisfaction}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="h-4 w-4 text-amber-700" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">남은 열정:</span> {result.remainingPassion}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Compass className="h-4 w-4 text-amber-700" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">방향 유형:</span> {dirInfo.label}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Award className="h-4 w-4 text-amber-700" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">레거시 스킬:</span> {result.legacySkillScore}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-amber-700" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">2막 준비도:</span> {result.secondActReadiness}%
                </p>
              </div>
            </div>
          </div>
        );

      // ── Page 2: 삶의 만족도 & 열정 ──
      case 1:
        return (
          <div key="p1">
            <h2 className="text-lg font-bold mb-4">삶의 만족도 & 열정</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <SatisfactionGauge value={result.lifeSatisfaction} label="삶의 만족도" />
                <SatisfactionGauge value={result.remainingPassion} label="남은 열정" />
              </div>
            </div>
            <div className="space-y-1">
              <ScoreBar label="삶의 만족도" value={result.lifeSatisfaction} />
              <ScoreBar label="남은 열정" value={result.remainingPassion} />
            </div>
            <div className="mt-6 bg-amber-50 p-4 rounded-xl">
              <p className="text-sm text-amber-800">
                {result.lifeSatisfaction >= 70 && result.remainingPassion >= 70
                  ? '높은 삶의 만족도와 열정을 가지고 계십니다. 인생 2막에 대한 에너지가 충분합니다.'
                  : result.lifeSatisfaction >= 50
                  ? '삶에 대한 기본적인 만족이 있으며, 새로운 도전에 대한 준비가 가능합니다.'
                  : '현재 삶에서 변화가 필요한 시점입니다. 새로운 방향 설정이 중요합니다.'}
              </p>
            </div>
          </div>
        );

      // ── Page 3: 방향 탐색 ──
      case 2:
        return (
          <div key="p2">
            <h2 className="text-lg font-bold mb-4">방향 탐색</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <div className="flex justify-center mb-4">
                <span className={`px-4 py-2 rounded-full text-xs font-bold ${dirInfo.color}`}>
                  {dirInfo.label}
                </span>
              </div>
              <p className="text-xs text-neutral-500 text-center mb-4">{dirInfo.desc}</p>
              <DirectionRadar />
            </div>
            <div className="space-y-1">
              <ScoreBar label="사회 공헌" value={result.directionScores.social_contribution || 0} color="bg-green-500" />
              <ScoreBar label="창업/사업" value={result.directionScores.entrepreneurship || 0} color="bg-blue-500" />
              <ScoreBar label="교육/멘토링" value={result.directionScores.education || 0} color="bg-purple-500" />
              <ScoreBar label="여가/취미" value={result.directionScores.leisure || 0} color="bg-orange-500" />
            </div>
          </div>
        );

      // ── Page 4: 레거시 스킬 & 준비도 ──
      case 3:
        return (
          <div key="p3">
            <h2 className="text-lg font-bold mb-4">레거시 스킬 & 준비도</h2>

            {/* Legacy Skill */}
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <div className="text-center mb-4">
                <p className="text-3xl font-extrabold text-amber-700">{result.legacySkillScore}%</p>
                <p className="text-xs text-neutral-400 mt-1">레거시 스킬 종합</p>
              </div>
              {result.legacyAreas.length > 0 && (
                <div className="space-y-2 mt-4">
                  {result.legacyAreas.map((area, i) => (
                    <div key={i} className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg">
                      <Award className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                      <span className="text-xs text-amber-800">{area}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Social & Readiness */}
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-bold text-neutral-700 mb-4">사회적 연결 & 2막 준비도</h3>
              <ScoreBar label="사회적 필요" value={result.socialNeedScore} />
              <ScoreBar label="2막 준비도" value={result.secondActReadiness} />
            </div>

            {/* AI Report */}
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

      // ── Page 5: 다음 단계 ──
      case 4:
        return (
          <div key="p4">
            <h2 className="text-lg font-bold mb-6">다음 단계</h2>
            <div className="space-y-4">
              {result.hitAResultId && (
                <Link href={`/hero/hit/profile/${result.id}`}
                  className="block border-2 border-amber-700 rounded-xl p-5 hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-700 text-white rounded-lg flex items-center justify-center font-bold text-sm">A+E</div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800">통합 프로필 보기</p>
                      <p className="text-xs text-neutral-500 mt-0.5">HIT A + E 결과를 한눈에</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-700" />
                  </div>
                </Link>
              )}
              {/* 풀 보고서 */}
              <Link href={`/hero/hit/e/report/${resultId}`}
                className="block border border-neutral-200 rounded-xl p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">PDF</div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전체 보고서 보기</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HIT E 상세 분석 + 인쇄/PDF 저장</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-amber-700" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">AI 인생 2막 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">방향 설정, 레거시 활용, 액션 플랜 수립</p>
                  </div>
                  <Link href={`/hero/coaching?type=ai&resultId=${resultId}`} className="text-xs text-amber-700 font-medium">시작 →</Link>
                </div>
              </div>
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-amber-700" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전문가 대면 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HeRo 멘토가 인생 2막을 함께 설계합니다</p>
                  </div>
                  <Link href={`/hero/coaching?type=mentor&resultId=${resultId}`} className="text-xs text-amber-700 font-medium">예약 →</Link>
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                  {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 결과 링크 복사</>}
                </button>
                <Link href="/hero/hit/e"
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
            onClick={() => setCurrentPage(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentPage ? 'w-6 bg-amber-700' : 'w-1.5 bg-neutral-200 hover:bg-neutral-300'
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
