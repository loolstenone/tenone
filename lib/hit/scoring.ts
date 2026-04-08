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
  CHDeepScores,
  APDeepScores,
  APMatrixCell,
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

// ── CH Deep 심화 채점 (14하위영역 + 5영역 정밀 재산출 + 다크 탐지) ──

export function scoreCHDeep(responses: ResponseRow[], _chCoreScores?: CHCoreScores): CHDeepScores {
  const coreRes = responses.filter(r => r.module === 'character_core');
  const deepRes = responses.filter(r => r.module === 'character_deep');

  const getCore = (id: string, rev: boolean): number => {
    const r = coreRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : (rev ? reverseScore(v) : v);
  };
  const getDeep = (id: string, rev: boolean): number => {
    const r = deepRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : (rev ? reverseScore(v) : v);
  };

  const conscience = score100([
    getCore('ch_c01', false), getCore('ch_c05', false), getCore('ch_c08', true),
    getCore('ch_x01', false), getCore('ch_x03', false), getDeep('chx_con01', false),
  ]);
  const self_discipline = score100([
    getCore('ch_c02', false), getCore('ch_c03', false), getCore('ch_c06', true),
    getCore('ch_c07', false), getDeep('chx_sd01', false), getDeep('chx_sd02', false),
  ]);
  const perfectionism = score100([
    getCore('ch_c04', false),
    getDeep('chx_pf01', false), getDeep('chx_pf02', false),
    getDeep('chx_pf03', true), getDeep('chx_pf04', true), getDeep('chx_pf05', false),
  ]);
  const warmth = score100([
    getCore('ch_r01', false), getCore('ch_r04', false), getCore('ch_r06', true),
    getDeep('chx_wm01', false), getDeep('chx_wm02', false), getDeep('chx_wm03', false),
  ]);
  const social_boldness = score100([
    getCore('ch_r03', false), getCore('ch_r05', false), getCore('ch_r07', true),
    getDeep('chx_sb01', false), getDeep('chx_sb02', false), getDeep('chx_sb03', false),
  ]);
  const sensitivity = score100([
    getCore('ch_r02', false), getCore('ch_r08', false),
    getDeep('chx_sn01', false), getDeep('chx_sn02', false),
    getDeep('chx_sn03', true), getDeep('chx_sn04', false),
  ]);
  const tension = score100([
    getCore('ch_e01', true), getCore('ch_e05', true),
    getDeep('chx_tn01', true), getDeep('chx_tn02', true),
    getDeep('chx_tn03', false), getDeep('chx_tn04', true),
  ]);
  const optimism = score100([
    getCore('ch_e02', false), getCore('ch_e04', false), getCore('ch_e07', false),
    getDeep('chx_op01', false), getDeep('chx_op02', false), getDeep('chx_op03', true),
  ]);
  const control = score100([
    getCore('ch_e03', false), getCore('ch_e06', false), getCore('ch_e08', true),
    getDeep('chx_ct01', false), getDeep('chx_ct02', true), getDeep('chx_ct03', false),
  ]);
  const independence = score100([
    getCore('ch_x02', false), getCore('ch_x04', false), getCore('ch_x07', false),
    getDeep('chx_in01', false), getDeep('chx_in02', true), getDeep('chx_in03', false),
  ]);
  const suspicion = score100([
    getCore('ch_x05', true), getCore('ch_x06', false), getCore('ch_x08', true),
    getDeep('chx_su01', true), getDeep('chx_su02', true), getDeep('chx_su03', false),
  ]);
  const openness = score100([
    getCore('ch_g01', false), getCore('ch_g04', false),
    getDeep('chx_op2_01', false), getDeep('chx_op2_02', false),
    getDeep('chx_op2_03', false), getDeep('chx_op2_04', true),
  ]);
  const adventure = score100([
    getCore('ch_g02', false), getCore('ch_g05', false), getCore('ch_g07', true),
    getDeep('chx_ad01', false), getDeep('chx_ad02', false), getDeep('chx_ad03', false),
  ]);
  const intellect = score100([
    getCore('ch_g03', false), getCore('ch_g06', false), getCore('ch_g08', false),
    getDeep('chx_iq01', false), getDeep('chx_iq02', false), getDeep('chx_iq03', false),
  ]);

  const subscales = {
    conscience, self_discipline, perfectionism,
    warmth, social_boldness, sensitivity,
    tension, optimism, control,
    independence, suspicion,
    openness, adventure, intellect,
  };

  const precise = {
    integrity: Math.round((conscience + self_discipline + perfectionism) / 3),
    relational: Math.round((warmth + social_boldness + sensitivity) / 3),
    emotional: Math.round(((100 - tension) + optimism + control) / 3),
    ethics: Math.round((conscience + (100 - suspicion) + independence) / 3),
    growth: Math.round((openness + adventure + intellect) / 3),
  };

  const getRawCore = (id: string): number => {
    const r = coreRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : v;
  };
  const getRawDeep = (id: string): number => {
    const r = deepRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : v;
  };

  const narcissism = [
    getRawDeep('chx_pf05'),
    getRawDeep('chx_sb02'),
    getRawDeep('chx_sb03'),
  ].every(v => v >= 6) && sensitivity < 34;

  const machiavellianism = [
    getRawCore('ch_c08'),
    getRawCore('ch_x05'),
    getRawCore('ch_x08'),
    getRawDeep('chx_su01'),
  ].every(v => v >= 6) && independence >= 80;

  const psychopathy = [
    getRawCore('ch_r06'),
    getRawDeep('chx_sn03'),
    getRawDeep('chx_tn03'),
    getRawDeep('chx_ct03'),
  ].every(v => v >= 6) && conscience < 34;

  const sociopathy = [
    getRawCore('ch_c08'),
    getRawDeep('chx_ad03'),
    getRawCore('ch_r06'),
  ].every(v => v >= 6) && control >= 67 && conscience < 34;

  const decoyVal = getRawDeep('chx_val01');
  const decoyFakingFlag = decoyVal >= 6;

  return {
    subscales,
    precise,
    darkTypes: { narcissism, machiavellianism, psychopathy, sociopathy },
    decoyFakingFlag,
  };
}

// ── AP Deep 심화 채점 (흥미-효능감 매트릭스) ──

export function scoreAPDeep(responses: ResponseRow[]): APDeepScores {
  const coreRes = responses.filter(r => r.module === 'aptitude_core');
  const deepRes = responses.filter(r => r.module === 'aptitude_deep');

  const getCore = (id: string): number => {
    const r = coreRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : v;
  };
  const getDeep = (id: string): number => {
    const r = deepRes.find(x => x.question_id === id);
    if (!r) return 0;
    const v = parseInt(r.option_value);
    return isNaN(v) ? 0 : v;
  };

  const interest = {
    R: score100(['ap_r01','ap_r02','ap_r03','ap_r04','ap_r05'].map(getCore)),
    I: score100(['ap_i01','ap_i02','ap_i03','ap_i04','ap_i05'].map(getCore)),
    A: score100(['ap_a01','ap_a02','ap_a03','ap_a04','ap_a05'].map(getCore)),
    S: score100(['ap_s01','ap_s02','ap_s03','ap_s04','ap_s05'].map(getCore)),
    E: score100(['ap_e01','ap_e02','ap_e03','ap_e04','ap_e05'].map(getCore)),
    C: score100(['ap_c01','ap_c02','ap_c03','ap_c04','ap_c05'].map(getCore)),
  };

  const efficacy = {
    R: score100(['apx_r01','apx_r02','apx_r03','apx_r04','apx_r05'].map(getDeep)),
    I: score100(['apx_i01','apx_i02','apx_i03','apx_i04','apx_i05'].map(getDeep)),
    A: score100(['apx_a01','apx_a02','apx_a03','apx_a04','apx_a05'].map(getDeep)),
    S: score100(['apx_s01','apx_s02','apx_s03','apx_s04','apx_s05'].map(getDeep)),
    E: score100(['apx_e01','apx_e02','apx_e03','apx_e04','apx_e05'].map(getDeep)),
    C: score100(['apx_c01','apx_c02','apx_c03','apx_c04','apx_c05'].map(getDeep)),
  };

  const total = {
    R: Math.round(interest.R * 0.6 + efficacy.R * 0.4),
    I: Math.round(interest.I * 0.6 + efficacy.I * 0.4),
    A: Math.round(interest.A * 0.6 + efficacy.A * 0.4),
    S: Math.round(interest.S * 0.6 + efficacy.S * 0.4),
    E: Math.round(interest.E * 0.6 + efficacy.E * 0.4),
    C: Math.round(interest.C * 0.6 + efficacy.C * 0.4),
  };

  const cell = (int: number, eff: number): APMatrixCell => {
    if (int >= 60 && eff >= 60) return '최적영역';
    if (int >= 60 && eff < 60) return '탐색학습필요';
    if (int < 60 && eff >= 60) return '소진리스크';
    return '비관심영역';
  };

  const matrix = {
    R: cell(interest.R, efficacy.R),
    I: cell(interest.I, efficacy.I),
    A: cell(interest.A, efficacy.A),
    S: cell(interest.S, efficacy.S),
    E: cell(interest.E, efficacy.E),
    C: cell(interest.C, efficacy.C),
  };

  const sorted = Object.entries(total).sort((a, b) => b[1] - a[1]);
  const top3TotalCode = sorted.slice(0, 3).map(([k]) => k).join('');

  return { interest, efficacy, total, matrix, top3TotalCode };
}

// ── 왜곡 탐지 — inconsistency_flag + pattern_flag ─────────────────────────
// HIT_Scoring_Algorithm.md 3가지 왜곡 조건 완전 구현
// 결과는 관리자 전용 hit_admin_flags에만 저장 — 내담자 절대 비노출

export interface DistortionFlags {
  /** 미끼 문항 6~7점 → 사회적 바람직성 편향 */
  fakingFlag: boolean;
  /** 동일 축 역문항 불일치 ≥50% → 무성의 응답 또는 왜곡 */
  inconsistencyFlag: boolean;
  /** 연속 8문항+ 동일 점수 → 패턴 응답(무성의) */
  patternFlag: boolean;
  /** 상세 정보 (관리자 전용) */
  detail: {
    inconsistentAxes: string[];
    longestRun: number;
    patternValue: number | null;
  };
}

export function detectDistortion(
  responses: ResponseRow[],
  ptScores: PTScores,
): DistortionFlags {
  // 1. faking_flag: PT 미끼 문항 (이미 scorePT에서 계산됨)
  const fakingFlag = ptScores.fakingFlag;

  // 2. inconsistency_flag: 동일 축 역문항 불일치
  // 각 PT 축에서 정방향/역방향 문항 평균 차이 > 3.5 (7점 척도 50%)이면 불일치
  const ptRes = responses.filter(r => r.module === 'personality_type');
  const getVal = (id: string): number => {
    const r = ptRes.find(x => x.question_id === id);
    if (!r) return 0;
    return parseInt(r.option_value) || 0;
  };

  // 각 축의 정방향/역방향 문항 평균을 비교
  const axisChecks: { axis: string; fwdIds: string[]; revIds: string[] }[] = [
    {
      axis: 'E/I',
      fwdIds: ['pt_e01','pt_e02','pt_e03','pt_e04','pt_e05','pt_e06','pt_e07','pt_e08'],
      revIds: ['pt_i01','pt_i02','pt_i03','pt_i04','pt_i05','pt_i06','pt_i07'],
    },
    {
      axis: 'N/S',
      fwdIds: ['pt_n01','pt_n02','pt_n03','pt_n04','pt_n05','pt_n06','pt_n07'],
      revIds: ['pt_s01','pt_s02','pt_s03','pt_s04','pt_s05','pt_s06','pt_s07'],
    },
    {
      axis: 'T/F',
      fwdIds: ['pt_t01','pt_t02','pt_t03','pt_t04','pt_t05','pt_t06','pt_t07'],
      revIds: ['pt_f01','pt_f02','pt_f03','pt_f04','pt_f05','pt_f06','pt_f07'],
    },
    {
      axis: 'J/P',
      fwdIds: ['pt_j01','pt_j02','pt_j03','pt_j04','pt_j05','pt_j06','pt_j07'],
      revIds: ['pt_p01','pt_p02','pt_p03','pt_p04','pt_p05','pt_p06','pt_p07'],
    },
  ];

  const inconsistentAxes: string[] = [];
  for (const { axis, fwdIds, revIds } of axisChecks) {
    const fwdVals = fwdIds.map(getVal).filter(v => v > 0);
    const revVals = revIds.map(getVal).filter(v => v > 0);
    if (fwdVals.length === 0 || revVals.length === 0) continue;
    const fwdAvg = fwdVals.reduce((a, b) => a + b, 0) / fwdVals.length;
    // 역방향 문항은 원래 반대 극성 — 7점 척도에서 역산 후 비교
    const revAvgReversed = revVals.reduce((a, b) => a + (8 - b), 0) / revVals.length;
    // 두 평균 차이가 3.5점(7점 척도 50%) 이상이면 불일치
    if (Math.abs(fwdAvg - revAvgReversed) >= 3.5) {
      inconsistentAxes.push(axis);
    }
  }
  const inconsistencyFlag = inconsistentAxes.length >= 2; // 2축 이상 불일치

  // 3. pattern_flag: 연속 8문항+ 동일 점수
  // 모든 응답을 question_index 순서로 정렬 후 연속 동일값 체크
  const allVals = responses
    .filter(r => ['personality_type','behavior_type','character_core','aptitude_core'].includes(r.module))
    .map(r => parseInt(r.option_value) || 0)
    .filter(v => v > 0);

  let longestRun = 1;
  let currentRun = 1;
  let patternValue: number | null = null;
  for (let i = 1; i < allVals.length; i++) {
    if (allVals[i] === allVals[i - 1]) {
      currentRun++;
      if (currentRun > longestRun) {
        longestRun = currentRun;
        patternValue = allVals[i];
      }
    } else {
      currentRun = 1;
    }
  }
  const patternFlag = longestRun >= 8;

  return {
    fakingFlag,
    inconsistencyFlag,
    patternFlag,
    detail: { inconsistentAxes, longestRun, patternValue: patternFlag ? patternValue : null },
  };
}

// ── DISC × MBTI 교차 패턴 8개 ───────────────────────────────────────────────
// HIT_Scoring_Algorithm.md 1-7 기준 트리거 조건 완전 구현

export interface CrossPattern {
  code: string;
  label: string;
  d_pct: number;
  pt_pct: number;
}

export function computeCrossPatterns(bt: BTScores, pt: PTScores): CrossPattern[] {
  const triggered: CrossPattern[] = [];

  const checks: { code: string; label: string; btVal: number; ptVal: number; btThresh: number; ptThresh: number }[] = [
    { code: 'CROSS-D-T', label: '냉철한 결단력',        btVal: bt.d, ptVal: pt.tScore,  btThresh: 30, ptThresh: 56 },
    { code: 'CROSS-D-P', label: '기회 포착형 리더십',    btVal: bt.d, ptVal: 100 - pt.jScore, btThresh: 30, ptThresh: 56 },
    { code: 'CROSS-D-J', label: '체계적 추진력',         btVal: bt.d, ptVal: pt.jScore,  btThresh: 30, ptThresh: 56 },
    { code: 'CROSS-D-F', label: '카리스마적 동기부여',   btVal: bt.d, ptVal: 100 - pt.tScore, btThresh: 30, ptThresh: 56 },
    { code: 'CROSS-I-E', label: '영향력 있는 네트워커',  btVal: bt.i, ptVal: pt.eScore,  btThresh: 30, ptThresh: 56 },
    { code: 'CROSS-S-N', label: '비전 있는 조율자',      btVal: bt.s, ptVal: pt.nScore,  btThresh: 30, ptThresh: 56 },
    { code: 'CROSS-S-J', label: '믿을 수 있는 관리자',   btVal: bt.s, ptVal: pt.jScore,  btThresh: 30, ptThresh: 56 },
    { code: 'CROSS-C-N', label: '혁신적 분석가',         btVal: bt.c, ptVal: pt.nScore,  btThresh: 30, ptThresh: 56 },
  ];

  for (const { code, label, btVal, ptVal, btThresh, ptThresh } of checks) {
    if (btVal >= btThresh && ptVal >= ptThresh) {
      triggered.push({ code, label, d_pct: btVal, pt_pct: ptVal });
    }
  }

  return triggered;
}
