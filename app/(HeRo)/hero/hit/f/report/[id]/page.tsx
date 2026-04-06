"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, ArrowLeft } from "lucide-react";

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
  latentScores: Record<string, number>;
  resilienceScores: Record<string, number>;
  breakContextScore: number;
  breakReasonScore: number;
  practicalReadiness: number;
  reentryMotivation: number;
  jobCategory: string;
  createdAt: string;
}

const CVI_GRADE_LABELS: Record<string, string> = {
  HIGH: '높음 (복귀 가능)',
  MID: '보통 (전략 필요)',
  LOW: '낮음 (기초부터)',
};

const ROUTE_LABELS: Record<string, string> = {
  R: 'Recovery (기존 경력 복귀)',
  C: 'HIT C (경력 전환)',
  B: 'HIT B (기초 점검)',
};

const JOURNEY_LABELS: Record<string, string> = {
  ready_to_return: '복귀 준비 완료',
  skill_ready_prep_needed: '역량 준비 OK, 실행 준비 필요',
  strategic_transition: '전략적 전환 단계',
  resilience_building: '회복탄력성 강화 단계',
  foundation_rebuilding: '기반 재구축 단계',
  early_recovery: '초기 회복 단계',
};

export default function HitFReportPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitFResult | null>(null);
  const [loading, setLoading] = useState(true);

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

  const ScoreBar = ({ label, value, color = 'bg-[#E53935]' }: { label: string; value: number; color?: string }) => (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-400 font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );

  const createdDate = new Date(result.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 print:px-0 print:py-0">
      {/* 인쇄 버튼 */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link href={`/hero/hit/f/result/${resultId}`} className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600">
          <ArrowLeft className="h-4 w-4" /> 결과로 돌아가기
        </Link>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-700">
          <Printer className="h-4 w-4" /> 인쇄 / PDF 저장
        </button>
      </div>

      {/* 보고서 헤더 */}
      <div className="text-center mb-8 pb-6 border-b border-neutral-200">
        <Image src="/hero-logo-wide.png" alt="HeRo" width={120} height={36} className="h-8 w-auto mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold mb-1">HIT F - 경력 공백 복귀 분석 리포트</h1>
        <p className="text-sm text-neutral-400">{createdDate} | ID: {result.id.slice(0, 8)}</p>
      </div>

      {/* 종합 요약 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1. 종합 요약</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-50 p-4 rounded-xl">
            <p className="text-xs text-neutral-400 mb-1">CVI (경력유효성지수)</p>
            <p className="text-2xl font-extrabold text-[#E53935]">{result.cviRaw.toFixed(1)}</p>
            <p className="text-xs text-neutral-500">{CVI_GRADE_LABELS[result.cviGrade]}</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-xl">
            <p className="text-xs text-neutral-400 mb-1">경력 공백</p>
            <p className="text-2xl font-extrabold text-neutral-800">{result.breakMonths}개월</p>
            <p className="text-xs text-neutral-500">직무변화속도: {result.jobChangeVelocity}</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-xl">
            <p className="text-xs text-neutral-400 mb-1">추천 경로</p>
            <p className="text-lg font-extrabold text-neutral-800">{ROUTE_LABELS[result.nextRoute]}</p>
          </div>
          <div className="bg-neutral-50 p-4 rounded-xl">
            <p className="text-xs text-neutral-400 mb-1">여정 단계</p>
            <p className="text-lg font-extrabold text-neutral-800">{JOURNEY_LABELS[result.journeyStage] || result.journeyStage}</p>
          </div>
        </div>
      </section>

      {/* 잠재 역량 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">2. 잠재 역량 ({result.latentScore}%)</h2>
        <ScoreBar label="기술적 역량 유지" value={result.latentScores.technical_retention ?? 0} />
        <ScoreBar label="소프트 스킬 유지" value={result.latentScores.soft_skill_retention ?? 0} />
        <ScoreBar label="지속적 학습" value={result.latentScores.continuous_learning ?? 0} />
      </section>

      {/* 공백 맥락 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">3. 공백 맥락</h2>
        <ScoreBar label="경력 단절 상황 인식" value={result.breakContextScore} color="bg-neutral-500" />
        <ScoreBar label="단절 사유 수용" value={result.breakReasonScore} color="bg-neutral-500" />
      </section>

      {/* 회복탄력성 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">4. 회복탄력성 ({result.resilienceScore}%)</h2>
        <ScoreBar label="정서적 회복력" value={result.resilienceScores.emotional_resilience ?? 0} color="bg-purple-500" />
        <ScoreBar label="자신감" value={result.resilienceScores.confidence ?? 0} color="bg-blue-500" />
        <ScoreBar label="적응력" value={result.resilienceScores.adaptability ?? 0} color="bg-teal-500" />
      </section>

      {/* 재진입 준비도 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">5. 재진입 준비도 ({result.reentryReadiness}%)</h2>
        <ScoreBar label="실질적 준비" value={result.practicalReadiness} color="bg-emerald-500" />
        <ScoreBar label="복귀 동기" value={result.reentryMotivation} color="bg-amber-500" />
      </section>

      {/* 라우팅 근거 */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">6. 라우팅 근거</h2>
        <div className="bg-neutral-50 p-5 rounded-xl">
          <p className="text-sm text-neutral-700 leading-[1.8]">{result.routingRationale}</p>
        </div>
      </section>

      {/* AI 분석 */}
      {result.aiReport && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">7. HeRo AI 종합 분석</h2>
          <div className="bg-neutral-50 p-5 rounded-xl">
            <p className="text-sm text-neutral-700 leading-[1.8] whitespace-pre-line">
              {cleanMarkdown(result.aiReport)}
            </p>
          </div>
        </section>
      )}

      {/* 푸터 */}
      <div className="text-center pt-6 border-t border-neutral-200">
        <Image src="/hero-logo-wide.png" alt="HeRo" width={80} height={24} className="h-5 w-auto mx-auto mb-2 opacity-30" />
        <p className="text-[10px] text-neutral-300">
          HeRo &middot; Ten:One Universe &middot; HIT F Career Break Recovery Analysis
        </p>
        <p className="text-[10px] text-neutral-300">
          이 리포트는 AI 기반 자기분석 도구입니다. 전문 상담을 대체하지 않습니다.
        </p>
      </div>
    </div>
  );
}
