-- Planner's Planner AI: 월간 요약 RPC v2 — todo·canceled 카운트 추가
-- 기존 done_tasks·carried_tasks 외에 todo_count·canceled_count 추가하여
-- 월간 통계 UI에서 5종(전체·미완·완료·이월·취소) 비율 표시 가능

CREATE OR REPLACE FUNCTION planners_monthly_summary(
    _member_id UUID,
    _year INTEGER,
    _month INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    _first_day DATE;
    _last_day DATE;
    _done_count INT := 0;
    _carried_count INT := 0;
    _todo_count INT := 0;
    _canceled_count INT := 0;
    _total_count INT := 0;
    _days_recorded INT := 0;
    _projects_completed INT := 0;
    _energy_avg NUMERIC;
    _task RECORD;
    _day RECORD;
    _status TEXT;
BEGIN
    _first_day := make_date(_year, _month, 1);
    _last_day := (_first_day + INTERVAL '1 month - 1 day')::date;

    FOR _day IN
        SELECT tasks, energy_level
        FROM planners_daily
        WHERE member_id = _member_id
          AND date BETWEEN _first_day AND _last_day
    LOOP
        _days_recorded := _days_recorded + 1;
        IF jsonb_typeof(_day.tasks) = 'array' THEN
            FOR _task IN SELECT * FROM jsonb_array_elements(_day.tasks) AS elem
            LOOP
                _total_count := _total_count + 1;
                _status := _task.elem->>'status';
                IF _status = 'done' THEN
                    _done_count := _done_count + 1;
                ELSIF _status = 'carried' THEN
                    _carried_count := _carried_count + 1;
                ELSIF _status = 'canceled' THEN
                    _canceled_count := _canceled_count + 1;
                ELSE
                    -- 'todo' / null / 그 외 미완으로 집계
                    _todo_count := _todo_count + 1;
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    SELECT AVG(energy_level)::numeric(4,2) INTO _energy_avg
    FROM planners_daily
    WHERE member_id = _member_id
      AND date BETWEEN _first_day AND _last_day
      AND energy_level IS NOT NULL;

    SELECT COUNT(*) INTO _projects_completed
    FROM planners_projects
    WHERE member_id = _member_id
      AND completed_at BETWEEN _first_day AND (_last_day + INTERVAL '1 day');

    RETURN jsonb_build_object(
        'first_day', _first_day,
        'last_day', _last_day,
        'days_recorded', _days_recorded,
        'total_tasks', _total_count,
        'todo_tasks', _todo_count,
        'done_tasks', _done_count,
        'carried_tasks', _carried_count,
        'canceled_tasks', _canceled_count,
        'completion_rate',
            CASE WHEN _total_count > 0 THEN
                round((_done_count::numeric / _total_count) * 100, 1)
            ELSE 0 END,
        'energy_avg', _energy_avg,
        'projects_completed', _projects_completed
    );
END;
$$;
