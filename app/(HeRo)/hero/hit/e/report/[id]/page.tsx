"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, ArrowLeft, Sparkles, Award } from "lucide-react";

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

const DIRECTION_LABELS: Record<string, string> = {
  social_contribution: '사회 공헌형',
  entrepreneurship: '창업/사업형',
  education: '교육/멘토링형',
  leisure: '여가/취미형',
};

const JOURNEY_LABELS: Record<string, string> = {
  ready_to_launch: '2막 시작 준비 완료',
  almost_ready: '거의 준비됨',
  direction_found: '방향 탐색 완료',
  exploring: '탐색 중',
  needs_reflection: '성찰 필요',
  early_awareness: '초기 인식',
};

export default function HitEReportPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitEResult | null>(null);
  const [loading, setLoading] = useState(true);

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

  const directionLabel = DIRECTION_LABELS[result.directionType] || '사회 공헌형';
  const journeyLabel = JOURNEY_LABELS[result.journeyStage] || '탐색 중';
  const formattedDate = new Date(result.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  // Simple bar
  const ScoreBar = ({ label, value, color = 'bg-amber-700' }: { label: string; value: number; color?: string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-400 font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );

  // Direction radar (SVG)
  const directions = [
    { label: '사회공헌', key: 'social_contribution' },
    { label: '창업/사업', key: 'entrepreneurship' },
    { label: '교육/멘토링', key: 'education' },
    { label: '여가/취미', key: 'leisure' },
  ];

  const DirectionRadar = () => {
    const cx = 140, cy = 140, maxR = 100;
    const n = directions.length;
    const angleStep = (2 * Math.PI) / n;

    const pointsValue = directions.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = ((result.directionScores[d.key] || 0) / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 280 280" className="w-full max-w-[280px] mx-auto">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon key={scale}
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
          return <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="#e5e5e5" strokeWidth="0.5" />;
        })}
        <polygon points={pointsValue} fill="rgba(180,83,9,0.15)" stroke="#b45309" strokeWidth="2" />
        {directions.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = ((result.directionScores[d.key] || 0) / 100) * maxR;
          return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="3" fill="#b45309" />;
        })}
        {directions.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const lr = maxR + 22;
          return (
            <text key={i} x={cx + lr * Math.cos(angle)} y={cy + lr * Math.sin(angle)} textAnchor="middle" dominantBaseline="middle"
              className="text-[11px] fill-neutral-500">{d.label}</text>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="hit-report-container mx-auto max-w-[210mm] px-8 py-10 print:pb-0">
      {/* ── 상단 버튼 ── */}
      <div className="no-print flex items-center justify-between mb-8">
        <Link href={`/hero/hit/e/result/${resultId}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700">
          <ArrowLeft className="h-4 w-4" /> 결과 페이지로 돌아가기
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/hero/coaching/ai?resultId=${resultId}`} className="inline-flex items-center gap-2 px-4 py-2 border border-amber-700 text-amber-700 text-sm font-medium rounded-xl hover:bg-amber-50 transition-colors">
            <Sparkles className="h-4 w-4" /> AI 상담
          </Link>
          <button onClick={() => window.print()} className="print-keep inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-xl hover:bg-amber-800 transition-colors">
            <Printer className="h-4 w-4" /> 인쇄 / PDF
          </button>
        </div>
      </div>

      {/* Section 1: 표지 */}
      <section>
        <div className="border-b-2 border-amber-700 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/hero-logo.png" alt="HeRo" width={56} height={56} className="h-14 w-14 object-contain" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-[0.2em] mb-1">HeRo Integrated Test</p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">HIT E 인생 2막 보고서</h1>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-400">
              <p>{formattedDate}</p>
              <p className="mt-1 font-mono text-[10px]">ID: {resultId.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="border-l-[3px] border-amber-700 pl-6 mb-8">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-2xl font-extrabold text-amber-700">{journeyLabel}</span>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            {directionLabel} · 레거시 스킬 {result.legacySkillScore}% · 2막 준비도 {result.secondActReadiness}%
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-[15px] text-neutral-600">
            <div><span className="text-xs text-neutral-400 block">삶의 만족도</span>{result.lifeSatisfaction}%</div>
            <div><span className="text-xs text-neutral-400 block">남은 열정</span>{result.remainingPassion}%</div>
            <div><span className="text-xs text-neutral-400 block">방향 유형</span>{directionLabel}</div>
            <div><span className="text-xs text-neutral-400 block">2막 준비도</span>{result.secondActReadiness}%</div>
          </div>
        </div>
      </section>

      {/* Section 2: 삶의 만족도 & 열정 */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">삶의 만족도 & 열정</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-amber-700">{result.lifeSatisfaction}%</p>
              <p className="text-xs text-neutral-400 mt-1">삶의 만족도</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-extrabold text-amber-700">{result.remainingPassion}%</p>
              <p className="text-xs text-neutral-400 mt-1">남은 열정</p>
            </div>
          </div>
        </div>
        <div className="mb-8">
          <ScoreBar label="삶의 만족도" value={result.lifeSatisfaction} />
          <ScoreBar label="남은 열정" value={result.remainingPassion} />
        </div>
      </section>

      {/* Section 3: 방향 탐색 */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">방향 탐색</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <p className="text-sm font-bold text-neutral-700 mb-4 text-center">{directionLabel}</p>
          <DirectionRadar />
        </div>
        <div className="mb-8">
          <ScoreBar label="사회 공헌" value={result.directionScores.social_contribution || 0} color="bg-green-500" />
          <ScoreBar label="창업/사업" value={result.directionScores.entrepreneurship || 0} color="bg-blue-500" />
          <ScoreBar label="교육/멘토링" value={result.directionScores.education || 0} color="bg-purple-500" />
          <ScoreBar label="여가/취미" value={result.directionScores.leisure || 0} color="bg-orange-500" />
        </div>
      </section>

      {/* Section 4: 레거시 스킬 */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">레거시 스킬</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <div className="text-center mb-6">
            <p className="text-4xl font-extrabold text-amber-700">{result.legacySkillScore}%</p>
            <p className="text-xs text-neutral-400 mt-1">레거시 스킬 종합</p>
          </div>
        </div>

        {result.legacyAreas.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-neutral-500 mb-3">레거시 영역</h3>
            <div className="space-y-2">
              {result.legacyAreas.map((area, i) => (
                <div key={i} className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg">
                  <Award className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                  <span className="text-xs text-amber-800">{area}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Section 5: 사회적 연결 & 준비도 */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">사회적 연결 & 2막 준비도</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <ScoreBar label="사회적 필요" value={result.socialNeedScore} />
          <ScoreBar label="2막 준비도" value={result.secondActReadiness} />
          <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between text-sm">
            <span className="font-bold text-neutral-700">종합 준비도</span>
            <span className="font-extrabold text-amber-700">{result.secondActReadiness}%</span>
          </div>
        </div>
      </section>

      {/* Section 6: HeRo의 종합 분석 */}
      {result.aiReport && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200 flex items-center gap-2">
            <Image src="/hero-logo-wide.png" alt="" width={28} height={14} className="h-4 w-auto" />
            HeRo의 종합 분석
          </h2>
          <div className="space-y-4">
            {result.aiReport.split('\n').filter(p => p.trim()).map((p, i) => (
              <p key={i} className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(p)}</p>
            ))}
          </div>
        </section>
      )}

      {/* ── 푸터 ── */}
      <div className="mt-16 pt-6 border-t border-neutral-200 flex items-center justify-center gap-3">
        <Image src="/hero-logo-wide.png" alt="HeRo" width={48} height={24} className="h-5 w-auto opacity-30" />
        <p className="text-xs text-neutral-300">
          HeRo Integrated Test (HIT) | Ten:One Universe | {formattedDate}
        </p>
      </div>

      {/* ── AI 상담 플로팅 ── */}
      <Link
        href={`/hero/coaching/ai?resultId=${resultId}`}
        className="no-print fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-amber-700 text-white font-bold rounded-full shadow-lg hover:bg-amber-800 hover:shadow-xl transition-all hover:scale-105"
      >
        <Sparkles className="h-5 w-5" /> AI 상담
      </Link>

      {/* ── PDF 워터마크 ── */}
      <div className="hidden print:block" style={{ pageBreakBefore: "always" }}>
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 40px)" }}>
          <div className="text-center">
            <Image src="/hero-logo-black-wide.png" alt="HeRo" width={400} height={200} className="w-80 mx-auto opacity-[0.06]" />
            <p className="text-sm text-neutral-300 mt-10 tracking-widest uppercase">HeRo Integrated Test</p>
            <p className="text-xs text-neutral-300 mt-2">Ten:One Universe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
