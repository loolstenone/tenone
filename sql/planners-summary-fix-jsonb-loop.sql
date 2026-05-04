-- planners summary 함수 jsonb_array_elements 루프 버그 수정
-- 문제: FOR _task IN SELECT * FROM jsonb_array_elements(...) AS elem 후 _task.elem 참조
--       → "record _task has no field elem" 에러
-- 수정: SELECT value FROM jsonb_array_elements(...) → _task JSONB 변수로 직접 받음
-- 적용일: 2026-05-04

-- myverse_monthly_summary
CREATE OR REPLACE FUNCTION public.myverse_monthly_summary(_member_id uuid, _year integer, _month integer)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    _first_day DATE;
    _last_day DATE;
    _done_count INT := 0;
    _carried_count INT := 0;
    _total_count INT := 0;
    _todo_count INT := 0;
    _canceled_count INT := 0;
    _days_recorded INT := 0;
    _projects_completed INT := 0;
    _energy_avg NUMERIC;
    _task JSONB;
    _day RECORD;
    _status TEXT;
BEGIN
    _first_day := make_date(_year, _month, 1);
    _last_day := (_first_day + INTERVAL '1 month - 1 day')::date;

    FOR _day IN
        SELECT tasks, energy_level
        FROM myverse_daily
        WHERE member_id = _member_id
          AND date BETWEEN _first_day AND _last_day
    LOOP
        _days_recorded := _days_recorded + 1;
        IF jsonb_typeof(_day.tasks) = 'array' THEN
            FOR _task IN SELECT value FROM jsonb_array_elements(_day.tasks)
            LOOP
                _total_count := _total_count + 1;
                _status := _task->>'status';
                IF _status = 'done' THEN
                    _done_count := _done_count + 1;
                ELSIF _status = 'carried' THEN
                    _carried_count := _carried_count + 1;
                ELSIF _status = 'cancelled' OR _status = 'canceled' THEN
                    _canceled_count := _canceled_count + 1;
                ELSE
                    _todo_count := _todo_count + 1;
                END IF;
            END LOOP;
        END IF;
    END LOOP;

    SELECT AVG(energy_level)::numeric(4,2) INTO _energy_avg
    FROM myverse_daily
    WHERE member_id = _member_id
      AND date BETWEEN _first_day AND _last_day
      AND energy_level IS NOT NULL;

    SELECT COUNT(*) INTO _projects_completed
    FROM myverse_projects
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

-- myverse_weekly_summary
CREATE OR REPLACE FUNCTION public.myverse_weekly_summary(_member_id uuid, _year integer, _week integer)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    _week_start DATE;
    _week_end DATE;
    _done_count INT := 0;
    _carried_count INT := 0;
    _total_count INT := 0;
    _notes_count INT := 0;
    _energy_avg NUMERIC;
    _days_recorded INT := 0;
    _task JSONB;
    _day RECORD;
    _status TEXT;
BEGIN
    SELECT week_start, week_end INTO _week_start, _week_end
    FROM myverse_weekly
    WHERE member_id = _member_id AND year = _year AND week = _week;

    IF _week_start IS NULL THEN
        _week_start := (to_date(_year || '-01-04', 'YYYY-MM-DD') + (_week - 1) * 7)::date
                       - EXTRACT(DOW FROM to_date(_year || '-01-04', 'YYYY-MM-DD'))::int + 1;
        _week_end := _week_start + 6;
    END IF;

    FOR _day IN
        SELECT date, tasks, notes, notes_secondary, energy_level, daily_result
        FROM myverse_daily
        WHERE member_id = _member_id
          AND date BETWEEN _week_start AND _week_end
    LOOP
        _days_recorded := _days_recorded + 1;

        IF jsonb_typeof(_day.tasks) = 'array' THEN
            FOR _task IN SELECT value FROM jsonb_array_elements(_day.tasks)
            LOOP
                _total_count := _total_count + 1;
                _status := _task->>'status';
                IF _status = 'done' THEN
                    _done_count := _done_count + 1;
                ELSIF _status = 'carried' THEN
                    _carried_count := _carried_count + 1;
                END IF;
            END LOOP;
        END IF;

        IF _day.notes IS NOT NULL AND length(_day.notes) > 0 THEN
            _notes_count := _notes_count + 1;
        END IF;
        IF _day.notes_secondary IS NOT NULL AND length(_day.notes_secondary) > 0 THEN
            _notes_count := _notes_count + 1;
        END IF;
    END LOOP;

    SELECT AVG(energy_level)::numeric(4,2) INTO _energy_avg
    FROM myverse_daily
    WHERE member_id = _member_id
      AND date BETWEEN _week_start AND _week_end
      AND energy_level IS NOT NULL;

    RETURN jsonb_build_object(
        'week_start', _week_start,
        'week_end', _week_end,
        'days_recorded', _days_recorded,
        'total_tasks', _total_count,
        'done_tasks', _done_count,
        'carried_tasks', _carried_count,
        'completion_rate',
            CASE WHEN _total_count > 0 THEN
                round((_done_count::numeric / _total_count) * 100, 1)
            ELSE 0 END,
        'notes_count', _notes_count,
        'energy_avg', _energy_avg
    );
END;
$$;
