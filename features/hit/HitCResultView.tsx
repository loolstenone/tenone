"use client";

/** HIT C "진입" 결과 — 결과 페이지(화면)와 보고서(인쇄) 공용 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Printer } from "lucide-react";
import { StageChecklistCard } from "@/features/hero/StageChecklistCard";
import { HIT_STAGES } from "@/lib/hit/stages";
import { READINESS_LABELS, ONBOARDING_LABELS } from "@/lib/hit/scoring-c";
import { cleanMarkdown } from "@/features/hit/hit-b-result-mapper";

interface CResult {
  id: string;
  readiness_scores: Record<string, number>;
  readiness_total: number;
  readiness_grade: string;
  readiness_gaps: string[];
  checklist_percent: number | null;
  onboarding_scores: Record<string, number>;
  onboarding_total: number;
  career_decision: number;
  ai_report: string | null;
  journey_stage: string;
  track_id: string | null;
  created_at: string;
  report_modules?: { id: string; title: string; content: string }[];
}

const STAGE_LABEL: Record<string, string> = { ready: '출발 준비 완료', developing: '준비 진행 중', exploring: '탐색 단계', discovering: '발견 단계' };

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1"><span className="text-neutral-700">{label}</span><span className="font-bold text-neutral-900">{value}</span></div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-[#E53935] rounded-full" style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export default function HitCResultView({ resultId, print = false }: { resultId: string; print?: boolean }) {
  const [r, setR] = useState<CResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hit/c/result/${resultId}`).then(x => x.json()).then(d => { if (!d.error) setR(d); setLoading(false); }).catch(() => setLoading(false));
  }, [resultId]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" /></div>;
  if (!r) return <div className="min-h-[60vh] flex items-center justify-center text-center"><div><p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p><Link href="/hero/hit/c" className="text-[#E53935] underline text-sm">다시 검사하기</Link></div></div>;

  const date = new Date(r.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className={`mx-auto ${print ? 'max-w-[210mm] px-8 py-10' : 'max-w-2xl px-6 py-8'}`}>
      {print && (
        <div className="no-print flex items-center justify-between mb-8">
          <Link href={`/hero/hit/c/result/${resultId}`} className="text-sm text-neutral-500 hover:text-neutral-700">← 결과 페이지로</Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700"><Printer className="h-4 w-4" /> 인쇄 / PDF</button>
        </div>
      )}
      <div className="text-center mb-8">
        <Image src="/hero-logo.png" alt="HeRo" width={48} height={48} className="h-12 w-12 mx-auto mb-3" />
        <p className="text-[11px] font-semibold text-neutral-400 tracking-wide mb-1">{HIT_STAGES.c.code}</p>
        <h1 className="text-2xl md:text-3xl font-extrabold">{HIT_STAGES.c.name}</h1>
        <p className="text-xs text-neutral-400 mt-2">{date}</p>
        <span className="inline-block mt-4 px-5 py-2 rounded-full text-sm font-bold bg-red-50 text-[#E53935]">{STAGE_LABEL[r.journey_stage] ?? r.journey_stage}</span>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-1">취업 준비 상태 <span className="text-sm font-medium text-neutral-400">자기 인식 {r.readiness_total} · {r.readiness_grade}</span></h2>
        <p className="text-xs text-neutral-500 mb-4">실제 완료는 아래 체크리스트가 셉니다{typeof r.checklist_percent === 'number' ? ` (검사 당시 ${r.checklist_percent}%)` : ''}.</p>
        <div className="space-y-3 border border-neutral-200 rounded-xl p-5">
          {Object.entries(r.readiness_scores).map(([k, v]) => <Bar key={k} label={READINESS_LABELS[k] ?? k} value={v} />)}
        </div>
        {r.readiness_gaps?.length > 0 && <p className="text-xs text-neutral-500 mt-2">보완 영역: {r.readiness_gaps.join(' · ')}</p>}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">첫 직무 적응 <span className="text-sm font-medium text-neutral-400">{r.onboarding_total}</span></h2>
        <div className="space-y-3 border border-neutral-200 rounded-xl p-5">
          {Object.entries(r.onboarding_scores).map(([k, v]) => <Bar key={k} label={ONBOARDING_LABELS[k] ?? k} value={v} />)}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-4">진로 결정 확신</h2>
        <div className="border border-neutral-200 rounded-xl p-5"><Bar label="첫 직무를 분명히, 내 판단으로 정했는가" value={r.career_decision} /></div>
      </section>

      {(r.report_modules ?? []).length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-1">HeRo 해설</h2>
          <p className="text-xs text-neutral-500 mb-4">점수 구간에 따라 미리 작성·검수된 해설이 선택됩니다.</p>
          <div className="space-y-5">{(r.report_modules ?? []).map(m => (
            <div key={m.id} className="border-l-2 border-neutral-300 pl-4"><p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p><p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p></div>
          ))}</div>
        </section>
      )}

      {r.ai_report && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Image src="/hero-logo-wide.png" alt="" width={24} height={12} className="h-3.5 w-auto opacity-50" /> 종합 해설 (AI 보조)</h2>
          <div className="bg-neutral-50 p-5 rounded-xl"><p className="text-sm text-neutral-700 leading-[1.8] whitespace-pre-line">{cleanMarkdown(r.ai_report)}</p></div>
        </section>
      )}

      {!print && (
        <>
          <section className="mb-8"><StageChecklistCard stage="c" compact /></section>
          <section className="space-y-3">
            <Link href={`/hero/hit/c/report/${resultId}`} className="block border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors"><div className="flex items-center gap-3"><div className="flex-1"><p className="font-bold text-neutral-800">보고서 보기 · 인쇄</p></div><ArrowRight className="h-4 w-4 text-neutral-400" /></div></Link>
            <Link href="/hero/journey" className="block border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors"><div className="flex items-center gap-3"><div className="flex-1"><p className="font-bold text-neutral-800">나의 저니로</p><p className="text-xs text-neutral-500 mt-0.5">목표·체크인·체크리스트</p></div><ArrowRight className="h-4 w-4 text-neutral-400" /></div></Link>
          </section>
        </>
      )}
    </div>
  );
}
