-- ============================================================
-- planners_* → myverse_* 일괄 전환
-- ============================================================
-- 마이버스 단일 브랜드화에 따른 DB 명명 정리.
-- 테이블명·함수명·함수 본문을 모두 myverse_ 접두사로 통일한다.
-- 인덱스·FK·RLS 정책·트리거는 테이블 OID 따라 자동으로 따라온다(이름은 cosmetic).
-- 함수 본문 안의 테이블 참조는 늦은 바인딩이므로 반드시 재작성한다.
-- ============================================================

BEGIN;

-- ---------- Phase 1: 테이블 이름 변경 (29개) ----------
ALTER TABLE IF EXISTS planners_users                  RENAME TO myverse_users;
ALTER TABLE IF EXISTS planners_identities             RENAME TO myverse_identities;
ALTER TABLE IF EXISTS planners_calendar_entries       RENAME TO myverse_calendar_entries;
ALTER TABLE IF EXISTS planners_daily                  RENAME TO myverse_daily;
ALTER TABLE IF EXISTS planners_daily_moments          RENAME TO myverse_daily_moments;
ALTER TABLE IF EXISTS planners_daily_places           RENAME TO myverse_daily_places;
ALTER TABLE IF EXISTS planners_daily_routines         RENAME TO myverse_daily_routines;
ALTER TABLE IF EXISTS planners_weekly                 RENAME TO myverse_weekly;
ALTER TABLE IF EXISTS planners_monthly                RENAME TO myverse_monthly;
ALTER TABLE IF EXISTS planners_yearly                 RENAME TO myverse_yearly;
ALTER TABLE IF EXISTS planners_projects               RENAME TO myverse_projects;
ALTER TABLE IF EXISTS planners_project_milestones     RENAME TO myverse_project_milestones;
ALTER TABLE IF EXISTS planners_project_notes          RENAME TO myverse_project_notes;
ALTER TABLE IF EXISTS planners_project_gprs           RENAME TO myverse_project_gprs;
ALTER TABLE IF EXISTS planners_project_vriefs         RENAME TO myverse_project_vriefs;
ALTER TABLE IF EXISTS planners_contacts               RENAME TO myverse_contacts;
ALTER TABLE IF EXISTS planners_canvases               RENAME TO myverse_canvases;
ALTER TABLE IF EXISTS planners_covers                 RENAME TO myverse_covers;
ALTER TABLE IF EXISTS planners_templates              RENAME TO myverse_templates;
ALTER TABLE IF EXISTS planners_external_events       RENAME TO myverse_external_events;
ALTER TABLE IF EXISTS planners_integrations           RENAME TO myverse_integrations;
ALTER TABLE IF EXISTS planners_payments               RENAME TO myverse_payments;
ALTER TABLE IF EXISTS planners_push_subscriptions     RENAME TO myverse_push_subscriptions;
ALTER TABLE IF EXISTS planners_ai_briefings           RENAME TO myverse_ai_briefings;
ALTER TABLE IF EXISTS planners_ai_usage               RENAME TO myverse_ai_usage;
ALTER TABLE IF EXISTS planners_community_posts       RENAME TO myverse_community_posts;
ALTER TABLE IF EXISTS planners_community_comments    RENAME TO myverse_community_comments;
ALTER TABLE IF EXISTS planners_community_likes       RENAME TO myverse_community_likes;
ALTER TABLE IF EXISTS planners_feedback               RENAME TO myverse_feedback;

-- ---------- Phase 2: 함수 이름 변경 (13개) ----------
-- 트리거는 OID 바인딩이므로 함수명 변경에 영향 없음.
ALTER FUNCTION planners_activate_pdf_buyer(uuid)             RENAME TO myverse_activate_pdf_buyer;
ALTER FUNCTION planners_activate_subscription(uuid, integer, text) RENAME TO myverse_activate_subscription;
ALTER FUNCTION planners_calendar_touch_updated_at()          RENAME TO myverse_calendar_touch_updated_at;
ALTER FUNCTION planners_canvases_touch()                     RENAME TO myverse_canvases_touch;
ALTER FUNCTION planners_community_bump_comment_count()       RENAME TO myverse_community_bump_comment_count;
ALTER FUNCTION planners_community_bump_like_count()          RENAME TO myverse_community_bump_like_count;
ALTER FUNCTION planners_expire_subscriptions()               RENAME TO myverse_expire_subscriptions;
ALTER FUNCTION planners_feedback_touch()                     RENAME TO myverse_feedback_touch;
ALTER FUNCTION planners_moments_touch()                      RENAME TO myverse_moments_touch;
ALTER FUNCTION planners_monthly_summary(uuid, integer, integer) RENAME TO myverse_monthly_summary;
ALTER FUNCTION planners_project_milestones_updated_at()      RENAME TO myverse_project_milestones_updated_at;
ALTER FUNCTION planners_weekly_summary(uuid, integer, integer) RENAME TO myverse_weekly_summary;
ALTER FUNCTION planners_yearly_summary(uuid, integer)        RENAME TO myverse_yearly_summary;

-- ---------- Phase 3: 함수 본문 재작성 ----------
-- 본문은 늦은 바인딩 → 옛 테이블명을 새 테이블명으로 교체해야 함.

CREATE OR REPLACE FUNCTION public.myverse_activate_pdf_buyer(_member_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    UPDATE myverse_users
    SET is_pdf_buyer = true,
        pdf_buyer_verified_at = now(),
        updated_at = now()
    WHERE member_id = _member_id;

    PERFORM myverse_activate_subscription(_member_id, 1, 'pdf_buyer');

    INSERT INTO myverse_payments (
        member_id, order_id, amount, status, source,
        subscription_years, subscription_starts, subscription_ends,
        paid_at, meta
    ) VALUES (
        _member_id,
        'pdf_' || _member_id::TEXT || '_' || EXTRACT(EPOCH FROM now())::BIGINT::TEXT,
        0,
        'manual',
        'pdf_buyer',
        1,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 year',
        now(),
        jsonb_build_object('note', 'PDF buyer free activation')
    )
    ON CONFLICT (order_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_activate_subscription(_member_id uuid, _years integer DEFAULT 1, _source text DEFAULT 'toss')
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    _now TIMESTAMPTZ := now();
    _current_expires TIMESTAMPTZ;
    _new_expires TIMESTAMPTZ;
BEGIN
    SELECT subscription_expires_at INTO _current_expires
    FROM myverse_users
    WHERE member_id = _member_id;

    IF _current_expires IS NOT NULL AND _current_expires > _now THEN
        _new_expires := _current_expires + (_years || ' years')::INTERVAL;
    ELSE
        _new_expires := _now + (_years || ' years')::INTERVAL;
    END IF;

    INSERT INTO myverse_users (member_id, subscription_status, subscription_expires_at, updated_at)
    VALUES (_member_id, 'active', _new_expires, _now)
    ON CONFLICT (member_id) DO UPDATE
    SET subscription_status = 'active',
        subscription_expires_at = _new_expires,
        updated_at = _now;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_calendar_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_canvases_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_community_bump_comment_count()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE myverse_community_posts
           SET comment_count = comment_count + 1
         WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE myverse_community_posts
           SET comment_count = GREATEST(comment_count - 1, 0)
         WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_community_bump_like_count()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE myverse_community_posts
           SET like_count = like_count + 1
         WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE myverse_community_posts
           SET like_count = GREATEST(like_count - 1, 0)
         WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_expire_subscriptions()
RETURNS integer LANGUAGE plpgsql AS $$
DECLARE
    _count INTEGER;
BEGIN
    UPDATE myverse_users
    SET subscription_status = 'expired', updated_at = now()
    WHERE subscription_status = 'active'
      AND subscription_expires_at IS NOT NULL
      AND subscription_expires_at < now();
    GET DIAGNOSTICS _count = ROW_COUNT;
    RETURN _count;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_feedback_touch()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_moments_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_project_milestones_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public', 'pg_temp' AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.myverse_monthly_summary(_member_id uuid, _year integer, _month integer)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
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

CREATE OR REPLACE FUNCTION public.myverse_weekly_summary(_member_id uuid, _year integer, _week integer)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
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

CREATE OR REPLACE FUNCTION public.myverse_yearly_summary(_member_id uuid, _year integer)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
    _done_count INT := 0;
    _days_recorded INT := 0;
    _days_with_tasks INT := 0;
    _projects_completed INT := 0;
    _projects_total INT := 0;
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE jsonb_typeof(tasks) = 'array'),
        COUNT(*)
    INTO _days_with_tasks, _days_recorded
    FROM myverse_daily
    WHERE member_id = _member_id
      AND EXTRACT(YEAR FROM date) = _year;

    SELECT COALESCE(SUM(
        (SELECT COUNT(*) FROM jsonb_array_elements(tasks) AS e
         WHERE (e->>'status') = 'done')
    ), 0)
    INTO _done_count
    FROM myverse_daily
    WHERE member_id = _member_id
      AND EXTRACT(YEAR FROM date) = _year
      AND jsonb_typeof(tasks) = 'array';

    SELECT COUNT(*) INTO _projects_completed
    FROM myverse_projects
    WHERE member_id = _member_id
      AND EXTRACT(YEAR FROM completed_at) = _year;

    SELECT COUNT(*) INTO _projects_total
    FROM myverse_projects
    WHERE member_id = _member_id
      AND (
          EXTRACT(YEAR FROM created_at) = _year OR
          EXTRACT(YEAR FROM COALESCE(completed_at, created_at)) = _year
      );

    RETURN jsonb_build_object(
        'year', _year,
        'days_recorded', _days_recorded,
        'days_with_tasks', _days_with_tasks,
        'done_tasks', _done_count,
        'projects_completed', _projects_completed,
        'projects_total', _projects_total
    );
END;
$$;

COMMIT;
