-- taxonomies 테이블 — 유니버스 공통 분류 상수 SSOT
-- Created: 2026-04-21 (세션 66)
-- Migrated from: lib/badak-constants.ts (INDUSTRIES, JOB_FUNCTIONS, JOB_LEVELS)
-- Purpose: 코드 상수 → DB + CRUD UI로 전환, 비개발자도 편집 가능

CREATE TABLE IF NOT EXISTS taxonomies (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind         TEXT NOT NULL CHECK (kind IN ('industry', 'job_function', 'job_level', 'looking_for', 'can_offer')),
    value        TEXT NOT NULL,
    label        TEXT,
    category     TEXT,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    is_active    BOOLEAN NOT NULL DEFAULT true,
    is_core      BOOLEAN NOT NULL DEFAULT false,
    description  TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    tenant_id    TEXT NOT NULL DEFAULT 'tenone',
    UNIQUE (kind, value, tenant_id)
);

CREATE INDEX IF NOT EXISTS taxonomies_kind_active_idx ON taxonomies(kind, is_active, sort_order);

ALTER TABLE taxonomies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "taxonomies_read" ON taxonomies;
CREATE POLICY "taxonomies_read" ON taxonomies FOR SELECT USING (true);

DROP POLICY IF EXISTS "taxonomies_write_staff" ON taxonomies;
CREATE POLICY "taxonomies_write_staff" ON taxonomies FOR ALL
    USING (EXISTS (
        SELECT 1 FROM member_roles mr
        JOIN members m ON m.id = mr.member_id
        WHERE m.auth_id = auth.uid() AND mr.role IN ('staff','manager','super_admin') AND mr.is_active
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM member_roles mr
        JOIN members m ON m.id = mr.member_id
        WHERE m.auth_id = auth.uid() AND mr.role IN ('staff','manager','super_admin') AND mr.is_active
    ));

-- 시드는 /intra/ums/standard/taxonomies UI 또는 Supabase execute_sql로 INSERT
-- (마이그레이션 당시 38 job_function + 30 industry 입력됨)
