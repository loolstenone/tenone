"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Printer, ArrowLeft, Sparkles } from "lucide-react";
import HitModelGuideModal from "@/features/hit/HitModelGuideModal";
import RIASECChart from "@/features/hit/RIASECChart";
import CompetencyChart from "@/features/hit/CompetencyChart";
import InterestEfficacyMatrix from "@/features/hit/InterestEfficacyMatrix";
import { mapHitBResult, B_STAGE_INFO, cleanMarkdown } from "@/features/hit/hit-b-result-mapper";
import { HIT_STAGES } from "@/lib/hit/stages";
import type { HitBResult } from "@/types/hit";

export default function HitBReportPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<(HitBResult & { trackName: string }) | null>(null);
  const [reportModules, setReportModules] = useState<Record<string, { title: string; content: string }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId) return;
    fetch(`/api/hit/b/result/${resultId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoading(false); return; }
        setResult(mapHitBResult(data));
        if (data.report_modules) setReportModules(data.report_modules);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resultId]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" /></div>;
  if (!result) {
    return <div className="min-h-[60vh] flex items-center justify-center text-center"><div><p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p><Link href="/hero/hit/b" className="text-[#E53935] underline text-sm">다시 검사하기</Link></div></div>;
  }

  const stageLabel = B_STAGE_INFO[result.journeyStage]?.label || '발견 단계';
  const formattedDate = new Date(result.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  const compMods = Object.entries(reportModules).filter(([k]) => k.startsWith('COMP-'));
  const eff = result.efficacyScores;

  return (
    <div className="hit-report-container mx-auto max-w-[210mm] px-8 py-10 print:pb-0">
      <div className="no-print flex items-center justify-between mb-8">
        <Link href={`/hero/hit/b/result/${resultId}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700"><ArrowLeft className="h-4 w-4" /> 결과 페이지로 돌아가기</Link>
        <div className="flex items-center gap-2">
          <HitModelGuideModal />
          <Link href={`/hero/coaching/ai?resultId=${resultId}`} className="inline-flex items-center gap-2 px-4 py-2 border border-[#E53935] text-[#E53935] text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"><Sparkles className="h-4 w-4" /> AI 상담</Link>
          <button onClick={() => window.print()} className="print-keep inline-flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors"><Printer className="h-4 w-4" /> 인쇄 / PDF</button>
        </div>
      </div>

      <section>
        <div className="border-b-2 border-[#E53935] pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image src="/hero-logo.png" alt="HeRo" width={56} height={56} className="h-14 w-14 object-contain" />
              <div>
                <p className="text-xs font-bold text-[#E53935] uppercase tracking-[0.2em] mb-1">HeRo Integrated Test</p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900">{HIT_STAGES.b.name} 보고서</h1>
                <p className="text-[11px] text-neutral-400 mt-1">{HIT_STAGES.b.code}</p>
              </div>
            </div>
            <div className="text-right text-xs text-neutral-400"><p>{formattedDate}</p><p className="mt-1 font-mono text-[10px]">ID: {resultId.slice(0, 8)}</p></div>
          </div>
        </div>
        <div className="border-l-[3px] border-[#E53935] pl-6 mb-8">
          <div className="flex items-baseline gap-3 mb-1"><span className="text-2xl font-extrabold text-neutral-900">{result.trackName}</span><span className="text-lg font-bold text-neutral-900">효능감 {result.efficacyTop3}</span></div>
          <p className="text-xs text-neutral-400 mb-4">{stageLabel}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-[15px] text-neutral-600">
            <div><span className="text-xs text-neutral-400 block">트랙</span>{result.trackName}</div>
            <div><span className="text-xs text-neutral-400 block">효능감 Top3</span>{result.efficacyTop3}</div>
            <div><span className="text-xs text-neutral-400 block">자기·직무 이해</span>{result.insightTotal}</div>
            <div><span className="text-xs text-neutral-400 block">단계</span>{stageLabel}</div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">역량 진단</h2>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8"><CompetencyChart common={result.competencyCommon} trackScores={result.competencyTrackScores} trackName={result.trackName} /></div>
        {compMods.map(([id, m]) => (
          <div key={id} className={`mb-7 border-l-2 ${id.endsWith('-A') ? 'border-green-400' : id.endsWith('-D') ? 'border-red-300' : 'border-neutral-300'} pl-4`}>
            <p className="text-[15px] font-semibold text-neutral-800 mb-2">{m.title}</p>
            <p className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-bold mb-2 pt-8 border-t-2 border-neutral-200">효능감 × 흥미</h2>
        <p className="text-sm text-neutral-500 mb-8">"끌린다"(HIT A 흥미)와 "할 수 있다"(HIT B 효능감)를 겹친 6유형 매트릭스</p>
        <div className="border border-neutral-200 rounded-xl p-6 mb-8"><RIASECChart r={eff.R ?? 0} i={eff.I ?? 0} a={eff.A ?? 0} s={eff.S ?? 0} e={eff.E ?? 0} c={eff.C ?? 0} hollandCode={result.efficacyTop3} /></div>
        <InterestEfficacyMatrix matrix={result.matrix} efficacy={eff} />
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200">자기·직무 이해</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-neutral-200 rounded-xl p-6"><p className="text-xs text-neutral-400">자기 이해</p><p className="text-3xl font-extrabold mt-1">{result.insightSelf}</p></div>
          <div className="border border-neutral-200 rounded-xl p-6"><p className="text-xs text-neutral-400">직무 이해</p><p className="text-3xl font-extrabold mt-1">{result.insightJob}</p></div>
        </div>
      </section>

      {result.aiReport && (
        <section className="mt-16">
          <h2 className="text-xl font-bold mb-8 pt-8 border-t-2 border-neutral-200 flex items-center gap-2"><Image src="/hero-logo-wide.png" alt="" width={28} height={14} className="h-4 w-auto" /> HeRo의 종합 분석</h2>
          <div className="space-y-4">{result.aiReport.split('\n').filter(p => p.trim()).map((p, i) => <p key={i} className="text-[15px] text-neutral-600 leading-[1.8]">{cleanMarkdown(p)}</p>)}</div>
        </section>
      )}

      <div className="mt-16 pt-6 border-t border-neutral-200 flex items-center justify-center gap-3">
        <Image src="/hero-logo-wide.png" alt="HeRo" width={48} height={24} className="h-5 w-auto opacity-30" />
        <p className="text-xs text-neutral-300">HeRo Integrated Test (HIT) | Ten:One™ Universe | {formattedDate}</p>
      </div>
      <Link href={`/hero/coaching/ai?resultId=${resultId}`} className="no-print fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3 bg-neutral-900 text-white font-bold rounded-full shadow-lg hover:bg-neutral-700 hover:shadow-xl transition-all hover:scale-105"><Sparkles className="h-5 w-5" /> AI 상담</Link>
    </div>
  );
}
