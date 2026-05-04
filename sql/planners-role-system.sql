-- ============================================================
-- Planner's Planner AI — Role System Migration
-- Phase 1: user_role 컬럼 + template role_tags
-- ============================================================

-- 1. myverse_users에 user_role 추가
ALTER TABLE myverse_users
ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT NULL
CHECK (user_role IS NULL OR user_role IN (
    'office_worker', 'student', 'researcher', 'designer',
    'developer', 'creator', 'sales', 'planner', 'athlete', 'entrepreneur'
));

-- 2. myverse_templates에 role_tags 배열 추가
ALTER TABLE myverse_templates
ADD COLUMN IF NOT EXISTS role_tags TEXT[] DEFAULT '{}';

-- ============================================================
-- 3. 기존 템플릿 role_tags 시드 (카테고리·키워드 기반)
-- ============================================================

-- 회의록·보고서 → 직장인, 기획자, 영업
UPDATE myverse_templates SET role_tags = ARRAY['office_worker','planner','sales']
WHERE label ILIKE '%회의%' OR label ILIKE '%보고%' OR label ILIKE '%미팅%'
   OR key ILIKE '%meeting%' OR key ILIKE '%report%';

-- 강의·수업 노트 → 대학생, 연구원
UPDATE myverse_templates SET role_tags = ARRAY['student','researcher']
WHERE label ILIKE '%강의%' OR label ILIKE '%수업%' OR label ILIKE '%강좌%'
   OR key ILIKE '%lecture%' OR key ILIKE '%class%';

-- 연구·논문 → 연구원
UPDATE myverse_templates SET role_tags = ARRAY['researcher']
WHERE label ILIKE '%연구%' OR label ILIKE '%논문%' OR label ILIKE '%실험%'
   OR key ILIKE '%research%' OR key ILIKE '%paper%';

-- OKR·목표·KR → 직장인, 기획자, 창업가
UPDATE myverse_templates SET role_tags = ARRAY['office_worker','planner','entrepreneur']
WHERE label ILIKE '%OKR%' OR label ILIKE '%목표%' OR key ILIKE '%okr%' OR key ILIKE '%goal%';

-- 전략·기획 프레임워크 → 기획자, 창업가
UPDATE myverse_templates SET role_tags = ARRAY['planner','entrepreneur','office_worker']
WHERE label ILIKE '%전략%' OR label ILIKE '%기획%' OR label ILIKE '%프레임%'
   OR key ILIKE '%strategy%' OR key ILIKE '%framework%';

-- 린캔버스·BMC·비즈니스모델 → 창업가, 기획자
UPDATE myverse_templates SET role_tags = ARRAY['entrepreneur','planner']
WHERE label ILIKE '%캔버스%' OR label ILIKE '%린%' OR label ILIKE '%비즈니스 모델%'
   OR key ILIKE '%lean%' OR key ILIKE '%bmc%' OR key ILIKE '%canvas%';

-- 스프린트·개발·이슈 → 개발자
UPDATE myverse_templates SET role_tags = ARRAY['developer']
WHERE label ILIKE '%스프린트%' OR label ILIKE '%개발%' OR label ILIKE '%이슈%'
   OR key ILIKE '%sprint%' OR key ILIKE '%dev%' OR key ILIKE '%issue%';

-- 콘텐츠·유튜브·SNS → 크리에이터
UPDATE myverse_templates SET role_tags = ARRAY['creator']
WHERE label ILIKE '%콘텐츠%' OR label ILIKE '%유튜브%' OR label ILIKE '%SNS%'
   OR label ILIKE '%스크립트%' OR key ILIKE '%content%' OR key ILIKE '%youtube%';

-- 운동·트레이닝·피트니스 → 운동
UPDATE myverse_templates SET role_tags = ARRAY['athlete']
WHERE label ILIKE '%운동%' OR label ILIKE '%트레이닝%' OR label ILIKE '%피트니스%'
   OR key ILIKE '%workout%' OR key ILIKE '%training%';

-- 시간표 → 대학생
UPDATE myverse_templates SET role_tags = ARRAY['student']
WHERE label ILIKE '%시간표%' OR key ILIKE '%timetable%';

-- 영업·고객·CRM → 영업
UPDATE myverse_templates SET role_tags = ARRAY['sales','office_worker']
WHERE label ILIKE '%영업%' OR label ILIKE '%고객%' OR label ILIKE '%세일즈%'
   OR key ILIKE '%sales%' OR key ILIKE '%customer%' OR key ILIKE '%crm%';

-- 디자인·브리프·무드보드 → 디자이너
UPDATE myverse_templates SET role_tags = ARRAY['designer']
WHERE label ILIKE '%디자인%' OR label ILIKE '%브리프%' OR label ILIKE '%무드보드%'
   OR key ILIKE '%design%' OR key ILIKE '%brief%' OR key ILIKE '%moodboard%';

-- role_tags가 여전히 빈 템플릿 = 모든 역할에 공통 노출
-- (빈 배열 = 필터 없음으로 처리 — 코드에서 role_tags=[] 이면 항상 표시)
