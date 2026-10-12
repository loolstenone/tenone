"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Users, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import RIASECChart from "@/features/hit/RIASECChart";
import CompetencyChart from "@/features/hit/CompetencyChart";
import InterestEfficacyMatrix from "@/features/hit/InterestEfficacyMatrix";
import HeroChatPanel from "@/features/hit/HeroChatPanel";
import { getHeroGreeting } from "@/lib/hit/hero-agent-system";
import { mapHitBResult, B_STAGE_INFO, cleanMarkdown } from "@/features/hit/hit-b-result-mapper";
import { CORE_COMPETENCY_LABELS, type CoreCompetency } from "@/lib/hit/scoring-b";
import { HIT_STAGES, HIT_LIFE_STAGES, HIT_SITUATIONS } from "@/lib/hit/stages";
import type { HitBResult } from "@/types/hit";

const TOTAL_PAGES = 5;
const PAGE_LABELS = ["요약", "역량", "효능감 × 흥미", "자기·직무 이해", "다음 단계"];

export default function HitBResultPage() {
  const params = useParams();
  const resultId = params.id as string;
  const [result, setResult] = useState<(HitBResult & { trackName: string }) | null>(null);
  const [reportModules, setReportModules] = useState<Record<string, { title: string; content: string }>>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

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

  const goNext = useCallback(() => { if (currentPage < TOTAL_PAGES - 1) setCurrentPage(p => p + 1); }, [currentPage]);
  const goPrev = useCallback(() => { if (currentPage > 0) setCurrentPage(p => p - 1); }, [currentPage]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" /></div>;
  }
  if (!result) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center">
        <div><p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p><Link href="/hero/hit/b" className="text-[#E53935] underline text-sm">다시 검사하기</Link></div>
      </div>
    );
  }

  const stageInfo = B_STAGE_INFO[result.journeyStage] || B_STAGE_INFO.discovering;
  const compMods = Object.entries(reportModules).filter(([k]) => k.startsWith('COMP-'));
  const topCore = (Object.entries(result.competencyCommon) as [CoreCompetency, number][]).sort((a, b) => b[1] - a[1])[0];
  const eff = result.efficacyScores;

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return (
          <div key="p0">
            <div className="text-center mb-6">
              <Image src="/hero-logo.png" alt="HeRo" width={48} height={48} className="h-12 w-12 mx-auto mb-3" />
              <p className="text-[11px] font-semibold text-neutral-400 tracking-wide mb-1">{HIT_STAGES.b.code}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">{HIT_STAGES.b.name}</h1>
            </div>
            <div className="flex justify-center mb-6"><span className={`px-5 py-2.5 rounded-full text-sm font-bold ${stageInfo.color}`}>{stageInfo.label}</span></div>
            <div className="bg-neutral-50 p-5 rounded-xl space-y-2 text-sm text-neutral-600">
              <p><span className="font-bold">가장 강한 역량:</span> {topCore ? `${CORE_COMPETENCY_LABELS[topCore[0]] ?? topCore[0]} ${topCore[1]}` : '-'}</p>
              <p><span className="font-bold">직무 트랙:</span> {result.trackName}</p>
              <p><span className="font-bold">효능감 Top3:</span> {result.efficacyTop3 || '-'}</p>
              {result.matrix && result.matrix.optimal.length > 0 && <p><span className="font-bold">최적 영역:</span> {result.matrix.optimal.join(' · ')}</p>}
              <p><span className="font-bold">자기·직무 이해:</span> {result.insightTotal}</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div key="p1">
            <h2 className="text-lg font-bold mb-4">역량</h2>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <CompetencyChart common={result.competencyCommon} trackScores={result.competencyTrackScores} trackName={result.trackName} />
            </div>
            {compMods.length > 0 && (
              <div className="space-y-5">
                {compMods.map(([id, m]) => (
                  <div key={id} className={`border-l-2 ${id.endsWith('-A') ? 'border-green-400' : id.endsWith('-D') ? 'border-red-300' : 'border-neutral-300'} pl-4`}>
                    <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                    <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div key="p2">
            <h2 className="text-lg font-bold mb-1">효능감 × 흥미</h2>
            <p className="text-xs text-neutral-500 mb-4">"끌린다"(HIT A 흥미)와 "할 수 있다"(효능감)를 겹쳐 보면 중심에 둘 일과 배우면 되는 일이 나뉩니다.</p>
            <div className="border border-neutral-200 rounded-xl p-6 mb-6">
              <RIASECChart r={eff.R ?? 0} i={eff.I ?? 0} a={eff.A ?? 0} s={eff.S ?? 0} e={eff.E ?? 0} c={eff.C ?? 0} hollandCode={result.efficacyTop3} />
            </div>
            <InterestEfficacyMatrix matrix={result.matrix} efficacy={eff} />
          </div>
        );
      case 3:
        return (
          <div key="p3">
            <h2 className="text-lg font-bold mb-4">자기·직무 이해</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[['자기 이해', result.insightSelf, '내 강점·가치·맞는 환경을 아는 정도'], ['직무 이해', result.insightJob, '희망 직무의 일·요구 역량·경로를 아는 정도']].map(([l, v, d]) => (
                <div key={String(l)} className="border border-neutral-200 rounded-xl p-5">
                  <p className="text-xs text-neutral-400">{l}</p>
                  <p className="text-3xl font-extrabold text-neutral-900 mt-1">{v}</p>
                  <p className="text-[11px] text-neutral-500 mt-2 leading-snug">{d}</p>
                </div>
              ))}
            </div>
            {result.aiReport && (
              <div>
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Image src="/hero-logo-wide.png" alt="" width={24} height={12} className="h-3.5 w-auto opacity-50" /> HeRo의 종합 분석
                </h3>
                <div className="bg-neutral-50 p-5 rounded-xl"><p className="text-sm text-neutral-700 leading-[1.8] whitespace-pre-line">{cleanMarkdown(result.aiReport)}</p></div>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div key="p4">
            <h2 className="text-lg font-bold mb-2">다음 단계</h2>
            <p className="text-xs text-neutral-500 mb-5">A·B로 공통 기반이 끝났습니다. 지금 내 상황에 맞는 검사 하나를 고르세요.</p>
            <div className="space-y-3">
              {[...HIT_LIFE_STAGES, ...HIT_SITUATIONS].map(s => (
                <Link key={s.key} href={`/hero/hit/${s.key}?b=${resultId}`} className="block border border-neutral-200 rounded-xl p-4 hover:border-neutral-400 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-neutral-400 tracking-wide">{s.code}{s.group === 'situation' ? ' · 상황 모듈' : ''}</p>
                      <p className="font-bold text-neutral-900">{s.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5 truncate">{s.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  </div>
                </Link>
              ))}
              <Link href={`/hero/hit/b/report/${resultId}`} className="block border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3"><div className="w-10 h-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">PDF</div><div className="flex-1"><p className="font-bold text-neutral-800">전체 보고서 보기</p><p className="text-xs text-neutral-500 mt-0.5">상세 분석 + 인쇄/PDF 저장</p></div><ArrowRight className="h-4 w-4 text-neutral-400" /></div>
              </Link>
              <div className="border border-neutral-200 rounded-xl p-4"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-neutral-400" /><div className="flex-1"><p className="font-bold text-neutral-800">AI 맞춤 상담</p><p className="text-xs text-neutral-500 mt-0.5">A×B 교차 분석, 직무 적합도, 성장 로드맵</p></div><Link href={`/hero/coaching?type=ai&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">시작 →</Link></div></div>
              <div className="border border-neutral-200 rounded-xl p-4"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-neutral-400" /><div className="flex-1"><p className="font-bold text-neutral-800">전문가 대면 상담</p><p className="text-xs text-neutral-500 mt-0.5">HeRo 멘토가 커리어를 함께 설계합니다</p></div><Link href={`/hero/coaching?type=mentor&resultId=${resultId}`} className="text-xs text-[#E53935] font-medium">예약 →</Link></div></div>
              <Link href="/hero/hit/b" className="flex items-center justify-center gap-2 w-full py-2.5 text-xs text-neutral-400 hover:text-neutral-600"><RefreshCw className="h-3 w-3" /> 다시 검사하기</Link>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-lg px-6 py-8 min-h-[70vh] flex flex-col">
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {PAGE_LABELS.map((label, i) => (
          <button key={i} onClick={() => setCurrentPage(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentPage ? 'w-6 bg-[#E53935]' : 'w-1.5 bg-neutral-200 hover:bg-neutral-300'}`} title={label} />
        ))}
      </div>
      <div className="flex-1"><div key={currentPage} style={{ animation: 'fadeIn 0.3s ease-out' }}>{renderPage()}</div></div>
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-100">
        <button onClick={goPrev} disabled={currentPage === 0} className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft className="h-4 w-4" /> 이전</button>
        <span className="text-xs text-neutral-300 font-mono">{currentPage + 1} / {TOTAL_PAGES}</span>
        <button onClick={goNext} disabled={currentPage === TOTAL_PAGES - 1} className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">다음 <ChevronRight className="h-4 w-4" /></button>
      </div>
      <HeroChatPanel
        resultId={resultId}
        mode={result.hitAResultId ? 'AB_FULL' : 'B_ONLY'}
        greeting={getHeroGreeting(result.hitAResultId ? 'AB_FULL' : 'B_ONLY', { hollandCode: result.efficacyTop3, topCompetency: topCore ? CORE_COMPETENCY_LABELS[topCore[0]] : undefined })}
        quickQuestions={result.hitAResultId ? ['직무 적합도 분석', '성격과 역량 연결', '3개월 성장 플랜', '배우면 되는 영역은?'] : ['적성에 맞는 직무는?', '역량 올리려면?', '어디서부터 시작할까?', '효능감이 낮은 이유']}
      />
      <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
