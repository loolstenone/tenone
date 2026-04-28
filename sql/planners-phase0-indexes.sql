-- Planner's Phase 0 — FK 인덱스 보강
-- QA에서 발견된 N+1 위험 해소
-- 2026-04-29

-- planners_project_vriefs.project_id — 프로젝트 상세 진입 시 매번 JOIN
CREATE INDEX IF NOT EXISTS idx_planners_project_vriefs_project_id
    ON planners_project_vriefs(project_id);

-- planners_project_gprs.project_id — 마일스톤·KR 조회 시 JOIN
CREATE INDEX IF NOT EXISTS idx_planners_project_gprs_project_id
    ON planners_project_gprs(project_id);

-- planners_ai_usage.member_id — 일/월 사용량 카운트 빈번
CREATE INDEX IF NOT EXISTS idx_planners_ai_usage_member_id
    ON planners_ai_usage(member_id);

-- 추가 권장: 자주 쓰는 (member_id, date) 복합 인덱스 — 일별 조회 가속
CREATE INDEX IF NOT EXISTS idx_planners_ai_usage_member_date
    ON planners_ai_usage(member_id, used_date DESC);
