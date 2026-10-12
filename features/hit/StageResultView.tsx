"use client";

/**
 * 생애주기·상황 검사(D 전환 · E 리더십 · F 2막 · GAP 복귀) 결과 — 결과 화면과 보고서(인쇄·PDF) 공용
 * 틀·점수 기준은 features/hit/report/ReportKit (A·B·C와 같음, 2026-10-12 재구성)
 * 화면이 읽는 필드 = 채점 API가 저장하는 컬럼 (app/api/hit/{x}/score). 해설은 규칙 기반 모듈이 주, AI는 보조.
 */
import { useEffect, useState } from "react";
import { HIT_STAGES } from "@/lib/hit/stages";
import { STAGE_DIM_COPY, BAND_INFO, scoreBand } from "@/lib/hit/report-copy";
import {
  ReportShell, ReportHeader, HitChain, SectionNav, Section, KeyFindings, ScoreGuide, ScoreRow,
  ModuleList, AiNarrative, NextLink, ReportFooterNote, LoadingState, NotFoundState, formatDate,
  ReportToolbar, ReportCover, FullReportLink, useReportTitle, isoDay,
} from "@/features/hit/report/ReportKit";
import { HitNextSteps } from "@/features/hit/report/HitNextSteps";

type StageKey = "d" | "e" | "f" | "gap";
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
interface Item { key: string; value: number }
interface Block { id: string; title: string; lead: string; items: Item[]; checklist?: boolean; headline?: string }
interface View {
  journey: Record<string, string>;
  cover: { headline: string; sub: string };
  findings: { label: string; value: string; note: string }[];
  blocks: Block[];
  extra?: React.ReactNode;
}

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : 0);
const pick = (obj: Row | null | undefined, keys: string[]): Item[] => keys.filter(k => obj && k in obj).map(k => ({ key: k, value: n(obj![k]) }));
const top = (items: Item[]) => [...items].sort((a, b) => b.value - a.value)[0];
const L = (k: string) => STAGE_DIM_COPY[k]?.label ?? k;
const CHECKLIST_LEAD = "검사 문항이 아니라, 나의 저니 준비 체크리스트를 얼마나 해 두었는지(완료율)입니다. 체크할수록 올라갑니다.";

function viewFor(stage: StageKey, r: Row): View {
  switch (stage) {
    case "d": {
      const mt: Record<string, string> = { push_driven: "떠나고 싶은 이유가 큼 (Push)", pull_driven: "가고 싶은 곳이 끌림 (Pull)", balanced: "떠날 이유와 끌림이 균형" };
      const capital = pick(r.capital_scores, ["domain_expertise", "achievement", "relational", "transferable"]);
      const best = top(capital);
      return {
        journey: { ready_to_leap: "도약 준비 완료", almost_ready: "거의 준비됨", urgent_but_unprepared: "급하지만 준비가 더 필요", building_foundation: "기반을 다지는 중", exploring: "탐색 단계", early_awareness: "초기 인식" },
        cover: { headline: `전환 가능성 ${n(r.transferability_index)}`, sub: r.target_job ? `희망 직무 ${r.target_job}` : (mt[r.motivation_type] ?? "") },
        findings: [
          { label: "전환 가능성", value: `${n(r.transferability_index)} · ${BAND_INFO[scoreBand(n(r.transferability_index))].label}`, note: "지금의 경력이 새 자리에서 통할 가능성입니다." },
          { label: "이직 동기", value: mt[r.motivation_type] ?? "-", note: `떠날 이유 ${n(r.motivation_push)} · 끌림 ${n(r.motivation_pull)}` },
          { label: "가장 큰 경력 자본", value: best ? `${L(best.key)} ${best.value}` : "-", note: best ? STAGE_DIM_COPY[best.key]?.what ?? "" : "" },
        ],
        blocks: [
          { id: "capital", title: "경력 자본", lead: "지금까지의 경력에서 쌓아 온, 다음 자리로 가져갈 수 있는 자산입니다.", items: capital },
          { id: "motivation", title: "이직 동기", lead: "지금 자리를 떠나고 싶은 이유(Push)와 새 자리에 끌리는 이유(Pull)입니다. 끌림이 클수록 이직 후 만족이 오래갑니다.", items: [{ key: "motivation_push", value: n(r.motivation_push) }, { key: "motivation_pull", value: n(r.motivation_pull) }] },
          { id: "transfer", title: "전환 가능성", lead: "내 역량이 다른 회사·직무로 옮겨 갔을 때 통하는 정도입니다.", items: pick(r.transferability_scores, ["skill_transfer", "market_fit", "adaptation"]), headline: `전환 가능성 지수 ${n(r.transferability_index)}` },
          { id: "ready", title: "이직 준비", lead: CHECKLIST_LEAD, items: pick(r.readiness_scores, ["doc", "interview", "timing", "psychological"]), checklist: true, headline: `전환 준비도 ${n(r.transition_readiness)}` },
        ],
        extra: Array.isArray(r.gap_areas) && r.gap_areas.length > 0 ? (
          <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
            <p className="text-[15px] font-bold text-neutral-900">먼저 보완할 영역</p>
            <ul className="mt-3 space-y-2">{r.gap_areas.map((g: string) => <li key={g} className="flex gap-3 text-[15px] text-neutral-700"><span className="text-neutral-300">—</span>{g}</li>)}</ul>
          </div>
        ) : null,
      };
    }
    case "e": {
      const lt: Record<string, string> = { exec_leadership: "실행형 리더", strategic_leadership: "전략형 리더", coaching_leadership: "코치형 리더", independent_leadership: "독립형 전문가" };
      const roles = (r.next_role_matrix?.possible_roles ?? []) as { code: string; role: string; fit_score: number; description: string }[];
      const expertise = pick(r.expertise_domains, ["domain_depth", "tacit_knowledge", "redeployment", "personal_brand"]);
      const best = top(expertise);
      return {
        journey: { ready_for_transition: "전환 준비 완료", almost_ready: "거의 준비됨", building_bridge: "브릿지 구축 중", deepening_expertise: "전문성 심화 중", exploring_options: "옵션 탐색 중", early_reflection: "초기 성찰 단계" },
        cover: { headline: lt[r.leadership_type] ?? "리더십 전환", sub: roles[0] ? `차기 역할 1순위 ${roles[0].role}` : "" },
        findings: [
          { label: "리더십 유형", value: lt[r.leadership_type] ?? "-", note: STAGE_DIM_COPY[r.leadership_type]?.what ?? "" },
          { label: "가장 잘 맞는 다음 역할", value: roles[0] ? `${roles[0].role} ${n(roles[0].fit_score)}` : "-", note: roles[0]?.description ?? "" },
          { label: "가장 큰 전문성 자산", value: best ? `${L(best.key)} ${best.value}` : "-", note: best ? STAGE_DIM_COPY[best.key]?.what ?? "" : "" },
        ],
        blocks: [
          { id: "expertise", title: "전문성 자산", lead: "오랜 경력이 남긴, 다음 역할에서도 쓸 수 있는 자산입니다.", items: expertise },
          { id: "leadership", title: "리더십 유형", lead: "사람과 일을 이끄는 네 가지 방식 중 어느 쪽이 강한지입니다. 가장 높은 쪽이 나의 리더십 유형입니다.", items: pick(r.leadership_scores, ["exec_leadership", "strategic_leadership", "coaching_leadership", "independent_leadership"]) },
          { id: "identity", title: "정체성 · 네트워크", lead: "직함 없이도 나를 설명할 수 있는지, 그리고 전환을 도와줄 관계가 있는지입니다.", items: [{ key: "identity_flexibility", value: n(r.identity_flexibility) }, { key: "network_quality", value: n(r.network_quality) }, { key: "network_breadth", value: n(r.network_breadth) }] },
          { id: "ready", title: "전환 준비", lead: CHECKLIST_LEAD, items: [{ key: "senior_readiness", value: n(r.senior_readiness) }], checklist: true },
        ],
        extra: roles.length > 0 ? (
          <div className="rounded-2xl border border-neutral-200 px-5 sm:px-6">
            <p className="text-[15px] font-bold text-neutral-900 pt-5">차기 역할 적합도</p>
            {roles.slice(0, 5).map(role => <ScoreRow key={role.code} label={role.role} value={n(role.fit_score)} meaning={role.description} />)}
          </div>
        ) : null,
      };
    }
    case "f": {
      const dt: Record<string, string> = { re_employment: "재취업형", entrepreneurship: "창업·독립형", social_contribution: "사회 공헌형", mentoring: "멘토링·교육형", leisure: "여가·자기실현형" };
      return {
        journey: { ready_to_launch: "2막 시작 준비 완료", almost_ready: "거의 준비됨", direction_found: "방향이 잡힘", exploring: "탐색 중", needs_reflection: "성찰 필요", early_awareness: "초기 인식" },
        cover: { headline: dt[r.direction_type] ?? "인생 2막", sub: `2막 준비도 ${n(r.second_act_readiness)}` },
        findings: [
          { label: "2막 방향", value: dt[r.direction_type] ?? "-", note: STAGE_DIM_COPY[r.direction_type]?.what ?? "" },
          { label: "남아 있는 열정", value: `${n(r.remaining_passion)} · ${BAND_INFO[scoreBand(n(r.remaining_passion))].label}`, note: STAGE_DIM_COPY.remaining_passion.what },
          { label: "2막 준비도", value: `${n(r.second_act_readiness)}`, note: "재정·시간·건강·관계 준비 체크리스트 완료율입니다." },
        ],
        blocks: [
          { id: "life", title: "삶과 열정", lead: "지금의 삶에 대한 만족, 아직 하고 싶은 일의 크기, 은퇴·퇴직이라는 변화를 받아들이는 정도입니다.", items: [{ key: "life_satisfaction", value: n(r.life_satisfaction) }, { key: "remaining_passion", value: n(r.remaining_passion) }, { key: "psych_transition", value: n(r.psych_transition) }] },
          { id: "direction", title: "2막 방향", lead: "다섯 가지 2막의 모습 중 어디에 마음이 가는지입니다. 높은 두 가지를 함께 설계해 보세요.", items: pick(r.direction_scores, ["re_employment", "entrepreneurship", "social_contribution", "mentoring", "leisure"]) },
          { id: "legacy", title: "레거시 · 사회적 연결", lead: "내 경험을 다음 세대와 새 일에 이어 줄 힘, 그리고 계속 어딘가에 속하고 역할을 맡고 싶은 마음입니다.", items: [...pick(r.legacy_scores, ["transferable_legacy", "knowledge_transfer", "new_capability"]), ...pick(r.social_scores, ["belonging", "role_necessity"])], headline: `레거시 역량 ${n(r.legacy_skill_score)}` },
          { id: "ready", title: "2막 준비", lead: CHECKLIST_LEAD, items: pick(r.readiness_scores, ["finance", "time", "energy", "relationship"]), checklist: true, headline: `2막 준비도 ${n(r.second_act_readiness)}` },
        ],
      };
    }
    case "gap": {
      const route: Record<string, string> = { R: "기존 경력으로 복귀", C: `${HIT_STAGES.d.code}(이직) 검사 추천`, B: `${HIT_STAGES.b.code}(역량과 방향)부터 다시 점검` };
      const cvi: Record<string, string> = { HIGH: "경력이 지금도 잘 통함", MID: "경력이 부분적으로 통함", LOW: "경력 업데이트가 필요함" };
      const res = pick(r.resilience_scores, ["self_narrative", "self_esteem", "retry_willingness"]);
      const bestRes = top(res);
      return {
        journey: { ready_to_return: "복귀 준비 완료", skill_ready_prep_needed: "역량은 준비됨 · 실행 준비 필요", strategic_transition: "전략적 전환 단계", resilience_building: "회복탄력성 강화 단계", foundation_rebuilding: "기반 재구축 단계", early_recovery: "초기 회복 단계" },
        cover: { headline: route[r.next_route] ?? "복귀 설계", sub: r.break_months ? `공백 ${n(r.break_months)}개월 · CVI ${n(r.cvi_raw)}` : `CVI ${n(r.cvi_raw)}` },
        findings: [
          { label: "경력 유효성 (CVI)", value: `${n(r.cvi_raw)} · ${cvi[r.cvi_grade] ?? ""}`, note: "예전 경력이 지금 시장에서 통하는 정도입니다." },
          { label: "추천 복귀 경로", value: route[r.next_route] ?? "-", note: r.break_months ? `공백 ${n(r.break_months)}개월 기준` : "" },
          { label: "가장 단단한 힘", value: bestRes ? `${L(bestRes.key)} ${bestRes.value}` : "-", note: bestRes ? STAGE_DIM_COPY[bestRes.key]?.what ?? "" : "" },
        ],
        blocks: [
          { id: "cvi", title: "경력 유효성 (CVI)", lead: "예전 직무·스킬이 지금도 통하는지입니다. 직무 유효성 35% · 스킬 현재성 35% · 시장 재진입 30%로 계산합니다.", items: pick(r.latent_scores, ["job_viability", "skill_currency", "market_reentry"]), headline: `CVI ${n(r.cvi_raw)}` },
          { id: "resilience", title: "회복탄력성", lead: "공백을 어떻게 이야기하고, 나를 얼마나 믿고, 다시 도전할 마음이 있는지입니다.", items: res },
          { id: "direction", title: "복귀 방향", lead: "원래 경력으로 돌아갈지, 다른 경력으로 옮길지, 완전히 새로 시작할지 — 마음이 가는 쪽입니다.", items: pick(r.direction_scores, ["career_restoration", "career_pivot", "fresh_start"]) },
          { id: "ready", title: "복귀 준비", lead: CHECKLIST_LEAD, items: pick(r.readiness_scores, ["skill_update", "network", "self_presentation", "field_language"]), checklist: true, headline: `재진입 준비도 ${n(r.reentry_readiness)}` },
        ],
        extra: r.routing_rationale ? (
          <div className="rounded-2xl bg-neutral-50 p-5 sm:p-6">
            <p className="text-[15px] font-bold text-neutral-900">추천 경로의 이유</p>
            <p className="text-[15px] text-neutral-700 mt-2 leading-[1.85]">{r.routing_rationale}</p>
          </div>
        ) : null,
      };
    }
  }
}

export default function StageResultView({ stage, resultId, print = false }: { stage: StageKey; resultId: string; print?: boolean }) {
  const [r, setR] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const def = HIT_STAGES[stage];
  const groupLabel = def.group === "situation" ? "상황 모듈" : "생애주기";

  useEffect(() => {
    fetch(`/api/hit/${stage}/result/${resultId}`).then(x => x.json()).then(d => { if (!d.error) setR(d); setLoading(false); }).catch(() => setLoading(false));
  }, [stage, resultId]);

  const view = r ? viewFor(stage, r) : null;
  useReportTitle([`HeRo ${def.code} ${def.name}`, view?.cover.headline, isoDay(r?.created_at)], !!view);

  if (loading) return <LoadingState />;
  if (!r || !view) return <NotFoundState retryHref={`/hero/hit/${stage}`} />;

  const blocks = view.blocks.filter(b => b.items.length > 0);
  const modules = (r.report_modules ?? []) as { id: string; title: string; content: string }[];
  const journey = view.journey[r.journey_stage];
  const lastMainId = [...blocks].reverse().find(b => !b.checklist)?.id;
  const nav = [{ id: "summary", label: "한눈에" }, ...blocks.map(b => ({ id: b.id, label: b.title })), { id: "commentary", label: "해설" }];

  return (
    <>
    <div className={print ? "hit-report-container" : ""}>
    <ReportShell>
      {print && <ReportToolbar backHref={`/hero/hit/${stage}/result/${resultId}`} />}
      {print && <ReportCover code={`${groupLabel}`} title={def.code} subtitle={def.name} headline={view.cover.headline} sub={view.cover.sub} date={formatDate(r.created_at)} reportNo={resultId.slice(0, 8).toUpperCase()} />}
      {!print && <ReportHeader code={`${groupLabel}`} title={def.code} subtitle={def.name} date={formatDate(r.created_at)} stage={journey} />}
      {!print && <HitChain type={stage} id={resultId} />}
      {!print && <SectionNav items={nav} />}

      <Section id="summary" title="한눈에" lead={print && journey ? `현재 단계: ${journey}` : "이번 검사에서 가장 먼저 알아 두면 좋은 세 가지입니다."}>
        <KeyFindings items={view.findings} />
        <div className="mt-6"><ScoreGuide /></div>
      </Section>

      {blocks.map(b => (
        <Section key={b.id} id={b.id} title={b.headline ? `${b.title} — ${b.headline.replace(/^[^\d]*/, "")}` : b.title} lead={b.lead}>
          <div className="rounded-2xl border border-neutral-200 px-5 sm:px-6">
            {[...b.items].sort((x, y) => (b.checklist ? 0 : y.value - x.value)).map(it => (
              <ScoreRow key={it.key} label={L(it.key)} value={it.value} what={STAGE_DIM_COPY[it.key]?.what} plain={STAGE_DIM_COPY[it.key]?.pref}
                meaning={b.checklist ? undefined : STAGE_DIM_COPY[it.key] ? (it.value >= 75 ? STAGE_DIM_COPY[it.key].hi : it.value >= 50 ? STAGE_DIM_COPY[it.key].mid : STAGE_DIM_COPY[it.key].low) : undefined} />
            ))}
          </div>
          {b.id === lastMainId && view.extra && <div className="mt-6">{view.extra}</div>}
        </Section>
      ))}

      <Section id="commentary" title="HeRo 해설" lead="점수 구간에 따라 미리 쓰고 검수한 해설입니다. 같은 점수에는 언제나 같은 해설이 나옵니다.">
        <ModuleList modules={modules} />
        <div className="mt-10"><AiNarrative text={r.ai_report as string | null} /></div>
      </Section>

      <ReportFooterNote />
    </ReportShell>
    </div>

    {!print && (
      <HitNextSteps from="stage">
        <div className="space-y-3">
          <NextLink href="/hero/journey" title="나의 저니에서 준비 체크하기" desc="준비 체크리스트를 채울수록 준비도가 올라갑니다" primary />
          <FullReportLink href={`/hero/hit/${stage}/report/${resultId}`} />
        </div>
      </HitNextSteps>
    )}
    </>
  );
}
