-- planners_yearly.anniversaries (jsonb 배열) → planners_calendar_entries 일괄 이전
-- 중복 방지: 같은 member + 같은 제목 + 같은 날짜가 이미 있으면 스킵

INSERT INTO planners_calendar_entries (
    member_id, kind, title, start_date, recurrence
)
SELECT
    y.member_id,
    CASE
        WHEN (a->>'type') = 'event'        THEN 'meeting'
        WHEN (a->>'type') = 'anniversary'  THEN 'anniversary'
        ELSE 'anniversary'
    END AS kind,
    COALESCE(a->>'label', '제목 없음') AS title,
    (a->>'date')::date AS start_date,
    CASE
        WHEN (a->>'type') = 'event' THEN 'none'
        ELSE 'yearly'  -- 기념일은 매년 반복 (생일·결혼기념일 등 자연스러운 기본값)
    END AS recurrence
FROM planners_yearly y, jsonb_array_elements(y.anniversaries) AS a
WHERE jsonb_typeof(y.anniversaries) = 'array'
  AND (a->>'label') IS NOT NULL
  AND (a->>'date') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  AND NOT EXISTS (
      SELECT 1 FROM planners_calendar_entries e
      WHERE e.member_id = y.member_id
        AND e.title = COALESCE(a->>'label', '제목 없음')
        AND e.start_date = (a->>'date')::date
  );
