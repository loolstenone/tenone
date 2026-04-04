/**
 * HIT A 보고서 조립기 — 3계층 모듈 조합 시스템
 * Layer 3 (64유형 고유) + Layer 2 (모듈 라이브러리) + Layer 1 (AI 동적)
 */

interface HitAScores {
  discD: number; discI: number; discS: number; discC: number;
  discPrimary: string; discSubtype: string;
  mbtiType: string;
  mbtiEScore: number; mbtiSScore: number; mbtiTScore: number; mbtiJScore: number;
  sPowerScores?: Record<string, number>;
}

/**
 * 점수에 따라 필요한 모듈 ID 목록을 선택
 */
export function selectModules(scores: HitAScores): string[] {
  const modules: string[] = [];

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
