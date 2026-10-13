/**
 * HIT G(경력 공백) 채점 회귀 점검 — 가상 응답으로 채점·준비도 체크 전·해설 선택 확인 (2026-10-13).
 * 실행: npx tsx scripts/hit-gap-scoring-check.ts   (DB 접속 없음)
 */
import { scoreHitGap } from '../lib/hit/scoring-gap';
import { selectStageModules } from '../lib/hit/stage-report-modules';

type Row = { module: string; question_id: string; option_value: string };
const SPEC: [string, string, string, number][] = [
  ['latent_capability', 'disruption_context', 'f_dc', 12], ['latent_capability', 'hidden_competency', 'f_hc', 10], ['latent_capability', 'gap_activities', 'f_ga', 10],
  ['career_viability', 'job_viability', 'f_jv', 12], ['career_viability', 'skill_currency', 'f_sc', 12], ['career_viability', 'market_reentry', 'f_mr', 12],
  ['resilience', 'self_narrative', 'f_sn', 10], ['resilience', 'self_esteem', 'f_se', 8], ['resilience', 'retry_willingness', 'f_rw', 10],
  ['direction_bifurcation', 'career_restoration', 'f_cr', 12], ['direction_bifurcation', 'career_pivot', 'f_cp', 10], ['direction_bifurcation', 'fresh_start', 'f_fs', 10],
];
const build = (pick: (sub: string) => number): Row[] => SPEC.flatMap(([module, sub, prefix, n]) =>
  Array.from({ length: n }, (_, i) => ({ module, question_id: `${prefix}${String(i + 1).padStart(2, '0')}`, option_value: `${sub}:${pick(sub)}` })));

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; };

{
  const r = scoreHitGap(build(() => 4), { checklist: { percent: 0, byGroup: {} } });
  check('보통 → 유효성·회복력 50, CVI MID', r.latentScore === 50 && r.resilienceScore === 50 && r.cviGrade === 'MID', `${r.latentScore}/${r.resilienceScore}/${r.cviGrade}`);
  check('체크 전 → 재진입 준비도 0 · 경로 설명에 준비 언급 없음', r.reentryReadiness === 0 && !r.routingRationale.includes('복귀 준비'), r.routingRationale);
  const ids = selectStageModules('gap', { reentry_readiness: r.reentryReadiness, latent_scores: r.latentScores, cvi_grade: r.cviGrade, break_context_scores: {}, resilience_scores: {}, direction_dominant: r.directionTop.code });
  check('체크 전 → FP 해설 없음', !ids.some(x => x.startsWith('FP-')), ids.join(' '));
}
{
  const low = scoreHitGap(build(() => 4), { checklist: { percent: 20, byGroup: {} } });
  check('체크 후 → 준비도 = 완료율·동기 가중', low.reentryReadiness === Math.round(20 * 0.55 + 50 * 0.45), String(low.reentryReadiness));
}
{
  // 기술 유효성: 보통(5→67) → OUTDATED(업데이트 필요), 낮음(2→17) → GAP(갭 큼)
  const mid = selectStageModules('gap', { latent_scores: { job_viability: 50, skill_currency: 67 }, cvi_grade: 'MID', break_context_scores: {}, resilience_scores: {} });
  const low = selectStageModules('gap', { latent_scores: { job_viability: 50, skill_currency: 17 }, cvi_grade: 'LOW', break_context_scores: {}, resilience_scores: {} });
  check('기술 유효성 보통 → OUTDATED / 낮음 → GAP', mid.includes('FV-SKILL-OUTDATED') && low.includes('FV-SKILL-GAP'), `${mid.find(x => x.startsWith('FV-SKILL'))} ${low.find(x => x.startsWith('FV-SKILL'))}`);
}
{
  const r = scoreHitGap(build(sub => sub === 'career_restoration' ? 7 : 4));
  check('복원 방향 우세', r.directionTop.code === 'career_restoration', r.directionTop.code);
}

console.log(fails === 0 ? '\n모두 통과' : `\n실패 ${fails}건`);
process.exit(fails === 0 ? 0 : 1);
