/**
 * HIT A 보고서 조립기 — 3계층 모듈 조합 시스템
 * Layer 3 (64유형 고유) + Layer 2 (모듈 라이브러리) + Layer 1 (AI 동적)
 */

import type { UFScores } from '@/types/hit';

interface HitAScores {
  discD: number; discI: number; discS: number; discC: number;
  discPrimary: string; discSubtype: string;
  mbtiType: string;
  mbtiEScore: number; mbtiSScore: number; mbtiTScore: number; mbtiJScore: number;
  sPowerScores?: Record<string, number>;
  ufScores?: UFScores;
  /** 흥미 Top3 코드 (예: AES) — RIASEC 해설 선택 */
  apTop3Code?: string | null;
}

/**
 * 점수에 따라 필요한 모듈 ID 목록을 선택
 */
export function selectModules(scores: HitAScores): string[] {
  const modules: string[] = [];

  // 0. UF 기저요인 모듈 (9영역 × HIGH/MID/LOW)
  if (scores.ufScores) {
    const ufModuleKeyMap: Record<keyof UFScores, string> = {
      sibling: 'SIBLING', parent: 'PARENT', family: 'FAMILY',
      peer: 'PEER', self: 'SELF', temperament: 'TEMPER',
      economic: 'ECON', trauma: 'TRAUMA', cultural: 'CULTURE',
    };
    (Object.keys(ufModuleKeyMap) as (keyof UFScores)[]).forEach(key => {
      const score = scores.ufScores![key];
      const mk = ufModuleKeyMap[key];
      // 75/50 — 화면 점수 구간(report-copy 75/50/25)·C~GAP 모듈 선택과 같은 기준 (2026-10-12, 기존 67/34)
      if (score >= 75) modules.push(`UF-${mk}-HIGH`);
      else if (score >= 50) modules.push(`UF-${mk}-MID`);
      else modules.push(`UF-${mk}-LOW`);
    });
  }

  // 1. DISC 주특성
  modules.push(`DISC-${scores.discPrimary}`);

  // 2. DISC 보조특성 조합
  const discScores = [
    { key: 'D', val: scores.discD },
    { key: 'I', val: scores.discI },
    { key: 'S', val: scores.discS },
    { key: 'C', val: scores.discC },
  ].sort((a, b) => b.val - a.val);
  const secondary = discScores[1].key;
  if (secondary !== scores.discPrimary) {
    modules.push(`DISC-${scores.discPrimary}${secondary}`);
  }

  // 3. DISC 상대적 저특성
  const lowest = discScores[3].key;
  modules.push(`DISC-LOW-${lowest}`);

  // 4. MBTI 축별 (4축 × 강도) — 점수는 모두 왼쪽 성향 비율(E·S·T·J, 화면 MBTISpectrum과 같음).
  //    2026-10-12 수정: S·T·J를 100에서 빼서 넘겨 반대 성향 해설이 나가던 결함 (ENFP에게 감각·사고·판단 해설)
  modules.push(getMbtiModule('E', 'I', scores.mbtiEScore));
  modules.push(getMbtiModule('S', 'N', scores.mbtiSScore));
  modules.push(getMbtiModule('T', 'F', scores.mbtiTScore));
  modules.push(getMbtiModule('J', 'P', scores.mbtiJScore));

  // 5. DISC×MBTI 교차 (해당되는 것만)
  if (scores.discPrimary === 'D' && scores.mbtiJScore >= 65) modules.push('CROSS-D-J');
  if (scores.discPrimary === 'D' && scores.mbtiTScore >= 55) modules.push('CROSS-D-T');
  if (scores.discPrimary === 'D' && scores.mbtiJScore < 40) modules.push('CROSS-D-P');
  if (scores.discPrimary === 'D' && scores.mbtiTScore < 45) modules.push('CROSS-D-F');
  if (scores.discPrimary === 'S' && scores.mbtiJScore >= 65) modules.push('CROSS-S-J');
  if (scores.discPrimary === 'I' && scores.mbtiEScore >= 65) modules.push('CROSS-I-E');
  if (scores.discPrimary === 'C' && scores.mbtiSScore < 40) modules.push('CROSS-C-N');
  if (scores.discPrimary === 'S' && scores.mbtiSScore < 40) modules.push('CROSS-S-N');

  // 6. S-Power (상위 3 = 주강점, 하위 2 = 성장)
  if (scores.sPowerScores) {
    const spSorted = Object.entries(scores.sPowerScores)
      .sort(([, a], [, b]) => b - a);
    const spKeyMap: Record<string, string> = {
      strategic: 'STRATEGIC', analytical: 'ANALYTIC', execution: 'EXECUTE',
      interpersonal: 'CONNECT', creativity: 'CREATE',
      harmony: 'HARMONY', breakthrough: 'BREAK', guard: 'GUARD', stability: 'GUARD', // 채점 키는 guard (stability만 있어 원칙 수호 해설이 빠지던 결함, 2026-10-12)
    };

    // Top 3 주강점
    spSorted.slice(0, 3).forEach(([key]) => {
      const moduleKey = spKeyMap[key];
      if (moduleKey) modules.push(`SP-${moduleKey}`);
    });

    // Bottom 2 성장 영역
    spSorted.slice(-2).forEach(([key]) => {
      const moduleKey = spKeyMap[key];
      if (moduleKey) modules.push(`SP-${moduleKey}-GROWTH`);
    });
  }

  // 7. 소통 스타일
  modules.push(`COMM-${scores.discPrimary}`);

  // 8. 흥미 (R4, 2026-10-12) — 상위 2개 유형 해설 + 정확히 맞는 Top3 조합 해설(있을 때만, 없으면 조회에서 빠짐)
  const ap = (scores.apTop3Code ?? '').toUpperCase().replace(/[^RIASEC]/g, '');
  if (ap.length >= 2) {
    modules.push(`RIASEC-TOP-${ap[0]}`, `RIASEC-TOP-${ap[1]}`);
    if (ap.length >= 3) modules.push(`RIASEC-${ap.slice(0, 3)}`);
  }

  return modules;
}

function getMbtiModule(high: string, low: string, score: number): string {
  // score: 0=극low, 50=중립, 100=극high
  if (score >= 76) return `MBTI-${high}-STRONG`;
  if (score >= 61) return `MBTI-${high}-MID`;
  if (score >= 51) return `MBTI-${high}-WEAK`;
  if (score >= 40) return `MBTI-${low}-WEAK`;
  if (score >= 25) return `MBTI-${low}-MID`;
  return `MBTI-${low}-STRONG`;
}

// ══════════════════════════════════════
// HIT B 모듈 선택
// ══════════════════════════════════════

interface HitBScores {
  competencyCommon: Record<string, number>;
}

export const CORE_MODULE_KEY: Record<string, string> = {
  problem_solving: 'PROBLEM', communication: 'COMM', initiative: 'INIT',
  collaboration: 'COLLAB', self_management: 'SELF', learning_agility: 'AGILE',
};

/**
 * HIT - Bounce 해설 — 핵심역량 6 × 4등급 (CORE-{역량}-{A..D}, sql/hit-b-core-modules-2026-10.sql, R1 2026-10-12)
 * 등급 = 화면 구간 75/50/25. 점수 높은 순으로 돌려준다. (옛 COMP-* 6영역 문안은 쓰지 않음)
 */
export function selectBModules(scores: HitBScores): string[] {
  return Object.entries(scores.competencyCommon)
    .filter(([k]) => CORE_MODULE_KEY[k])
    .sort((x, y) => y[1] - x[1])
    .map(([k, v]) => `CORE-${CORE_MODULE_KEY[k]}-${v >= 75 ? 'A' : v >= 50 ? 'B' : v >= 25 ? 'C' : 'D'}`);
}

/**
 * HIT - Bounce 직무 트랙 역량 해설 (TRK-{sub_domain}-{H|M|L}, sql/hit-b-track-modules-2026-10.sql, R2 2026-10-12)
 * H 75+ · M 50~74 · L 50 미만. 22개 트랙 전부 작성(비마케팅 17트랙 = sql/hit-b-track-modules-others-2026-10.sql)
 * — sub_domain은 트랙 사이에 겹치면 안 된다(겹치면 다른 트랙 해설이 나옴). DB에 없는 id는 화면 공통 문장으로 대체.
 */
export function trackModuleId(subDomain: string, v: number): string {
  return `TRK-${subDomain}-${v >= 75 ? 'H' : v >= 50 ? 'M' : 'L'}`;
}
export function selectBTrackModules(trackScores: Record<string, number> | null | undefined): string[] {
  return Object.entries(trackScores ?? {}).map(([k, v]) => trackModuleId(k, Number(v)));
}

/**
 * 모듈 콘텐츠에서 점수 플레이스홀더를 치환
 */
export function interpolateModule(content: string, scores: HitAScores): string {
  return content
    .replace(/\{disc\.d\}/g, String(scores.discD))
    .replace(/\{disc\.i\}/g, String(scores.discI))
    .replace(/\{disc\.s\}/g, String(scores.discS))
    .replace(/\{disc\.c\}/g, String(scores.discC))
    .replace(/\{score\}/g, '') // 개별 모듈에서 점수는 제목에 포함
    .replace(/\{[^}]+\}/g, ''); // 기타 플레이스홀더 제거
}
