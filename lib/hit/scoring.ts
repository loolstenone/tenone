/**
 * HIT A 채점 알고리즘
 */
import type { MBTIScores, DISCScores, SPowerScores, UFScores, TypeProfile } from '@/types/hit';
import { findTypeMatch } from './data/type-matching';
import { ufQuestions } from './data/base-questions';

interface ResponseRow {
  module: string;
  question_id: string;
  option_value: string;
}

// ── MBTI 채점 ──
export function scoreMBTI(responses: ResponseRow[]): MBTIScores {
  const mbti = responses.filter(r => r.module === 'mbti');
  const counts: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  mbti.forEach(r => { counts[r.option_value] = (counts[r.option_value] || 0) + 1; });

  const eScore = Math.round((counts.E / (counts.E + counts.I || 1)) * 100);
  const sScore = Math.round((counts.S / (counts.S + counts.N || 1)) * 100);
  const tScore = Math.round((counts.T / (counts.T + counts.F || 1)) * 100);
  const jScore = Math.round((counts.J / (counts.J + counts.P || 1)) * 100);

  const type = (eScore >= 50 ? 'E' : 'I')
    + (sScore >= 50 ? 'S' : 'N')
    + (tScore >= 50 ? 'T' : 'F')
    + (jScore >= 50 ? 'J' : 'P');

  return { eScore, sScore, tScore, jScore, type };
}

// ── DISC 채점 ──
export function scoreDISC(responses: ResponseRow[]): DISCScores {
  const disc = responses.filter(r => r.module === 'disc');
  const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
  disc.forEach(r => { counts[r.option_value] = (counts[r.option_value] || 0) + 1; });

  const total = disc.length || 1;
  const d = Math.round((counts.D / total) * 100);
  const i = Math.round((counts.I / total) * 100);
  const s = Math.round((counts.S / total) * 100);
  const c = Math.round((counts.C / total) * 100);

  // Primary = 최고점
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0][0];

  // Subtype = 15%+ 포함 (최대 3자)
  const threshold = total * 0.15;
  const subtype = sorted.filter(([, cnt]) => cnt >= threshold).map(([k]) => k).join('');

  return { d, i, s, c, primary, subtype };
}

// ── UF 기저요인 채점 (9영역 × 7점 리커트) ──

// 문항 ID → subscale 매핑 (ufQuestions에서 구축)
const UF_SUBSCALE_MAP: Record<string, keyof UFScores> = {};
const UF_REVERSE_SET = new Set<string>();
ufQuestions.forEach(q => {
  UF_SUBSCALE_MAP[q.id] = q.subscale as keyof UFScores;
  if (q.reverse) UF_REVERSE_SET.add(q.id);
});

export function scoreUF(responses: ResponseRow[]): UFScores {
  const uf = responses.filter(r => r.module === 'base');

  // 영역별 점수 누적
  const sums: Record<string, number[]> = {};

  uf.forEach(r => {
    const subscale = UF_SUBSCALE_MAP[r.question_id];
    if (!subscale) return;
    if (!sums[subscale]) sums[subscale] = [];

    let value = parseInt(r.option_value); // 1~7
    if (isNaN(value)) return;
    if (UF_REVERSE_SET.has(r.question_id)) {
      value = 8 - value; // 역문항 변환
    }
    sums[subscale].push(value);
  });

  // 영역별 평균 → 0~100 스케일 변환
  const toScore = (values: number[] | undefined): number => {
    if (!values || values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(((avg - 1) / 6) * 100); // 1~7 → 0~100
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

/** @deprecated 하위 호환용 — 새 코드에서는 scoreUF 사용 */
export function scoreBase(responses: ResponseRow[]): { scores: Record<string, number>; summary: string } {
  const uf = scoreUF(responses);
  // 가장 높은 영역 3개로 요약 생성
  const sorted = Object.entries(uf).sort((a, b) => b[1] - a[1]);
  const areaNames: Record<string, string> = {
    sibling: '형제관계', parent: '부모관계', family: '가정환경',
    peer: '또래관계', self: '자기개념', temperament: '기질',
    economic: '경제환경', trauma: '전환경험', cultural: '문화맥락',
  };
  const top3 = sorted.slice(0, 3).map(([k]) => areaNames[k]).join(', ');
  const summary = `${top3} 영역에서 높은 점수를 보이며, 이러한 기저요인이 현재 성향 형성에 기여하고 있습니다.`;

  return { scores: uf as unknown as Record<string, number>, summary };
}

// ── 64유형 매칭 ──
export function match64Type(mbti: MBTIScores, disc: DISCScores): TypeProfile {
  return findTypeMatch(mbti.type, disc.subtype);
}

// ── S-Power 강점 산출 ──
export function deriveSPower(mbti: MBTIScores, disc: DISCScores): SPowerScores {
  // MBTI + DISC 기반 가중 조합
  return {
    strategic: clamp(Math.round(
      (100 - mbti.sScore) * 0.4 + // N 높을수록 전략적
      disc.d * 0.3 +
      (100 - mbti.eScore) * 0.15 + // I 성향이 전략적 사고에 기여
      mbti.tScore * 0.15
    )),
    execution: clamp(Math.round(
      disc.d * 0.4 +
      mbti.jScore * 0.3 +
      mbti.eScore * 0.15 +
      mbti.sScore * 0.15
    )),
    creativity: clamp(Math.round(
      (100 - mbti.sScore) * 0.35 + // N 높을수록 창의적
      (100 - mbti.jScore) * 0.25 + // P 높을수록 유연
      disc.i * 0.2 +
      mbti.eScore * 0.2
    )),
    interpersonal: clamp(Math.round(
      disc.i * 0.3 +
      disc.s * 0.2 +
      mbti.eScore * 0.25 +
      (100 - mbti.tScore) * 0.25 // F 높을수록 대인관계
    )),
    analytical: clamp(Math.round(
      disc.c * 0.35 +
      mbti.tScore * 0.3 +
      mbti.sScore * 0.2 +
      mbti.jScore * 0.15
    )),
  };
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}
