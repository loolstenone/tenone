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
      if (score >= 67) modules.push(`UF-${mk}-HIGH`);
      else if (score >= 34) modules.push(`UF-${mk}-MID`);
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

  // 4. MBTI 축별 (4축 × 강도)
  modules.push(getMbtiModule('E', 'I', scores.mbtiEScore));
  modules.push(getMbtiModule('S', 'N', 100 - scores.mbtiSScore));
  modules.push(getMbtiModule('T', 'F', 100 - scores.mbtiTScore));
  modules.push(getMbtiModule('J', 'P', 100 - scores.mbtiJScore));

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
      harmony: 'HARMONY', breakthrough: 'BREAK', stability: 'GUARD',
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
  personalityScores: Record<string, number>;
  hollandCode: string;
  competencyCommon: Record<string, number>;
  readinessGrade: string;
}

function getLevel(score: number): string {
  if (score >= 67) return 'HIGH';
  if (score >= 34) return 'MID';
  return 'LOW';
}

export function selectBModules(scores: HitBScores): string[] {
  const modules: string[] = [];

  // 1. 인성 모듈 (personality) — 5개 영역
  const personalityAreas: Record<string, { key: string; modulePrefix: string }> = {
    emotional: { key: 'emotional', modulePrefix: 'EMOTIONAL' },
    ethics: { key: 'ethics', modulePrefix: 'ETHICS' },
    growth: { key: 'growth', modulePrefix: 'GROWTH' },
    integrity: { key: 'integrity', modulePrefix: 'INTEGRITY' },
    relation: { key: 'relation', modulePrefix: 'RELATION' },
  };

  // personalityScores에서 영역별 평균으로 매핑
  const pScores = scores.personalityScores;
  const emotionalAvg = Math.round(((pScores.tension || 50) + (100 - (pScores.suspicion || 50))) / 2);
  const ethicsAvg = Math.round((pScores.conscience || 50));
  const growthAvg = Math.round(((pScores.openness || 50) + (pScores.adventure || 50)) / 2);
  const integrityAvg = Math.round(((pScores.self_discipline || 50) + (pScores.perfectionism || 50)) / 2);
  const relationAvg = Math.round(((pScores.warmth || 50) + (pScores.social_boldness || 50)) / 2);

  modules.push(`EMOTIONAL-${getLevel(emotionalAvg)}`);
  modules.push(`ETHICS-${getLevel(ethicsAvg)}`);
  modules.push(`GROWTH-${getLevel(growthAvg)}`);
  modules.push(`INTEGRITY-${getLevel(integrityAvg)}`);
  modules.push(`RELATION-${getLevel(relationAvg)}`);

  // 2. RIASEC 모듈 — Holland Code로 매핑
  if (scores.hollandCode) {
    modules.push(`RIASEC-${scores.hollandCode}`);
  }

  // 3. 역량 모듈 — 6개 핵심 역량 등급
  const compAreas: Record<string, string[]> = {
    COMM: ['communication', 'collaboration', 'persuasion'],
    ANAL: ['analytics', 'data_driven', 'market_analysis'],
    CREATE: ['storytelling', 'visual_sense', 'creative_concept', 'content_creation'],
    EXEC: ['campaign_mgmt', 'self_management', 'initiative', 'consistency'],
    LEAD: ['stakeholder_mgmt', 'strategic_thinking'],
    PLAN: ['planning', 'reporting', 'seo'],
  };

  Object.entries(compAreas).forEach(([prefix, keys]) => {
    const vals = keys.map(k => scores.competencyCommon[k] ?? 0).filter(v => v > 0);
    if (vals.length === 0) return;
    const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    let grade: string;
    if (avg >= 80) grade = 'A';
    else if (avg >= 60) grade = 'B';
    else if (avg >= 40) grade = 'C';
    else grade = 'D';
    modules.push(`COMP-${prefix}-${grade}`);
  });

  // 4. 준비도 모듈
  modules.push(`READY-${scores.readinessGrade}`);

  return modules;
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
