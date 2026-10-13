/**
 * HIT A 채점 회귀 점검 — 정답을 아는 가상 응답으로 채점 공식·해설 선택 규칙을 확인한다 (2026-10-13).
 * 실행: npx tsx scripts/hit-a-scoring-check.ts   (DB 접속 없음, 순수 계산)
 * 채점·선택 규칙·문항 목록을 고치면 반드시 다시 돌린다. 기대값이 어긋나면 ❌로 표시되고 종료 코드 1.
 */
import { scorePT, scoreBT, scoreCH, scoreAP, scoreUF, summarizeUF, calcSpower8d } from '../lib/hit/scoring';
import { selectModules } from '../lib/hit/report-assembler';

type Row = { module: string; question_id: string; option_value: string };
const ids = (prefix: string, keys: [string, number][], pad = 2, sep = '') =>
  keys.flatMap(([k, n]) => Array.from({ length: n }, (_, i) => `${prefix}_${k}${sep}${String(i + 1).padStart(pad, '0')}`));
const CORE: Record<string, string[]> = {
  personality_type: ids('pt', [['e', 8], ['i', 7], ['n', 8], ['s', 7], ['t', 7], ['f', 8], ['j', 7], ['p', 8]]),
  behavior_type: ids('bt', [['d', 10], ['i', 10], ['s', 10], ['c', 10]], 2, '_'),
  character_core: ['c01','c02','c03','c04','c05','c06','c07','c08','r01','r02','r04','r06','r08','r09','r10','r11','e01','e02','e03','e04','e05','e06','e07','e08','x01','x02','x03','x04','x07','x09','x10','x11','g01','g02','g03','g04','g05','g06','g07','g08'].map(k => `ch_${k}`),
  aptitude_core: ids('ap', [['r', 5], ['i', 5], ['a', 5], ['s', 5], ['e', 5], ['c', 5]]),
};
const uniform = (v: number, pick?: (id: string) => number | null): Row[] =>
  Object.entries(CORE).flatMap(([module, qs]) => qs.map(q => ({ module, question_id: q, option_value: String(pick?.(q) ?? v) })));

let fails = 0;
const check = (name: string, ok: boolean, detail = '') => { console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; };

// 1. 전 문항 '보통'(4) → 모든 점수 50, 성격 축 50, S-Power 8개 전부 50
{
  const r = uniform(4);
  const pt = scorePT(r), bt = scoreBT(r), ch = scoreCH(r), ap = scoreAP(r), sp = calcSpower8d(pt, bt, ch, ap);
  check('보통 응답 → 성격 축 50', [pt.eScore, pt.nScore, pt.tScore, pt.jScore].every(v => v === 50), JSON.stringify([pt.eScore, pt.nScore, pt.tScore, pt.jScore]));
  check('보통 응답 → 행동 강도 50', Object.values(bt.intensity).every(v => v === 50), JSON.stringify(bt.intensity));
  check('보통 응답 → 성품 50', [ch.integrity, ch.relational, ch.emotional, ch.ethics, ch.growth].every(v => v === 50));
  check('보통 응답 → 흥미 50', Object.values(ap.scores).every(v => v === 50));
  check('보통 응답 → S-Power 전부 50', Object.values(sp).every(v => v === 50), JSON.stringify(sp));
}
// 2. 극단 응답: 전부 7 → 역문항 때문에 성품 < 100, 흥미 100, 행동 강도 100
{
  const r = uniform(7);
  const ch = scoreCH(r), ap = scoreAP(r), bt = scoreBT(r);
  check('전부 7 → 흥미 100·행동 강도 100', Object.values(ap.scores).every(v => v === 100) && Object.values(bt.intensity).every(v => v === 100));
  check('전부 7 → 성품은 역문항 만큼 깎임 (성실 75·대인 88·정서 63·윤리 88·성장 88)', ch.integrity === 75 && ch.relational === 88 && ch.emotional === 63 && ch.ethics === 88 && ch.growth === 88, JSON.stringify(ch));
}
// 3. 성격 축 방향: E 문항 7·I 문항 1 → E 88, 유형 E…; 반대로 하면 I
{
  const e = uniform(4, id => id.startsWith('pt_e') ? 7 : id.startsWith('pt_i') ? 1 : null);
  const i = uniform(4, id => id.startsWith('pt_e') ? 1 : id.startsWith('pt_i') ? 7 : null);
  check('E 쪽 응답 → E 88·유형 E', scorePT(e).eScore === 88 && scorePT(e).type.startsWith('E'), String(scorePT(e).eScore));
  check('I 쪽 응답 → E 13·유형 I·등급 STRONG', scorePT(i).eScore === 13 && scorePT(i).type.startsWith('I') && scorePT(i).eGrade === 'STRONG', `${scorePT(i).eScore} ${scorePT(i).eGrade}`);
}
// 4. 결측: 성격 문항 절반이 없어도 평균이라 50 유지 (0으로 세지 않음)
{
  const r = uniform(4).filter(x => !(x.module === 'personality_type' && /0[1-4]$/.test(x.question_id)));
  const pt = scorePT(r);
  check('성격 결측 → 50 유지', [pt.eScore, pt.nScore, pt.tScore, pt.jScore].every(v => v === 50), JSON.stringify([pt.eScore, pt.nScore, pt.tScore, pt.jScore]));
}
// 5. 역문항 확인: ch_x10(R)만 7, 나머지 윤리 4 → 윤리 평균 (4×7+1)/8 = 3.625 → 44
{
  const r = uniform(4, id => id === 'ch_x10' ? 7 : null);
  check('윤리 역문항 x10=7 → 44', scoreCH(r).ethics === 44, String(scoreCH(r).ethics));
}
// 6. 성장 배경: 해당 없음(0)·게이트·영역 결측
{
  const meta = [
    ...['uf_001', 'uf_002', 'uf_003', 'uf_004', 'uf_005'].map(id => ({ id, sub_domain: 'sibling', reverse_scored: false, scoring_key: { weight: 1 } })),
    { id: 'uf_041', sub_domain: 'trauma', reverse_scored: false, scoring_key: { role: 'gate' } },
    { id: 'uf_043', sub_domain: 'trauma', reverse_scored: false, scoring_key: { weight: 1 } },
    { id: 'uf_044', sub_domain: 'trauma', reverse_scored: false, scoring_key: { weight: 1.2 } },
  ];
  const base = (m: Record<string, string>): Row[] => Object.entries(m).map(([question_id, option_value]) => ({ module: 'base', question_id, option_value }));
  const only = scoreUF(base({ uf_001: '0', uf_002: '0', uf_003: '0', uf_004: '0', uf_005: '0', uf_041: '2', uf_043: '7', uf_044: '7' }), meta)!;
  check('외동(전부 해당 없음)+큰 위기 없음 → 형제 null·전환점 null·exposure false', only.sibling === null && only.trauma === null && only.traumaExposure === false);
  const mods = selectModules({ discD: 50, discI: 50, discS: 50, discC: 50, discPrimary: 'S', discSubtype: 'SI', mbtiType: 'ISFP', mbtiEScore: 50, mbtiSScore: 50, mbtiTScore: 50, mbtiJScore: 50, ufScores: only, ufTraumaExposure: only.traumaExposure }).filter(m => m.startsWith('UF-'));
  check('→ 해설은 UF-TRAUMA-NONE 하나, 형제 해설 없음', mods.length === 1 && mods[0] === 'UF-TRAUMA-NONE', mods.join(' '));
  const low = scoreUF(base({ uf_001: '4', uf_002: '4', uf_041: '7', uf_043: '1', uf_044: '2' }), meta)!;
  check('큰 위기 있음·회복 자원 낮음 → 전환점 9', low.trauma === 9 && low.traumaExposure === true, String(low.trauma));
  check('요약은 50 이상 영역만', summarizeUF(low) === '형제관계 영역에서 높은 점수를 보입니다.', summarizeUF(low));
}

console.log(fails === 0 ? '\n모두 통과' : `\n실패 ${fails}건`);
process.exit(fails === 0 ? 0 : 1);
