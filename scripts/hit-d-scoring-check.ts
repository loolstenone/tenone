/**
 * HIT D 채점 회귀 점검 — 가상 응답으로 채점 공식·전환 유형·해설 선택 확인 (2026-10-13).
 * 실행: npx tsx scripts/hit-d-scoring-check.ts   (DB 접속 없음)
 * 응답 module은 정규화 후 이름(careerCapital·motivation·transferability) — lib/hit/normalize-responses.ts 출력과 같다.
 */
import { scoreHitD } from '../lib/hit/scoring-d';
import { selectStageModules } from '../lib/hit/stage-report-modules';

type Row = { module: string; question_id: string; option_value: string };
const SUBS: Record<string, [string, string, number][]> = {
  careerCapital: [['domain_expertise', 'c_de', 10], ['achievement', 'c_ac', 10], ['relational', 'c_re', 10], ['transferable', 'c_tr', 10]],
  motivation: [['push', 'c_pu', 12], ['pull', 'c_pl', 12]],
  transferability: [['skill_transfer', 'c_st', 12], ['market_fit', 'c_mf', 12], ['adaptation', 'c_ad', 12]],
};
const REV = new Set(['c_ac05', 'c_ad05']);
// 2026-10-13 문항 재검토: c_st11 삭제 · c_de05 → 이탈(push)·정방향
const DROP = new Set(['c_st11']);
const MOVE: Record<string, [string, string]> = { c_de05: ['motivation', 'push'] };
const build = (pick: (sub: string, id: string) => number): Row[] => Object.entries(SUBS).flatMap(([module, list]) =>
  list.flatMap(([sub, prefix, n]) => Array.from({ length: n }, (_, i) => {
    const id = `${prefix}${String(i + 1).padStart(2, '0')}`;
    const [m2, s2] = MOVE[id] ?? [module, sub];
    return { module: m2, question_id: id, option_value: `${s2}:${pick(s2, id)}${REV.has(id) ? ':r' : ''}` };
  })).filter(r => !DROP.has(r.question_id)));

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; };

{
  const r = scoreHitD(build(() => 4));
  check('보통 → 자본·전환 전부 50', Object.values(r.capitalScores).every(v => v === 50) && Object.values(r.transferabilityScores).every(v => v === 50), JSON.stringify(r.capitalScores));
  check('보통 → 동기 균형·유형 EXPLORER(기본값)', r.motivationType === 'balanced' && r.ctype === 'CTYPE-EXPLORER', `${r.motivationType} ${r.ctype}`);
}
{
  // 전략형: 전문성 높음 + 성장 한계(c_pu01·02·09) 높음 + 역량 이전 높음
  const r = scoreHitD(build((sub, id) => sub === 'domain_expertise' || sub === 'skill_transfer' ? 7 : ['c_pu01', 'c_pu02', 'c_pu09', 'c_de05'].includes(id) ? 7 : 4));
  check('전략형 판정', r.ctype === 'CTYPE-STRATEGIC', r.ctype);
}
{
  // 성장형: 전문성 중간(5→67 미만이어야 하므로 4.9 근사 불가 → 전문성 4·5 섞어 58) + 성장 끌림 높음 + 적응 높음
  const r = scoreHitD(build((sub, id) => sub === 'domain_expertise' ? (Number(id.slice(-1)) % 2 ? 5 : 4) : sub === 'adaptation' ? 7 : ['c_pl01', 'c_pl06', 'c_pl08'].includes(id) ? 7 : 4));
  check('성장형 판정', r.ctype === 'CTYPE-GROWTH', `${r.capitalScores.domain_expertise} ${r.ctype}`);
}
{
  // 탈출형: 이탈 7 · 유인 1
  const r = scoreHitD(build(sub => sub === 'push' ? 7 : sub === 'pull' ? 1 : 4));
  check('탈출형·이탈 우세', r.ctype === 'CTYPE-ESCAPE' && r.motivationType === 'push_driven', `${r.ctype} ${r.motivationType}`);
}
{
  // 체크리스트 기반 준비도: 체크 전(0)이면 CR 해설 없음
  const ids0 = selectStageModules('d', { capital_scores: {}, transferability_scores: {}, motivation_type: 'balanced', ctype: 'CTYPE-EXPLORER', transition_readiness: 0 });
  check('준비도 0 → CR 생략', !ids0.some(x => x.startsWith('CR-')), ids0.join(' '));
  const ids = selectStageModules('d', { capital_scores: { domain_expertise: 80, achievement: 60, relational: 40, transferable: 50 }, transferability_scores: { skill_transfer: 75, market_fit: 49, adaptation: 50 }, motivation_type: 'push_driven', motivation_subs: { pushGrowth: 90, pushCulture: 75, pullValues: 74 }, ctype: 'CTYPE-STRATEGIC', transition_readiness: 30 });
  check('해설 id', ids.join(' ') === 'CC-DOMAIN-HIGH CC-ACHIEVE-MID CC-RELATION-LOW CC-TRANSFER-MID CM-PUSH-DOMINANT CM-PUSH-GROWTH CM-PUSH-CULTURE CT-SKILL-HIGH CT-MARKET-LOW CT-ADAPT-MID CTYPE-STRATEGIC CR-C', ids.join(' '));
}

{
  // 체크리스트 체크 전(0) → '이직 준비 보강 필요'를 보완 영역에 넣지 않는다. 체크했는데 낮으면 넣는다
  const none = scoreHitD(build(() => 4), { checklist: { percent: 0, byGroup: {} } });
  const low = scoreHitD(build(() => 4), { checklist: { percent: 20, byGroup: { 서류: 20, 면접: 20, 타이밍: 20, 지지: 20 } } });
  check('체크 전 → 준비 보완 없음 / 체크 후 낮음 → 있음', !none.gapAreas.some(g => g.startsWith('이직 준비')) && low.gapAreas.some(g => g.startsWith('이직 준비')), `${none.gapAreas.length}/${low.gapAreas.length}`);
}

{
  // c_de05('더 배울 것이 없다')는 이제 성장 한계(이탈)에 들어가고 전문성을 깎지 않는다
  const r = scoreHitD(build((sub, id) => id === 'c_de05' ? 7 : 4));
  check('c_de05=7 → 전문성 50 유지·성장 한계 상승', r.capitalScores.domain_expertise === 50 && r.motivationSubs.pushGrowth > 50, `${r.capitalScores.domain_expertise} / ${r.motivationSubs.pushGrowth}`);
}

console.log(fails === 0 ? '\n모두 통과' : `\n실패 ${fails}건`);
process.exit(fails === 0 ? 0 : 1);
