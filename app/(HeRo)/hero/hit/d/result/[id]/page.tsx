"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Copy, Check, Sparkles, Users,
  RefreshCw, ChevronLeft, ChevronRight,
  Microscope, Crown, Shuffle, Globe, TrendingUp,
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

interface NextRoleOption {
  role: string;
  fit_score: number;
  description: string;
}

interface HitDResult {
  id: string;
  session_id: string;
  member_id: string | null;
  hit_a_result_id: string | null;
  expertise_depth: number;
  expertise_domains: Record<string, number>;
  leadership_type: string;
  leadership_scores: Record<string, number>;
  identity_flexibility: number;
  network_quality: number;
  network_breadth: number;
  senior_readiness: number;
  next_role_matrix: { current_role: string; possible_roles: NextRoleOption[] };
  ai_report: string;
  journey_stage: string;
  created_at: string;
}

const LEADERSHIP_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  visionary: { label: '비전 제시형', desc: '큰 그림과 방향을 제시하며 사람들에게 영감을 주는 리더', color: 'text-purple-600 bg-purple-50' },
  coaching: { label: '코칭형', desc: '팀원의 잠재력을 발견하고 성장을 이끄는 리더', color: 'text-green-600 bg-green-50' },
  democratic: { label: '민주형', desc: '다양한 의견을 수렴하고 합의를 이끌어내는 리더', color: 'text-blue-600 bg-blue-50' },
  commanding: { label: '지시형', desc: '명확한 지시와 실행력으로 위기를 돌파하는 리더', color: 'text-orange-600 bg-orange-50' },
};

const JOURNEY_LABELS: Record<string, { label: string; color: string }> = {
  ready_for_transition: { label: '전환 준비 완료', color: 'text-green-600 bg-green-50' },
  almost_ready: { label: '거의 준비됨', color: 'text-blue-600 bg-blue-50' },
  building_bridge: { label: '브릿지 구축 중', color: 'text-indigo-600 bg-indigo-50' },
  deepening_expertise: { label: '전문성 심화 중', color: 'text-yellow-600 bg-yellow-50' },
  exploring_options: { label: '옵션 탐색 중', color: 'text-orange-600 bg-orange-50' },
  early_reflection: { label: '초기 성찰 단계', color: 'text-neutral-600 bg-neutral-100' },
};

const TOTAL_PAGES = 5;

export default function HitDResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitDResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/d/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        setResult(data);
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
          <Link href="/hero/hit/d" className="text-[#E53935] underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const leadershipInfo = LEADERSHIP_LABELS[result.leadership_type] || LEADERSHIP_LABELS.visionary;
  const journeyInfo = JOURNEY_LABELS[result.journey_stage] || JOURNEY_LABELS.early_reflection;
  const pageLabels = ["종합 요약", "전문성 & 리더십", "정체성 유연성", "네트워크 & 다음 역할", "다음 단계"];

  // Score bar renderer
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

  // Leadership Radar (4 axes)
  const leadershipData = [
    { label: '비전', value: result.leadership_scores.visionary || 0 },
    { label: '코칭', value: result.leadership_scores.coaching || 0 },
    { label: '민주', value: result.leadership_scores.democratic || 0 },
    { label: '지시', value: result.leadership_scores.commanding || 0 },
  ];

  const RadarLeadership = () => {
    const cx = 120, cy = 120, maxR = 90;
    const n = leadershipData.length;
    const angleStep = (2 * Math.PI) / n;

    const pointsValue = leadershipData.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (d.value / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 240 240" className="w-full max-w-[240px] mx-auto">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon key={scale}
            points={leadershipData.map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              const r = scale * maxR;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none" stroke="#e5e5e5" strokeWidth="0.5"
          />
        ))}
        {leadershipData.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="#e5e5e5" strokeWidth="0.5" />;
        })}
        <polygon points={pointsValue} fill="rgba(229,57,53,0.15)" stroke="#E53935" strokeWidth="2" />
        {leadershipData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (d.value / 100) * maxR;
          return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="3" fill="#E53935" />;
        })}
        {leadershipData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const lr = maxR + 20;
          return (
            <text key={i} x={cx + lr * Math.cos(angle)} y={cy + lr * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle"
              className="text-[10px] fill-neutral-500">{d.label}</text>
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
              <p className="text-xs font-bold text-[#E53935] uppercase tracking-widest mb-2">HIT - D 결과</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">시니어 리더십 전환</h1>
            </div>
            <div className="flex justify-center mb-6">
              <span className={`px-5 py-2.5 rounded-full text-sm font-bold ${journeyInfo.color}`}>
                {journeyInfo.label}
              </span>
            </div>
            <div className="bg-neutral-50 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-3">
                <Crown className="h-4 w-4 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">리더십 유형:</span> {leadershipInfo.label}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Microscope className="h-4 w-4 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">전문성 깊이:</span> {result.expertise_depth}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Shuffle className="h-4 w-4 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">정체성 유연성:</span> {result.identity_flexibility}%
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-neutral-400" />
                <p className="text-sm text-neutral-600">
                  <span className="font-bold">시니어 준비도:</span> {result.senior_readiness}%
                </p>
              </div>
            </div>
            {/* Top recommended role */}
            {result.next_role_matrix?.possible_roles?.[0] && (
              <div className="mt-4 p-4 border-2 border-[#E53935] rounded-xl bg-red-50/50">
                <p className="text-xs font-bold text-[#E53935] mb-1">추천 다음 역할 #1</p>
                <p className="text-lg font-extrabold text-neutral-900">
                  {result.next_role_matrix.possible_roles[0].role}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  적합도 {result.next_role_matrix.possible_roles[0].fit_score}%
                </p>
              </div>
            )}
          </div>
        );

      // ── Page 2: 전문성 & 리더십 ──
      case 1:
        return (
          <div key="p1">
            <h2 className="text-lg font-bold mb-4">전문성 & 리더십</h2>

            {/* Expertise bars */}
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-bold text-neutral-700 mb-4">전문성</h3>
              <ScoreBar label="전문 분야 깊이" value={result.expertise_depth} />
              <ScoreBar label="도메인 확장성" value={result.expertise_domains?.breadth ?? 0} />
            </div>

            {/* Leadership radar */}
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-neutral-700">리더십 스타일</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${leadershipInfo.color}`}>
                  {leadershipInfo.label}
                </span>
              </div>
              <RadarLeadership />
              <div className="mt-4 space-y-1">
                <ScoreBar label="비전 제시형" value={result.leadership_scores.visionary || 0} />
                <ScoreBar label="코칭형" value={result.leadership_scores.coaching || 0} />
                <ScoreBar label="민주형" value={result.leadership_scores.democratic || 0} />
                <ScoreBar label="지시형" value={result.leadership_scores.commanding || 0} />
              </div>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed">
              {leadershipInfo.desc}
            </p>
          </div>
        );

      // ── Page 3: 정체성 유연성 ──
      case 2:
        return (
          <div key="p2">
            <h2 className="text-lg font-bold mb-4">정체성 유연성</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <div className="text-center mb-6">
                <p className="text-4xl font-extrabold text-[#E53935]">{result.identity_flexibility}%</p>
                <p className="text-xs text-neutral-400 mt-1">정체성 유연성 지수</p>
              </div>
              {/* Identity sub-scores — we need to derive from expertise_domains or separate fields */}
              {/* Since we store identity_flexibility as single number, show related network/expertise */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">역할에 묶이지 않는 정체성</span>
                  <span className="text-sm font-bold text-neutral-900">{result.identity_flexibility >= 60 ? '유연' : result.identity_flexibility >= 40 ? '보통' : '경직'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">변화에 대한 태도</span>
                  <span className="text-sm font-bold text-neutral-900">{result.identity_flexibility >= 65 ? '적극 수용' : result.identity_flexibility >= 45 ? '선택적 수용' : '회피 경향'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">자기 재발명 의지</span>
                  <span className="text-sm font-bold text-neutral-900">{result.identity_flexibility >= 70 ? '높음' : result.identity_flexibility >= 50 ? '보통' : '낮음'}</span>
                </div>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-neutral-50 p-4 rounded-xl">
              <p className="text-xs text-neutral-500 leading-relaxed">
                {result.identity_flexibility >= 65
                  ? '높은 정체성 유연성은 시니어 전환의 핵심 자산입니다. 역할이 바뀌어도 자신의 핵심 가치를 유지하면서 새로운 맥락에 적응할 수 있습니다.'
                  : result.identity_flexibility >= 45
                    ? '보통 수준의 정체성 유연성입니다. 시니어 전환을 위해 현재 역할을 넘어선 자기 정의를 연습해보는 것이 도움됩니다.'
                    : '현재 역할에 대한 강한 동일시가 있습니다. 시니어 전환 시 가장 큰 심리적 도전이 될 수 있으며, 점진적인 역할 확장을 권합니다.'}
              </p>
            </div>
          </div>
        );

      // ── Page 4: 네트워크 & 다음 역할 ──
      case 3:
        return (
          <div key="p3">
            <h2 className="text-lg font-bold mb-4">네트워크 & 다음 역할</h2>

            {/* Network scores */}
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-bold text-neutral-700 mb-4">네트워크</h3>
              <ScoreBar label="네트워크 질" value={result.network_quality} />
              <ScoreBar label="네트워크 폭" value={result.network_breadth} />
              <ScoreBar label="시니어 준비도" value={result.senior_readiness} />
            </div>

            {/* Next Role Matrix */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">다음 역할 매트릭스</h3>
              {result.next_role_matrix?.current_role && (
                <p className="text-xs text-neutral-500 mb-4">
                  현재 추정 역할: <span className="font-bold text-neutral-700">{result.next_role_matrix.current_role}</span>
                </p>
              )}
              <div className="space-y-3">
                {(result.next_role_matrix?.possible_roles || []).map((role, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'border-[#E53935] bg-red-50/30' : 'border-neutral-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {i === 0 && <TrendingUp className="h-4 w-4 text-[#E53935]" />}
                        <p className={`font-bold text-sm ${i === 0 ? 'text-[#E53935]' : 'text-neutral-800'}`}>{role.role}</p>
                      </div>
                      <span className={`text-sm font-mono font-bold ${i === 0 ? 'text-[#E53935]' : 'text-neutral-500'}`}>{role.fit_score}%</span>
                    </div>
                    <p className="text-xs text-neutral-500">{role.description}</p>
                    {/* Fit bar */}
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-2">
                      <div className={`h-full rounded-full transition-all duration-500 ${i === 0 ? 'bg-[#E53935]' : 'bg-neutral-300'}`}
                        style={{ width: `${role.fit_score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Report */}
            {result.ai_report && (
              <div className="mt-6">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Image src="/hero-logo-wide.png" alt="" width={24} height={12} className="h-3.5 w-auto opacity-50" />
                  HeRo의 종합 분석
                </h3>
                <div className="bg-neutral-50 p-5 rounded-xl">
                  <p className="text-sm text-neutral-700 leading-[1.8] whitespace-pre-line">
                    {cleanMarkdown(result.ai_report)}
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
              {result.hit_a_result_id && (
                <Link href={`/hero/hit/profile/${result.id}`}
                  className="block border-2 border-[#E53935] rounded-xl p-5 hover:bg-red-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#E53935] text-white rounded-lg flex items-center justify-center font-bold text-sm">A+D</div>
                    <div className="flex-1">
                      <p className="font-bold text-neutral-800">통합 프로필 보기</p>
                      <p className="text-xs text-neutral-500 mt-0.5">HIT A + D 결과를 한눈에</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#E53935]" />
                  </div>
                </Link>
              )}
              {/* 풀 보고서 */}
              <Link href={`/hero/hit/d/report/${resultId}`}
                className="block border border-neutral-200 rounded-xl p-5 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">PDF</div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전체 보고서 보기</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HIT D 상세 분석 + 인쇄/PDF 저장</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
              </Link>
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-[#E53935]" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">AI 시니어 전환 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">리더십 전환, 역할 설계, 레거시 구축 전략</p>
                  </div>
                  <Link href={`/hero/coaching?type=ai&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">시작 →</Link>
                </div>
              </div>
              <div className="border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#E53935]" />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">전문가 대면 상담</p>
                    <p className="text-xs text-neutral-500 mt-0.5">HeRo 시니어 멘토가 전환을 함께 설계합니다</p>
                  </div>
                  <Link href={`/hero/coaching?type=mentor&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">예약 →</Link>
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <button onClick={handleCopy}
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 rounded-lg text-sm hover:bg-neutral-50 transition-colors">
                  {copied ? <><Check className="h-3.5 w-3.5 text-green-500" /> 복사됨</> : <><Copy className="h-3.5 w-3.5" /> 결과 링크 복사</>}
                </button>
                <Link href="/hero/hit/d"
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
