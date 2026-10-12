"use client";

/**
 * 생애주기·상황 검사(D 전환 · E 리더십 · F 2막 · GAP 복귀) 결과 화면 — 결과 페이지와 보고서(인쇄) 공용 (2026-10-12)
 *
 * 화면이 읽는 필드 = 채점 API가 저장하는 컬럼 (app/api/hit/{x}/score). 옛 결과 페이지는 저장하지 않는 필드를 읽어
 * 점수가 전부 0으로 보이거나(D) 유형 라벨이 비는(E·F) 문제가 있었다.
 * 해설은 규칙 기반 리포트 모듈(lib/hit/stage-report-modules.ts)이 주, AI 문단은 보조.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Printer, ShieldCheck } from "lucide-react";
import { StageChecklistCard } from "@/features/hero/StageChecklistCard";
import { HIT_STAGES } from "@/lib/hit/stages";
import { cleanMarkdown } from "@/features/hit/hit-b-result-mapper";

type StageKey = "d" | "e" | "f" | "gap";
type Row = Record<string, any>;
interface Item { label: string; value: number }
interface Section { title: string; caption?: string; items: Item[]; headline?: string }

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0);
const items = (obj: Row | null | undefined, labels: Record<string, string>): Item[] =>
  Object.entries(labels).filter(([k]) => obj && k in obj).map(([k, label]) => ({ label, value: n(obj![k]) }));

const JOURNEY: Record<StageKey, Record<string, string>> = {
  d: { ready_to_leap: "도약 준비 완료", almost_ready: "거의 준비됨", urgent_but_unprepared: "급하지만 준비가 더 필요", building_foundation: "기반을 다지는 중", exploring: "탐색 단계", early_awareness: "초기 인식" },
  e: { ready_for_transition: "전환 준비 완료", almost_ready: "거의 준비됨", building_bridge: "브릿지 구축 중", deepening_expertise: "전문성 심화 중", exploring_options: "옵션 탐색 중", early_reflection: "초기 성찰 단계" },
  f: { ready_to_launch: "2막 시작 준비 완료", almost_ready: "거의 준비됨", direction_found: "방향이 잡힘", exploring: "탐색 중", needs_reflection: "성찰 필요", early_awareness: "초기 인식" },
  gap: { ready_to_return: "복귀 준비 완료", skill_ready_prep_needed: "역량은 준비됨 · 실행 준비 필요", strategic_transition: "전략적 전환 단계", resilience_building: "회복탄력성 강화 단계", foundation_rebuilding: "기반 재구축 단계", early_recovery: "초기 회복 단계" },
};

function sectionsFor(stage: StageKey, r: Row): { sections: Section[]; badges: string[]; extra?: React.ReactNode } {
  switch (stage) {
    case "d": {
      const mt: Record<string, string> = { push_driven: "이탈 요인(Push) 우세", pull_driven: "유인 요인(Pull) 우세", balanced: "균형" };
      return {
        badges: [mt[r.motivation_type] ?? "", r.target_job ? `희망 직무: ${r.target_job}` : ""].filter(Boolean),
        sections: [
          { title: "경력 자본", items: items(r.capital_scores, { domain_expertise: "도메인 전문성", achievement: "성과", relational: "관계 자본", transferable: "이전 가능 역량" }) },
          { title: "이직 동기", items: [{ label: "이탈 요인 (Push)", value: n(r.motivation_push) }, { label: "유인 요인 (Pull)", value: n(r.motivation_pull) }] },
          { title: "전환 가능성", headline: `전환 가능성 지수 ${n(r.transferability_index)}`, items: items(r.transferability_scores, { skill_transfer: "역량 이전", market_fit: "시장 적합", adaptation: "적응력" }) },
          { title: "이직 준비", caption: "검사가 아니라 준비 체크리스트 완료율입니다", headline: `전환 준비도 ${n(r.transition_readiness)}`, items: items(r.readiness_scores, { doc: "서류", interview: "면접", timing: "타이밍", psychological: "지지·확신" }) },
        ],
        extra: Array.isArray(r.gap_areas) && r.gap_areas.length > 0 ? (
          <div className="border border-neutral-200 rounded-xl p-5">
            <p className="text-sm font-bold mb-2">보완할 영역</p>
            <ul className="list-disc pl-5 text-sm text-neutral-600 space-y-1">{r.gap_areas.map((g: string) => <li key={g}>{g}</li>)}</ul>
          </div>
        ) : null,
      };
    }
    case "e": {
      const lt: Record<string, string> = { exec_leadership: "실행형 리더", strategic_leadership: "전략형 리더", coaching_leadership: "코치형 리더", independent_leadership: "독립형 전문가" };
      const roles = (r.next_role_matrix?.possible_roles ?? []) as { code: string; role: string; fit_score: number; description: string }[];
      return {
        badges: [lt[r.leadership_type] ?? "", r.next_role_matrix?.current_role ? `현재 위치: ${r.next_role_matrix.current_role}` : ""].filter(Boolean),
        sections: [
          { title: "전문성 자산", items: items(r.expertise_domains, { domain_depth: "도메인 깊이", tacit_knowledge: "암묵지", redeployment: "재배치 가능성", personal_brand: "퍼스널 브랜드" }) },
          { title: "리더십 유형", items: items(r.leadership_scores, { exec_leadership: "실행형", strategic_leadership: "전략형", coaching_leadership: "코치형", independent_leadership: "독립형" }) },
          { title: "정체성 · 네트워크", items: [{ label: "정체성 유연성", value: n(r.identity_flexibility) }, { label: "강한 연결 (신뢰 관계)", value: n(r.network_quality) }, { label: "약한 연결 (폭)", value: n(r.network_breadth) }] },
          { title: "전환 준비", caption: "검사가 아니라 준비 체크리스트 완료율입니다", items: [{ label: "전환 준비도", value: n(r.senior_readiness) }] },
        ],
        extra: roles.length > 0 ? (
          <div className="border border-neutral-200 rounded-xl p-5">
            <p className="text-sm font-bold mb-3">차기 역할 적합도</p>
            <div className="space-y-3">
              {roles.slice(0, 5).map(role => (
                <div key={role.code}>
                  <div className="flex items-center justify-between text-sm"><span className="font-semibold text-neutral-800">{role.role}</span><span className="text-neutral-500">{n(role.fit_score)}</span></div>
                  <p className="text-xs text-neutral-500 mt-0.5">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null,
      };
    }
    case "f": {
      const dt: Record<string, string> = { re_employment: "재취업형", entrepreneurship: "창업·독립형", social_contribution: "사회 공헌형", mentoring: "멘토링·교육형", leisure: "여가·자기실현형" };
      return {
        badges: [dt[r.direction_type] ?? ""].filter(Boolean),
        sections: [
          { title: "삶과 열정", items: [{ label: "삶의 만족도", value: n(r.life_satisfaction) }, { label: "잔여 열정", value: n(r.remaining_passion) }, { label: "심리적 전환", value: n(r.psych_transition) }] },
          { title: "2막 방향", items: items(r.direction_scores, { re_employment: "재취업", entrepreneurship: "창업·독립", social_contribution: "사회 공헌", mentoring: "멘토링·교육", leisure: "여가·자기실현" }) },
          { title: "레거시 · 사회적 연결", headline: `레거시 역량 ${n(r.legacy_skill_score)}`, items: [...items(r.legacy_scores, { transferable_legacy: "이전 가능한 경험", knowledge_transfer: "지식 전수", new_capability: "새 역량 의지" }), ...items(r.social_scores, { belonging: "소속 욕구", role_necessity: "역할 필요" })] },
          { title: "2막 준비", caption: "검사가 아니라 준비 체크리스트 완료율입니다", headline: `2막 준비도 ${n(r.second_act_readiness)}`, items: items(r.readiness_scores, { finance: "재정", time: "시간", energy: "건강", relationship: "관계" }) },
        ],
      };
    }
    case "gap": {
      const route: Record<string, string> = { R: "기존 경력으로 복귀", C: `${HIT_STAGES.d.name} 추천`, B: `${HIT_STAGES.b.name}부터 점검` };
      const cvi: Record<string, string> = { HIGH: "경력 유효성 높음", MID: "경력 유효성 보통", LOW: "경력 유효성 낮음" };
      return {
        badges: [cvi[r.cvi_grade] ?? "", route[r.next_route] ? `추천 경로: ${route[r.next_route]}` : "", r.break_months ? `공백 ${n(r.break_months)}개월` : ""].filter(Boolean),
        sections: [
          { title: "경력 유효성 (CVI)", headline: `CVI ${n(r.cvi_raw)}`, caption: "직무 유효성 35% · 스킬 현재성 35% · 시장 재진입 30% 가중", items: items(r.latent_scores, { job_viability: "직무 유효성", skill_currency: "스킬 현재성", market_reentry: "시장 재진입" }) },
          { title: "회복탄력성", items: items(r.resilience_scores, { self_narrative: "자기 서사", self_esteem: "자존감", retry_willingness: "재도전 의지" }) },
          { title: "복귀 방향", items: items(r.direction_scores, { career_restoration: "경력 복원", career_pivot: "경력 전환", fresh_start: "새 출발" }) },
          { title: "복귀 준비", caption: "검사가 아니라 준비 체크리스트 완료율입니다", headline: `재진입 준비도 ${n(r.reentry_readiness)}`, items: items(r.readiness_scores, { skill_update: "스킬", network: "네트워크", self_presentation: "자기 표현", field_language: "현장 감각" }) },
        ],
        extra: r.routing_rationale ? <div className="bg-neutral-50 rounded-xl p-5 text-sm text-neutral-700 leading-relaxed">{r.routing_rationale}</div> : null,
      };
    }
  }
}

function Bar({ label, value }: Item) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1"><span className="text-neutral-700">{label}</span><span className="font-bold text-neutral-900">{value}</span></div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-[#E53935] rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
    </div>
  );
}

export default function StageResultView({ stage, resultId, print = false }: { stage: StageKey; resultId: string; print?: boolean }) {
  const [r, setR] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const def = HIT_STAGES[stage];

  useEffect(() => {
    fetch(`/api/hit/${stage}/result/${resultId}`).then(x => x.json()).then(d => { if (!d.error) setR(d); setLoading(false); }).catch(() => setLoading(false));
  }, [stage, resultId]);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><div className="h-10 w-10 border-2 border-neutral-200 border-t-[#E53935] rounded-full animate-spin" /></div>;
  if (!r) return <div className="min-h-[60vh] flex items-center justify-center text-center"><div><p className="text-neutral-400 mb-4">결과를 찾을 수 없습니다.</p><Link href={`/hero/hit/${stage}`} className="text-[#E53935] underline text-sm">다시 검사하기</Link></div></div>;

  const { sections, badges, extra } = sectionsFor(stage, r);
  const modules = (r.report_modules ?? []) as { id: string; title: string; content: string }[];
  const date = r.created_at ? new Date(r.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "";
  const journey = JOURNEY[stage][r.journey_stage] ?? null;

  return (
    <div className={`mx-auto ${print ? "max-w-[210mm] px-8 py-10" : "max-w-2xl px-6 py-8"}`}>
      {print && (
        <div className="no-print flex items-center justify-between mb-8">
          <Link href={`/hero/hit/${stage}/result/${resultId}`} className="text-sm text-neutral-500 hover:text-neutral-700">← 결과 페이지로</Link>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 bg-[#E53935] text-white text-sm font-medium rounded-xl hover:bg-red-700"><Printer className="h-4 w-4" /> 인쇄 / PDF</button>
        </div>
      )}

      <div className="text-center mb-8">
        <Image src="/hero-logo.png" alt="HeRo" width={48} height={48} className="h-12 w-12 mx-auto mb-3" />
        <p className="text-[11px] font-semibold text-neutral-400 tracking-wide mb-1">{def.code}{def.group === "situation" ? " · 상황 모듈" : ""}</p>
        <h1 className="text-2xl md:text-3xl font-extrabold break-keep">{def.name}</h1>
        {date && <p className="text-xs text-neutral-400 mt-2">{date}</p>}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {journey && <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-red-50 text-[#E53935]">{journey}</span>}
          {badges.map(b => <span key={b} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">{b}</span>)}
        </div>
      </div>

      <div className="space-y-6 mb-8">
        {sections.filter(s => s.items.length > 0).map(s => (
          <section key={s.title}>
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-lg font-bold">{s.title}</h2>
              {s.headline && <span className="text-sm font-semibold text-neutral-500">{s.headline}</span>}
            </div>
            {s.caption && <p className="text-xs text-neutral-500 mb-2">{s.caption}</p>}
            <div className="space-y-3 border border-neutral-200 rounded-xl p-5">{s.items.map(it => <Bar key={it.label} {...it} />)}</div>
          </section>
        ))}
        {extra}
      </div>

      {modules.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-1">HeRo 해설</h2>
          <p className="text-xs text-neutral-500 mb-4">점수 구간에 따라 미리 작성·검수된 해설이 선택됩니다. 같은 점수에는 언제나 같은 해설이 나옵니다.</p>
          <div className="space-y-5">
            {modules.map(m => (
              <div key={m.id} className="border-l-2 border-neutral-300 pl-4">
                <p className="text-[15px] font-semibold text-neutral-800 mb-1">{m.title}</p>
                <p className="text-sm text-neutral-600 leading-[1.8]">{cleanMarkdown(m.content)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {r.ai_report && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-2"><Image src="/hero-logo-wide.png" alt="" width={24} height={12} className="h-3.5 w-auto opacity-50" /> 종합 해설 (AI 보조)</h2>
          <p className="text-[11px] text-neutral-400 mb-3">위 점수를 바탕으로 AI가 쓴 읽기용 요약입니다. 점수·유형·등급을 바꾸지 않습니다.</p>
          <div className="bg-neutral-50 p-5 rounded-xl"><p className="text-sm text-neutral-700 leading-[1.8] whitespace-pre-line">{cleanMarkdown(String(r.ai_report))}</p></div>
        </section>
      )}

      {!print && (
        <>
          <section className="mb-8"><StageChecklistCard stage={stage} compact /></section>
          <section className="space-y-3">
            <Link href={`/hero/hit/${stage}/report/${resultId}`} className="block border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors"><div className="flex items-center gap-3"><p className="flex-1 font-bold text-neutral-800">보고서 보기 · 인쇄</p><ArrowRight className="h-4 w-4 text-neutral-400" /></div></Link>
            <Link href="/hero/hit/method" className="block border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-neutral-400" /><div className="flex-1"><p className="font-bold text-neutral-800">이 결과는 어떻게 만들어졌나요</p><p className="text-xs text-neutral-500 mt-0.5">HIT 엔진 — 채점·해설·품질 관리</p></div><ArrowRight className="h-4 w-4 text-neutral-400" /></div></Link>
            <Link href="/hero/journey" className="block border border-neutral-200 rounded-xl p-4 hover:bg-neutral-50 transition-colors"><div className="flex items-center gap-3"><p className="flex-1 font-bold text-neutral-800">나의 저니로</p><ArrowRight className="h-4 w-4 text-neutral-400" /></div></Link>
          </section>
        </>
      )}
    </div>
  );
}
