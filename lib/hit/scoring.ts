/**
 * HIT A 채점 알고리즘
 */
import type { MBTIScores, DISCScores, SPowerScores, TypeProfile } from '@/types/hit';
import { findTypeMatch } from './data/type-matching';

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

// ── 기저요인 채점 ──
export function scoreBase(responses: ResponseRow[]): { scores: Record<string, number>; summary: string } {
  const base = responses.filter(r => r.module === 'base');
  const counts: Record<string, number> = { D: 0, I: 0, S: 0, C: 0 };
  base.forEach(r => { counts[r.option_value] = (counts[r.option_value] || 0) + 1; });

  const total = base.length || 1;
  const scores = {
    D: Math.round((counts.D / total) * 100),
    I: Math.round((counts.I / total) * 100),
    S: Math.round((counts.S / total) * 100),
    C: Math.round((counts.C / total) * 100),
  };

  const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const summaryMap: Record<string, string> = {
    D: '도전적이고 독립적인 양육 환경에서 성장하여 주도적 성향이 형성되었습니다.',
    I: '사교적이고 활발한 환경에서 성장하여 소통과 관계 형성을 중시합니다.',
    S: '안정적이고 지지적인 환경에서 성장하여 꾸준함과 조화를 추구합니다.',
    C: '체계적이고 분석적인 환경에서 성장하여 논리적 사고를 중시합니다.',
  };

  return { scores, summary: summaryMap[dominant] || '' };
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
