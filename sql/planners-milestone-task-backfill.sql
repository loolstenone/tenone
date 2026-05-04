-- ═══════════════════════════════════════════════════════════════
-- 프로젝트 마일스톤 → myverse_daily.tasks 백필
-- 목적: due_date가 있는 모든 기존 마일스톤을 해당 날짜의 일간 일정에 반영
-- 멱등: 동일 마일스톤은 ms_{milestone_id} 키로 1건만 유지
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE
    m RECORD;
    v_task_id TEXT;
    v_new_task JSONB;
    v_existing JSONB;
    v_filtered JSONB;
    v_count INT := 0;
BEGIN
    FOR m IN
        SELECT
            ms.id   AS mid,
            ms.title,
            ms.due_date,
            ms.done_at,
            p.member_id,
            p.id    AS project_id
        FROM myverse_project_milestones ms
        JOIN myverse_projects p ON p.id = ms.project_id
        WHERE ms.due_date IS NOT NULL
    LOOP
        v_task_id := 'ms_' || m.mid::text;
        v_new_task := jsonb_build_object(
            'id',         v_task_id,
            'text',       m.title,
            'status',     CASE WHEN m.done_at IS NOT NULL THEN 'done' ELSE 'todo' END,
            'project_id', m.project_id::text,
            'source',     'milestone',
            'priority',   NULL,
            'time',       NULL
        );

        SELECT tasks INTO v_existing
        FROM myverse_daily
        WHERE member_id = m.member_id AND date = m.due_date;

        IF v_existing IS NULL THEN
            -- 해당 날짜 row 없음 → 신규 INSERT
            INSERT INTO myverse_daily (member_id, date, tasks)
            VALUES (m.member_id, m.due_date, jsonb_build_array(v_new_task));
        ELSE
            -- 기존 ms_{id} 제거 후 새로 추가 (멱등)
            SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb) INTO v_filtered
            FROM jsonb_array_elements(v_existing) elem
            WHERE elem->>'id' IS NULL OR elem->>'id' != v_task_id;

            UPDATE myverse_daily
            SET tasks = v_filtered || jsonb_build_array(v_new_task)
            WHERE member_id = m.member_id AND date = m.due_date;
        END IF;

        v_count := v_count + 1;
    END LOOP;

    RAISE NOTICE '✅ 마일스톤 → 일정 백필 완료: % 건', v_count;
END $$;
