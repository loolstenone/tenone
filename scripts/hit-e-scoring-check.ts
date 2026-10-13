/**
 * HIT E 채점 회귀 점검 — 가상 응답으로 채점 공식·정체성 방향·차기 역할 확인 (2026-10-13).
 * 실행: npx tsx scripts/hit-e-scoring-check.ts   (DB 접속 없음)
 * 응답 module은 정규화 후 이름(expertise·leadership·identity·network) — lib/hit/normalize-responses.ts 출력과 같다.
 * 역채점 표시는 DB hit_questions.reverse_scored와 같아야 한다 (2026-10-13: 역할 정체성 4문항 정방향, d_wt10 역채점).
 */
import { scoreHitE } from '../lib/hit/scoring-e';
import { selectStageModules } from '../lib/hit/stage-report-modules';

type Row = { module: string; question_id: string; option_value: string };
const SPEC: [string, string, string, number][] = [
  ['expertise', 'domain_depth', 'd_dd', 10], ['expertise', 'tacit_knowledge', 'd_tk', 10], ['expertise', 'redeployment', 'd_rd', 10], ['expertise', 'personal_brand', 'd_pb', 10],
  ['leadership', 'exec_leadership', 'd_le', 8], ['leadership', 'strategic_leadership', 'd_ls', 8], ['leadership', 'coaching_leadership', 'd_lc', 8], ['leadership', 'independent_leadership', 'd_li', 8],
  ['identity', 'identity_strength', 'd_is', 10], ['identity', 'new_role', 'd_nr', 10], ['identity', 'identity_recon', 'd_ir', 8],
  ['network', 'strong_ties', 'd_st', 10], ['network', 'weak_ties', 'd_wt', 10],
];
const REV = new Set(['d_nr05', 'd_pb10', 'd_tk10', 'd_wt10']); // DB 기준 (2026-10-13)
/** pick은 '응답 원값'(역채점 전)을 돌려준다 */
const build = (pick: (sub: string, id: string) => number): Row[] => SPEC.flatMap(([module, sub, prefix, n]) =>
  Array.from({ length: n }, (_, i) => {
    const id = `${prefix}${String(i + 1).padStart(2, '0')}`;
    return { module, question_id: id, option_value: `${sub}:${pick(sub, id)}${REV.has(id) ? ':r' : ''}` };
  }));
const neutralA = { bt: { d: 50, i: 50, s: 50, c: 50 }, sp: { strategic: 50, execution: 50, creativity: 50, interpersonal: 50, analytical: 50, harmony: 50, breakthrough: 50, guard: 50 }, ch: { integrity: 50, relational: 50, emotional: 50, ethics: 50, growth: 50 }, ap: { R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 } };

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; };

{
  const r = scoreHitE(build(() => 4), neutralA);
  check('보통 → 전문성·네트워크 50, 정체성 유연성 50', r.expertise_depth === 50 && r.network_quality === 50 && r.network_breadth === 50 && r.identity_flexibility === 50, `${r.identity_flexibility}`);
  check('보통 + A 중립 → 차기 역할 적합도 전부 50', r.next_role_matrix.possible_roles.every(x => x.fit_score === 50), r.next_role_matrix.possible_roles.map(x => x.fit_score).join(','));
}
{
  // 직업과 나를 동일시(역할 정체성 문항 전부 7) + 새 역할·재구성 낮음(1) → 경직(유연성 낮음)
  const r = scoreHitE(build((sub, id) => id === 'd_nr05' ? 7 : sub === 'identity_strength' ? 7 : sub === 'new_role' || sub === 'identity_recon' ? 1 : 4), neutralA);
  check('직업 동일시 → 역할 정체성 100·유연성 0·DI-RIGID', r.role_identity === 100 && r.identity_flexibility === 0 && selectStageModules('e', r as never).includes('DI-RIGID'), `${r.role_identity}/${r.identity_flexibility}`);
}
{
  // 넓은 네트워크: weak_ties 7, 단 d_wt10("깊은 네트워크가 중요")은 1 → 역채점이라 7로 → 100
  const r = scoreHitE(build((sub, id) => id === 'd_wt10' ? 1 : sub === 'weak_ties' ? 7 : 4), neutralA);
  check('약한 연결 100 (d_wt10 역채점)', r.network_breadth === 100, String(r.network_breadth));
}
{
  // 코칭 리더십 최고 → 리더십 유형 coaching
  const r = scoreHitE(build(sub => sub === 'coaching_leadership' ? 7 : 4), neutralA);
  check('리더십 유형 = 코치형', r.leadership_type === 'coaching_leadership', r.leadership_type);
}

console.log(fails === 0 ? '\n모두 통과' : `\n실패 ${fails}건`);
process.exit(fails === 0 ? 0 : 1);
