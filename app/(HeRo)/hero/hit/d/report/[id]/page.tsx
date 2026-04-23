"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, ArrowLeft, Sparkles, TrendingUp } from "lucide-react";

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

const LEADERSHIP_LABELS: Record<string, string> = {
  visionary: '비전 제시형',
  coaching: '코칭형',
  democratic: '민주형',
  commanding: '지시형',
};

const JOURNEY_LABELS: Record<string, string> = {
  ready_for_transition: '전환 준비 완료',
  almost_ready: '거의 준비됨',
  building_bridge: '브릿지 구축 중',
  deepening_expertise: '전문성 심화 중',
  exploring_options: '옵션 탐색 중',
  early_reflection: '초기 성찰 단계',
};

export default function HitDReportPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitDResult | null>(null);
  const [loading, setLoading] = useState(true);

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

  const leadershipLabel = LEADERSHIP_LABELS[result.leadership_type] || '비전 제시형';
  const journeyLabel = JOURNEY_LABELS[result.journey_stage] || '초기 성찰 단계';
  const formattedDate = new Date(result.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  // Score bar
  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-neutral-600">{label}</span>
        <span className="text-neutral-400 font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#E53935] rounded-full" style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );

  // Leadership Radar (SVG)
  const leadershipData = [
    { label: '비전', value: result.leadership_scores.visionary || 0 },
    { label: '코칭', value: result.leadership_scores.coaching || 0 },
    { label: '민주', value: result.leadership_scores.democratic || 0 },
    { label: '지시', value: result.leadership_scores.commanding || 0 },
  ];

  const RadarLeadership = () => {
    const cx = 140, cy = 140, maxR = 100;
    const n = leadershipData.length;
    const angleStep = (2 * Math.PI) / n;

    const pointsValue = leadershipData.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (d.value / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 280 280" className="w-full max-w-[280px] mx-auto">
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
        <Link href={`/hero/hit/d/result/${resultId}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700">
          <ArrowLeft className="h-4 w-4" /> 결과 페이지로 돌아가기
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/hero/coaching/ai?resultId=${resultId}`} className="inline-flex items-center gap-2 px-4 py-2 border border-[#E53935] text-[#E53935] text-sm font-medium rounded-xl hover:bg-red-50 transition-colors">
            <Sparkles className="h-4 w-4" /> AI 상담
          </Link>
          <button onClick={() => window.print()} className="print-keep inline-flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
            <Printer className="h-4 w-4" /> 인쇄 / PDF
          </button>
        </div>
      </div>

      {/* ══ Section 1: 표지 ══ */}
      <section>
        <div className="border-b-2 border-[#E53935] pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/hero-logo.png" alt="HeRo" width={56} height={56} className="h-14 w-14 object-contain" />
              <div>
                <p className="text-xs font-bold text-[#E53935] uppercase tracking-[0.2em] mb-1">HeRo Integrated Test</p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">HIT D 시니어 리더십 전환 보고서</h1>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-400">
              <p>{formattedDate}</p>
              <p className="mt-1 font-mono text-[10px]">ID: {resultId.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        {/* 요약 카드 */}
        <div className="border-l-[3px] border-[#E53935] pl-6 mb-8">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-2xl font-extrabold text-neutral-900">{leadershipLabel}</span>
            <span className="text-lg font-bold text-neutral-900">{journeyLabel}</span>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            전문성 {result.expertise_depth}% · 정체성 유연성 {result.identity_flexibility}% · 시니어 준비도 {result.senior_readiness}%
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-[15px] text-neutral-600">
            <div><span className="text-xs text-neutral-400 block">전문성 깊이</span>{result.expertise_depth}%</div>
            <div><span className="text-xs text-neutral-400 block">리더십 유형</span>{leadershipLabel}</div>
            <div><span className="text-xs text-neutral-400 block">정체성 유연성</span>{result.identity_flexibility}%</div>
            <div><span className="text-xs text-neutral-400 block">시니어 준비도</span>{result.senior_readiness}%</div>
          </div>
        </div>
      </section>

      {/* ══ Section 2: 전문성 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">전문성 깊이 & 도메인</h2>
        <div className="mb-8">
          <ScoreBar label="전문 분야 깊이" value={result.expertise_depth} />
          <ScoreBar label="도메인 확장성" value={result.expertise_domains?.breadth ?? 0} />
        </div>
      </section>

      {/* ══ Section 3: 리더십 스타일 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">리더십 스타일</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <p className="text-sm font-bold text-neutral-700 mb-4 text-center">{leadershipLabel}</p>
          <div className="flex justify-center mb-6">
            <RadarLeadership />
          </div>
          <ScoreBar label="비전 제시형" value={result.leadership_scores.visionary || 0} />
          <ScoreBar label="코칭형" value={result.leadership_scores.coaching || 0} />
          <ScoreBar label="민주형" value={result.leadership_scores.democratic || 0} />
          <ScoreBar label="지시형" value={result.leadership_scores.commanding || 0} />
        </div>
      </section>

      {/* ══ Section 4: 정체성 유연성 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">정체성 유연성</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <div className="text-center mb-4">
            <p className="text-4xl font-extrabold text-neutral-900">{result.identity_flexibility}%</p>
            <p className="text-xs text-neutral-400 mt-1">정체성 유연성 지수</p>
          </div>
          <p className="text-sm text-neutral-600 leading-relaxed text-center">
            {result.identity_flexibility >= 65
              ? '높은 정체성 유연성 -- 역할 전환에 심리적으로 준비된 상태입니다.'
              : result.identity_flexibility >= 45
                ? '보통 수준의 정체성 유연성 -- 점진적 전환 전략이 적합합니다.'
                : '현재 역할에 대한 강한 동일시 -- 단계적 역할 확장이 필요합니다.'}
          </p>
        </div>
      </section>

      {/* ══ Section 5: 네트워크 & 시니어 준비도 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">네트워크 & 시니어 준비도</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <ScoreBar label="네트워크 질" value={result.network_quality} />
          <ScoreBar label="네트워크 폭" value={result.network_breadth} />
          <ScoreBar label="시니어 준비도" value={result.senior_readiness} />
        </div>
      </section>

      {/* ══ Section 6: 다음 역할 매트릭스 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">다음 역할 매트릭스</h2>
        {result.next_role_matrix?.current_role && (
          <p className="text-sm text-neutral-500 mb-6">
            현재 추정 역할: <span className="font-bold text-neutral-700">{result.next_role_matrix.current_role}</span>
          </p>
        )}
        <div className="space-y-4 mb-8">
          {(result.next_role_matrix?.possible_roles || []).map((role, i) => (
            <div key={i} className={`p-5 rounded-xl border ${i === 0 ? 'border-[#E53935] bg-red-50/30' : 'border-neutral-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {i === 0 && <TrendingUp className="h-4 w-4 text-[#E53935]" />}
                  <p className={`font-bold ${i === 0 ? 'text-neutral-900' : 'text-neutral-800'}`}>{role.role}</p>
                </div>
                <span className={`text-lg font-mono font-bold ${i === 0 ? 'text-neutral-900' : 'text-neutral-500'}`}>{role.fit_score}%</span>
              </div>
              <p className="text-sm text-neutral-600">{role.description}</p>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mt-3">
                <div className={`h-full rounded-full ${i === 0 ? 'bg-[#E53935]' : 'bg-neutral-300'}`}
                  style={{ width: `${role.fit_score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ Section 7: HeRo의 종합 분석 ══ */}
      {result.ai_report && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200 flex items-center gap-2">
            <Image src="/hero-logo-wide.png" alt="" width={28} height={14} className="h-4 w-auto" />
            HeRo의 종합 분석
          </h2>
          <div className="space-y-4">
            {result.ai_report.split('\n').filter(p => p.trim()).map((p, i) => (
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
        className="no-print fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white font-bold rounded-full shadow-lg hover:bg-neutral-700 hover:shadow-xl transition-all hover:scale-105"
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
