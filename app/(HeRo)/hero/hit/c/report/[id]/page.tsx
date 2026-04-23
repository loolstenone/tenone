"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react";

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
  capitalExpertise: number;
  capitalNetwork: number;
  capitalOrgUnderstanding: number;
  capitalCompetencies: number;
  capitalTotal: number;
  motivationPush: number;
  motivationPull: number;
  motivationBalance: string;
  transferabilitySkillPortability: number;
  transferabilityIndustryAdaptability: number;
  transferabilityLearningAgility: number;
  transferabilityIndex: number;
  readinessPreparation: number;
  readinessGapAwareness: number;
  readinessTotal: number;
  readinessGrade: string;
  gapAreas: string[];
  aiReport: string;
  reportModules: Record<string, { title: string; content: string }>;
  createdAt: string;
}

const MOTIVATION_LABELS: Record<string, string> = {
  push_dominant: 'Push 우세 (불만족 동기)',
  pull_dominant: 'Pull 우세 (기회 동기)',
  balanced: '균형 동기',
};

const READINESS_GRADE_LABELS: Record<string, string> = {
  A: '전환 준비 완료',
  B: '거의 준비됨',
  C: '준비 진행 중',
  D: '준비 필요',
  F: '전환 재검토',
};

export default function HitCReportPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitCResult | null>(null);
  const [loading, setLoading] = useState(true);

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

  const motivationLabel = MOTIVATION_LABELS[result.motivationBalance] || '균형 동기';
  const gradeLabel = READINESS_GRADE_LABELS[result.readinessGrade] || '준비 진행 중';
  const formattedDate = new Date(result.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  // Report module filters
  const capitalMods = Object.entries(result.reportModules).filter(([k]) => k.startsWith('CAPITAL-'));
  const motivationMods = Object.entries(result.reportModules).filter(([k]) => k.startsWith('MOTIV-'));
  const transferMods = Object.entries(result.reportModules).filter(([k]) => k.startsWith('TRANS-'));
  const readyMods = Object.entries(result.reportModules).filter(([k]) => k.startsWith('READY-'));

  // Simple bar
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

  // Capital radar (SVG)
  const capitalData = [
    { label: '전문성', value: result.capitalExpertise },
    { label: '네트워크', value: result.capitalNetwork },
    { label: '조직이해', value: result.capitalOrgUnderstanding },
    { label: '핵심역량', value: result.capitalCompetencies },
  ];

  const RadarCapital = () => {
    const cx = 140, cy = 140, maxR = 100;
    const n = capitalData.length;
    const angleStep = (2 * Math.PI) / n;

    const pointsValue = capitalData.map((d, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (d.value / 100) * maxR;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 280 280" className="w-full max-w-[280px] mx-auto">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon key={scale}
            points={capitalData.map((_, i) => {
              const angle = angleStep * i - Math.PI / 2;
              const r = scale * maxR;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="none" stroke="#e5e5e5" strokeWidth="0.5"
          />
        ))}
        {capitalData.map((_, i) => {
          const angle = angleStep * i - Math.PI / 2;
          return <line key={i} x1={cx} y1={cy} x2={cx + maxR * Math.cos(angle)} y2={cy + maxR * Math.sin(angle)} stroke="#e5e5e5" strokeWidth="0.5" />;
        })}
        <polygon points={pointsValue} fill="rgba(229,57,53,0.15)" stroke="#E53935" strokeWidth="2" />
        {capitalData.map((d, i) => {
          const angle = angleStep * i - Math.PI / 2;
          const r = (d.value / 100) * maxR;
          return <circle key={i} cx={cx + r * Math.cos(angle)} cy={cy + r * Math.sin(angle)} r="3" fill="#E53935" />;
        })}
        {capitalData.map((d, i) => {
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

  // Push vs Pull bar
  const pushTotal = result.motivationPush + result.motivationPull;
  const pushPct = pushTotal > 0 ? Math.round((result.motivationPush / pushTotal) * 100) : 50;
  const pullPct = 100 - pushPct;

  return (
    <div className="hit-report-container mx-auto max-w-[210mm] px-8 py-10 print:pb-0">
      {/* ── 상단 버튼 ── */}
      <div className="no-print flex items-center justify-between mb-8">
        <Link href={`/hero/hit/c/result/${resultId}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700">
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
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">HIT C 경력전환 보고서</h1>
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
            <span className="text-2xl font-extrabold text-neutral-900">{result.readinessGrade}등급</span>
            <span className="text-lg font-bold text-neutral-900">{gradeLabel}</span>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            {motivationLabel} · 전환 가능성 {result.transferabilityIndex}% · 준비도 {result.readinessTotal}%
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-[15px] text-neutral-600">
            <div><span className="text-xs text-neutral-400 block">경력 자본</span>{result.capitalTotal}%</div>
            <div><span className="text-xs text-neutral-400 block">동기 유형</span>{motivationLabel}</div>
            <div><span className="text-xs text-neutral-400 block">전환 가능성</span>{result.transferabilityIndex}%</div>
            <div><span className="text-xs text-neutral-400 block">준비도</span>{result.readinessGrade}등급 ({result.readinessTotal}%)</div>
          </div>
        </div>
      </section>

      {/* ══ Section 2: 경력 자본 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">경력 자본</h2>
        <div className="border border-neutral-200 rounded-xl p-6 flex justify-center mb-8">
          <RadarCapital />
        </div>
        <div className="mb-8">
          <ScoreBar label="전문성 깊이" value={result.capitalExpertise} />
          <ScoreBar label="인적 네트워크" value={result.capitalNetwork} />
          <ScoreBar label="조직 이해력" value={result.capitalOrgUnderstanding} />
          <ScoreBar label="핵심 역량" value={result.capitalCompetencies} />
        </div>
        {capitalMods.length > 0 && capitalMods.map(([id, m]) => (
          <div key={id} className="mb-7 border-l-2 border-neutral-300 pl-4">
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
      </section>

      {/* ══ Section 3: 이직 동기 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">이직 동기</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <p className="text-sm font-bold text-neutral-700 mb-4 text-center">{motivationLabel}</p>
          {/* Push vs Pull bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-orange-600 font-medium">Push {pushPct}%</span>
              <span className="text-green-600 font-medium">Pull {pullPct}%</span>
            </div>
            <div className="h-3 bg-neutral-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-orange-400" style={{ width: `${pushPct}%` }} />
              <div className="h-full bg-green-400" style={{ width: `${pullPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
              <span>불만족 동기</span>
              <span>기회 동기</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
            <div className="bg-orange-50 p-3 rounded-lg text-center">
              <p className="text-xs font-bold text-orange-700">Push 요인</p>
              <p className="text-xl font-extrabold text-orange-600">{result.motivationPush}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xs font-bold text-green-700">Pull 요인</p>
              <p className="text-xl font-extrabold text-green-600">{result.motivationPull}%</p>
            </div>
          </div>
        </div>
        {motivationMods.length > 0 && motivationMods.map(([id, m]) => (
          <div key={id} className="mb-7 border-l-2 border-orange-400 pl-4">
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
      </section>

      {/* ══ Section 4: 전환 가능성 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">전환 가능성</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <div className="text-center mb-6">
            <p className="text-4xl font-extrabold text-neutral-900">{result.transferabilityIndex}%</p>
            <p className="text-xs text-neutral-400 mt-1">전환 가능성 지수</p>
          </div>
          <ScoreBar label="스킬 이동성" value={result.transferabilitySkillPortability} />
          <ScoreBar label="산업 적응력" value={result.transferabilityIndustryAdaptability} />
          <ScoreBar label="학습 민첩성" value={result.transferabilityLearningAgility} />
        </div>
        {transferMods.length > 0 && transferMods.map(([id, m]) => (
          <div key={id} className="mb-7 border-l-2 border-purple-400 pl-4">
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
      </section>

      {/* ══ Section 5: 준비도 & 갭 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">전환 준비도</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-neutral-700">{gradeLabel}</span>
            <span className="text-2xl font-extrabold text-[#E53935]">{result.readinessGrade}등급</span>
          </div>
          <ScoreBar label="준비 정도" value={result.readinessPreparation} />
          <ScoreBar label="갭 인식" value={result.readinessGapAwareness} />
          <div className="mt-3 pt-3 border-t border-neutral-100 flex justify-between text-sm">
            <span className="font-bold text-neutral-700">종합 준비도</span>
            <span className="font-extrabold text-neutral-900">{result.readinessTotal}%</span>
          </div>
        </div>

        {/* Gap Areas */}
        {result.gapAreas.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-neutral-500 mb-3">주요 갭 영역</h3>
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

        {readyMods.length > 0 && readyMods.map(([id, m]) => (
          <div key={id} className="mb-7 border-l-2 border-blue-400 pl-4">
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
      </section>

      {/* ══ Section 6: HeRo의 종합 분석 ══ */}
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
