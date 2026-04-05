/**
 * HIT B 채점 알고리즘
 * 7점 리커트 척도 기반: personality, riasec, competency, readiness
 */

interface ResponseRow {
  module: string;
  question_id: string;
  option_value: string;  // '1'~'7' (Likert)
}

// ── 성격 특성 채점 (15 하위척도) ──

export function scorePersonality(responses: ResponseRow[]): {
  scores: Record<string, number>;
  darkTriadFlags: Record<string, boolean>;
} {
  const personality = responses.filter(r => r.module === 'personality');

  // question_id 형식: 'pers_001' — subscale은 question data에서 매핑됨
  // option_value에 subscale 정보 인코딩: 'subscale:value' 또는 순수 숫자
  // 여기서는 question_id에서 subscale 매핑 필요 — subscale map 사용

  // subscale별로 그룹핑 (question_id 패턴 기반)
  const subscaleMap = buildSubscaleMap(personality);
  const scores: Record<string, number> = {};
  const darkTriadFlags: Record<string, boolean> = {};

  for (const [subscale, values] of Object.entries(subscaleMap)) {
    if (values.length === 0) continue;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    // 1-7 → 0-100 스케일
    scores[subscale] = Math.round(((avg - 1) / 6) * 100);

    // Dark triad 판별: _dark 접미사 subscale이 70 초과 시 플래그
    if (subscale.endsWith('_dark') && scores[subscale] > 70) {
      darkTriadFlags[subscale] = true;
    } else if (subscale.endsWith('_dark')) {
      darkTriadFlags[subscale] = false;
    }
  }

  return { scores, darkTriadFlags };
}

function buildSubscaleMap(responses: ResponseRow[]): Record<string, number[]> {
  const map: Record<string, number[]> = {};

  for (const r of responses) {
    // option_value 형식: 'subscale:value:reverse' 또는 그냥 숫자
    const parts = r.option_value.split(':');
    let subscale: string;
    let value: number;
    let reverse = false;

    if (parts.length >= 2) {
      subscale = parts[0];
      value = parseInt(parts[1], 10);
      reverse = parts[2] === 'r';
    } else {
      // fallback: question_id에서 subscale 추정
      subscale = extractSubscale(r.question_id);
      value = parseInt(r.option_value, 10);
    }

    if (isNaN(value)) continue;
    if (reverse) value = 8 - value;

    if (!map[subscale]) map[subscale] = [];
    map[subscale].push(value);
  }

  return map;
}

function extractSubscale(questionId: string): string {
  // question_id 형식 예: 'pers_openness_001' → 'openness'
  const parts = questionId.split('_');
  if (parts.length >= 3) {
    return parts.slice(1, -1).join('_');
  }
  return 'unknown';
}

// ── RIASEC 채점 ──

export function scoreRIASEC(responses: ResponseRow[]): {
  r: number; i: number; a: number; s: number; e: number; c: number;
  hollandCode: string;
} {
  const riasec = responses.filter(r => r.module === 'riasec');

  const sums: Record<string, number[]> = { R: [], I: [], A: [], S: [], E: [], C: [] };

  for (const resp of riasec) {
    // option_value 형식: 'TYPE:value' (예: 'R:5')
    const parts = resp.option_value.split(':');
    let type: string;
    let value: number;

    if (parts.length >= 2) {
      type = parts[0].toUpperCase();
      value = parseInt(parts[1], 10);
    } else {
      // fallback: question_id에서 type 추출
      type = extractRIASECType(resp.question_id);
      value = parseInt(resp.option_value, 10);
    }

    if (isNaN(value) || !sums[type]) continue;
    sums[type].push(value);
  }

  const scores: Record<string, number> = {};
  for (const [type, values] of Object.entries(sums)) {
    if (values.length === 0) {
      scores[type] = 0;
      continue;
    }
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    scores[type] = Math.round(((avg - 1) / 6) * 100);
  }

  // Top 3 = Holland Code
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const hollandCode = sorted.slice(0, 3).map(([k]) => k).join('');

  return {
    r: scores.R, i: scores.I, a: scores.A,
    s: scores.S, e: scores.E, c: scores.C,
    hollandCode,
  };
}

function extractRIASECType(questionId: string): string {
  // question_id 형식 예: 'riasec_r_001' → 'R'
  const parts = questionId.split('_');
  if (parts.length >= 3) {
    return parts[1].toUpperCase();
  }
  return 'R';
}

// ── 역량 채점 ──

export function scoreCompetency(
  responses: ResponseRow[],
  track: string,
): {
  common: Record<string, number>;
  trackScores: Record<string, number>;
} {
  const competency = responses.filter(r => r.module === 'competency');

  const commonMap: Record<string, number[]> = {};
  const trackMap: Record<string, number[]> = {};

  for (const resp of competency) {
    // option_value 형식: 'subscale:value[:track]'
    const parts = resp.option_value.split(':');
    let subscale: string;
    let value: number;
    let respTrack: string | null = null;

    if (parts.length >= 2) {
      subscale = parts[0];
      value = parseInt(parts[1], 10);
      if (parts.length >= 3 && parts[2] !== 'r') {
        respTrack = parts[2];
      }
    } else {
      subscale = extractSubscale(resp.question_id);
      value = parseInt(resp.option_value, 10);
      // track 여부는 question_id에서 판단
      if (resp.question_id.includes(track)) {
        respTrack = track;
      }
    }

    if (isNaN(value)) continue;

    if (respTrack) {
      if (!trackMap[subscale]) trackMap[subscale] = [];
      trackMap[subscale].push(value);
    } else {
      if (!commonMap[subscale]) commonMap[subscale] = [];
      commonMap[subscale].push(value);
    }
  }

  const common: Record<string, number> = {};
  for (const [sub, values] of Object.entries(commonMap)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    common[sub] = Math.round(((avg - 1) / 6) * 100);
  }

  const trackScores: Record<string, number> = {};
  for (const [sub, values] of Object.entries(trackMap)) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    trackScores[sub] = Math.round(((avg - 1) / 6) * 100);
  }

  return { common, trackScores };
}

// ── 준비도 채점 ──

export function scoreReadiness(responses: ResponseRow[]): {
  self: number;
  portfolio: number;
  interview: number;
  network: number;
  total: number;
  grade: string;
  gaps: string[];
} {
  const readiness = responses.filter(r => r.module === 'readiness');

  const domainMap: Record<string, number[]> = {
    self: [],
    portfolio: [],
    interview: [],
    network: [],
  };

  // option_value 도메인명 → 코드 도메인 매핑
  const domainAlias: Record<string, string> = {
    self: 'self',
    self_understanding: 'self',
    portfolio: 'portfolio',
    interview: 'interview',
    interview_prep: 'interview',
    network: 'network',
    networking: 'network',
  };

  for (const resp of readiness) {
    const parts = resp.option_value.split(':');
    let domain: string;
    let value: number;

    if (parts.length >= 2) {
      domain = domainAlias[parts[0]] || parts[0];
      value = parseInt(parts[1], 10);
    } else {
      const raw = extractDomain(resp.question_id);
      domain = domainAlias[raw] || raw;
      value = parseInt(resp.option_value, 10);
    }

    if (isNaN(value) || !domainMap[domain]) continue;
    domainMap[domain].push(value);
  }

  const scores: Record<string, number> = {};
  for (const [domain, values] of Object.entries(domainMap)) {
    if (values.length === 0) {
      scores[domain] = 0;
      continue;
    }
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    scores[domain] = Math.round(((avg - 1) / 6) * 100);
  }

  const self = scores.self;
  const portfolio = scores.portfolio;
  const interview = scores.interview;
  const network = scores.network;
  const total = Math.round((self + portfolio + interview + network) / 4);

  // 등급: A>=80, B>=65, C>=50, D<50
  let grade: string;
  if (total >= 80) grade = 'A';
  else if (total >= 65) grade = 'B';
  else if (total >= 50) grade = 'C';
  else grade = 'D';

  // 60 미만 도메인 = gap
  const gaps: string[] = [];
  const domainNames: Record<string, string> = {
    self: '자기이해',
    portfolio: '포트폴리오',
    interview: '면접준비',
    network: '네트워킹',
  };
  for (const [domain, score] of Object.entries(scores)) {
    if (score < 60) {
      gaps.push(domainNames[domain] || domain);
    }
  }

  return { self, portfolio, interview, network, total, grade, gaps };
}

function extractDomain(questionId: string): string {
  // question_id 형식 예: 'read_self_001' → 'self'
  const parts = questionId.split('_');
  if (parts.length >= 3) {
    return parts[1];
  }
  return 'self';
}

// ── 여정 단계 판별 ──

export function determineJourneyStage(readinessTotal: number, competencyAvg: number): string {
  if (readinessTotal >= 80 && competencyAvg >= 70) return 'ready';
  if (readinessTotal >= 60 && competencyAvg >= 50) return 'developing';
  if (readinessTotal >= 40) return 'exploring';
  return 'discovering';
}

// ── 주의 신호 산출 (소비자 비노출) ──

export function computeAlertScores(personalityScores: Record<string, number>): {
  alertN1: number;
  alertM1: number;
  alertP1: number;
  alertLevel: number;
} {
  // _dark subscale에서 추출
  const alertN1 = personalityScores['narcissism_dark'] ?? 0;
  const alertM1 = personalityScores['machiavellianism_dark'] ?? 0;
  const alertP1 = personalityScores['psychopathy_dark'] ?? 0;

  // 70 이상 = 감지
  let alertLevel = 0;
  if (alertN1 >= 70) alertLevel++;
  if (alertM1 >= 70) alertLevel++;
  if (alertP1 >= 70) alertLevel++;

  return { alertN1, alertM1, alertP1, alertLevel };
}
