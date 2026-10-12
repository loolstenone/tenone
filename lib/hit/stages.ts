/**
 * HIT 검사 체계 SSOT (2026-10-12 재편 — docs/HIT_Structure_Consulting_2026-10.md)
 *
 *   공통 (전 회원)      A 정체성 · B 역량·방향
 *   생애주기 (1인 1개)  C 진입 · D 전환 · E 리더십 · F 2막
 *   상황 모듈           GAP 경력 공백·복귀 (단계와 무관, 해당자만)
 *
 * 화면 표기: 이름(brand, 2026-10-12 — 기호 글자로 시작하는 영어 이름)이 제목, 상황 설명(name)이 부제, 기호(HIT A~F)는 보조.
 * 이름을 바꾸는 곳은 여기 한 곳.
 * DB test_type · 결과 테이블 · 라우트는 key를 그대로 쓴다 (`hit_{key}_results`, `/hero/hit/{key}`).
 */

export type HitStageKey = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'gap';

export interface HitStageDef {
  key: HitStageKey;
  /** DB hit_sessions.test_type · hit_questions.test_type */
  testType: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'GAP';
  /** 기호 표기 (보조) */
  code: string;
  /** 검사 이름 — 제목 (A Archetype · B Bounce · C Challenger · D Departure · E Elevate · F Flourish · GAP Gap) */
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
  a:   { key: 'a',   testType: 'A',   code: 'HIT A', brand: 'Archetype',   name: '나에 대한 이해',           desc: '성격·행동·성품·적성·성장 배경을 교차 분석해 S-Power 강점과 64유형을 도출합니다.', group: 'common',    approxQuestions: 221 },
  b:   { key: 'b',   testType: 'B',   code: 'HIT B', brand: 'Bounce',   name: '역량과 방향',               desc: '핵심역량·직무 트랙 역량·할 수 있다는 효능감·자기와 직무에 대한 이해를 진단합니다.', group: 'common',    approxQuestions: 112 },
  c:   { key: 'c',   testType: 'C',   code: 'HIT C', brand: 'Challenger',   name: '진입 — 대학생, 사회 초년',  desc: '첫 직무 적응, 진로 결정, 취업 준비 상태를 진단합니다.',                     group: 'stage',     approxQuestions: 78 },
  d:   { key: 'd',   testType: 'D',   code: 'HIT D', brand: 'Departure',   name: '전환 — 경력 이직',          desc: '경력 자본 · 이직 동기 · 전환 가능성으로 어디로, 언제 움직일지 봅니다.',                              group: 'stage',     approxQuestions: 100 },
  e:   { key: 'e',   testType: 'E',   code: 'HIT E', brand: 'Elevate',   name: '리더십 전환 (시니어)',      desc: '전문성·리더십·정체성·네트워크로 리더십 전환 지도를 그립니다.',                 group: 'stage',     approxQuestions: 120 },
  f:   { key: 'f',   testType: 'F',   code: 'HIT F', brand: 'Flourish',   name: '인생 2막 준비 (은퇴, 퇴직)', desc: '삶의 만족도·잔여 열정·방향·레거시·사회적 연결로 2막을 설계합니다.',            group: 'stage',     approxQuestions: 112 },
  gap: { key: 'gap', testType: 'GAP', code: 'HIT GAP', brand: 'Gap', name: '경력 공백 · 복귀',          desc: '공백의 맥락, 경력 유효성, 회복탄력성, 복귀 방향을 봅니다. 어느 단계에서든 해당자만.', group: 'situation', approxQuestions: 128 },
};

export const HIT_COMMON: HitStageDef[] = [HIT_STAGES.a, HIT_STAGES.b];
export const HIT_LIFE_STAGES: HitStageDef[] = [HIT_STAGES.c, HIT_STAGES.d, HIT_STAGES.e, HIT_STAGES.f];
export const HIT_SITUATIONS: HitStageDef[] = [HIT_STAGES.gap];

/** 한 줄 표기 — "Challenger · 진입 — 대학생, 사회 초년" */
export function hitStageLabel(s: HitStageDef): string {
  return `${s.brand} · ${s.name}`;
}

export function hitStagePath(key: HitStageKey): string {
  return `/hero/hit/${key}`;
}

export function hitStageByTestType(testType: string): HitStageDef | undefined {
  return Object.values(HIT_STAGES).find(s => s.testType === testType);
}
