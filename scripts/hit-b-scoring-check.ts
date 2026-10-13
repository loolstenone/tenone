/**
 * HIT B 채점 회귀 점검 — 가상 응답으로 채점 공식·매트릭스·해설 선택을 확인 (2026-10-13).
 * 실행: npx tsx scripts/hit-b-scoring-check.ts   (DB 접속 없음)
 */
import { scoreHitB, buildInterestEfficacyMatrix, CORE_COMPETENCIES, HOLLAND_TYPES } from '../lib/hit/scoring-b';
import { selectBModules, selectBTrackModules } from '../lib/hit/report-assembler';

type Row = { module: string; question_id: string; option_value: string };
const TRACK_SUBS = ['ad_measurement', 'campaign_execution', 'consumer_insight', 'copy_story', 'creative_concept', 'media_planning'];
const build = (pick: (module: string, sub: string, i: number) => number): Row[] => [
  ...CORE_COMPETENCIES.flatMap(s => Array.from({ length: 5 }, (_, i) => ({ module: 'competency_core', question_id: `c_${s}_${i}`, option_value: `${s}:${pick('competency_core', s, i)}` }))),
  ...TRACK_SUBS.flatMap(s => Array.from({ length: 5 }, (_, i) => ({ module: 'competency', question_id: `t_${s}_${i}`, option_value: `${s}:${pick('competency', s, i)}` }))),
  ...HOLLAND_TYPES.flatMap(s => Array.from({ length: 6 }, (_, i) => ({ module: 'efficacy', question_id: `e_${s}_${i}`, option_value: `${s}:${pick('efficacy', s, i)}` }))),
  ...['self_understanding', 'job_understanding'].flatMap(s => Array.from({ length: 8 }, (_, i) => ({ module: 'career_insight', question_id: `i_${s}_${i}`, option_value: `${s}:${pick('career_insight', s, i)}` }))),
];

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; };

{
  const r = scoreHitB(build(() => 4), { R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 });
  check('보통 → 핵심역량 전부 50·등급 B', Object.values(r.coreCompetencyScores).every(v => v === 50) && r.coreCompetencyGrade === 'B');
  check('보통 → 트랙 6개 50', Object.keys(r.trackScores).length === 6 && Object.values(r.trackScores).every(v => v === 50), JSON.stringify(r.trackScores));
  check('보통 → 효능감 50·이해 50', Object.values(r.efficacyScores).every(v => v === 50) && r.insightTotal === 50);
  check('보통 → 단계 developing', r.journeyStage === 'developing', r.journeyStage);
  check('흥미·효능 50 → 매트릭스 전부 비관심(그룹 비어 있음)', r.matrix.optimal.length + r.matrix.explore.length + r.matrix.burnout.length === 0);
}
{
  const r = scoreHitB(build(() => 7), null);
  check('전부 7 → 100·A·ready', Object.values(r.coreCompetencyScores).every(v => v === 100) && r.journeyStage === 'ready');
  check('HIT A 없음 → 매트릭스 전부 미측정', Object.values(r.matrix.cells).every(c => c === '미측정'));
}
{
  // 핵심역량 해설 선택: 점수 구간 75/50/25 → A/B/C/D, 높은 순
  const ids = selectBModules({ competencyCommon: { problem_solving: 80, communication: 60, initiative: 30, collaboration: 10, self_management: 50, learning_agility: 75 } });
  check('핵심역량 해설 id·순서', ids.join(' ') === 'CORE-PROBLEM-A CORE-AGILE-A CORE-COMM-B CORE-SELF-B CORE-INIT-C CORE-COLLAB-D', ids.join(' '));
  const t = selectBTrackModules({ copy_story: 75, media_planning: 74, ad_measurement: 49 });
  check('트랙 해설 id H/M/L', t.join(' ') === 'TRK-copy_story-H TRK-media_planning-M TRK-ad_measurement-L', t.join(' '));
}
{
  // 매트릭스 경계 60
  const m = buildInterestEfficacyMatrix({ R: 60, I: 59, A: 60, S: 59, E: 70, C: 10 }, { R: 60, I: 60, A: 59, S: 59, E: 90, C: 90 });
  check('매트릭스 60 경계', m.cells.R === '최적영역' && m.cells.I === '소진리스크' && m.cells.A === '탐색학습필요' && m.cells.S === '비관심영역' && m.cells.C === '소진리스크', JSON.stringify(m.cells));
}

{
  // 단계: 자기·직무 이해는 둘 다 기준을 넘어야 (평균 X)
  const r = scoreHitB(build((mod, sub) => mod === 'career_insight' ? (sub === 'self_understanding' ? 5 : 3) : 5), null);
  check('자기 67·직무 33 → exploring (developing 아님)', r.journeyStage === 'exploring', `${r.insightSelf}/${r.insightJob} ${r.journeyStage}`);
}

console.log(fails === 0 ? '\n모두 통과' : `\n실패 ${fails}건`);
process.exit(fails === 0 ? 0 : 1);
