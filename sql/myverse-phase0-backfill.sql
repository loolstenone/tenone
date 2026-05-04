-- Myverse Phase 0-E: 기존 데이터 백필
-- 적용일: 2026-05-04
--
-- 기존 row의 도메인·캡처모드를 추정해 채움. 모두 visibility=private 기본 유지.
-- 사용자가 명시적으로 공개 선택할 때까지 안전.

-- 1) routines: category로 도메인 추정
UPDATE planners_daily_routines SET domain = CASE category
    WHEN 'work'      THEN 'work'
    WHEN 'study'     THEN 'study'
    WHEN 'exercise'  THEN 'body'
    WHEN 'meal'      THEN 'body'
    WHEN 'health'    THEN 'body'
    WHEN 'rest'      THEN 'body'
    WHEN 'transport' THEN 'move'
    WHEN 'social'    THEN 'relation'
    WHEN 'leisure'   THEN 'daily'
    WHEN 'faith'     THEN 'daily'
    ELSE 'daily'
END WHERE domain = 'daily' OR domain IS NULL;

-- 2) places: category로 도메인 추정
UPDATE planners_daily_places SET domain = CASE category
    WHEN 'work'     THEN 'work'
    WHEN 'meal'     THEN 'body'
    WHEN 'exercise' THEN 'body'
    WHEN 'medical'  THEN 'body'
    WHEN 'shopping' THEN 'daily'
    WHEN 'leisure'  THEN 'daily'
    WHEN 'home'     THEN 'daily'
    WHEN 'social'   THEN 'relation'
    ELSE 'daily'
END WHERE domain = 'daily' OR domain IS NULL;

-- 3) calendar_entries: kind로 도메인 추정
UPDATE planners_calendar_entries SET domain = CASE kind
    WHEN 'meeting'        THEN 'work'
    WHEN 'task'           THEN 'work'
    WHEN 'anniversary'    THEN 'daily'
    WHEN 'public_holiday' THEN 'schedule'
    WHEN 'solar_term'     THEN 'schedule'
    ELSE 'schedule'
END WHERE domain = 'daily' OR domain IS NULL;

-- 4) projects: 모두 work 도메인
UPDATE planners_projects SET domain = 'work'
    WHERE domain = 'daily' OR domain IS NULL;

-- 5) contacts: 모두 relation 도메인
UPDATE planners_contacts SET domain = 'relation'
    WHERE domain = 'daily' OR domain IS NULL;

-- 6) moments: 기본 daily 유지 (사진은 컨텍스트 부족, 분류 엔진이 나중에 처리)
-- UPDATE 불필요

-- 7) capture_mode: 기존 데이터는 모두 active (사용자가 직접 입력했음)
UPDATE planners_daily_moments SET capture_mode = 'active' WHERE capture_mode IS NULL OR capture_mode = '';
UPDATE planners_daily_routines SET capture_mode = 'active' WHERE capture_mode IS NULL OR capture_mode = '';
UPDATE planners_daily_places SET capture_mode = 'active' WHERE capture_mode IS NULL OR capture_mode = '';
UPDATE planners_calendar_entries SET capture_mode = 'active' WHERE capture_mode IS NULL OR capture_mode = '';

-- 단, Meta ZIP으로 임포트된 모먼트는 imported로
-- (media_url에 'meta_' 패턴 또는 import-meta 흔적 — 현 데이터에선 식별 어려움, 일단 active)

-- 8) time_axis 백필 — date + visited_at/start_time/happened_at 활용
UPDATE planners_daily_moments
SET time_axis = jsonb_build_object(
    'at', happened_at,
    'date', date,
    'period', CASE
        WHEN happened_at IS NULL THEN NULL
        WHEN EXTRACT(HOUR FROM happened_at AT TIME ZONE 'Asia/Seoul') < 6 THEN 'dawn'
        WHEN EXTRACT(HOUR FROM happened_at AT TIME ZONE 'Asia/Seoul') < 12 THEN 'morning'
        WHEN EXTRACT(HOUR FROM happened_at AT TIME ZONE 'Asia/Seoul') < 18 THEN 'afternoon'
        WHEN EXTRACT(HOUR FROM happened_at AT TIME ZONE 'Asia/Seoul') < 22 THEN 'evening'
        ELSE 'night'
    END
)
WHERE time_axis IS NULL;

UPDATE planners_daily_routines
SET time_axis = jsonb_build_object(
    'date', date,
    'start', start_time,
    'end', end_time,
    'period', CASE
        WHEN start_time IS NULL THEN NULL
        WHEN EXTRACT(HOUR FROM start_time) < 6 THEN 'dawn'
        WHEN EXTRACT(HOUR FROM start_time) < 12 THEN 'morning'
        WHEN EXTRACT(HOUR FROM start_time) < 18 THEN 'afternoon'
        WHEN EXTRACT(HOUR FROM start_time) < 22 THEN 'evening'
        ELSE 'night'
    END
)
WHERE time_axis IS NULL;

UPDATE planners_daily_places
SET time_axis = jsonb_build_object(
    'date', date,
    'visited_at', visited_at,
    'duration_min', duration_min
)
WHERE time_axis IS NULL;

-- 9) content_axis 백필 — 검색 가능한 텍스트 합성
UPDATE planners_daily_moments
SET content_axis = COALESCE(caption, '') || ' ' || COALESCE(location, '') || ' ' || COALESCE(activity, '')
WHERE content_axis IS NULL;

UPDATE planners_daily_routines
SET content_axis = activity || ' ' || COALESCE(note, '')
WHERE content_axis IS NULL;

UPDATE planners_daily_places
SET content_axis = place_name || ' ' || COALESCE(address, '') || ' ' || COALESCE(note, '')
WHERE content_axis IS NULL;
