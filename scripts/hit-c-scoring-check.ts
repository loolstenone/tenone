/**
 * HIT C 채점 회귀 점검 — 가상 응답으로 채점 공식·해설 선택 확인 (2026-10-13).
 * 실행: npx tsx scripts/hit-c-scoring-check.ts   (DB 접속 없음)
 */
import { scoreHitC } from '../lib/hit/scoring-c';
import { selectStageModules } from '../lib/hit/stage-report-modules';

type Row = { module: string; question_id: string; option_value: string };
const common = (sub: string, prefix: string, n: number, v: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ module: 'readiness', question_id: `${prefix}${i}`, option_value: `${sub}:${v}` }));
const build = (p: Partial<Record<string, number>>, d = 4): Row[] => [
  ...['self', 'portfolio', 'interview', 'network'].flatMap(s => common(s, `ready_c_${s}_`, 5, p[s] ?? d)),
  ...common('skill_readiness', 'b_sr', 8, p.skill_readiness ?? d),
  ...common('action_readiness', 'b_ar', 8, p.action_readiness ?? d),
  ...['self', 'portfolio', 'interview', 'network'].flatMap(s => common(s, `ready_ad_${s}_`, 3, p.track ?? d)),
  ...['org_adaptation', 'learning_speed', 'relationship_building', 'feedback_acceptance'].flatMap(s =>
    Array.from({ length: 5 }, (_, i) => ({ module: 'onboarding', question_id: `ent_${s}_${i}`, option_value: `${s}:${p[s] ?? d}` }))),
  ...Array.from({ length: 10 }, (_, i) => ({ module: 'career_decision', question_id: `ent_cd${i}`, option_value: `career_decision:${p.decision ?? d}` })),
];

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; };

{
  const r = scoreHitC(build({}));
  check('보통 → 준비 7영역(트랙 포함) 50', Object.keys(r.readinessScores).length === 7 && Object.values(r.readinessScores).every(v => v === 50), JSON.stringify(r.readinessScores));
  check('보통 → 적응 50·결정 50·developing', r.onboardingTotal === 50 && r.careerDecision === 50 && r.journeyStage === 'developing');
}
{
  // 트랙 문항이 공통 차원에 섞이지 않아야 한다: 트랙만 7, 공통 4 → self 50, track 100
  const r = scoreHitC(build({ track: 7 }));
  check('트랙 문항은 track으로만', r.readinessScores.self === 50 && r.readinessScores.track === 100, JSON.stringify(r.readinessScores));
}
{
  const r = scoreHitC(build({ portfolio: 1, interview: 2 }));
  check('부족 영역(50 미만) = 포트폴리오·면접', r.readinessGaps.length === 2 && r.readinessGaps.includes('포트폴리오') && r.readinessGaps.includes('면접'), r.readinessGaps.join(','));
}
{
  const ids = selectStageModules('c', { readiness_total: 20, career_decision: 80, onboarding_scores: { org_adaptation: 40, learning_speed: 90, relationship_building: 60, feedback_acceptance: 75 } });
  check('해설 id·순서', ids.join(' ') === 'READY-D DEC-H ONB-LEARN-H ONB-FEEDBACK-H ONB-REL-M ONB-ORG-L', ids.join(' '));
}

console.log(fails === 0 ? '\n모두 통과' : `\n실패 ${fails}건`);
process.exit(fails === 0 ? 0 : 1);
