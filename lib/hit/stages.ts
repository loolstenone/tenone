/**
 * HIT 검사 체계 SSOT (2026-10-12 재편 — docs/HIT_Structure_Consulting_2026-10.md)
 *
 *   공통 (전 회원)      A 정체성 · B 역량·방향
 *   생애주기 (1인 1개)  C 진입 · D 전환 · E 리더십 · F 2막
 *   상황 모듈           GAP 경력 공백·복귀 (단계와 무관, 해당자만)
 *
 * 화면 표기 (2026-10-13 사용자 결정 — 한국어 우선): 제목 = code "기본 성향 검사 (Archetype)", 문장 안 = ko "기본 성향 검사".
 *   영어 이름(brand)은 괄호 보조로만. 상황 설명(name)이 부제. 글자(letter A~G)는 작은 배지에만.
 *   (2026-10-12의 "HIT - Archetype" 표기는 영어만으로 이해하기 어려워 폐지)
 * 이름을 바꾸는 곳은 여기 한 곳.
 * DB test_type · 결과 테이블 · 라우트는 key를 그대로 쓴다 (`hit_{key}_results`, `/hero/hit/{key}`).
 */

export type HitStageKey = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'gap';

export interface HitStageDef {
  key: HitStageKey;
  /** DB hit_sessions.test_type · hit_questions.test_type */
  testType: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'GAP';
  /** 기호 글자 (A~F, G) — 작은 배지용 */
  letter: string;
  /** 검사 제목 표기 — "기본 성향 검사 (Archetype)" (제목·카드·배지 옆) */
  code: string;
  /** 문장 안 표기 — "기본 성향 검사" (조사가 붙는 자리: "기본 성향 검사를 먼저…") */
  ko: string;
  /** 검사 이름 — 제목 (A Archetype · B Bounce · C Challenger · D Departure · E Elevate · F Flourish · G Gap) — 표기는 G, key·라우트·DB는 'gap' 그대로 */
  brand: string;
  /** 상황 설명 — 부제 */
  name: string;
  /** 한 줄 설명 */
  desc: string;
  group: 'common' | 'stage' | 'situation';
  /** 문항 수 (화면 안내용 — 실제 출제는 DB. 2026-10-12 하네스로 실측: B 112 · C 78 · D 100 · E 120 · F 112 · GAP 128) */
  approxQuestions: number;
}

export const HIT_STAGES: Record<HitStageKey, HitStageDef> = {
  a:   { key: 'a',   testType: 'A',   letter: 'A', code: '기본 성향 검사 (Archetype)', ko: '기본 성향 검사', brand: 'Archetype', name: '나에 대한 이해', desc: '성격·행동 유형·성품·적성·성장 배경을 함께 보고, 나만의 강점과 64가지 유형 중 내 유형을 알려 드립니다.', group: 'common',    approxQuestions: 217 },
  b:   { key: 'b',   testType: 'B',   letter: 'B', code: '역량·방향 검사 (Bounce)', ko: '역량·방향 검사', brand: 'Bounce', name: '역량과 방향', desc: "핵심 역량, 직무별 역량, '할 수 있다'는 자신감, 나와 직무에 대한 이해를 진단합니다.", group: 'common',    approxQuestions: 112 },
  c:   { key: 'c',   testType: 'C',   letter: 'C', code: '사회 진입 검사 (Challenger)', ko: '사회 진입 검사', brand: 'Challenger', name: '대학생 · 사회 초년생', desc: '진로 결정, 취업 준비, 첫 직무 적응 상태를 진단합니다.',                     group: 'stage',     approxQuestions: 78 },
  d:   { key: 'd',   testType: 'D',   letter: 'D', code: '이직 검사 (Departure)', ko: '이직 검사', brand: 'Departure', name: '경력 이직', desc: '경력 자산, 이직 동기, 옮겨 갈 수 있는 정도를 보고 어디로, 언제 움직일지 정리합니다.',                              group: 'stage',     approxQuestions: 99 },
  e:   { key: 'e',   testType: 'E',   letter: 'E', code: '리더 전환 검사 (Elevate)', ko: '리더 전환 검사', brand: 'Elevate', name: '시니어 리더 전환', desc: '전문성, 리더십, 일에 대한 정체성, 인맥을 보고 리더로 옮겨 가는 길을 정리합니다.',                 group: 'stage',     approxQuestions: 120 },
  f:   { key: 'f',   testType: 'F',   letter: 'F', code: '인생 2막 검사 (Flourish)', ko: '인생 2막 검사', brand: 'Flourish', name: '은퇴 · 퇴직 후 인생 2막', desc: '삶의 만족도, 남은 열정, 2막의 방향, 물려줄 경험, 사회적 관계를 보고 2막을 설계합니다.',            group: 'stage',     approxQuestions: 112 },
  gap: { key: 'gap', testType: 'GAP', letter: 'G', code: '경력 공백 복귀 검사 (Gap)', ko: '경력 공백 복귀 검사', brand: 'Gap', name: '경력 공백 후 복귀', desc: '공백이 생긴 사정, 예전 경력이 지금도 통하는 정도, 다시 일어설 힘, 복귀 방향을 봅니다. 공백이 있는 분만 합니다.', group: 'situation', approxQuestions: 126 },
};

/** 글자(A~G) → 검사 정의 */
export const HIT_BY_LETTER: Record<string, HitStageDef> = Object.fromEntries(Object.values(HIT_STAGES).map(s => [s.letter, s]));

export const HIT_COMMON: HitStageDef[] = [HIT_STAGES.a, HIT_STAGES.b];
export const HIT_LIFE_STAGES: HitStageDef[] = [HIT_STAGES.c, HIT_STAGES.d, HIT_STAGES.e, HIT_STAGES.f];
export const HIT_SITUATIONS: HitStageDef[] = [HIT_STAGES.gap];

/** 한 줄 표기 — "Challenger · 대학생 · 사회 초년생" */
export function hitStageLabel(s: HitStageDef): string {
  return `${s.brand} · ${s.name}`;
}

export function hitStagePath(key: HitStageKey): string {
  return `/hero/hit/${key}`;
}

export function hitStageByTestType(testType: string): HitStageDef | undefined {
  return Object.values(HIT_STAGES).find(s => s.testType === testType);
}

/** 문항당 평균 응답 시간(초) — 소요 시간 안내의 단일 기준 */
export const HIT_SECONDS_PER_ITEM = 6;

/** 문항 수 → 예상 소요 분 (올림) */
export function estimateMinutes(questionCount: number): number {
  return Math.ceil((questionCount * HIT_SECONDS_PER_ITEM) / 60);
}

/** 단계별 예상 소요 분 */
export function hitStageMinutes(key: HitStageKey): number {
  return estimateMinutes(HIT_STAGES[key].approxQuestions);
}

/** 화면 표기 — "약 23분" */
export function hitStageMinutesLabel(key: HitStageKey): string {
  return `약 ${hitStageMinutes(key)}분`;
}

/** 단계별 문항 수 */
export function hitStageQuestionCount(key: HitStageKey): number {
  return HIT_STAGES[key].approxQuestions;
}
