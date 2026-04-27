-- Planner's Planner AI: 'midday' 브리핑 타입 추가 (점심·오후 중간 점검)
-- 기존 'morning'·'evening' 외에 'midday' 추가하여 시간대별 톤 차별화 + 통합 채팅 UI 지원

ALTER TABLE planners_ai_briefings
  DROP CONSTRAINT IF EXISTS planners_ai_briefings_briefing_type_check;

ALTER TABLE planners_ai_briefings
  ADD CONSTRAINT planners_ai_briefings_briefing_type_check
  CHECK (briefing_type IN ('morning', 'midday', 'evening'));
