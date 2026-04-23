"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Copy, Check, Sparkles, Users,
  RefreshCw, ChevronLeft, ChevronRight,
  Briefcase, Target, TrendingUp, AlertTriangle,
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

interface HitCResult {
  id: string;
  sessionId: string;
  memberId: string | null;
  hitAResultId: string | null;
  // Capital scores
  capitalExpertise: number;
  capitalNetwork: number;
  capitalOrgUnderstanding: number;
  capitalCompetencies: number;
  capitalTotal: number;
  // Motivation
  motivationPush: number;
  motivationPull: number;
  motivationBalance: string; // 'push_dominant' | 'pull_dominant' | 'balanced'
  // Transferability
  transferabilitySkillPortability: number;
  transferabilityIndustryAdaptability: number;
  transferabilityLearningAgility: number;
  transferabilityIndex: number;
  // Readiness
  readinessPreparation: number;
  readinessGapAwareness: number;
  readinessTotal: number;
  readinessGrade: string;
  // Gaps & AI
  gapAreas: string[];
  aiReport: string;
  reportModules: Record<string, { title: string; content: string }>;
  createdAt: string;
}

const MOTIVATION_LABELS: Record<string, { label: string; color: string }> = {
  push_dominant: { label: 'Push 우세 (불만족 동기)', color: 'text-orange-600 bg-orange-50' },
  pull_dominant: { label: 'Pull 우세 (기회 동기)', color: 'text-green-600 bg-green-50' },
  balanced: { label: '균형 동기', color: 'text-blue-600 bg-blue-50' },
};

const READINESS_GRADE_INFO: Record<string, { label: string; color: string }> = {
  A: { label: '전환 준비 완료', color: 'text-green-600 bg-green-50' },
  B: { label: '거의 준비됨', color: 'text-blue-600 bg-blue-50' },
  C: { label: '준비 진행 중', color: 'text-yellow-600 bg-yellow-50' },
  D: { label: '준비 필요', color: 'text-orange-600 bg-orange-50' },
  F: { label: '전환 재검토', color: 'text-red-600 bg-red-50' },
};

const TOTAL_PAGES = 5;

export default function HitCResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitCResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/c/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        setResult({
          id: data.id,
          sessionId: data.session_id,
          memberId: data.member_id,
          hitAResultId: data.hit_a_result_id,
          capitalExpertise: data.capital_expertise ?? 0,
          capitalNetwork: data.capital_network ?? 0,
          capitalOrgUnderstanding: data.capital_org_understanding ?? 0,
          capitalCompetencies: data.capital_competencies ?? 0,
          capitalTotal: data.capital_total ?? 0,
          motivationPush: data.motivation_push ?? 0,
          motivationPull: data.motivation_pull ?? 0,
          motivationBalance: data.motivation_balance ?? 'balanced',
          transferabilitySkillPortability: data.transferability_skill_portability ?? 0,
          transferabilityIndustryAdaptability: data.transferability_industry_adaptability ?? 0,
          transferabilityLearningAgility: data.transferability_learning_agility ?? 0,
          transferabilityIndex: data.transferability_index ?? 0,
          readinessPreparation: data.readiness_preparation ?? 0,
          readinessGapAwareness: data.readiness_gap_awareness ?? 0,
          readinessTotal: data.readiness_total ?? 0,
          readinessGrade: data.readiness_grade ?? 'C',
          gapAreas: data.gap_areas ?? [],
          aiReport: data.ai_report ?? '',
          reportModules: data.report_modules ?? {},
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
          <Link href="/hero/hit/c" className="text-[#E53935] underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const motivationInfo = MOTIVATION_LABELS[result.motivationBalance] || MOTIVATION_LABELS.balanced;
  const gradeInfo = READINESS_GRADE_INFO[result.readinessGrade] || READINESS_GRADE_INFO.C;
  const pageLabels = ["종합 요약", "경력 자본", "이직 동기", "전환 가능성 & 준비도", "다음 단계"];

  // Report module filters
  const capitalMods = Object.entries(result.reportModules).filter(([k]) => k.startsWith('CAPITAL-'));
  const motivationMods = Object.entries(result.reportModules).filter(([k]) => k.startsWith('MOTIV-'));
  const transferMods = Object.entries(result.reportModules).filter(([k]) => k.startsWith('TRANS-'));
  const readyMods = Object.entries(result.reportModules).filter(([k]) => k.startsWith('READY-'));

  // Simple bar renderer
  const ScoreBar = ({ label, value, max = 100 }: { label: string; value: number; max?: number }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-400 font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#E53935] rounded-full transition-all duration-500" style={{ width: `${Math.min(value, max)}%` }} />
      </div>
    </div>
  );

  // Radar chart for capital (SVG inline)
  const capitalData = [
    { label: '전문성', value: result.capitalExpertise },
    { label: '네트워크', value: result.capitalNetwork },
    { label: '조직이해', value: result.capitalOrgUnderstanding },
    { label: '핵심역량', value: result.capitalCompetencies },
  ];

  const RadarCapital = () => {
    const cx = 120, cy = 120, maxR = 90;
    const n = capitalData.length;
    const angleStep = (2 * Math.PI) / n;

    const pointsMax = capitalData.map((_, i) => {
      const angle = angleStep * i - Math.PI / 2;
      return `${cx + maxR * Math.cos(angle)},${cy + maxR * Math.sin(angle)}`;
    }).join(' ');

    const pointsValue = capitalData.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (d.value / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={capitalData.map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              const r = scale * maxR;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none" stroke="#e5e5e5" strokeWidth="0.5"
          />
        ))}
        {/* Axes */}
        {capitalData.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return (
            <line key={i} x1={cx} y1={cy}
              x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)}
              stroke="#e5e5e5" strokeWidth="0.5"
            />
          );
        })}
        {/* Value polygon */}
        <polygon points={pointsValue} fill="rgba(229,57,53,0.15)" stroke="#E53935" strokeWidth="2" />
        {/* Value dots */}
        {capitalData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (d.value / 100) * maxR;
          return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="3" fill="#E53935" />;
        })}
        {/* Labels */}
        {capitalData.map((d, i) => {
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

  // Push vs Pull bar
  const PushPullBar = () => {
    const total = result.motivationPush + result.motivationPull;
    const pushPct = total > 0 ? Math.round((result.motivationPush / total) * 100) : 50;
    const pullPct = 100 - pushPct;
    return (
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-orange-600 font-medium">Push {pushPct}%</span>
          <span className="text-green-600 font-medium">Pull {pullPct}%</span>
        </div>
        <div className="h-3 bg-neutral-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${pushPct}%` }} />
          <div className="h-full bg-green-400 transition-all duration-500" style={{ width: `${pullPct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
          <span>불만족 동기</span>
          <span>기회 동기</span>
        </div>
      </div>
    );
  };

  // Transferability gauge
  const TransferGauge = () => {
    const value = result.transferabilityIndex;
    const rotation = (value / 100) * 180 - 90;
    return (
      <div className="text-center">
        <svg viewBox="0 0 200 120" className="w-full max-w-[200px] mx-auto">
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e5e5" strokeWidth="12" strokeLinecap="round" />
          {/* Value arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E53935" strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 251.2} 251.2`} />
          {/* Needle */}
          <line x1="100" y1="100" x2="100" y2="30"
            stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"
            transform={`rotate(${rotation} 100 100)`} />
          <circle cx="100" cy="100" r="4" fill="#1a1a1a" />
          {/* Value text */}
          <text x="100" y="95" textAnchor="middle" className="text-2xl font-extrabold fill-neutral-900">{value}%</text>
        </svg>
        <p className="text-xs text-neutral-400 mt-1">전환 가능성 지수</p>
      </div>
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
              <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT - C 결과</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">경력전환 분석</h1>
            </div>
            <div className="flex justify-center mb-6">
              <span className={`px-5 py-2.5 rounded-full text-sm font-bold ${gradeInfo.color}`}>
                {gradeInfo.label}
              </span>
            </div>
            <div className="bg-neutral-50 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">경력 자본:</span> {result.capitalTotal}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">동기 유형:</span> {motivationInfo.label}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">전환 가능성:</span> {result.transferabilityIndex}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-4 w-4 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">준비도:</span> {result.readinessGrade}등급 ({result.readinessTotal}%)
                </p>
              </div>
            </div>
          </div>
        );

      // ── Page 2: 경력 자본 ──
      case 1:
        return (
          <div key="p1">
            <h2 className="text-lg font-bold mb-4">경력 자본</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <RadarCapital />
            </div>
            <div className="space-y-1 mb-6">
              <ScoreBar label="전문성 깊이" value={result.capitalExpertise} />
              <ScoreBar label="인적 네트워크" value={result.capitalNetwork} />
              <ScoreBar label="조직 이해력" value={result.capitalOrgUnderstanding} />
              <ScoreBar label="핵심 역량" value={result.capitalCompetencies} />
            </div>
            {capitalMods.length > 0 && (
              <div className="space-y-5">
                {capitalMods.map(([id, m]) => (
                  <div key={id} className="border-l-2 border-neutral-300 pl-4">
                    <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                    <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      // ── Page 3: 이직 동기 ──
      case 2:
        return (
          <div key="p2">
            <h2 className="text-lg font-bold mb-4">이직 동기 분석</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <div className="flex justify-center mb-4">
                <span className={`px-4 py-2 rounded-full text-xs font-bold ${motivationInfo.color}`}>
                  {motivationInfo.label}
                </span>
              </div>
              <PushPullBar />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs font-bold text-orange-700 mb-1">Push 요인</p>
                  <p className="text-2xl font-extrabold text-orange-600">{result.motivationPush}%</p>
                  <p className="text-[10px] text-orange-500">현직 불만족</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs font-bold text-green-700 mb-1">Pull 요인</p>
                  <p className="text-2xl font-extrabold text-green-600">{result.motivationPull}%</p>
                  <p className="text-[10px] text-green-500">새로운 기회</p>
                </div>
              </div>
            </div>
            {motivationMods.length > 0 && motivationMods.map(([id, m]) => (
              <div key={id} className="border-l-2 border-orange-400 pl-4 mb-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
          </div>
        );

      // ── Page 4: 전환 가능성 & 준비도 ──
      case 3:
        return (
          <div key="p3">
            <h2 className="text-lg font-bold mb-4">전환 가능성 & 준비도</h2>

            {/* Transferability */}
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <TransferGauge />
              <div className="mt-4 space-y-1">
                <ScoreBar label="스킬 이동성" value={result.transferabilitySkillPortability} />
                <ScoreBar label="산업 적응력" value={result.transferabilityIndustryAdaptability} />
                <ScoreBar label="학습 민첩성" value={result.transferabilityLearningAgility} />
              </div>
            </div>

            {transferMods.length > 0 && transferMods.map(([id, m]) => (
              <div key={id} className="border-l-2 border-purple-400 pl-4 mb-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}

            {/* Readiness */}
            <div className="border border-neutral-200 rounded-xl p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-700">전환 준비도</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${gradeInfo.color}`}>
                  {result.readinessGrade}등급
                </span>
              </div>
              <ScoreBar label="준비 정도" value={result.readinessPreparation} />
              <ScoreBar label="갭 인식" value={result.readinessGapAwareness} />
              <div className="mt-2 pt-2 border-t border-neutral-100">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-neutral-700">종합 준비도</span>
                  <span className="font-extrabold text-[#E53935]">{result.readinessTotal}%</span>
                </div>
              </div>
            </div>

            {readyMods.length > 0 && readyMods.map(([id, m]) => (
              <div key={id} className="mt-4 border-l-2 border-blue-400 pl-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}

            {/* Gap Areas */}
            {result.gapAreas.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">주요 갭 영역</h3>
                <div className="space-y-2">
                  {result.gapAreas.map((gap, i) => (
                    <div key={i} className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                      <span className="text-xs text-red-700">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  className="block border-2 border-[#E53935] rounded-xl p-5 hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E53935] text-white rounded-lg flex items-center justify-center font-bold text-sm">A+C</div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800">통합 프로필 보기</p>
                      <p className="text-xs text-neutral-500 mt-0.5">HIT A + C 결과를 한눈에</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#E53935]" />
                  </div>
                </Link>
              )}
              {/* 풀 보고서 */}
              <Link href={`/hero/hit/c/report/${resultId}`}
                className="block border border-neutral-200 rounded-xl p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">PDF</div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전체 보고서 보기</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HIT C 상세 분석 + 인쇄/PDF 저장</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-neutral-400" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">AI 경력전환 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">이직 전략, 갭 분석, 액션 플랜 수립</p>
                  </div>
                  <Link href={`/hero/coaching?type=ai&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">시작 →</Link>
                </div>
              </div>
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-neutral-400" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전문가 대면 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HeRo 멘토가 경력전환을 함께 설계합니다</p>
                  </div>
                  <Link href={`/hero/coaching?type=mentor&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">예약 →</Link>
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                  {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 결과 링크 복사</>}
                </button>
                <Link href="/hero/hit/c"
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
