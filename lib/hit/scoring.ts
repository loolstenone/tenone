/**
 * HIT A 채점 알고리즘 v2
 * PT(성격유형) + BT(행동유형) + UF(기저요인) + CH core(인성) + AP core(적성) → S-Power 8차원
 */
import type {
  MBTIScores,
  DISCScores,
  SPowerScores,
  UFScores,
  TypeProfile,
  PTScores,
  BTScores,
  CHCoreScores,
  APCoreScores,
} from '@/types/hit';
import { findTypeMatch } from './data/type-matching';
import { ufQuestions } from './data/base-questions';

interface ResponseRow {
  module: string;
  question_id: string;
  option_value: string;
}

function reverseScore(v: number): number { return 8 - v; }
function clamp(v: number, min = 0, max = 100): number { return Math.max(min, Math.min(max, v)); }
function score100(values: number[]): number {
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / (values.length * 7) * 100);
}

// ── PT 성격유형 채점 (7점 리커트) ──
export function scorePT(responses: ResponseRow[]): PTScores {
  const ptRes = responses.filter(r => r.module === 'personality_type');
  const getVal = (id: string, rev: boolean): number | null => {
    const r = ptRes.find(x => x.question_id === id);
    if (!r) return null;
    const v = parseInt(r.option_value);
    return isNaN(v) ? null : (rev ? reverseScore(v) : v);
  };

  // E축 (E방향 8개 / I방향 7개)
  const eIds = ['pt_e01', 'pt_e02', 'pt_e03', 'pt_e04', 'pt_e05', 'pt_e06', 'pt_e07', 'pt_e08'];
  const iIds: [string, boolean][] = [
    ['pt_i01', false], ['pt_i02', false], ['pt_i03', false], ['pt_i04', false],
    ['pt_i05', false], ['pt_i06', false], ['pt_i07', false],
  ];
  const eRaw = eIds.reduce((s, id) => { const v = getVal(id, false); return s + (v ?? 0); }, 0);
  const iRaw = iIds.reduce((s, [id, rev]) => { const v = getVal(id, rev); return s + (v ?? 0); }, 0);
  const ePct = Math.round(eRaw / (eRaw + iRaw || 1) * 100);

  // N축
  const nIds: [string, boolean][] = [
    ['pt_n01', false], ['pt_n02', false], ['pt_n03', false], ['pt_n04', false],
    ['pt_n05', false], ['pt_n06', false], ['pt_n07', false], ['pt_n08', true],
  ];
  const sIds: [string, boolean][] = [
    ['pt_s01', false], ['pt_s02', false], ['pt_s03', false], ['pt_s04', false],
    ['pt_s05', false], ['pt_s06', false], ['pt_s07', true],
  ];
  const nRaw = nIds.reduce((s, [id, rev]) => { const v = getVal(id, rev); return s + (v ?? 0); }, 0);
  const sRaw = sIds.reduce((s, [id, rev]) => { const v = getVal(id, rev); return s + (v ?? 0); }, 0);
  const nPct = Math.round(nRaw / (nRaw + sRaw || 1) * 100);

  // T축
  const tIds: [string, boolean][] = [
    ['pt_t01', false], ['pt_t02', false], ['pt_t03', false], ['pt_t04', false],
    ['pt_t05', false], ['pt_t06', false], ['pt_t07', false],
  ];
  const fIds: [string, boolean][] = [
    ['pt_f01', false], ['pt_f02', false], ['pt_f03', false], ['pt_f04', false],
    ['pt_f05', false], ['pt_f06', false], ['pt_f07', true], ['pt_f08', false],
  ];
  const tRaw = tIds.reduce((s, [id, rev]) => { const v = getVal(id, rev); return s + (v ?? 0); }, 0);
  const fRaw = fIds.reduce((s, [id, rev]) => { const v = getVal(id, rev); return s + (v ?? 0); }, 0);
  const tPct = Math.round(tRaw / (tRaw + fRaw || 1) * 100);

  // J축
  const jIds: [string, boolean][] = [
    ['pt_j01', false], ['pt_j02', false], ['pt_j03', true], ['pt_j04', true],
    ['pt_j05', false], ['pt_j06', false], ['pt_j07', false],
  ];
  const pIds: [string, boolean][] = [
    ['pt_p01', false], ['pt_p02', false], ['pt_p03', false], ['pt_p04', false],
    ['pt_p05', true], ['pt_p06', false], ['pt_p07', false], ['pt_p08', false],
  ];
  const jRaw = jIds.reduce((s, [id, rev]) => { const v = getVal(id, rev); return s + (v ?? 0); }, 0);
  const pRaw = pIds.reduce((s, [id, rev]) => { const v = getVal(id, rev); return s + (v ?? 0); }, 0);
  const jPct = Math.round(jRaw / (jRaw + pRaw || 1) * 100);

  // 강도 등급
  const grade = (pct: number): 'STRONG' | 'MID' | 'WEAK' =>
    pct >= 76 ? 'STRONG' : pct >= 56 ? 'MID' : 'WEAK';

  const type =
    (ePct >= 51 ? 'E' : 'I') +
    (nPct >= 51 ? 'N' : 'S') +
    (tPct >= 51 ? 'T' : 'F') +
    (jPct >= 51 ? 'J' : 'P');

  // 미끼 탐지 (관리자용 플래그)
  const decoy1 = getVal('pt_val01', false);
  const decoy2 = getVal('pt_val02', false);
  const fakingFlag = (decoy1 !== null && decoy1 >= 6) && (decoy2 !== null && decoy2 >= 6);

  return {
    eScore: ePct,
    nScore: nPct,
    tScore: tPct,
    jScore: jPct,
    type,
    eGrade: grade(ePct),
    nGrade: grade(nPct),
    tGrade: grade(tPct),
    jGrade: grade(jPct),
    fakingFlag,
  };
}

// ── BT 행동유형 채점 (7점 리커트) ──
export function scoreBT(responses: ResponseRow[]): BTScores {
  const btRes = responses.filter(r => r.module === 'behavior_type');
  const getVal = (id: string, rev: boolean): number => {
    const r = btRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : (rev ? reverseScore(v) : v);
  };

  const dIds: [string, boolean][] = [
    ['bt_d_01', false], ['bt_d_02', false], ['bt_d_03', false], ['bt_d_04', false],
    ['bt_d_05', false], ['bt_d_06', false], ['bt_d_07', false], ['bt_d_08', false],
    ['bt_d_09', false], ['bt_d_10', false],
  ];
  const iIds: [string, boolean][] = [
    ['bt_i_01', false], ['bt_i_02', false], ['bt_i_03', false], ['bt_i_04', false],
    ['bt_i_05', false], ['bt_i_06', false], ['bt_i_07', false], ['bt_i_08', false],
    ['bt_i_09', false], ['bt_i_10', false],
  ];
  const sIds: [string, boolean][] = [
    ['bt_s_01', false], ['bt_s_02', false], ['bt_s_03', false], ['bt_s_04', false],
    ['bt_s_05', false], ['bt_s_06', false], ['bt_s_07', false], ['bt_s_08', true],
    ['bt_s_09', false], ['bt_s_10', false],
  ];
  const cIds: [string, boolean][] = [
    ['bt_c_01', false], ['bt_c_02', false], ['bt_c_03', false], ['bt_c_04', true],
    ['bt_c_05', false], ['bt_c_06', false], ['bt_c_07', false], ['bt_c_08', false],
    ['bt_c_09', false], ['bt_c_10', true],
  ];

  const dRaw = dIds.reduce((s, [id, rev]) => s + getVal(id, rev), 0);
  const iRaw = iIds.reduce((s, [id, rev]) => s + getVal(id, rev), 0);
  const sRaw = sIds.reduce((s, [id, rev]) => s + getVal(id, rev), 0);
  const cRaw = cIds.reduce((s, [id, rev]) => s + getVal(id, rev), 0);

  const total = dRaw + iRaw + sRaw + cRaw || 1;
  const d = Math.round(dRaw / total * 100);
  const i = Math.round(iRaw / total * 100);
  const s = Math.round(sRaw / total * 100);
  const c = Math.round(cRaw / total * 100);

  const entries: [string, number][] = [['D', d], ['I', i], ['S', s], ['C', c]];
  entries.sort((a, b) => b[1] - a[1]);
  const primary = entries[0][0];
  const secondary = entries[1][0];
  const lowest = entries[3][0];

  // 다크 트라이어드 사전 탐지 (D 과잉 패턴)
  const darkPattern = (
    [getVal('bt_d_02', false), getVal('bt_d_03', false), getVal('bt_d_06', false), getVal('bt_d_08', false)]
      .every(v => v >= 6)
  );

  return { d, i, s, c, primary, secondary, lowest, darkPattern };
}

// ── CH Core 인성 채점 (7점 리커트, 5대 영역) ──
export function scoreCH(responses: ResponseRow[]): CHCoreScores {
  const chRes = responses.filter(r => r.module === 'character_core');
  const getVal = (id: string, rev: boolean): number => {
    const r = chRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : (rev ? reverseScore(v) : v);
  };

  const integrityVals = [
    getVal('ch_c01', false), getVal('ch_c02', false), getVal('ch_c03', false), getVal('ch_c04', false),
    getVal('ch_c05', false), getVal('ch_c06', true),  getVal('ch_c07', false), getVal('ch_c08', true),
  ];
  const relationalVals = [
    getVal('ch_r01', false), getVal('ch_r02', false), getVal('ch_r03', false), getVal('ch_r04', false),
    getVal('ch_r05', false), getVal('ch_r06', true),  getVal('ch_r07', true),  getVal('ch_r08', false),
  ];
  const emotionalVals = [
    getVal('ch_e01', true),  getVal('ch_e02', false), getVal('ch_e03', false), getVal('ch_e04', false),
    getVal('ch_e05', true),  getVal('ch_e06', false), getVal('ch_e07', false), getVal('ch_e08', true),
  ];
  const ethicsVals = [
    getVal('ch_x01', false), getVal('ch_x02', false), getVal('ch_x03', false), getVal('ch_x04', false),
    getVal('ch_x05', true),  getVal('ch_x06', false), getVal('ch_x07', false), getVal('ch_x08', true),
  ];
  const growthVals = [
    getVal('ch_g01', false), getVal('ch_g02', false), getVal('ch_g03', false), getVal('ch_g04', false),
    getVal('ch_g05', false), getVal('ch_g06', false), getVal('ch_g07', true),  getVal('ch_g08', false),
  ];

  // 다크 코어 사전 탐지
  // ch_c08 역문항: 원점수 6~7이면 역산값 1~2 → 조건 성립
  // ch_r06 역문항: 원점수 6~7이면 역산값 1~2 → 조건 성립
  const darkPreFlag = getVal('ch_c08', true) <= 2 && getVal('ch_r06', true) <= 2;

  return {
    integrity: score100(integrityVals),
    relational: score100(relationalVals),
    emotional: score100(emotionalVals),
    ethics: score100(ethicsVals),
    growth: score100(growthVals),
    darkPreFlag,
  };
}

// ── AP Core 적성 채점 (7점 리커트, 6유형) ──
export function scoreAP(responses: ResponseRow[]): APCoreScores {
  const apRes = responses.filter(r => r.module === 'aptitude_core');
  const getVal = (id: string): number => {
    const r = apRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : v;
  };

  const R = score100(['ap_r01', 'ap_r02', 'ap_r03', 'ap_r04', 'ap_r05'].map(getVal));
  const I = score100(['ap_i01', 'ap_i02', 'ap_i03', 'ap_i04', 'ap_i05'].map(getVal));
  const A = score100(['ap_a01', 'ap_a02', 'ap_a03', 'ap_a04', 'ap_a05'].map(getVal));
  const S = score100(['ap_s01', 'ap_s02', 'ap_s03', 'ap_s04', 'ap_s05'].map(getVal));
  const E = score100(['ap_e01', 'ap_e02', 'ap_e03', 'ap_e04', 'ap_e05'].map(getVal));
  const C = score100(['ap_c01', 'ap_c02', 'ap_c03', 'ap_c04', 'ap_c05'].map(getVal));

  const sorted: [string, number][] = [['R', R], ['I', I], ['A', A], ['S', S], ['E', E], ['C', C]];
  sorted.sort((a, b) => b[1] - a[1]);
  const top3Code = sorted.slice(0, 3).map(x => x[0]).join('');

  return { R, I, A, S, E, C, top3Code, scores: { R, I, A, S, E, C } };
}

// ── S-Power 8차원 — 5모듈 교차 분석 ──
export function calcSpower8d(
  pt: PTScores,
  bt: BTScores,
  uf: UFScores,
  ch: CHCoreScores,
  ap: APCoreScores,
): SPowerScores {
  // PT 파생 점수
  const pScore = 100 - pt.jScore;
  const fScore = 100 - pt.tScore;
  const iScore = 100 - pt.eScore;
  const sScore = 100 - pt.nScore;

  return {
    strategic: clamp(Math.round(
      bt.d * 0.30 + pt.nScore * 0.25 + pt.tScore * 0.20 +
      ap.E * 0.10 + uf.self * 0.10 + ch.growth * 0.05
    )),
    execution: clamp(Math.round(
      bt.d * 0.30 + pt.jScore * 0.25 + sScore * 0.15 +
      ch.integrity * 0.15 + uf.temperament * 0.10 + ap.R * 0.05
    )),
    creativity: clamp(Math.round(
      bt.i * 0.25 + pt.nScore * 0.25 + pScore * 0.20 +
      ap.A * 0.15 + ch.growth * 0.10 + uf.peer * 0.05
    )),
    interpersonal: clamp(Math.round(
      bt.i * 0.25 + pt.eScore * 0.20 + fScore * 0.20 +
      ch.relational * 0.15 + ap.S * 0.10 + uf.parent * 0.10
    )),
    analytical: clamp(Math.round(
      bt.c * 0.30 + pt.tScore * 0.25 + sScore * 0.15 +
      ap.I * 0.15 + ch.integrity * 0.10 + uf.economic * 0.05
    )),
    harmony: clamp(Math.round(
      bt.s * 0.30 + fScore * 0.25 + iScore * 0.15 +
      ch.relational * 0.15 + ch.emotional * 0.10 + uf.family * 0.05
    )),
    breakthrough: clamp(Math.round(
      bt.d * 0.25 + pt.nScore * 0.20 + pScore * 0.15 +
      ch.growth * 0.15 + uf.trauma * 0.15 + uf.self * 0.10
    )),
    guard: clamp(Math.round(
      bt.s * 0.25 + bt.c * 0.20 + pt.jScore * 0.20 +
      sScore * 0.10 + ch.ethics * 0.15 + ap.C * 0.10
    )),
  };
}

// ── 기존 함수 하위 호환 유지 ──

export function scoreMBTI(responses: ResponseRow[]): MBTIScores {
  const pt = scorePT(responses);
  return {
    eScore: pt.eScore,
    sScore: 100 - pt.nScore,
    tScore: pt.tScore,
    jScore: pt.jScore,
    type: pt.type,
  };
}

export function scoreDISC(responses: ResponseRow[]): DISCScores {
  const bt = scoreBT(responses);
  return {
    d: bt.d,
    i: bt.i,
    s: bt.s,
    c: bt.c,
    primary: bt.primary,
    subtype: bt.primary + bt.secondary,
  };
}

// ── UF 기저요인 채점 (9영역 × 7점 리커트) ──

const UF_SUBSCALE_MAP: Record<string, keyof UFScores> = {};
const UF_REVERSE_SET = new Set<string>();
ufQuestions.forEach(q => {
  UF_SUBSCALE_MAP[q.id] = q.subscale as keyof UFScores;
  if (q.reverse) UF_REVERSE_SET.add(q.id);
});

export function scoreUF(responses: ResponseRow[]): UFScores {
  const uf = responses.filter(r => r.module === 'base');
  const sums: Record<string, number[]> = {};

  uf.forEach(r => {
    const subscale = UF_SUBSCALE_MAP[r.question_id];
    if (!subscale) return;
    if (!sums[subscale]) sums[subscale] = [];
    let value = parseInt(r.option_value);
    if (isNaN(value)) return;
    if (UF_REVERSE_SET.has(r.question_id)) value = 8 - value;
    sums[subscale].push(value);
  });

  const toScore = (values: number[] | undefined): number => {
    if (!values || values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(((avg - 1) / 6) * 100);
  };

  return {
    sibling: toScore(sums['sibling']),
    parent: toScore(sums['parent']),
    family: toScore(sums['family']),
    peer: toScore(sums['peer']),
    self: toScore(sums['self']),
    temperament: toScore(sums['temperament']),
    economic: toScore(sums['economic']),
    trauma: toScore(sums['trauma']),
    cultural: toScore(sums['cultural']),
  };
}

/** @deprecated scoreBase → scoreUF 사용 */
export function scoreBase(responses: ResponseRow[]): { scores: Record<string, number>; summary: string } {
  const uf = scoreUF(responses);
  const sorted = Object.entries(uf).sort((a, b) => b[1] - a[1]);
  const areaNames: Record<string, string> = {
    sibling: '형제관계', parent: '부모관계', family: '가정환경',
    peer: '또래관계', self: '자기개념', temperament: '기질',
    economic: '경제환경', trauma: '전환경험', cultural: '문화맥락',
  };
  const top3 = sorted.slice(0, 3).map(([k]) => areaNames[k]).join(', ');
  return {
    scores: uf as unknown as Record<string, number>,
    summary: `${top3} 영역에서 높은 점수를 보입니다.`,
  };
}

// ── 64유형 매칭 ──
export function match64Type(mbti: MBTIScores, disc: DISCScores): TypeProfile {
  return findTypeMatch(mbti.type, disc.subtype);
}

/** @deprecated calcSpower8d 사용 권장 */
export function deriveSPower(mbti: MBTIScores, disc: DISCScores, ufScores?: UFScores): SPowerScores {
  const ufAvg = ufScores
    ? Math.round(Object.values(ufScores).reduce((a, b) => a + b, 0) / 9)
    : 50;

  return {
    strategic: clamp(Math.round(disc.d * 0.3 + (100 - mbti.sScore) * 0.3 + mbti.tScore * 0.2 + ufAvg * 0.2)),
    execution: clamp(Math.round(disc.d * 0.3 + mbti.jScore * 0.3 + mbti.tScore * 0.2 + ufAvg * 0.2)),
    creativity: clamp(Math.round(disc.i * 0.25 + (100 - mbti.sScore) * 0.3 + (100 - mbti.jScore) * 0.25 + ufAvg * 0.2)),
    interpersonal: clamp(Math.round(disc.i * 0.3 + mbti.eScore * 0.3 + (100 - mbti.tScore) * 0.2 + ufAvg * 0.2)),
    analytical: clamp(Math.round(disc.c * 0.3 + mbti.tScore * 0.3 + mbti.sScore * 0.2 + ufAvg * 0.2)),
    harmony: clamp(Math.round(disc.s * 0.3 + (100 - mbti.tScore) * 0.25 + mbti.eScore * 0.15 + ufAvg * 0.2)),
    breakthrough: clamp(Math.round(disc.d * 0.25 + (100 - mbti.sScore) * 0.25 + (100 - mbti.jScore) * 0.2 + ufAvg * 0.2)),
    guard: clamp(Math.round(disc.c * 0.3 + mbti.jScore * 0.25 + mbti.tScore * 0.15 + ufAvg * 0.2)),
  };
}
