/**
 * HIT AI 해설 설정 SSOT (2026-10-12)
 *
 * HIT 결과의 점수·유형·등급·리포트 모듈은 전부 서버의 규칙 기반 채점(lib/hit/scoring*.ts)이 정한다.
 * AI는 그 점수를 받아 "읽기 쉬운 해설 문단"만 쓴다 — 점수를 바꾸거나 새로 만들지 않는다.
 * AI 호출이 실패해도 결과는 저장되고 화면은 규칙 기반 리포트 모듈로 완결된다.
 *
 * 모델 ID는 여기 한 곳에서만 바꾼다 (채점 API마다 다르게 적혀 있던 무효 ID 'claude-sonnet-4-5-20250514' 정리).
 */
export const HIT_REPORT_MODEL = 'claude-sonnet-4-6';
export const HIT_NARRATIVE_MODEL = 'claude-haiku-4-5-20251001';
