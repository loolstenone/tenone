/**
 * HIT A 출제 모듈 SSOT (2026-10-12)
 *   - HIT 검사는 회원 전용 (2026-10-12 결정) — 4모듈 + UF 기저요인(base) 전부 출제
 *   - UF = 본인 리포트 전용 (S-Power·매칭 미사용)
 * 문항 수는 DB hit_questions가 원천 — 화면 표기는 아래 상수와 DB를 함께 맞춘다.
 */
export const HIT_A_CORE_MODULES = ['personality_type', 'behavior_type', 'character_core', 'aptitude_core'] as const;
export const HIT_A_UF_MODULE = 'base';

export const HIT_A_CORE_COUNT = 172; // PT 62 · BT 40 · CH 40 · AP 30
export const HIT_A_UF_COUNT = 49;    // 9영역 (종교 문항 삭제 후)
export const HIT_A_TOTAL_COUNT = HIT_A_CORE_COUNT + HIT_A_UF_COUNT; // 221
