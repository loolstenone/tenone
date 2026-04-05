"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, ArrowLeft, Sparkles } from "lucide-react";
import HitModelGuideModal from "@/features/hit/HitModelGuideModal";
import RIASECChart from "@/features/hit/RIASECChart";
import CompetencyChart from "@/features/hit/CompetencyChart";
import ReadinessGauge from "@/features/hit/ReadinessGauge";
import RadarChart from "@/features/hit/RadarChart";
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

const STAGE_INFO: Record<string, { label: string }> = {
  ready: { label: '실전 준비 완료' },
  developing: { label: '역량 개발 중' },
  exploring: { label: '탐색 단계' },
  discovering: { label: '발견 단계' },
};

const PERSONALITY_NAMES: Record<string, string> = {
  warmth: '공감력', control: '자기조절', tension: '스트레스 반응', openness: '개방성',
  optimism: '낙관성', adventure: '도전성', dominance: '추진력', intellect: '탐구심',
  suspicion: '경계심', conscience: '책임감', sensitivity: '감수성', independence: '자립성',
  perfectionism: '꼼꼼함', self_discipline: '자기관리', social_boldness: '적극성',
};

export default function HitBReportPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<HitBResult | null>(null);
  const [reportModules, setReportModules] = useState<Record<string, { title: string; content: string }>>({});
  const [loading, setLoading] = useState(true);

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
          <Link href="/hero/hit/b" className="text-[#E53935] underline text-sm">다시 검사하기</Link>
        </div>
      </div>
    );
  }

  const trackName = TRACK_NAMES[result.competencyTrack] || result.competencyTrack;
  const stageLabel = STAGE_INFO[result.journeyStage]?.label || '발견 단계';
  const formattedDate = new Date(result.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  // 인성 레이더 차트 데이터 (dark 제외)
  const personalityData = Object.entries(result.personalityScores)
    .filter(([k]) => !k.includes('dark'))
    .map(([k, v]) => ({ label: PERSONALITY_NAMES[k] || k, value: v as number }));

  // 모듈 카테고리별
  const personalityMods = Object.entries(reportModules).filter(([k]) => /^(EMOTIONAL|ETHICS|GROWTH|INTEGRITY|RELATION)/.test(k));
  const riasecMods = Object.entries(reportModules).filter(([k]) => k.startsWith('RIASEC-'));
  const compMods = Object.entries(reportModules).filter(([k]) => k.startsWith('COMP-'));
  const readyMods = Object.entries(reportModules).filter(([k]) => k.startsWith('READY-'));

  return (
    <div className="hit-report-container mx-auto max-w-[210mm] px-8 py-10 print:pb-0">
      {/* ── 상단 버튼 ── */}
      <div className="no-print flex items-center justify-between mb-8">
        <Link href={`/hero/hit/b/result/${resultId}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700">
          <ArrowLeft className="h-4 w-4" /> 결과 페이지로 돌아가기
        </Link>
        <div className="flex items-center gap-2">
          <HitModelGuideModal />
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
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">HIT B 결과 보고서</h1>
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
            <span className="text-2xl font-extrabold text-[#E53935]">{result.hollandCode}</span>
            <span className="text-lg font-bold text-neutral-900">{trackName}</span>
          </div>
          <p className="text-xs text-neutral-400 mb-4">
            {stageLabel} · 준비도 {result.readinessGrade}등급 ({result.readinessTotal}%)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-[15px] text-neutral-600">
            <div><span className="text-xs text-neutral-400 block">Holland</span>{result.hollandCode}</div>
            <div><span className="text-xs text-neutral-400 block">트랙</span>{trackName}</div>
            <div><span className="text-xs text-neutral-400 block">준비도</span>{result.readinessGrade}등급 ({result.readinessTotal}%)</div>
            <div><span className="text-xs text-neutral-400 block">여정</span>{stageLabel}</div>
          </div>
        </div>
      </section>

      {/* ══ Section 2: 성격 특성 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">성격 특성</h2>
        {personalityData.length > 0 && (
          <div className="border border-neutral-200 rounded-xl p-6 flex justify-center mb-8">
            <RadarChart data={personalityData.slice(0, 8)} size={280} />
          </div>
        )}
        {/* 해설은 5영역 집계 (성실성/대인관계/정서/윤리/성장) — 차트의 8개 raw 속성을 그룹핑한 것 */}
        {personalityMods.length > 0 && personalityMods.map(([id, m]) => (
          <div key={id} className="mb-7 border-l-2 border-neutral-300 pl-4">
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
      </section>

      {/* ══ Section 3: 직업 흥미 RIASEC ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">직업 흥미 (RIASEC)</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <RIASECChart r={result.riasecR} i={result.riasecI} a={result.riasecA} s={result.riasecS} e={result.riasecE} c={result.riasecC} hollandCode={result.hollandCode} />
        </div>
        {riasecMods.length > 0 && riasecMods.map(([id, m]) => (
          <div key={id} className="mb-7 border-l-2 border-purple-400 pl-4">
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
      </section>

      {/* ══ Section 4: 역량 진단 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">역량 진단</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <CompetencyChart common={result.competencyCommon} trackScores={result.competencyTrackScores} trackName={trackName} />
        </div>
        {compMods.length > 0 && compMods.map(([id, m]) => {
          const isA = id.endsWith('-A');
          const isD = id.endsWith('-D');
          const borderColor = isA ? 'border-green-400' : isD ? 'border-red-300' : 'border-neutral-300';
          return (
            <div key={id} className={`mb-7 border-l-2 ${borderColor} pl-4`}>
              <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
              <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
            </div>
          );
        })}
      </section>

      {/* ══ Section 5: 커리어 준비도 ══ */}
      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">커리어 준비도</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8">
          <ReadinessGauge
            self={result.readinessSelf} portfolio={result.readinessPortfolio}
            interview={result.readinessInterview} network={result.readinessNetwork}
            total={result.readinessTotal} grade={result.readinessGrade}
            gaps={result.readinessGaps}
          />
        </div>
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
        className="no-print fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-[#E53935] text-white font-bold rounded-full shadow-lg hover:bg-red-700 hover:shadow-xl transition-all hover:scale-105"
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
