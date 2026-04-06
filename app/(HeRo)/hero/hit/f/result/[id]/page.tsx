"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Copy, Check, Sparkles, Users,
  RefreshCw, ChevronLeft, ChevronRight,
  Timer, Brain, Battery, Rocket, Navigation,
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

interface HitFResult {
  id: string;
  sessionId: string;
  memberId: string | null;
  hitAResultId: string | null;
  breakMonths: number;
  jobChangeVelocity: number;
  latentScore: number;
  cviRaw: number;
  cviGrade: string;
  nextRoute: string;
  resilienceScore: number;
  reentryReadiness: number;
  routingRationale: string;
  aiReport: string;
  journeyStage: string;
  // detail scores
  latentScores: Record<string, number>;
  resilienceScores: Record<string, number>;
  breakContextScore: number;
  breakReasonScore: number;
  practicalReadiness: number;
  reentryMotivation: number;
  jobCategory: string;
  createdAt: string;
}

const CVI_GRADE_INFO: Record<string, { label: string; color: string; bgColor: string }> = {
  HIGH: { label: '높음 - 복귀 가능', color: 'text-green-700', bgColor: 'bg-green-50' },
  MID: { label: '보통 - 전략 필요', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  LOW: { label: '낮음 - 기초부터', color: 'text-red-700', bgColor: 'bg-red-50' },
};

const ROUTE_INFO: Record<string, { label: string; desc: string; color: string }> = {
  R: { label: 'Recovery (복귀)', desc: '기존 경력 기반 빠른 복귀', color: 'text-green-600 bg-green-50' },
  C: { label: 'HIT C (전환)', desc: '새로운 방향으로 경력 전환', color: 'text-blue-600 bg-blue-50' },
  B: { label: 'HIT B (기본)', desc: '기초 역량 점검부터 시작', color: 'text-orange-600 bg-orange-50' },
};

const JOURNEY_LABELS: Record<string, string> = {
  ready_to_return: '복귀 준비 완료',
  skill_ready_prep_needed: '역량 준비 OK, 실행 준비 필요',
  strategic_transition: '전략적 전환 단계',
  resilience_building: '회복탄력성 강화 단계',
  foundation_rebuilding: '기반 재구축 단계',
  early_recovery: '초기 회복 단계',
};

const TOTAL_PAGES = 5;

export default function HitFResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitFResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/f/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        setResult({
          id: data.id,
          sessionId: data.session_id,
          memberId: data.member_id,
          hitAResultId: data.hit_a_result_id,
          breakMonths: data.break_months ?? 0,
          jobChangeVelocity: data.job_change_velocity ?? 0,
          latentScore: data.latent_score ?? 0,
          cviRaw: data.cvi_raw ?? 0,
          cviGrade: data.cvi_grade ?? 'MID',
          nextRoute: data.next_route ?? 'C',
          resilienceScore: data.resilience_score ?? 0,
          reentryReadiness: data.reentry_readiness ?? 0,
          routingRationale: data.routing_rationale ?? '',
          aiReport: data.ai_report ?? '',
          journeyStage: data.journey_stage ?? 'early_recovery',
          latentScores: data.latent_scores ?? {},
          resilienceScores: data.resilience_scores ?? {},
          breakContextScore: data.break_context_score ?? 0,
          breakReasonScore: data.break_reason_score ?? 0,
          practicalReadiness: data.practical_readiness ?? 0,
          reentryMotivation: data.reentry_motivation ?? 0,
          jobCategory: data.job_category ?? '',
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
        <div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div>
          <p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p>
          <Link href="/hero/hit/f" className="text-[#E53935] underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const cviInfo = CVI_GRADE_INFO[result.cviGrade] || CVI_GRADE_INFO.MID;
  const routeInfo = ROUTE_INFO[result.nextRoute] || ROUTE_INFO.C;
  const journeyLabel = JOURNEY_LABELS[result.journeyStage] || result.journeyStage;
  const pageLabels = ["종합 요약", "CVI 분석", "잠재 역량", "회복탄력성 & 준비도", "다음 단계"];

  // Score bar
  const ScoreBar = ({ label, value, max = 100, color = 'bg-[#E53935]' }: { label: string; value: number; max?: number; color?: string }) => (
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

  // CVI Gauge
  const CviGauge = () => {
    const value = result.cviRaw;
    const gradeColor = result.cviGrade === 'HIGH' ? '#22c55e' : result.cviGrade === 'MID' ? '#eab308' : '#ef4444';
    return (
      <div className="text-center">
        <svg viewBox="0 0 200 120" className="w-full max-w-[200px] mx-auto">
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e5e5" strokeWidth="14" strokeLinecap="round" />
          {/* Color zones: LOW (red), MID (yellow), HIGH (green) */}
          <path d="M 20 100 A 80 80 0 0 1 73.3 28.5" fill="none" stroke="#fecaca" strokeWidth="14" strokeLinecap="round" />
          <path d="M 73.3 28.5 A 80 80 0 0 1 126.7 28.5" fill="none" stroke="#fef3c7" strokeWidth="14" strokeLinecap="round" />
          <path d="M 126.7 28.5 A 80 80 0 0 1 180 100" fill="none" stroke="#dcfce7" strokeWidth="14" strokeLinecap="round" />
          {/* Needle */}
          {(() => {
            const rotation = (value / 100) * 180 - 90;
            return (
              <>
                <line x1="100" y1="100" x2="100" y2="30"
                  stroke={gradeColor} strokeWidth="2.5" strokeLinecap="round"
                  transform={`rotate(${rotation} 100 100)`} />
                <circle cx="100" cy="100" r="5" fill={gradeColor} />
              </>
            );
          })()}
          {/* Value text */}
          <text x="100" y="92" textAnchor="middle" className="text-2xl font-extrabold" fill={gradeColor}>
            {value.toFixed(1)}
          </text>
        </svg>
        <p className="text-xs text-neutral-400 mt-1">CVI (경력유효성지수)</p>
      </div>
    );
  };

  // Latent skills radar
  const latentData = [
    { label: '기술 유지', value: result.latentScores.technical_retention ?? 0 },
    { label: '소프트 스킬', value: result.latentScores.soft_skill_retention ?? 0 },
    { label: '지속 학습', value: result.latentScores.continuous_learning ?? 0 },
  ];

  const LatentRadar = () => {
    const cx = 120, cy = 120, maxR = 90;
    const n = latentData.length;
    const angleStep = (2 * Math.PI) / n;

    const pointsValue = latentData.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (d.value / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 240 240" className="w-full max-w-[220px] mx-auto">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={latentData.map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              const r = scale * maxR;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none" stroke="#e5e5e5" strokeWidth="0.5"
          />
        ))}
        {latentData.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return (
            <line key={i} x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)}
              stroke="#e5e5e5" strokeWidth="0.5"
            />
          );
        })}
        <polygon points={pointsValue} fill="rgba(229,57,53,0.15)" stroke="#E53935" strokeWidth="2" />
        {latentData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (d.value / 100) * maxR;
          return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="3" fill="#E53935" />;
        })}
        {latentData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const lr = maxR + 22;
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
              <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT - F 결과</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">경력 공백 복귀 분석</h1>
            </div>
            <div className="flex justify-center mb-6">
              <span className={`px-5 py-2.5 rounded-full text-sm font-bold ${cviInfo.color} ${cviInfo.bgColor}`}>
                CVI {result.cviGrade} - {cviInfo.label}
              </span>
            </div>
            <div className="bg-neutral-50 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <Timer className="h-4 w-4 text-[#E53935]" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">공백 기간:</span> {result.breakMonths}개월
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Brain className="h-4 w-4 text-[#E53935]" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">잠재 역량:</span> {result.latentScore}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Battery className="h-4 w-4 text-[#E53935]" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">회복탄력성:</span> {result.resilienceScore}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Rocket className="h-4 w-4 text-[#E53935]" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">재진입 준비도:</span> {result.reentryReadiness}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Navigation className="h-4 w-4 text-[#E53935]" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">추천 경로:</span> {routeInfo.label}
                </p>
              </div>
            </div>
            <div className="mt-4 bg-neutral-50 p-4 rounded-xl">
              <p className="text-xs font-bold text-neutral-400 mb-1">여정 단계</p>
              <p className="text-sm font-bold text-neutral-800">{journeyLabel}</p>
            </div>
          </div>
        );

      // ── Page 2: CVI 분석 ──
      case 1:
        return (
          <div key="p1">
            <h2 className="text-lg font-bold mb-4">CVI 경력유효성지수</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <CviGauge />
              <div className="flex justify-center mt-4">
                <span className={`px-4 py-2 rounded-full text-xs font-bold ${cviInfo.color} ${cviInfo.bgColor}`}>
                  {result.cviGrade} 등급
                </span>
              </div>
            </div>

            {/* CVI 구성 요소 */}
            <div className="space-y-4 mb-6">
              <div className="bg-neutral-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">경력 공백</span>
                  <span className="font-bold text-neutral-800">{result.breakMonths}개월</span>
                </div>
                <p className="text-[10px] text-neutral-400">공백이 길수록 CVI가 낮아집니다</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">직무변화속도</span>
                  <span className="font-bold text-neutral-800">{result.jobChangeVelocity}</span>
                </div>
                <p className="text-[10px] text-neutral-400">변화가 빠른 직군일수록 CVI에 더 큰 영향</p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-600">잠재 역량 점수</span>
                  <span className="font-bold text-neutral-800">{result.latentScore}%</span>
                </div>
                <p className="text-[10px] text-neutral-400">역량 유지도가 높으면 CVI를 보완합니다</p>
              </div>
            </div>

            {/* 추천 경로 */}
            <div className={`border-2 rounded-xl p-5 ${result.nextRoute === 'R' ? 'border-green-300' : result.nextRoute === 'C' ? 'border-blue-300' : 'border-orange-300'}`}>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">추천 경로</p>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${routeInfo.color}`}>
                  {routeInfo.label}
                </span>
              </div>
              <p className="text-sm text-neutral-600 mt-2">{routeInfo.desc}</p>
              <p className="text-xs text-neutral-400 mt-2">{result.routingRationale}</p>
            </div>
          </div>
        );

      // ── Page 3: 잠재 역량 ──
      case 2:
        return (
          <div key="p2">
            <h2 className="text-lg font-bold mb-4">잠재 역량</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <LatentRadar />
              <div className="text-center mt-2">
                <span className="text-2xl font-extrabold text-[#E53935]">{result.latentScore}%</span>
                <p className="text-xs text-neutral-400">종합 잠재 역량</p>
              </div>
            </div>
            <div className="space-y-1 mb-6">
              <ScoreBar label="기술적 역량 유지" value={result.latentScores.technical_retention ?? 0} />
              <ScoreBar label="소프트 스킬 유지" value={result.latentScores.soft_skill_retention ?? 0} />
              <ScoreBar label="지속적 학습" value={result.latentScores.continuous_learning ?? 0} />
            </div>

            {/* 공백 맥락 */}
            <div className="border border-neutral-200 rounded-xl p-5 mt-6">
              <h3 className="text-sm font-bold text-neutral-700 mb-3">공백 맥락 분석</h3>
              <ScoreBar label="단절 상황 인식" value={result.breakContextScore} color="bg-neutral-400" />
              <ScoreBar label="단절 사유 수용" value={result.breakReasonScore} color="bg-neutral-400" />
            </div>
          </div>
        );

      // ── Page 4: 회복탄력성 & 준비도 ──
      case 3:
        return (
          <div key="p3">
            <h2 className="text-lg font-bold mb-4">회복탄력성 & 재진입 준비도</h2>

            {/* Resilience bars */}
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-700">회복탄력성</h3>
                <span className="text-xl font-extrabold text-[#E53935]">{result.resilienceScore}%</span>
              </div>
              <ScoreBar label="정서적 회복력" value={result.resilienceScores.emotional_resilience ?? 0} color="bg-purple-500" />
              <ScoreBar label="자신감" value={result.resilienceScores.confidence ?? 0} color="bg-blue-500" />
              <ScoreBar label="적응력" value={result.resilienceScores.adaptability ?? 0} color="bg-teal-500" />
            </div>

            {/* Reentry readiness */}
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-700">재진입 준비도</h3>
                <span className="text-xl font-extrabold text-[#E53935]">{result.reentryReadiness}%</span>
              </div>
              <ScoreBar label="실질적 준비" value={result.practicalReadiness} color="bg-emerald-500" />
              <ScoreBar label="복귀 동기" value={result.reentryMotivation} color="bg-amber-500" />
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
              {/* 추천 경로 바로가기 */}
              {result.nextRoute === 'R' && (
                <div className="block border-2 border-green-400 rounded-xl p-5 bg-green-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">복귀</div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800">Recovery 경로 추천</p>
                      <p className="text-xs text-neutral-500 mt-0.5">기존 경력 기반으로 빠르게 복귀할 수 있습니다</p>
                    </div>
                  </div>
                </div>
              )}
              {result.nextRoute === 'C' && (
                <Link href={`/hero/hit/c?a=${result.hitAResultId}`}
                  className="block border-2 border-blue-400 rounded-xl p-5 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">C</div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800">HIT C (경력전환) 추천</p>
                      <p className="text-xs text-neutral-500 mt-0.5">새로운 방향으로의 경력 전환을 분석해보세요</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                  </div>
                </Link>
              )}
              {result.nextRoute === 'B' && (
                <Link href="/hero/hit/b"
                  className="block border-2 border-orange-400 rounded-xl p-5 hover:bg-orange-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">B</div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800">HIT B (기본 진단) 추천</p>
                      <p className="text-xs text-neutral-500 mt-0.5">기초 역량부터 점검해보세요</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-orange-500" />
                  </div>
                </Link>
              )}

              {/* 풀 보고서 */}
              <Link href={`/hero/hit/f/report/${resultId}`}
                className="block border border-neutral-200 rounded-xl p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">PDF</div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전체 보고서 보기</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HIT F 상세 분석 + 인쇄/PDF 저장</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>

              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#E53935]" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">AI 복귀 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">맞춤형 복귀 전략, 역량 보강 계획 수립</p>
                  </div>
                  <Link href={`/hero/coaching?type=ai&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">시작 &rarr;</Link>
                </div>
              </div>
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#E53935]" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전문가 대면 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HeRo 멘토가 복귀를 함께 설계합니다</p>
                  </div>
                  <Link href={`/hero/coaching?type=mentor&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">예약 &rarr;</Link>
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                  {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 결과 링크 복사</>}
                </button>
                <Link href="/hero/hit/f"
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

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
