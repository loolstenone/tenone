/**
 * HIT F 채점 회귀 점검 — 가상 응답으로 채점 공식·사회적 연결 방향 확인 (2026-10-13).
 * 실행: npx tsx scripts/hit-f-scoring-check.ts   (DB 접속 없음)
 * 응답 module은 정규화 후 이름(satisfaction·direction·legacy·social). 역채점 표시는 DB hit_questions.reverse_scored와 같아야 한다.
 */
import { scoreHitF } from '../lib/hit/scoring-f';
import { selectStageModules } from '../lib/hit/stage-report-modules';

type Row = { module: string; question_id: string; option_value: string };
const SPEC: [string, string, string, number][] = [
  ['satisfaction', 'life_satisfaction', 'e_ls', 12], ['satisfaction', 'residual_passion', 'e_rp', 12], ['satisfaction', 'psych_transition', 'e_pt', 8],
  ['direction', 're_employment', 'e_re', 6], ['direction', 'entrepreneurship', 'e_en', 6], ['direction', 'social_contribution', 'e_sc', 5], ['direction', 'mentoring', 'e_mt', 6], ['direction', 'leisure', 'e_sr', 5],
  ['legacy', 'transferable_legacy', 'e_tl', 10], ['legacy', 'knowledge_transfer', 'e_kt', 10], ['legacy', 'new_capability', 'e_nc', 12],
  ['social', 'belonging', 'e_bl', 10], ['social', 'role_necessity', 'e_rn', 10],
];
// DB 기준 역채점 (2026-10-13): 사회적 연결은 '욕구' — 고독·역할 초월 문항이 역채점
const REV = new Set(['e_ls11', 'e_rp10', 'e_pt04', 'e_kt09', 'e_bl10', 'e_rn07']);
const build = (pick: (sub: string, id: string) => number): Row[] => SPEC.flatMap(([module, sub, prefix, n]) =>
  Array.from({ length: n }, (_, i) => {
    const id = `${prefix}${String(i + 1).padStart(2, '0')}`;
    return { module, question_id: id, option_value: `${sub}:${pick(sub, id)}${REV.has(id) ? ':r' : ''}` };
  }));

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; };

{
  const r = scoreHitF(build(() => 4));
  check('보통 → 만족·열정·레거시·사회 50', r.lifeSatisfaction === 50 && r.remainingPassion === 50 && r.legacySkillScore === 50 && r.socialScores.belonging === 50 && r.socialScores.role_necessity === 50);
}
{
  // 고독을 즐기고 역할 없이도 평화로운 사람: 욕구 문항 1, 고독·초월 문항(e_bl10·e_rn07) 7 → 소속·역할 욕구 0 → LOW 해설
  const r = scoreHitF(build((sub, id) => id === 'e_bl10' || id === 'e_rn07' ? 7 : sub === 'belonging' || sub === 'role_necessity' ? 1 : 4));
  const ids = selectStageModules('f', { social_scores: r.socialScores, legacy_scores: r.legacyScores, life_satisfaction: 50, remaining_passion: 50, direction_type: r.directionType, second_act_readiness: 0 });
  check('고독·역할 초월 → 소속 0·역할 0·ES LOW', r.socialScores.belonging === 0 && r.socialScores.role_necessity === 0 && ids.includes('ES-BELONG-LOW') && ids.includes('ES-ROLE-LOW'), JSON.stringify(r.socialScores));
}
{
  // 방향: 멘토링 최고 → mentoring
  const r = scoreHitF(build(sub => sub === 'mentoring' ? 7 : 4));
  check('2막 방향 = 멘토링', r.directionType === 'mentoring', r.directionType);
}
{
  // 레거시 영역 기준 75/50
  const r = scoreHitF(build(sub => sub === 'transferable_legacy' ? 6 : sub === 'knowledge_transfer' ? 3 : 4));
  check('레거시 영역 75/50 기준', r.legacyAreas.includes('이전 가능 역량 우수') && r.legacyAreas.includes('지식 전수 방법 모색 필요') && r.legacyAreas.includes('새로운 역량 학습 필요') === false, r.legacyAreas.join(','));
}

console.log(fails === 0 ? '\n모두 통과' : `\n실패 ${fails}건`);
process.exit(fails === 0 ? 0 : 1);
